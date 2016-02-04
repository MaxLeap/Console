require(['main','jquery'], function() {
    require(['underscore', 'jquery', 'validate', 'API', 'Storage', 'language', 'Logger', 'U', 'core/functions/UI', 'Cookie', 'other/Account','Q',"Captcha",'./modules/common/contact'],
        function(_, $, validate, API, Storage, language, Logger, U, UI, Cookie, Account,Q,Captcha,Contact) {
            //打开错误
            var Login = {
                config:{
                    requireCaptcha : false
                },
                init:function(){
                    this.checkAlreadyLogin();
                    this.initUIShortUse();
                    this.initViewState();
                },
                checkAlreadyLogin: function () {
                    var token = Storage.get('sessionToken') || '';

                    if (token && token !== '') {
                        U.jumpTo('dashboard');
                    }
                },
                initUIShortUse: function () {
                    this.ui = {};
                    this.ui.form = $("#form-login");
                    this.ui.loader = $("#common-loader");
                    this.ui.login = $("#loginBtn");
                    this.ui.remember = $(".icon.checkbox");
                    this.ui.rememberWarpper = $(".checkbox-inline");
                    this.ui.username = $("#username");
                    this.ui.password = $("#password");
                    this.ui.captcha = $('.prelogin-captcha');
                },
                initValidate: function () {
                    var self = this;

                    this.ui.form.validate({
                        debug:true,
                        rules: {
                            username: {
                                required: true,
                                minlength: 6,
                            },
                            password: {
                                required: true,
                                minlength: 8
                            }
                        },
                        messages: {
                            username: {
                                required: language.i18n('prelogin.error.required'),
                                minlength: language.i18n('prelogin.error.min-length')
                            },
                            password: {
                                required: language.i18n('prelogin.error.required'),
                                minlength: language.i18n('prelogin.error.min-length')
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
                            self.syncInfo();
                        }
                    });
                },
                initViewState: function () {
                    var requireCaptcha = this.config.requireCaptcha;
                    var storageCaptcha = Storage.get('requireCaptcha');
                    var self = this;

                    //set checkbox
                    //toggle captcha
                    //set i18n
                    if (!!+requireCaptcha&&storageCaptcha) {
                        this.captchaObj = Captcha.init(this.ui.captcha);
                        this.ui.captcha.show();
                    } else {
                        this.ui.captcha.hide();
                    }
                    if (!!+Storage.get("rememberUser")) {
                        this.ui.remember.addClass('checked');
                    } else {
                        this.ui.remember.removeClass('checked');
                    }

                    language.setDefaultLanguage('prelogin', function() {
                        self.ui.form.i18n();
                        self.ui.loader.fadeOut();
                        self.eventsBind();
                        //i18n
                    });

                },
                eventsBind: function () {
                    var self = this;

                    this.ui.rememberWarpper.click(function(e) {
                        self.ui.remember.toggleClass("checked");
                    });
                    self.initValidate();
                },
                getValue: function () {
                    var requireCaptcha = this.config.requireCaptcha;
                    var captchaObj = this.captchaObj;
                    var data = {
                        loginid: this.ui.username.val(),
                        password: this.ui.password.val()
                    };

                    if (requireCaptcha && (typeof(captchaObj) != 'undefined')) {
                        data['captcha'] = {
                            challenge:captchaObj.getCaptchaValue(),
                            secret: captchaObj.getCaptchaHeaderSecret()
                        };
                    }
                    return data;
                },
                syncInfo: function () {
                    var data=this.getValue();
                    var self = this;

                    this.ui.login.attr("disabled", "disabled").addClass('loading');
                    $.ajax({
                        url: API.get('OrgUsers.login'),
                        type: 'POST',
                        dataType: 'json',
                        data: JSON.stringify(data),
                        contentType: 'application/json',
                        headers:{
                            "X-ML-Locale":language.getLowerCase(Storage.get("language"))
                        }
                    }).done(function(user) {
                        //logger info
                        Logger.success('prelogin.success.redirect', {
                            doI18n: true
                        });
                        self.saveInfoAfterLoginSuccess(user);
                        self.jumpAfterLoginSuccess();
                    }).fail(function(resp) {
                        self.parseErrorAfterLoginFail(resp);
                        self.refreshCaptchaAfterLoginFail();
                    }).always(function(){
                        self.ui.login.removeAttr("disabled").removeClass('loading');
                    });
                },
                saveInfoAfterLoginSuccess: function (user) {

                    if (this.ui.remember.hasClass('checked')) {
                        Storage.set('rememberUser', 1);
                        Storage.set('loginId', user.username);
                    }
                    //保存sessionToken useId username
                    Storage.set("sessionToken",user.sessionToken);
                    Storage.set("userId",user.objectId);
                    Storage.set("username",user.username);
                    Storage.set("orgType",user.orgType||'App');
                    Storage.set("requireCaptcha",null);
                    if(user.timezone){
                        Storage.set("timezone",user.timezone);
                    }
                    if(user.language){
                        Storage.set("language",user.language);
                    }
                },
                jumpAfterLoginSuccess: function () {
                    var lastUrl = Storage.get("lastUrl");

                    if (lastUrl) {
                        lastUrl = lastUrl.url || "";
                    }
                    if (lastUrl && (lastUrl != "") && (lastUrl != "/") && (lastUrl != "/login") && (lastUrl != "/login.html") && (!/login#/.test(lastUrl)) && (!/login.html#/.test(lastUrl))) {
                        U.jumpTo(lastUrl);
                    } else {
                        U.jumpTo('/dashboard');
                    }
                },
                parseErrorAfterLoginFail: function (resp) {
                    var self = this;

                    U.ParseError(resp, 'prelogin', 'login-error', {
                        //验证码
                        301: function(resp) {
                            Storage.set('requireCaptcha',true);
                            Logger.error(resp,{doI18n:true});
                        },
                        //邮箱未验证
                        215:function(resp){
                            Logger.error(resp,{doI18n:true});
                            setTimeout(function(){
                                var url = "/regnotify?send_email_flag=unknown&verify_email_address="+self.ui.username.val();

                                U.jumpTo(url);
                            },1000);

                        }
                    });
                },
                refreshCaptchaAfterLoginFail: function () {
                    var self = this;
                    var requireCaptcha = self.config.requireCaptcha;
                    var storageCaptcha = Storage.get('requireCaptcha');

                    //需要验证码就刷新验证码
                    if(requireCaptcha){
                        if (self.captchaObj) {
                            self.captchaObj.refresh();
                        } else {
                            self.captchaObj = Captcha.init(self.ui.captcha);
                            self.ui.captcha.show();
                        }
                    }
                }
            };

            Login.init();
            return;
        });
});
