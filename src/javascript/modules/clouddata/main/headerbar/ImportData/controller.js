define(
    [
        'app',
        'Logger',
        'dispatcher',
        'underscore',
        'marionette',
        'jquery',
        'i18n'
    ],
    function (AppCube,Logger,Dispatcher,_,Marionette,$,i18n) {
        return Marionette.ItemView.extend({
            render:function(){},
            init:function(){},
            beforeShow:function(){
                Dispatcher.on('Request.NewUpload',this.whenRequestNewUpload,this,'Component');
                Dispatcher.on('Request.setValue:UploadResult',this.whenRequestNewTask,this,'Component');
                Dispatcher.on('Request.getValue:LastUpload',this.whenRequestLastUpload,this,'Component');
            },
            beforeHide:function(){
                Dispatcher.off('Request.NewUpload','Component');
                Dispatcher.off('Request.setValue:UploadResult','Component');
                Dispatcher.off('Request.getValue:LastUpload','Component');
            },
            whenRequestNewTask:function(result){
                this.lastUploadResult = result;
            },
            whenRequestLastUpload:function(){
                return this.lastUploadResult||false;
            },
            whenRequestNewUpload:function(options){
                var handler = options.handler;
                var success = handler.options.onSuccess;
                var error = handler.options.onError;
                handler.options.onSuccess = function(xhr){
                    success(xhr);
                    $('#data-headerbar .item.data-import').removeClass('disabled');
                    $('#data-sidebar .button.import-class').removeClass('disabled');
                    $('#upload-icon').removeClass('loading').addClass('complete');
                    window.onbeforeunload = false;
                    Logger.success('common.success.upload',{doI18n:true});
                };
                handler.options.onError = function(xhr){
                    var message = error(xhr);
                    $('#data-headerbar .item.data-import').removeClass('disabled');
                    $('#data-sidebar .button.import-class').removeClass('disabled');
                    $('#upload-icon').removeClass('loading').addClass('error');
                    window.onbeforeunload = false;
                    Logger.error(message);
                };

                //start upload
                $('#data-headerbar .item.data-import').addClass('disabled');
                $('#data-sidebar .button.import-class').addClass('disabled');
                $('#upload-icon').removeClass('complete error').addClass('loading');
                window.onbeforeunload = function() {
                    return i18n.t('clouddata.tips.leave-page');
                }
            }
        });
    });