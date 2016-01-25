/*
 * 验证 通过邮件 激活账号 方式中token值
 */
require(['main','jquery'], function() {

	require(['jquery', 'API', 'Storage', 'language', 'Logger', 'validate','./modules/common/contact'], function($, API, Storage, language, Logger, validate,Contact) {
		var hash = window.location.hash;
		var search = window.location.search;
		var token = '';
		var pageCon = $("#verify");
		var appId ='';
		$(function() {

			language.setDefaultLanguage('prelogin', function() {
				initPage();
			});

		});

		function initPage() {
			pageCon.i18n();
			initPageValidate();

			if (search) {
				token = getToken(search);
				appId = getAppId(search);
				//验证token值是否为激活账号中得链接token值
				if(token){
					sendVerifyEmailAjax(token);
				}
			}
			else{
				$("#common-loader").fadeOut();
			}

		}

		function initPageValidate() {
			var submitBtn = $("#resend");
			$("#fail").validate({
				//只验证，不提交
				debug:true,
				rules: {
					email: {
						required: true,
						email: true
					}
				},
				messages: {
					email: {
						required: language.i18n('prelogin.error.required'),
						email: language.i18n('prelogin.error.email')
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
					resendRequestVerifyEmailAjax(email);
					return false;
				}
			});
		}


		//获取token值
		function getToken(search) {
			search = JSON.parse(search.replace(/\?/g, '{"').replace(/=/g, '":"').replace(/&/g, '","') + '"}');
			return search.token;
		}
		function getAppId(search){
			search = JSON.parse(search.replace(/\?/g, '{"').replace(/=/g, '":"').replace(/&/g, '","') + '"}');
			return search.appId;
		}

		//重新往用户所填邮箱发送邮件
		function resendRequestVerifyEmailAjax(email) {
			sendAjaxLoading(true,$("#resend"));
			$("#resend").addClass("disable");
			$.ajax({
				url: API.get('Email.requestEmailVerify'),
				type: 'POST',
				data: JSON.stringify({
					email: email
				}),
				dataType: 'json',
				headers: {
					'content-Type': 'application/json'
				}
			}).done(function(res) {
				Logger.success('prelogin.sendemail.success', {
					doI18n: true
				});
				if (res.success) {
					// initView("pass");
					sendAjaxLoading(false, $("#resend"));
					window.location.href="/regnotify?send_email_flag=success";
					// console.log("jump to  sendemail success");
				} else {
					initView("fail");
					sendAjaxLoading(false, $("#resend"));
				}

			}).fail(function(rep) {
				// Logger.error('prelogin.sendemail.fail', {
				// 	doI18n: true
				// });
				Logger.error(rep);
				initView("fail");
				sendAjaxLoading(false, $("#resend"));
			});
		}

		/*
		 * 发送verifyemail 请求
		 */
		function sendVerifyEmailAjax(token) {

			
			if(appId){
				//normal user
				//orgUser
				$.ajax({
					url: API.get('Data.verifyEmail')+"/"+token,
					type: 'GET',
					// data: JSON.stringify({
					// 	"sessionToken": token
					// }),
					dataType: 'json',
					headers: {
						'content-Type': 'application/json',
						'X-LAS-AppId':appId,
					}
				}).done(function(res) {
					Logger.success('prelogin.verifyemail.verify-success', {
						doI18n: true
					});
					initView("pass");
					initAutoJump();


				}).fail(function(res) {

					// Logger.error('prelogin.verifyemail.verify-fail', {
					// 	doI18n: true
					// });
					Logger.error(res);
					initView("fail");

				}).always(function() {
					$("#common-loader").fadeOut();
				});	

			}else{

				//orgUser
				$.ajax({
					url: API.get('Email.verifyEmail'),
					type: 'POST',
					data: JSON.stringify({
						"sessionToken": token
					}),
					dataType: 'json',
					headers: {
						'content-Type': 'application/json'
					}
				}).done(function(res) {
					Logger.success('prelogin.verifyemail.verify-success', {
						doI18n: true
					});
					initView("pass");
					initAutoJump();


				}).fail(function(res) {

					// Logger.error('prelogin.verifyemail.verify-fail', {
					// 	doI18n: true
					// });
					Logger.error(res);
					initView("fail");

				}).always(function() {
					$("#common-loader").fadeOut();
				});	
			}
			
		}

		function getAjaxHeader(appId){
            var resetAjaxHeader;

            if(appId){
                resetAjaxHeader = {
                    //从url中获取的token值和appId
                    // 'X-LAS-Session-Token': token,
                    'X-LAS-AppId':appId,
                    'content-Type': 'application/json'
                };
            }else{
                resetAjaxHeader = {
                    //从url中获取的token值
                    // 'X-LAS-Session-Token': token,
                    'content-Type': 'application/json'
                };
            }
            return resetAjaxHeader;
        }
		/*
		 *发送ajax请求改变按钮状态
		 */
		function sendAjaxLoading(showLoading, tag) {

			if (!showLoading) {
				tag.find(".text").show().end().find(".circle").hide().end().removeClass("disable");
			} else {
				tag.find(".text").hide().end().find(".circle").show().end().addClass("disable");
			}
		}



		function initAutoJump() {
			var i = 2;
			initView("verifyemail_success");
			setInterval(function() {
				$("#auto_jump").text(i--);
				if (i < 0) {
					window.location.href = "/login";
				}
			}, 1000);

		}

		function initView(id) {
			$("#" + id).fadeIn().siblings().fadeOut();
		}

	});


});
