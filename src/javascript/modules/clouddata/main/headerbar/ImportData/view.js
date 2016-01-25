define(
    [
        'app',
        'dispatcher',
        'C',
        'API',
        'Logger',
        'basic/net/Uploader',
        'core/functions/UI',
        'core/functions/Validator',
        'tpl!./template.html',
        'component/dialog/BasicDialog',
        'underscore',
        'jquery',
        'i18n',
        'pnotify.nonblock'
    ],
    function (AppCube,Dispatcher,C,API,Logger,Uploader,UI,Validator,template,BasicDialog,_,$,i18n) {

        function getMessageFromResult(text){
            var message;
            try {
                var json = JSON.parse(text);
                message = json.errorMessage||i18n.t('error.net.'+json.errorCode);
            } catch (error) {
                message = i18n.t('error.net.90000');
            }
            return message;
        }

        function toggleContentClass(className){
            var content = $('#app-dialog .content');
            content.removeClass('loading retry complete continue');
            if(className){
                content.addClass(className);
            }
        }

        var minWaitFileSize = 1024 * 1024 * 10;

        return BasicDialog.extend({
            events:{
                "click .type-list>.type":"toggleClassType",
                "click .btn-import":"createImportTask",
                "click .ui.dropdown .item":"autoCheck",
                "keyup input":"autoCheck"
            },
            template: template,
            beforeShow:function(){
                $('#app-dialog .btn-wait').bind('click.dataie',this.waitForComplete.bind(this));
                $('#app-dialog .btn-import').bind('click.dataie',this.createImportTask.bind(this));
                $('#app-dialog .btn-retry').bind('click.dataie',this.retryUpload.bind(this));
                $('#app-dialog .btn-continue').bind('click.dataie',this.continueUpload.bind(this));
            },
            beforeHide:function(){
                $('#app-dialog .btn-wait,' +
                '#app-dialog .btn-import,' +
                '#app-dialog .btn-retry,' +
                '#app-dialog .btn-continue').unbind('click.dataie');
                if(this.handler)this.handler.stopUpload();
                this.clearPage();
            },
            clearPage:function(){
                this.$('.ui.dropdown').each(function(index,e){
                    if($(e).data('moduleDropdown')){
                        $(e).dropdown('destroy');
                    }
                });
            },
            clearErrorMessage:function(){
                this.$('.info').removeClass('error');
                this.$('.info>.error-message').text('');
            },
            showErrorMessage:function(msg){
                this.$('.info').addClass('error');
                this.$('.info>.error-message').text(msg);
            },
            retryUpload:function(){
                //show upload zone
                this.$('.upload-zone').show();
                this.clearErrorMessage();
                //clear progress
                this.$('.progress-zone').hide();
                this.$('.progress-zone .progress-bar').removeClass('error');
                this.$('.upload-form input[type=file]').val('');
                this.setProgress(0);
                //clear button
                toggleContentClass();
            },
            continueUpload:function(){
                this.$('.ui.form').removeClass('visible');
                this.$('.upload-form').show().addClass('active');
                this.$('.import-form').removeClass('active');
                this.retryUpload();
            },
            showProgressBar:function(){
                this.$('.upload-zone').hide();
                this.$('.progress-zone').show();
            },
            startUploadAnimation:function(size){
                //初始速度
                var self = this;
                var speed = 400*1024/size;
                if(speed < 0.1)speed = 0.1;
                if(speed > 0.8)speed = 0.8;

                var step = 0;
                var damp_rate = 0.5;
                var end_value = 0.98;
                var animationHandler;
                //limit first speed
                var frame = function(){
                    animationHandler = setTimeout(function(){
                        //limit step
                        step+=speed;
                        if(step>end_value)step = end_value;
                        self.setProgress(step);
                        //limit speed
                        if(speed>0.001){
                            speed*=damp_rate;
                        }
                        if(step < end_value)frame();
                    },400);
                };
                frame();
                return function(){
                    clearTimeout(animationHandler);
                }
            },
            setProgress:function(percent){
                this.$('.progress-zone .percent').css('width',percent*100+'%');
            },
            toggleClassType:function(e){
                this.$('.type-list>.type').removeClass('active');
                $(e.currentTarget).addClass('active');
                this.renderEditorByType($(e.currentTarget).index());
            },
            uploadJSON:function(target){
                var self = this;
                this.clearErrorMessage();
                var size = target.get(0).files[0].size;
                var filename = target.get(0).files[0].name;
                var stopAnimation = this.startUploadAnimation(size);
                //show minimize
                if(size>minWaitFileSize)
                    toggleContentClass('loading');

                this.handler = new Uploader({
                    $el: target,
                    method:'POST',
                    urlRoot:API.get('DataIE') + '/apps/' + C.get('User.AppId') + '/upload',
                    checkImage:false,
                    key:'file',
                    onSuccess:function(res){
                        var result;
                        try{
                            result = JSON.parse(res);
                        }catch(e){
                            result = {};
                        }
                        stopAnimation();
                        self.setProgress(1);
                        self.showImportSettingPage(filename);
                        result.filename = filename;
                        Dispatcher.request("setValue:UploadResult",result,"Component");
                    },
                    onError:function(xhr,d){
                        stopAnimation();
                        var message = getMessageFromResult(xhr.responseText);
                        self.showErrorMessage(message);
                        toggleContentClass('retry');
                        self.$('.progress-zone .progress-bar').addClass('error');
                        return message;
                    }
                });
                this.handler.uploadFile();

                //#DEBUG
                //setTimeout(function(){
                //    var result = {
                //        "total":1,
                //        "s3Path":"https://s3-us-west-2.amazonaws.com/dataexportdev.leap.as/645758fd455c4016ad37226cd309bbc6",
                //        "bucketKey":"645758fd455c4016ad37226cd309bbc6"
                //    };
                //    stopAnimation();
                //    self.setProgress(1);
                //    self.showImportSettingPage(filename);
                //    Dispatcher.request("setValue:UploadResult",result,"Component");
                //},1000);
            },
            showImportSettingPage:function(filename){
                var self = this;
                this.$('.import-form .editor-zone,.import-form .choose-type').show();
                this.$('.import-form .result-zone').hide();
                this.$('.import-form .file-zone,.upload-form').removeClass('active');
                this.$('.file-zone .file-name').text(filename);
                /^(.*)\.json$/.test(filename);
                var className = RegExp.$1;
                var type = className == "_User"?1:(className == "_Installation"?2:0);
                this.renderEditorByType(type,className);
                this.$('.import-form').addClass('active');
                //make dialog can show dropdown
                setTimeout(function(){
                    self.$('.upload-form').hide();
                    self.$('.ui.form').addClass('visible');
                    toggleContentClass('complete');
                },200);
            },
            renderEditorByType:function(type,className){
                this.clearPage();
                this.$('.editor-zone').html('');
                var self = this;
                this.$('.type-list .type').removeClass('active');
                this.$('.type-list .type[data-value='+type+']').addClass('active');
                if(!className)className = "";
                if(type==0){
                    var node = '<div class="class-editor"><div class="inline field"><label data-i18n="clouddata.tag.class-name"></label><input class="validate validate-required" type="text" name="classname" value="'+className+'"/></div></div>';
                    this.$('.editor-zone').html(node).i18n();
                }else if(type==3){
                    this.$('.editor-zone').html('<div class="relation-editor"></div>');
                    AppCube.DataRepository.fetch('Store:Schemas').done(function(list){
                        var dropdown = $('<div class="inline field"><label data-i18n="clouddata.tag.relation-property"></label><div class="ui basic button dropdown origin-selector validate validate-required"><span class="text" data-i18n="clouddata.tag.choose-class"></span><input type="hidden"/><i class="icon dropdown"></i><div class="menu"><div class="scrolling menu"></div></div></div></div>');
                        var dropdown2 = $('<div class="inline field"><div class="ui basic button dropdown relation-selector validate validate-required"><span class="text" data-i18n="clouddata.tag.choose-relation"></span><input type="hidden"/><i class="icon dropdown"></i><div class="menu"><div class="scrolling menu"></div></div></div></div>');
                        var input = $('<div class="inline field"><input class="validate validate-required" type="text" name="target" value="'+className+'" data-i18n="[placeholder]clouddata.tag.target-column"/></div>');
                        self.$('.editor-zone .relation-editor').append(dropdown);
                        self.$('.editor-zone .relation-editor').append(dropdown2);
                        self.$('.editor-zone .relation-editor').append(input);
                        var menu1 = dropdown.find('.scrolling.menu');
                        var menu2 = dropdown2.find('.scrolling.menu');
                        _.forEach(list,function(item){
                            menu2.append('<div class="item" data-value="'+item.className+'">'+item.className+'</div>');
                            menu1.append('<div class="item" data-value="'+item.className+'">'+item.className+'</div>');
                        });
                        self.$('.editor-zone').i18n();
                        self.$('.ui.dropdown').dropdown();
                    });
                }else{
                    this.$('.editor-zone').html('');
                }
            },
            render:function(options){
                var self = this;
                BasicDialog.prototype.render.call(this,options);
                if(options.options.isWaiting){
                    var lastResult = Dispatcher.request("getValue:LastUpload",{},"Component");
                    this.showImportSettingPage(lastResult.filename);
                }
                //init uploader&&icon
                UI.bindUploader(this.$('.upload-form>.upload-zone'),false,function(e){
                    var files = e.target.files;
                    if(!files[0]){

                    }else if(files[0].type!="application/json"){
                        self.showErrorMessage(i18n.t('error.local.json-support'));
                    }else if(files[0].size>100*1024*1024){
                        self.showErrorMessage(i18n.t('error.local.upload-size-limit'));
                    }else{
                        //start upload
                        self.showProgressBar();
                        self.uploadJSON($(e.target));
                    }
                });
            },
            waitForComplete:function(){
                Dispatcher.request('NewUpload',{handler:this.handler},'Component');
                this.handler = null;
                $('#app-dialog').addClass('scale2corner');
                setTimeout(function(){
                    $('#app-dialog-wrapper').css('z-index',-1);
                    $('#app-dialog').removeClass('hidden scale2corner').modal('hide',function(){
                        $('#app-dialog-wrapper').removeAttr('style');
                    });
                },300);
            },
            getFormValue:function(){
                var type = this.$('.type-list>.type.active').attr('data-value');
                var data = {collectionType:type};
                if(type=='0'){
                    var name = this.$('.editor-zone [name=classname]').val();
                    data.classNames = [name];
                }else if(type=='3'){
                    data.relationOwner = this.$('.ui.dropdown.origin-selector').dropdown('get value');
                    data.relationTarget = this.$('.ui.dropdown.relation-selector').dropdown('get value');
                    data.relationField = this.$('.editor-zone [name=target]').val();
                }else{
                    data.classNames = [(type=="1"?"_User":"_Installation")];
                }
                return data;
            },
            createImportTask:function(){
                var lastResult = Dispatcher.request("getValue:LastUpload",{},"Component");
                var form = this.$('.editor-zone');
                if(Validator.check(form)){
                    var self = this;
                    var data = this.getFormValue();
                    data.bucketKey = lastResult.bucketKey;
                    data.total = lastResult.total;
                    data.s3Path = lastResult.s3Path;
                    if(lastResult){
                        AppCube.DataRepository.getStore("Store:DataIE").ImportData(data).then(function(res){
                            self.clearErrorMessage();
                            self.showTaskProgress(res.taskId);
                        },function(res){
                            var message = getMessageFromResult(res);
                            self.showErrorMessage(message);
                        }).finally(function(){
                            self.$('.import-form .editor-zone,.import-form .choose-type').hide();
                            self.$('.import-form .result-zone').show();
                            self.$('.import-form .file-zone').addClass('active');
                            //show button
                            toggleContentClass('continue');
                        });
                    }else{
                        debugger
                    }
                }
            },
            showTaskProgress:function(taskId){
                if(!taskId)return;
                var notify = new PNotify({
                    text: '<p class="title">'+i18n.t('clouddata.tag.data-import')+'</p><p class="progress"><span class="percent"></span></p>',
                    type: 'success',
                    icon: 'icon check circle',
                    mouse_reset:false,
                    hide:false,
                    nonblock: {
                        nonblock: true,
                        nonblock_opacity: .4
                    }
                });

                var fetchProcess = function(){
                    setTimeout(function(){
                        AppCube.DataRepository.getStore('Store:DataIE').getProcess([taskId]).done(function(res){
                            _.forEach(res,function(process){
                                if(process!=-1){
                                    var percent = parseFloat(process);
                                    if(isNaN(percent))percent = 0;
                                    notify.elem.find('span.percent').css('width',percent*100+'%');
                                    fetchProcess();
                                }else{
                                    AppCube.DataRepository.getStore('Store:DataIE').updateTaskById(taskId).done(function(task){
                                        var percent = parseFloat(task.process);
                                        if(isNaN(percent))percent = 0;
                                        notify.elem.find('span.percent').css('width',percent*100+'%');

                                        if(task.status!=100){
                                            notify.elem.find('p.title').text(i18n.t('clouddata.success.import'));
                                        }else{
                                            notify.elem.children('.alert-success').removeClass('alert-success').addClass('alert-danger');
                                            notify.elem.find('p.title').text(i18n.t('clouddata.fail.import'));
                                        }
                                        AppCube.DataRepository.refresh('Store:Schemas');
                                        setTimeout(function(){
                                            PNotify.removeAll();
                                        },1500);
                                    });
                                }
                            });
                        });
                    },1000);
                };

                fetchProcess();
            }
        });
    });