require(['main','jquery'], function() {

	require(['jquery', 'API', 'Storage', 'language', 'Logger','U','./modules/common/contact'], function($, API, Storage, language, Logger,U,Contact) {
		var hash = window.location.hash;
		var views = ['success', 'fail', "fail_reset", "success_reset"];
		var hashConfig = {
			"success": "sendemail_success",
			"fail": 'sendemail_fail',
			"success_reset": "sendresetpassword_success",
			"fail_reset": 'sendresetpassword_fail'
		}
		var search = window.location.search;
		var token = '';
		$(function() {

			language.init(function() {
				language.setDefaultLanguage('prelogin', function() {
					initPage();
				});
			});

		});

		function initPage() {
			$("#verifyemail").i18n();
			if (hash) {
				hash = hash.replace("#", '');
				if ($.inArray(hash, views) == -1) {
					hash = 'success';
				}
				changeHashAndInitPage(hash);
			} else {
				if (search) {
					token = getToken(search);
					//根据token值去验证邮件
					sendVerifyEmailAjax(token);
				}
			}

			$("#common-loader").fadeOut();

			$("#resend").click(function() {
				U.jumpTo('/register');
			});

			$("#resend_reset").unbind("click").click(function() {
				U.jumpTo('/forgot');
			});

		}

		//获取token值
		function getToken(search) {
			search = JSON.parse(search.replace(/\?/g, '{"').replace(/=/g, '":"').replace(/&/g, '","') + '"}');
			return search.token;
		}

		//重新往用户所填邮箱发送邮件
		function resendRequestVerifyEmailAjax(email) {
			sendAjaxLoading(true);
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
					sendAjaxLoading(false);
					changeHashAndInitPage('success');
				} else {
					changeHashAndInitPage('fail');
					sendAjaxLoading(false);
				}

			}).fail(function() {
				Logger.error('prelogin.sendemail.fail', {
					doI18n: true
				});
				changeHashAndInitPage('fail');
				sendAjaxLoading(false);
			});
		}

		function resendRequestPasswordReset(email){
			sendAjaxLoading(true);
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
					sendAjaxLoading(false);
					changeHashAndInitPage('success');
				} else {
					changeHashAndInitPage('fail');
					sendAjaxLoading(false);
				}

			}).fail(function() {
				Logger.error('prelogin.sendemail.fail', {
					doI18n: true
				});
				changeHashAndInitPage('fail');
				sendAjaxLoading(false);
			});
		}
		/*
		* 发送verifyemail 请求
		*/
		function sendVerifyEmailAjax(token) {
			$("#common-loader").fadeIn();
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
				$("#common-loader").fadeOut();
				Logger.success('prelogin.verifyemail.verify-success', {
					doI18n: true
				});
				initAutoJump();

			}).fail(function() {
				$("#common-loader").fadeOut();
				Logger.success('prelogin.verifyemail.verify-fail', {
					doI18n: true
				});
				initView("verifyemail_fail");

			});
		}

		/*
		 *发送ajax请求改变按钮状态
		 */
		function sendAjaxLoading(showLoading, tag) {
			var tag = tag || $("#resend");
			if (!showLoading) {
				tag.find(".text").show().end().find(".circle").hide().end().removeClass("disable");
			} else {
				tag.find(".text").hide().end().find(".circle").show().end().addClass("disable");
			}
		}

		function changeHashAndInitPage(hash) {
			window.location.hash = hash;

			initView(hashConfig[hash]);
		}

		function initAutoJump() {
			var i = 2;
			initView("verifyemail_success");
			setInterval(function() {
				$("#auto_jump").text(i--);
				if (i < 0) {
					U.jumpTo('/login');
				}
			}, 1000);

		}

		function initView(id) {
			$("#" + id).fadeIn().siblings().fadeOut();
		}

	});


});
