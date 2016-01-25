define([
    'app',
    'C',
    'U',
    'Logger',
    'basic/net/Uploader',
    'core/functions/UI',
    'Storage',
    '../deleteAppView/view',
    '../../common/component/BasicForm',
    'text!./template.html',
    'jquery',
    'underscore',
    'i18n',
    'core/functions/Validator',
    "semanticui_checkbox"
],function(AppCube,C,U,Logger,Uploader,UI,Storage,deleteAppView,BasicForm,template,$,_,i18n,Validator,checkbox){
    return BasicForm.extend({
        events:{
            "click .button.submit":"saveData",
            "click .button.add-platform":"addNewPlatform",
            "click .fa-times-circle":"removePlatformItem",
            "click .button.delete-app":"deleteApplication",
            "click #upload-zone .upload-confirm":"uploadIcon",
            "click #upload-zone .upload-remove:not(.disabled)":"removeIcon",
            "keyup input[name=name]":"changeAppName",
            "keyup input":"autoCheck",
            "change .custom-platform":"updatePlatform",
            "click .os.tabular>.item":"toggleOSTab"
        },
        template: _.template(template),
        beforeHide:function(){
            BasicForm.prototype.beforeHide.call(this);
            this.$('.ui.dropdown').each(function(index,e){
                if($(e).data('moduleDropdown')){
                    $(e).checkbox('destroy');
                }
            });
        },
        toggleOSTab:function(e){
            var os = $(e.currentTarget).attr('data-value');
            this.$('.os.tabular>.item').removeClass('active');
            $(e.currentTarget).addClass('active');
            this.$('.os.tabular').siblings().removeClass('active');
            this.$('.os.tabular').siblings('[data-tab='+os+']').addClass('active');
        },
        renderComponents:function(res){
            //render platform
            var self = this;
            var template = _.template('<div class="container-flex">' +
                '<input class="form-control platform-name" type="text" value="<%- name %>" placeholder="Platform Name">' +
                '<input class="form-control platform-link flex-1" type="text" name="platforms.<%- name %>" value="<%- value %>" placeholder="App Link">' +
                '<span class="fa fa-lg fa-times-circle"></span>' +
                '</div>');
            _.forEach(res.platforms,function(item,index){
                if(!_.contains(['iTunes App Store','Google Play Store','Web','Windows App Store'],index)){
                    self.$('#platform_link .button.add-platform').before(template({
                        name:index,
                        value:item
                    }));
                }
            });
            //render switcher
            this.$('.ui.checkbox').checkbox();
            //this.$('.os.dropdown').dropdown({
            //    onChange:function(item){
            //        C.set('User.AppOS',item);
            //    }
            //});
            //this.$('.os.dropdown').dropdown('set selected',res.os);
            AppCube.DataRepository.fetch('Store:Lang').done(function(res){
                var list = [];
                _.forEach(res,function(item){
                    list.push($('<div class="item" data-value="'+item.id+'">'+item.text+'</div>'));
                });
                self.$('.lang.dropdown .menu').html(list);
                self.$('.lang.dropdown').dropdown();
                //self.$('.lang.dropdown').dropdown('set selected',AppCube.current_lang);
            });
            //init uploader&&icon
            UI.bindUploader(this.$('#upload-zone>.upload-choose'),'#app-publish-icon-empty',function(){
                self.$('#app-publish-icon-empty').html('');
                self.$('#upload-zone>.upload-confirm').show();
                self.$('#app-publish-icon-empty').append('<canvas id="app-icon-progress-canvas" width="174" height="174"></canvas>');
                UI.initIconProgress("#app-icon-progress-canvas");
            });
        },
        uploadIcon:function(e){
            var self = this;
            var el = $(e.currentTarget).siblings('input[type=file]');
            UI.startUploadIcon("#app-icon-progress-canvas");
            var handler = new Uploader({
                $el:el,
                checkImage:false,
                onSuccess:function(res){
                    var result;
                    try{
                        result = JSON.parse(res);
                    }catch(e){
                        result = {};
                    }
                    Logger.success(i18n.t("common.success.upload"));
                    var data = {"metadata":{"icon":U.parseUrl(result.url)}};
                    var storeName = self.options.storeName;
                    self.$('#upload-zone>.upload-remove').removeClass('disabled');
                    AppCube.DataRepository.getStore(storeName).updateData(data).done(function(){
                        Logger.success(i18n.t("common.success.update"));
                    });
                },
                onProgress:function(percent){
                    UI.progressIcon("#app-icon-progress-canvas",percent*100);
                },
                onComplete:function(xhr){
                    self.$('#upload-zone>.upload-confirm').hide();
                    self.$('#upload-zone>.upload-choose').hide();
                    self.$('#upload-zone>.upload-remove').show().addClass('disabled');
                },
                onError:function(xhr,d){
                    self.$('#upload-zone>.upload-remove').removeClass('disabled');
                    Logger.error(i18n.t("common.fail.upload"));
                }
            });
            handler.uploadFile();
        },
        removeIcon:function(){
            var self = this;
            var data = {"metadata":{"icon":""}};
            var storeName = this.options.storeName;
            AppCube.DataRepository.getStore(storeName).updateData(data).done(function(){
                self.$('#app-publish-icon-empty').removeAttr('style');
                self.$('#upload-zone>.upload-remove').hide();
                self.$('#upload-zone>.upload-choose').show();
                self.$('#upload-zone>input').val('');
                Logger.success(i18n.t("common.success.update"));
            });
        },
        changeAppName:function(e){
            var value = $(e.currentTarget).val();
            var img = $('#app-selector .text>img');
            var appId = C.get('User.AppId');
            $('#app-selector .text').html(value).prepend(img);
            $('#app-selector .item[data-value='+appId+']>span').text(value);
        },
        addNewPlatform:function(e){
            var node = $('<div class="container-flex">' +
                '<input class="form-control platform-name custom-platform" type="text" value="" placeholder="Platform Name">' +
                '<input class="form-control platform-link custom-platform-value flex-1" type="text" name="platforms." value="" placeholder="App Link">' +
                '<span class="fa fa-lg fa-times-circle"></span>' +
                '</div>').insertBefore($(e.currentTarget));
            node.find('input:first').select().focus();
        },
        updatePlatform:function(e){
            var name = $(e.currentTarget).val();
            $(e.currentTarget).siblings('.custom-platform-value').attr('name','platforms.'+name);
        },
        removePlatformItem:function(e){
            $(e.currentTarget).parent('.container-flex').remove();
        },
        deleteApplication:function(){
            var self = this;
            UI.showDialog(i18n.t('settings.title.delete-app'),deleteAppView,{
                success:function(view){
                    var value = view.getValue();
                    var storeName = self.options.storeName;
                    view.showLoading();
                    AppCube.DataRepository.getStore(storeName).removeApp(value).then(function(res){
                        Storage.remove('current_app_id');
                        U.jumpTo('/settings');
                    },function(res){
                        var result = JSON.parse(res);
                        if(result.errorCode == 210||result.errorCode == 12000){
                            //password error or passeord empty
                            view.$('[name=password]').val('').focus();
                        }
                    }).finally(function(){
                        view.hideLoading();
                    });
                }
            });
        }
    });
});