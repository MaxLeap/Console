require(['main','jquery'], function() {
    require(['underscore', 'jquery', 'validate', 'Storage', 'U', 'language', 'Logger', 'API', 'core/functions/UI', 'Cookie', "Q","Captcha"],
        function(_, $, validate, Storage, U, language, Logger, API, UI, Cookie, Q,Captcha) {
            
            var Register = {
                config:{
                    requireCaptcha : false
                },
                init: function () {
                    this.initUIShortUse();
                    this.initViewState();
                },
                initUIShortUse: function () {
                    this.ui = {};
                    this.ui.form = $("#form-register");
                    this.ui.loader = $("#common-loader");
                    this.ui.register = $("#registerBtn");
                    this.ui.email = $("#email");
                    this.ui.username = $("#username");
                    this.ui.password = $("#password");
                    this.ui.phone = $("#phonenum");
                    this.ui.orgName  = $("#orgname"),
                    this.ui.captcha = $('.prelogin-captcha');
                },
                initViewState: function () {
                    var self = this;
                    var requireCaptcha = this.config.requireCaptcha;

                    if(requireCaptcha){
                        this.captchaObj = Captcha.init(this.ui.captcha);
                        this.ui.captcha.show();
                    }else{
                        this.ui.captcha.hide();
                    }
                    language.setDefaultLanguage('prelogin', function() {
                        self.ui.form.i18n();
                        self.ui.loader.hide();
                        self.eventsBind();
                    });
                },
                eventsBind: function () {
                    var self = this;

                    self.initValidate();
                },
                initValidate: function () {
                    //todo: validate captcha
                    this.ui.form.validate({
                        debug:true,
                        rules: {
                            rpassword: {
                                equalTo: "#password"
                            }
                        },
                        messages: {
                            username: {
                                required: language.i18n('prelogin.error.required'),
                                minlength: language.i18n('prelogin.error.min-length')
                            },
                            orgname: {
                                required: language.i18n('prelogin.error.required'),
                                minlength: language.i18n('prelogin.error.min-length')
                            },
                            email: {
                                required: language.i18n('prelogin.error.required'),
                                minlength: language.i18n('prelogin.error.min-length'),
                                email: language.i18n('prelogin.error.email')
                            },
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
                            submitBtn.attr("disabled", "disabled");
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

                    //将用户输入的Email address保存
                    Storage.set("verifyEmailAddress",this.ui.email.val());
                    this.ui.register.attr("disabled", "disabled").addClass('loading');
                    $.ajax({
                        url: API.get('OrgUsers.register'),
                        type: 'POST',
                        dataType: 'json',
                        data: JSON.stringify(data),
                        contentType: 'application/json',
                        headers:{
                            "X-ML-Locale":language.getLowerCase(Storage.get("language"))
                        }
                    }).done(function(user) {
                        //保存user信息
                        self.saveInfoAfterRegisterSuccess(user);
                        self.jumpAfterRegisterSuccess();
                    }).fail(function(resp) {
                        self.parseErrorAfterRegisterFail(resp);
                        //refresh Captcha After RegisterFail
                        if(self.config.requireCaptcha){
                            self.captchaObj.refresh();
                        }
                    }).always(function(xhr, status) {
                        this.ui.register.removeAttr("disabled").removeClass('loading');
                    }.bind(this));
                },
                getValue:function() {
                    var data = {
                        username: this.ui.username.val(),
                        email: this.ui.email.val(),
                        name: this.ui.orgName.val(),
                        phone: this.ui.phone.val(),
                        password: this.ui.password.val(),
                        userType: "2"
                    };
                    var requireCaptcha = this.config.requireCaptcha;

                    if(requireCaptcha){
                        data.captcha = {
                            challenge: this.captchaObj.getCaptchaValue(),
                            secret: this.captchaObj.getCaptchaHeaderSecret()
                        }
                    }

                    return data;
                },
                saveInfoAfterRegisterSuccess: function (user) {
                    var options = user;
                    var username = options.username || '';
                    var email = options.email || '';
                    var roles = options.roles || [];
                    var loginId = options.loginId || options.email || '';
                    var userType = options.userType || '';
                    var sessionToken = options.sessionToken || '';
                    var apps = options.apps || [];
                    var expiration = options.expiration || 0;

                    //clear
                    Storage.clear();

                    Storage.set('requireCaptcha', 0);
                    Storage.set('username', username);
                    Storage.set('email', email);
                    Storage.set('roles', '' + roles);
                    Storage.set('loginId', loginId);
                    Storage.set('userType', userType);
                    Storage.set('sessionToken', sessionToken);
                    Storage.set('expiration', expiration);
                    Storage.set('apps', apps);
                    Storage.set('permissions', options.permissons);
                    Storage.set('userId', options.objectId);

                },
                jumpAfterRegisterSuccess: function () {
                    Logger.success('prelogin.sendemail.success', {
                        doI18n: true
                    });
                    U.jumpTo('/regnotify?send_email_flag=success&verify_email_address='+this.ui.email.val());
                },
                parseErrorAfterRegisterFail: function (result) {
                    //需要刷新验证码
                    U.ParseError(result, 'register', 'error', {
                        301: function() {
                            Logger.error('prelogin.error.wrong-captcha', {
                                doI18n: true
                            })
                        }
                    });
                }
            };

            Register.init();
            return;
        });
});
