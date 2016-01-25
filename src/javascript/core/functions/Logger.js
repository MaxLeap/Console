define(
    [
        'language',
        'jquery',
        'pnotify',
        'app',
        'Storage',
        'pnotify.buttons'
    ],
    function (Language, $, PNotify,AppCube,Storage) {

        var Logger = {};

        Logger.info = function (message, options) {
            if(options&&options.doI18n==true){
                message = Language.i18n(message);
            }else{
                message = message || 'Info';
            }
            new PNotify({
                text: message,
                type: 'info',
                delay: 1000
            });
        };

        Logger.warning = function (message, options) {
            if(options&&options.doI18n==true){
                message = Language.i18n(message);
            }else{
                message = message || 'Warning';
            }
            new PNotify({
                text: message,
                type: 'warning',
                delay: 3000
            });
        };

        Logger.success = function (message, options) {
            if(options&&options.doI18n==true){
                message = Language.i18n(message);
            }else{
                message = message || 'Success';
            }
            new PNotify({
                text: message,
                type: 'success',
                icon: 'icon check circle',
                delay: 3000,
                mouse_reset:false,
                buttons: {
                    closer: true,
                    closer_hover:false
                }
            });
        };

        Logger.error = function (e, options) {
            var message,title,language;
            if (e instanceof Error) {
                title = 'Error';
                message = e.message;
            } else if (e.statusText || e.status) {
                title = e.status;
                if(e.status && (e.status == 200 || e.status == 201)){
                    return false;
                    //CloudData Pointer接口
                    //message = Language.i18n('error.net.99999');
                } else if (e.responseText) {
                    try {
                        var json = JSON.parse(e.responseText);
                        message = json.errorMessage||Language.i18n('error.net.'+json.errorCode);
                        if( e.status == 401){
                            language = Storage.get("language");
                            AppCube.User.clearUserData();
                            jumpLeapasBecauseSessionExpire(language);
                        }
                    } catch (error) {
                        message = e.statusText
                    }
                } else {
                    if(e.status == 0 && e.statusText == 'timeout'){
                        message = Language.i18n('error.net.0');
                    }else if(e.status == 0 && e.statusText == 'abort'){
                        return false;
                    }else{
                        message = e.status + ' ' + e.statusText
                    }
                }
            } else {
                title = 'Error';
                if(options&&options.doI18n==true){
                    message = Language.i18n(e);
                }else{
                    message = e;
                }
            }
            new PNotify({
                //fix title
                //title:title,
                title:"error",
                text: message,
                type: 'error',
                icon: 'icon warning sign',
                delay: 3000,
                mouse_reset:false,
                buttons: {
                    closer: true,
                    closer_hover:false
                }
            });
        };
        return Logger;

        //session jump to leap.as index
        function jumpLeapasBecauseSessionExpire(language){
            var host = window.location.hostname;

            if(/^localhost/.test(host)){
                window.location.href = '/login';
            }else{
                window.location.href = "/"+getIndexHtmlInfoByLanguage(language)+"?error=session-expire";
            }

            function getIndexHtmlInfoByLanguage(language){
                language = language|| Storage.get("language")||'en';

                if(/en/i.test(language)){
                    return 'en_us/index.html';
                }else{
                    return 'zh_cn/index.html';
                }
            }
        }
    });