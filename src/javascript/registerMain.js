require(['main','jquery'], function() {
    require(['underscore', 'jquery', 'validate', 'Storage', 'U', 'language', 'Logger', 'API', 'core/functions/UI', 'Cookie', "Q","Captcha"],
        function(_, $, validate, Storage, U, language, Logger, API, UI, Cookie, Q,Captcha) {
            var submitBtn = $('#registerBtn'),
                captchaEle = $('.prelogin-captcha'),
                captchaObj = {};

            /**
             * [initPage 初始化页面]
             * @return {[type]} [description]
             */
            function initPage() {
                //创建验证码
                captchaObj = Captcha.init(captchaEle);
                $('.control-group.agree').html(language.i18n('prelogin.tips.register'));
                $("#form-register").i18n();
                initPageValidate();
                $('#common-loader').fadeOut();
            }

            /**
             * [setStorage 保存用户信息]
             * @param {[type]} options [description]
             */
            function setStorage(options) {
                Storage.clear();
                var username = options.username || '',
                    email = options.email || '',
                    roles = options.roles || [],
                    loginId = options.loginId || options.email || '',
                    userType = options.userType || '',
                    sessionToken = options.sessionToken || '',
                    apps = options.apps || [],
                    expiration = options.expiration || 0;
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
            }

            /**
             * [initPageValidate 初始化页面配置]
             * @return {[type]} [description]
             */
            function initPageValidate() {
                var form = $("#form-register");
                //todo: validate captcha
                form.validate({
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
                        },
                        captcha: {
                            required: language.i18n('prelogin.error.required'),
                            minlength: language.i18n('prelogin.error.min-length')
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
                        element
                            .closest('.control-group').removeClass('error').addClass('success');
                    },
                    onkeyup: function(element, event) {
                        if (event.which === 9 && this.elementValue(element) === "") {
                            return;
                        } else if (element.name in this.submitted || element === this.lastElement) {
                            this.element(element);
                        }

                        this.checkForm();

                        // if (this.valid()) {
                        //     submitBtn.prop('disabled', false);
                        // } else {
                        //     submitBtn.prop('disabled', 'disabled');
                        // }
                    },
                    submitHandler: function(form) {
                        // registerHandler();
                        registerStepExcute();
                    }
                });
            }

            /**
             * [getRegisterInfo 获取注册信息]
             * @return {[type]} [description]
             */
            function getRegisterInfo() {
                var captchaData = {
                    challenge: captchaObj.getCaptchaValue(),
                    secret: captchaObj.getCaptchaHeaderSecret()
                }
                var data = {
                    username: $("#username").val(),
                    email: $("#email").val(),
                    name: $("#orgname").val(),
                    phone: $("#phonenum").val(),
                    password: $("#password").val(),
                    userType: "2",
                    captcha: captchaData
                };
                return data;
            }

            /**
             * [registerCheck 注册检查]
             * @return {[type]} [description]
             */
            function registerCheck(data) {
                submitBtn.attr("disabled", "disabled").addClass('loading');

                var defer = Q.defer();
                $.ajax({
                    url: API.get('OrgUsers.register'),
                    type: 'POST',
                    dataType: 'json',
                    data: JSON.stringify(data),
                    contentType: 'application/json'
                }).done(function(user) {
                    defer.resolve(user);
                }).fail(function(resp) {
                    defer.reject(resp);
                }).always(function(xhr, status) {
                    captchaObj.refresh();
                    Storage.set('requireCaptcha', 1);
                    submitBtn.removeAttr("disabled").removeClass('loading');
                });
                return defer.promise;
            }

            /**
             * 
             * [setRegisterEmail 发送注册验证邮件]
             * 
             */
            function setRegisterEmail(user) {
                submitBtn.attr("disabled", "disabled").addClass('loading');

                var defer = Q.defer();
                //请求发送邮箱验证邮件
                $.ajax({
                    url: API.get('Email.requestEmailVerify'),
                    type: 'POST',
                    data: JSON.stringify({
                        email: user.email
                    }),
                    dataType: 'json',
                    headers: {
                        'content-Type': 'application/json'
                    }
                }).done(function(res) {
                    defer.resolve(res);
                }).fail(function(res) {
                    defer.reject(res);
                }).always(function(xhr, status) {
                    submitBtn.removeAttr("disabled").removeClass('loading');
                });
                return defer.promise;
            }

            /**
             * [registerSuccessHandle 注册成功处理]
             * @return {[type]} [description]
             */
            function registerSuccessHandle(result) {

                //保存user信息
                setStorage(result);

                Logger.success('prelogin.sendemail.success', {
                    doI18n: true
                });

                U.jumpTo('/regnotify?send_email_flag=success&verify_email_address='+$("#email").val());

                //发送注册验证邮件
                //return setRegisterEmail(result);
            }

            /**
             * [registerFailHandle 注册失败处理]
             * @return {[type]} [description]
             */
            function registerFailHandle(result) {
                //需要刷新验证码
                U.ParseError(result, 'register', 'error', {
                    301: function() {
                        Logger.error('prelogin.error.wrong-captcha', {
                            doI18n: true
                        })
                    }
                });

            }

            /**
             * [registerStepExcute 登录步骤执行]
             * @return {[type]} [description]
             */
            function registerStepExcute() {
                //将用户输入的Email address保存
                Storage.set("verifyEmailAddress",$("#username").val());

                var register_info = getRegisterInfo();
                registerCheck(register_info).then(function(result) {
                    registerSuccessHandle(result);
                    // .then(function(result) {
                    //     //发送注册验证邮件成功
                    //     Logger.success('prelogin.sendemail.success', {
                    //         doI18n: true
                    //     });

                    //     U.jumpTo('/regnotify?send_email_flag=success');
                    // }, function(result) {

                    //     //发送注册验证邮件失败
                    //     Logger.success('prelogin.sendemail.success', {
                    //         doI18n: true
                    //     });

                    //     U.jumpTo('/regnotify?send_email_flag=fail');
                    // });
                }, function(result) {
                    registerFailHandle(result);
                });
            }

            //国际化完成 关闭loading
            language.init(function() {
                language.setDefaultLanguage('prelogin', function() {
                    initPage();
                });
            });
        });
});
