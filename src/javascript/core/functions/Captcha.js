/**
 * [description]
 * @param  {[type]} ){	} [description]
 * @return {[type]}        [description]
 */
define(['jquery','API',"Logger"], function($,API,Logger) {
	var Captcha = {};

	Captcha.init = function(ele) {

		if (!ele) {
			return;
		}
		var captcha = ele;
		var captcha_img = $(captcha).find(".captcha_img");
		var captcha_input=captcha.find("input[name=captcha]");
		getCaptchaInfo();
		initCaptchaEvent();

		//返回可用接口
		return {
			getCaptcha:function(){
				return {
					"challenge":getCaptchaValue(),
					"secret":getCaptchaHeaderSecret()
				};
			},
			getCaptchaValue: function() {
				return captcha_input.val();
			},
			getCaptchaHeaderSecret: function() {
				return captcha_img.data("HEADER_SECRET") || '';
			},
			//刷新验证码
			refresh: function() {
				getCaptchaInfo();
			}
		}

		/*
		 *  绑定事件
		 */
		function initCaptchaEvent() {
			//有些情况下可能清除body的绑定事件，需要考虑
			//bind captcha event
			captcha_img.click(function() {
				if (captcha_img.hasClass("disable")) {
					return;
				}
				getCaptchaInfo();
			});
		}


		/*
		 * 获取验证码图片的信息
		 * 
		 */
		function getCaptchaInfo() {
			var random = Math.random();
			captcha_img.attr("src", "");
			captcha_img.addClass("disable");
			$.ajax({
				url: API.get("captcha.secret"),
				type: 'get',
				data: {
					_: random
				},
				dataType: "json"
			}).done(function(data, textStatus, jqXHR) {
				//error judge
				var info = jqXHR.getResponseHeader('X-LAS-SECRET');
				captcha_img.attr("src", API.get("captcha") + "?secret=" + info).data("HEADER_SECRET", info);
			}).fail(function() {
				//显示出错图片
				captcha_img.attr({
					"src": "",
					alt: "error"
				});
				Logger.error("prelogin.error.get-captcha", {
					doI18n: true
				});
			}).always(function() {
				captcha.find(".captcha-warpper").show().end().find(".default-text").hide();
				captcha_img.removeClass("disable");
			});
		}

	};

	


		return Captcha;
});
