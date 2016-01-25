require(['main','jquery'], function() {
	require([
		'modules/common/bootstrapper', 
		'language', 
		'Q', 
		"tpl!config/timezone.json", 
		"API", 
		"Storage", 
		"Logger", 
		"core/functions/Validator",
		"U",
		"pace",
		'C',
		'app'
	], function(B, Language, Q, Timezone, API, Storage, Logger, Validator,U,Pace,C,AppCube) {
		B.init().done(function() {
			/**
			 * [getDropdownData 获取dropdown数据]
			 * @return {[type]}
			 */
			function getDropdownData() {
				var defer = Q.defer();
				$.when(
					$.ajax("/javascript/config/timezone.json"),
					$.ajax({
						url: API.get("Lang"),
						dataType: 'json',
						headers: {
							'X-LAS-Session-Token': C.get('User.SessionToken'),
							'content-Type': 'application/json'
						}
					})
				)
				.done(function(timezone, language) {
					defer.resolve({
						"timezone": timezone[0],
						"language": language[0]
					});
				}).fail(function(res) {
					defer.reject(res);
				});
				return defer.promise;
			}

			/**
			 * [prepareDropdownTeamplate 准备dropdown html]
			 * @param  {[type]}
			 * @param  {[type]}
			 * @return {[type]}
			 */
			function prepareDropdownTeamplate(key, data) {
				data = data[key];
				var template = '<div class="item" data-value="{{value}}">{{text}}</div>';
				var template_str_arr = [];
				var i, len;
				if (key == 'language') {
					for (i = 0, len = data.length; i < len; i++) {
						template_str_arr.push(template.replace(/{{value}}/, data[i]['code']).replace(/{{text}}/, data[i]["name"]));
					}
				} else if (key == 'timezone') {
					for (i = 0, len = data.length; i < len; i++) {
						template_str_arr.push(template.replace(/{{value}}/, data[i]).replace(/{{text}}/, data[i]));
					}
				}

				return template_str_arr.join("");
			}

			/**
			 * [
			 * 	initDropdown 初始化dropdown
			 * ]
			 * @param  {[data  数据源]}
			 * @return {[type]}
			 */
			function initDropdown(data) {
				//var template_language = prepareDropdownTeamplate("language", data);
				var template_timezone = prepareDropdownTeamplate("timezone", data);
				//$(".dropdown-language").find(".menu").append(template_language).end().dropdown({
				//	onChange: function() {
				//		removeErrorStyle.call(this);
				//	}
				//});
				$(".dropdown-timezone").find(".menu").append(template_timezone).end().dropdown({
					onChange: function() {
						removeErrorStyle.call(this);
					}
				});
			}



			/**
			 * [bindOrguserInfo  绑定orguser信息]
			 * @param  {[type]}
			 * @return {[type]}
			 */
			function bindOrguserInfo(data) {
				$("#username").val(data.username);
				$("#email").val(data.email);
				//默认 Asia/Chongqing，en
				$(".dropdown-language").dropdown("set selected", data.language || "en");
				$(".dropdown-timezone").dropdown("set selected", data.timezone || "Asia/Shanghai");
			}

			/**
			 * [operateOrguserInfo orguser 借口的put 与 get操作]
			 * @param  {[type]}
			 * @param  {[type]}
			 * @return {[type]}
			 */
			function operateOrguserInfo(type, info) {
				var defer = Q.defer();
				$("#profile").addClass("loading");
				$(".btn-save").addClass("disabled")
				$.ajax({
					url: API.get("OrgUsers") + "/" +AppCube.User.get('userId'),
					dataType: 'json',
					type: type,
					data: JSON.stringify(info) || {},
					headers: {
						'X-LAS-Session-Token': C.get("User.SessionToken"),
						'content-Type': 'application/json'
					}
				}).done(function(data) {
					defer.resolve({
						data: data,
						type: type
					});
				}).fail(function(res) {
					defer.reject(res.responseJSON.errorMessage);
				}).always(function() {
					$("#profile").removeClass("loading");
					$(".btn-save").removeClass("disabled")
				});
				return defer.promise;
			}

			/**
			 * [getFormInfo 获取表单信息]
			 * @return {[type]}
			 */
			function getFormInfo() {
				var profile_info = {};
				profile_info.username = $("#username").val();
				// profile_info.email = $("#email").val();
				profile_info.timezone = $(".dropdown-timezone").dropdown("get value");
				// profile_info.language = $(".dropdown-language").dropdown("get value");
				return profile_info;
			}

			/**
			 * [bindValidate 表单提交及验证]
			 * @return {[type]}
			 */
			function bindValidate() {
				var form = $("#profile");
				$(".btn-save").click(function() {
					if (Validator.check(form)) {
						var info = getFormInfo();

						operateOrguserInfo("put", info).then(function() {
							Logger.success("common.success.update",{doI18n:true});
							//re rerender username right
							$("#info-username").find(".username").text(info.username);
							if(info.timezone){
								Storage.set("timezone",info.timezone);
							}
							if(info.language){
								Storage.set("language",info.language);
							}


						}, function(res) {
							Logger.error("common.fail.update",{doI18n:true});
						});
					}

				});
				form.delegate(".validate", "keyup", function() {
					if (Validator.check($(this).parents(".field"))) {
						removeErrorStyle.call(this);
					}
				});

			}

			/**
			 * [removeErrorStyle  去掉input 和 dropdown 错误样式 ]
			 * @return {[type]}
			 */
			function removeErrorStyle() {
				$(this).next(".error-msg").remove().end().parents(".field").removeClass("error");
			}

			//国际化
			Language.init(function() {

				$("#profile-main").i18n();
				$("#common-loader").fadeOut();
				bindValidate();

				//获取drown信息并绑定
				getDropdownData().then(function(data) {
					initDropdown(data);
				}, function(res) {
					U.parseError(res);
				}).then(function() {
					return operateOrguserInfo("get");
				}).then(function(result) {
					bindOrguserInfo(result.data);
				}, function(res) {
					U.parseError(res);
				});

			});
		});
	});
});
