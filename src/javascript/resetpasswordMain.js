/*
 * create: 2015-04-07
 * use: 密码重置页面
 * author:wye
 * 密码重置请求成功后， 清除Storage，并跳转到 login页面
 */
require(['main','jquery'], function() {
    require(['underscore', 'jquery', 'validate', 'API', 'Storage', 'language', 'Logger', 'U', 'core/functions/UI', 'Cookie', 'other/Account','./modules/common/contact'],
        function(_, $, validate, API, Storage, language, Logger, U, UI, Cookie, Account,Contact) {

            var submitBtn = $('#submit_form');
            var search = window.location.search;
            var token;
            var appId;
            var info;

            if(search){
                info = getParas(search);
                token = info['token'];
                appId = info['appId'];

                token= token&&token.replace(/%22/g, '"');
                appId = appId&&appId.replace(/%22/g, '"');
            }

            function initPage() {
                $("#form-resetpassword").i18n();
                initPageValidate();
                $('#common-loader').fadeOut();
            }
            //清除以前用户的storage信息
            function clearPreviousUserInfo(){
                var lastUrl = Storage.get('lastUrl');
                var vistedIntrosSelector = Storage.get('vistedIntrosSelector');
                var language = Storage.get('language');
                var timezone = Storage.get('timezone');

                Storage.clear();
                Cookie.clear();
                if(lastUrl){
                    Storage.set('lastUrl',lastUrl);
                }
                if(language){
                    Storage.set('language',language);
                }
                if(timezone){
                    Storage.set('timezone',timezone);
                }
                if(vistedIntrosSelector){
                    Storage.set('vistedIntrosSelector',vistedIntrosSelector);
                }
            }
            /*
             * 重置密码请求
             */
            function resetPasswordHandler() {
                var data = {
                    password: $("#password").val()
                };
                var url ;
                if(appId){
                    url = API.get('Users.resetPassword');
                }else{
                    url = API.get('orgUsers.resetPassword');
                }

                submitBtn.attr("disabled", "disabled").addClass('loading');

                $.ajax({
                    url: url,
                    type: 'POST',
                    dataType: 'json',
                    data: JSON.stringify(data),
                    headers: getAjaxHeader(appId),
                    contentType: 'application/json'
                }).done(function(data) {
                    Logger.success("prelogin.resetpassword.success",{doI18n: true});
                    //成功跳转
                    clearPreviousUserInfo();
                    U.jumpTo('/login');
                }).fail(function(resp) {

                    submitBtn.removeAttr("disabled").removeClass('loading');
                    // console.log("error");
                    Logger.error("prelogin.resetpassword.fail",{doI18n: true});

                });
            }


            function getAjaxHeader(appId){
                var resetAjaxHeader;

                if(appId){
                    resetAjaxHeader = {
                        //从url中获取的token值和appId
                        'X-LAS-Session-Token': token,
                        'X-LAS-AppId':appId,
                        'content-Type': 'application/json'
                    };
                }else{
                    resetAjaxHeader = {
                        //从url中获取的token值
                        'X-LAS-Session-Token': token,
                        'content-Type': 'application/json'
                    };
                }
                return resetAjaxHeader;
            }

            function initPageValidate() {
                $("#form-resetpassword").validate({
                    rules: {
                        rpassword: {
                            equalTo: "#password"
                        }
                    },
                    messages: {
                        password: {
                            required: language.i18n('prelogin.error.required'),
                            minlength: language.i18n('prelogin.error.min-length')
                        },
                        rpassword: {
                            required: language.i18n('prelogin.error.required'),
                            minlength: language.i18n('prelogin.error.min-length'),
                            equalTo: language.i18n('prelogin.error.password-confirm')
                        }
                    },
                    highlight: function(element) {
                        $(element).closest('.control-group').removeClass('success').addClass('error');
                    },
                    errorPlacement: function(error, element) {
                        element.next('.error-promote').append(error);
                    },
                    success: function(element) {
                        element.closest('.control-group').removeClass('error').addClass('success');
                    },
                    onkeyup: function(element, event) {
                        if (event.which === 9 && this.elementValue(element) === "") {
                            return;
                        } else if (element.name in this.submitted || element === this.lastElement) {
                            this.element(element);
                        }

                        this.checkForm();

                    },
                    submitHandler: function(form) {
                        resetPasswordHandler();
                    }
                });
            }

            function checkUserStatus() {
                var token = Storage.get('sessionToken') || '';

                // if (token == '') {
                // window.location.pathname = 'dashboard';
                // }
            }

            //获取token值
            function getParas(search) {
                search = JSON.parse(search.replace(/\?/g, '{"').replace(/=/g, '":"').replace(/&/g, '","') + '"}');
                return search;
            }

            checkUserStatus();
            // language.init(function(){
                language.setDefaultLanguage('prelogin', function() {
                    initPage();
                });
            // });
        });
});
