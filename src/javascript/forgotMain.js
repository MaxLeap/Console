require(['main','jquery'], function() {
    require([
            'jquery', 'validate', 'Storage', 'U', 'language', 'Logger', 'core/functions/UI', 'API',"Captcha","Cookie",'./modules/common/contact'
        ], function($, validate, Storage, U, language, Logger, UI, API,Captcha,Cookie,Contact) {
            var ForgetPassword = {
                config:{
                    requireCaptcha : false
                },
                init:function(){
                    this.initUIShortUse();
                    this.initViewState();
                },
                initUIShortUse: function () {
                    this.ui = {};
                    this.ui.form = $("#form-forgot");
                    this.ui.forget = $('#forgotBtn');
                    this.ui.captcha = $('.prelogin-captcha');
                    this.ui.email = $("#email");
                    this.ui.loader= $("#common-loader");
                },
                initViewState: function () {
                    var requireCaptcha = this.config.requireCaptcha;
                    var self = this;

                    //toggle captcha
                    //set i18n
                    if (!!+requireCaptcha) {
                        this.captchaObj = Captcha.init(this.ui.captcha);
                        this.ui.captcha.show();
                    } else {
                        this.ui.captcha.hide();
                    }

                    language.setDefaultLanguage('prelogin', function() {
                        self.ui.form.i18n();
                        self.ui.loader.fadeOut();
                        self.eventsBind();
                    });
                },
                eventsBind: function () {
                    this.initValidate();
                },
                initValidate: function () {
                    this.ui.form.validate({
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
                        },
                        submitHandler: function(form) {
                            this.syncInfo();
                        }.bind(this)
                    });
                },
                syncInfo: function () {
                    var self = this;
                    var data = this.getValue();

                    self.ui.forget.attr("disabled", "disabled").addClass('loading');
                    $.ajax({
                        url: API.get('orgUsers.requestPasswordReset'),
                        //Email
                        type: 'POST',
                        dataType: 'json',
                        data: JSON.stringify(data),
                        contentType: 'application/json',
                        success: function(result) {
                            Logger.success('prelogin.success.forgot', {
                                doI18n: true
                            });
                            self.clearPrevUserInfo();
                            //jump url
                            U.jumpTo('/resetnotify?send_email_flag=success&reset_email_address='+data.email);
                        },
                        error: function(resp) {
                            var email = data.email;

                            self.parseErrorAfterSendEmailFail(resp,email);
                        },
                        always: function(xhr, status) {
                            self.ui.forget.removeAttr("disabled").removeClass('loading');
                        }
                    });
                },
                getValue: function () {
                    var requireCaptcha = this.config.requireCaptcha;
                    var captchaObj = this.captchaObj;
                    var data = {
                        email: this.ui.email.val(),
                    };

                    if (requireCaptcha && (typeof(captchaObj) != 'undefined')) {
                        data['captcha'] = {
                            challenge:captchaObj.getCaptchaValue(),
                            secret: captchaObj.getCaptchaHeaderSecret()
                        };
                    }
                    return data;
                },
                clearPrevUserInfo: function () {
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
                },
                parseErrorAfterSendEmailFail: function (resp,email) {
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
                            U.jumpTo('/resetnotify?send_email_flag=fail&reset_email_address='+email);
                        }
                    });
                }
            };

            ForgetPassword.init();
            return;
        });
});
