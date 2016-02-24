require(['main','jquery'], function (){
    require([
        'app',
        'modules/common/bootstrapper',
        'Logger',
        'core/functions/Validator',
        'API',
        'Storage',
        'data/Task',
        'data/Store',
        'jquery',
        'underscore',
        'zeroclipboard',
        'semanticui_modal'
    ],function(AppCube,Bootstrapper,Logger,Validator,API,Storage,Task,Store,$,_,ZeroClipboard){

        function setClip(key,value){
            var input = $('#app-dialog-detail [name='+key+']');
            input.val(value);
            input.next('.buttons').find('.copy-btn').attr('data-clipboard-text',value);
        }

        function setAppName(name){
            $('#app-dialog-detail >.header').i18n({APPNAME:name});
        }

        function initClipBoard(){
            ZeroClipboard.config({swfPath:"/ZeroClipboard.swf"});
            var client = new ZeroClipboard($('.ui.button.copy-btn'));
            client.on("ready", function(event){
                client.on('aftercopy',function(){
                    Logger.success('common.success.copy',{doI18n:true});
                });
            });
        }

        var createApp = function(){
            var dialog = $('#app-dialog-create-app');
            var name = dialog.find('[name=name]').val();
            var lang = dialog.find('[name=defaultLang]').val();
            //var os = dialog.find('[name=os]').val();
            //var appType=dialog.find('[name=appType]').val();
            var task = Task.create({
                url: API.get('App'),
                method: 'POST',
                params:{
                    defaultLang:lang,
                    name:name
                }
            });
            if(Validator.check(dialog)){
                dialog.find('.ui.form').addClass('loading');
                dialog.find('.positive.button').addClass('disabled');
                task.start().then(function(res){
                    if(task.state !=3){
                        setClip('appId',res.objectId);
                        setClip('clientKey',res.clientKey);
                        setClip('javascriptKey',res.javascriptKey);
                        setClip('restAPIKey',res.restAPIKey);
                        setClip('clientKey',res.clientKey);
                        setClip('masterKey',res.masterKey);

                        setAppName(res.name);
                        initClipBoard();

                        Storage.set('current_app_id', res.objectId);
                        subDialog.modal('show');
                        mainDialog.remove();
                        var lang = store2.get('language') === 'zh' ? '/zh_cn' : '/en_us';
                        var host = 'https://maxleap.cn';

                        $('#android_sdk_link').attr('href',host + lang+'/quickstart/android/core/new.html');
                        $('#ios_sdk_link').attr('href',host + lang+'/quickstart/ios/core/new.html');
                    }
                }).finally(function(){
                    dialog.find('.ui.form').removeClass('loading');
                    dialog.find('.positive.button').removeClass('disabled');
                });
            }
            return false;
        };

        var LangTask = Task.create({
            url: API.get('Lang'),
            formatter: function (res) {
                if (!res) {
                    return [];
                } else {
                    var data = _.map(res, function (item) {
                        return {
                            id: item.code,
                            text: item.name
                        };
                    });
                    return _.sortBy(data, function (item) {
                        return item.text
                    });
                }
            },
            method: 'GET',
            buffer: []
        });

        var mainDialog = $('#app-dialog-create-app').modal({
            closable:false,
            allowMultiple: true,
            onApprove:createApp
        });

        var subDialog = $('#app-dialog-detail').modal({
            closable:false,
            allowMultiple: true
        });

        Bootstrapper.init().done(function(){
            var store = Store.create({name: 'Store:Lang'});
            store.setData(LangTask);
            store.refreshData();
            AppCube.DataRepository.fetch('Store:Lang').done(function(lang){
                var list = [];
                _.forEach(lang,function(item){
                    list.push($('<div class="item" data-value="'+item.id+'">'+item.text+'</div>'));
                });
                $('.lang.dropdown .menu').html(list);
                $('body').i18n();
                $('#header-nav').insertAfter('body>.dimmer');
                $('.container-footer').css('z-index',2);
                $('.ui.loader').removeClass('active');

                mainDialog.find('.ui.dropdown').dropdown();

                mainDialog.modal('show');

                mainDialog.find('[name=name]').unbind('keyup').bind('keyup',function(e){
                    if(e.keyCode == 13){
                        mainDialog.find('.button.positive').click();
                    }else{
                        Validator.check(mainDialog);
                    }
                });

                mainDialog.find('.ui.dropdown .item').unbind('click').bind('click',function(e){
                    Validator.check(mainDialog);
                });
            });
        });
    });
});