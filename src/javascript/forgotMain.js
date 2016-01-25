require(['main','jquery'], function() {
    require([
            'jquery', 'validate', 'Storage', 'U', 'language', 'Logger', 'core/functions/UI', 'API',"Captcha","Cookie",'./modules/common/contact'
        ], function($, validate, Storage, U, language, Logger, UI, API,Captcha,Cookie,Contact) {
            var submitBtn = $('#forgotBtn'),
                captchaEle = $('.prelogin-captcha'),
                captchaObj = {};

            function initPage() {
                captchaObj = Captcha.init(captchaEle);
                var checkbox = $('.prelogin-pannel .options .checkbox');
                $("#form-forgot").i18n();
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
            function forgotHandler() {
                //todo: captcha is not undefined
                if (!captchaObj) {
                    return Logger.error('Error');
                }
                var data = {
                    email: $('#email').val(),
                    captcha:{
                        challenge:captchaObj.getCaptchaValue(),
                        secret: captchaObj.getCaptchaHeaderSecret()
                    }
                };
                
                submitBtn.attr("disabled", "disabled").addClass('loading');
                $.ajax({
                    url: API.get('orgUsers.requestPasswordReset'),
                    //Email
                    type: 'POST',
                    dataType: 'json',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    success: function(result) {
                        clearPreviousUserInfo();
                        Logger.success('prelogin.success.forgot', {
                            doI18n: true
                        });
                        U.jumpTo('/resetnotify?send_email_flag=success&reset_email_address='+data.email);

                    },
                    error: function(resp) {
                        U.ParseError(resp, 'login', 'error', {
                            //验证码错误
                            301: function(resp) {
                                Logger.error(resp,{doI18n:true});
                            },
                            //邮箱错误
                            205:function(resp){
                                Logger.error(resp,{doI18n:true});
                            },
                            "default":function(resp){
                                Logger.error(resp);
                                //跳转并传值
                                U.jumpTo('/resetnotify?send_email_flag=fail&reset_email_address='+data.email);
                            }
                        });
                        // Logger.error(resp);
                        // U.jumpTo('/resetnotify?send_email_flag=fail');

                    },
                    complete: function(xhr, status) {
                        Storage.set('requireCaptcha', 1);
                        captchaObj.refresh();
                        submitBtn.removeAttr("disabled").removeClass('loading');
                    }
                });
            }

            function initPageValidate() {
                $("#form-forgot").validate({
                    rules: {
                        email: {
                            required: true,
                            email: true
                        },
                        captcha: {
                            required: true
                        }
                    },
                    messages: {
                        email: {
                            required: language.i18n('prelogin.error.required'),
                            email: language.i18n('prelogin.error.email')
                        },
                        captcha: {
                            required: language.i18n('prelogin.error.required'),
                            minlength:language.i18n('prelogin.error.min-length')
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

                        if (this.valid()) {
                            submitBtn.prop('disabled', false);
                        } else {
                            submitBtn.prop('disabled', 'disabled');
                        }
                    },
                    submitHandler: function(form) {
                        forgotHandler();
                    }
                });
            }


            // language.init(function(){
            language.setDefaultLanguage('prelogin', function() {
                initPage();
            });
            // });
        });
});
