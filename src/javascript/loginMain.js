require(['main','jquery'], function() {
    require(['underscore', 'jquery', 'validate', 'API', 'Storage', 'language', 'Logger', 'U', 'core/functions/UI', 'Cookie', 'other/Account','Q',"Captcha",'./modules/common/contact'],
        function(_, $, validate, API, Storage, language, Logger, U, UI, Cookie, Account,Q,Captcha,Contact) {
            //打开错误
            Q.longStackSupport = true;
            var submitBtn = $('#loginBtn'),
                checkbox = $('.prelogin-pannel .options .checkbox'),
                rememberUser = Storage.get('rememberUser'),
                loginId = Storage.get('loginId'),
                requireCaptcha = Storage.get('requireCaptcha'),
                captchaEle = $('.prelogin-captcha');
            var captchaObj;

            /**
             * [initPage 初始化页面]
             * @return {[type]}
             */
            function initPage() {
                if (!!+requireCaptcha) {
                    captchaObj = Captcha.init(captchaEle);
                    captchaEle.show();
                } else {
                    captchaEle.hide();
                }

                $('.prelogin-pannel .options .checkbox-inline').click(function(e) {
                    checkbox.toggleClass('checked')
                });

                if (!!+rememberUser) {
                    checkbox.addClass('checked');
                    $("#login-email").val(loginId);
                } else {
                    checkbox.removeClass('checked');
                }
                $("#form-login").i18n();
                $('#common-loader').fadeOut();
                initPageValidate();


            }

            /**
             * [loginCheck 登录接口检查]
             * @param  {[type]}
             * @return {[type]}
             */
            function loginCheck(data){

                var defer=Q.defer();

                submitBtn.attr("disabled", "disabled").addClass('loading');

                $.ajax({
                    url: API.get('OrgUsers.login'),
                    type: 'POST',
                    dataType: 'json',
                    data: JSON.stringify(data),
                    contentType: 'application/json'
                }).done(function(user) {
                    
                    defer.resolve(user);

                }).fail(function(resp) {
                   
                    defer.reject(resp);

                }).always(function(){
                
                    submitBtn.removeAttr("disabled").removeClass('loading');
                
                });
                return defer.promise;
            }


            /**
             * [loginSuccessJump 登录成功处理]
             * @param  {[type]}
             * @return {[type]}
             */
            function loginSuccessJump(user){
                Logger.success('prelogin.success.redirect', {
                    doI18n: true
                });
                saveRemeberUserInfo($("#username").val());
                //保存sessionToken useId username
                Storage.set("sessionToken",user.sessionToken);
                Storage.set("userId",user.objectId);
                Storage.set("username",user.username);
                Storage.set("orgType",user.orgType||'App');


                if(user.timezone){
                    Storage.set("timezone",user.timezone);
                }
                if(user.language){
                    Storage.set("language",user.language);
                }
                var lastUrl = Storage.get("lastUrl");
                if (lastUrl) {
                    lastUrl = lastUrl.url || "";
                }
                if (lastUrl && (lastUrl != "") && (lastUrl != "/") && (lastUrl != "/login") && (lastUrl != "/login.html") && (!/login#/.test(lastUrl)) && (!/login.html#/.test(lastUrl))) {
                    U.jumpTo(lastUrl);
                } else {
                    U.jumpTo('/dashboard');
                }
            }


            /**
             * [loginFailHandle 登录失败处理]
             * @param  {[返回的http信息
             * ]}
             * @return {[type]}
             */
            function loginFailHandle(resp){
                U.ParseError(resp, 'prelogin', 'login-error', {
                    //验证码
                    301: function(resp) {
                        requireCaptcha = true;
                        Storage.set('requireCaptcha', 1);
                        
                        Logger.error(resp,{doI18n:true});
                    },
                    //邮箱未验证
                    215:function(resp){
                        Logger.error(resp,{doI18n:true});
                        
                        setTimeout(function(){
                            U.jumpTo("/regnotify?send_email_flag=unknown&verify_email_address="+$("#username").val());
                        },1000);
                        
                    }
                });
                //需要验证码就刷新验证码
                if(Storage.get('requireCaptcha')){
                    if (captchaObj) {
                        captchaObj.refresh();
                    } else {
                        captchaObj = Captcha.init(captchaEle);
                        captchaEle.show();
                    }
                }
            }

            /**
             * [getLoginInfo 获取登录信息]
             * @return {[type]}
             */
            function getLoginInfo(){
                var data = {
                    loginid: $("#username").val(),
                    password: $("#password").val()
                };
                if (requireCaptcha && (typeof(captchaObj) != 'undefined')) {
                    data['captcha'] = {
                        challenge:captchaObj.getCaptchaValue(),
                        secret: captchaObj.getCaptchaHeaderSecret()
                    };
                }
                return data;
            }

            /**
             * [saveRemeberUserInfo 保存记住密码信息]
             * @return {[type]}
             */
            function saveRemeberUserInfo(loginId){
                if (checkbox.hasClass('checked')) {
                    Storage.set('rememberUser', 1);
                    Storage.set('loginId', loginId);
                }
            }

            /**
             * [loginStepExcute 登录步骤执行]
             * @return {[type]}
             */
            function loginStepExcute() {

            
                 var login_info=getLoginInfo();
                 loginCheck(login_info).then(function(result){
                    loginSuccessJump(result);
                 },function(resp){
                    loginFailHandle(resp);
                 });               
            }


            /**
             * [initPageValidate 表单验证]
             * @return {[type]}
             */
            function initPageValidate() {
                $("#form-login").validate({
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
                        // loginHandler();
                        loginStepExcute();
                    }
                });
            }

            /**
             * [checkUserStatus 判断用户权限]
             * @return {[type]}
             */
            function checkUserStatus() {
                var token = Storage.get('sessionToken') || '';
                if (token && token != '') {
                    window.location.pathname = 'dashboard';
                }
            }

            checkUserStatus();
            // initLoader();
            // initLang();
            language.setDefaultLanguage('prelogin', function() {
                initPage();
            });

        });
});
