/*
 * 重置密码邮件是否成功状态展示页面
 */
require(['main','jquery'], function() {

	require(['jquery', 'API', 'Storage', 'language', 'Logger', 'validate', "core/functions/UI", "U","Captcha",'Cookie','./modules/common/contact'], function($, API, Storage, language, Logger, validate, UI, U,Captcha,Cookie,Contact) {
		var flagName = "send_email_flag";
		var hash = window.location.hash;
		var search = window.location.search;
		var token = '';
		var pageCon = $("#resetnotify");
		var submitBtn = $("#resend");
		var captchaEle = $(".prelogin-captcha");
		var captchaObj;

		//国际化
		language.setDefaultLanguage('prelogin', function() {

			initPage();
		});

		/**
		 * [initPage description]
		 * @return {[type]} [description]
		 */
		function initPage() {
			captchaObj = Captcha.init(captchaEle);
			pageCon.i18n();
			initPageValidate();

			if (search) {
				token = getToken(search, flagName);
				var reset_email_address=getToken(search, "reset_email_address");
				if(reset_email_address){
					$("#email").val(reset_email_address);
					$("#email").hide();
				}else{
					$("#email").val("");
				}
			
				//验证token值是否为激活账号中得链接token值
				if (token == "fail") {
					initView("send_email_fail");
				} else if (token == "success") {
					initView("send_email_success");
				}else{
					pageCon.hide();
				}
			} else {
				pageCon.hide();
			}
			$("#common-loader").fadeOut();

		}

		/**
		 * [initPageValidate  form表单验证 ]
		 * @return {[type]} [description]
		 */
		function initPageValidate() {

			$("#send_email").validate({
				//只验证，不提交
				debug: true,
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

					if (this.valid()) {
						submitBtn.prop('disabled', false);
					} else {
						submitBtn.prop('disabled', 'disabled');
					}
				},
				submitHandler: function(form) {
					var email = $("#email").val();
					resendResetPasswordEmail(email);
					return false;
				}
			});
		}


		//获取token值
		function getToken(search, key) {
			search = JSON.parse(search.replace(/\?/g, '{"').replace(/=/g, '":"').replace(/&/g, '","') + '"}');
			return search[key || "token"];
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

		/**
		 * 重新发送重置密码邮件
		 * @return {[type]} [description]
		 */
		function resendResetPasswordEmail(email) {
			if (!captchaObj) {
				return Logger.error('Error');
			}

			var data = {
				email: email,
				captcha: {
					challenge: captchaObj.getCaptchaValue(),
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
				contentType: 'application/json'
			}).done(function(result) {
                clearPreviousUserInfo();
				//保存resetEmailAddress
                Storage.set("resetEmailAddress",data.email);
				Logger.success('prelogin.success.forgot', {
					doI18n: true
				});
				// initView("send_email_success");
				U.jumpTo("/resetnotify?send_email_flag=success&reset_email_address="+data.email);
			}).fail(function(resp) {

				Logger.error(resp);
				U.jumpTo("/resetnotify?send_email_flag=fail&reset_email_address="+data.email);

			}).always(function(xhr, status) {

				Storage.set('requireCaptcha', 1);
				captchaObj.refresh();
				submitBtn.removeAttr("disabled").removeClass('loading');


			});
		}

		function initView(id) {
			$("#" + id).fadeIn().siblings().not(".control-group").fadeOut();
		}

	});


});
