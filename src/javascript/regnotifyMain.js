/*
 * 验证 通过邮件 激活账号 方式中token值
 */
require(['main','jquery'], function() {

	require(['jquery', 'API', 'Storage', 'language', 'Logger', 'validate',"U",'./modules/common/contact'], function($, API, Storage, language, Logger, validate,U,Contact) {
		var flagName="send_email_flag";
		var hash = window.location.hash;
		var search = window.location.search;
		var token = '';
		var pageCon = $("#regnotify");
		var submitBtn = $("#resend");

		/**
		 * [国际化]
		 * @return {[type]}   [description]
		 */
		language.setDefaultLanguage('prelogin', function() {
			initPage();
		});

		/**
		 * [initPage 初始化页面]
		 * @return {[type]} [description]
		 */
		function initPage() {
			pageCon.i18n();
			initPageValidate();

			if (search) {
				token = getToken(search,flagName);
				var verifyEmailAddress=getToken(search,"verify_email_address");
				if(token){
					if(verifyEmailAddress){
						$("#email").val(verifyEmailAddress);
						$("#email").hide();
					}else{
						$("#email").val("");
					}
					initView("send_email_"+token);
				}
				
			}else{
				pageCon.hide();
			}	
			$("#common-loader").fadeOut();

		}

		/**
		 * [initPageValidate form验证]
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


		/**
		 * [getToken 获取地址栏中 字段值]
		 * @param  {[type]} search [description]
		 * @param  {[type]} key    [description]
		 * @return {[type]}        [description]
		 */
		function getToken(search,key) {
			search = JSON.parse(search.replace(/\?/g, '{"').replace(/=/g, '":"').replace(/&/g, '","') + '"}');
			return search[key||"token"];
		}

		/**
		 * [resendRequestVerifyEmailAjax 重新发送注册激活邮件]
		 * @param  {[type]} email [description]
		 * @return {[type]}       [description]
		 */
		function resendRequestVerifyEmailAjax(email) {			
			submitBtn.attr("disabled", "disabled").addClass('loading');
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

				if (res&&res.success) {
                    Logger.success('prelogin.sendemail.success', {
                        doI18n: true
                    });
					U.jumpTo('/regnotify?send_email_flag=success&verify_email_address='+email);
				} else {
					U.jumpTo('/regnotify?send_email_flag=fail&verify_email_address='+email);
				}

			}).fail(function(rep) {
				//parse error
                Logger.error(rep);
				// initView("send_email_fail");
				U.jumpTo('/regnotify?send_email_flag=fail&verify_email_address='+email);
				
			}).always(function(){
				submitBtn.removeAttr("disabled").removeClass('loading');
			});
		}

		function initView(id) {
			$("#" + id).fadeIn().siblings().not(".control-group").fadeOut();
		}

	});


});
