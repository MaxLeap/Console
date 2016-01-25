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

			function bindOrguserInfo(data) {
				$("#billingAddress").val(data.billingAddress);
				$("#invoiceTitle").val(data.invoiceTitle);
				$("#name").val(data.name);
				$("#phone").val(data.phone);
			}

			/**
			 * [operateOrgprofile 接口的put 与 get操作]
			 * @param  {[type]}
			 * @param  {[type]}
			 * @return {[type]}
			 */
			function operateOrgprofile(type, info) {
				var defer = Q.defer();
				$("#profile").addClass("loading");
				$(".btn-save").addClass("disabled");
				$.ajax({
					url: API.get("orgs") + "/" + AppCube.User.get('orgId'),
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
				profile_info.billingAddress = $("#billingAddress").val();
				profile_info.invoiceTitle = $("#invoiceTitle").val();
				profile_info.name = $("#name").val();
				profile_info.phone = $("#phone").val();
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

						operateOrgprofile("put", info).then(function() {
							Logger.success("common.success.update",{doI18n:true});

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
			 * [removeErrorStyle  去掉input错误样式 ]
			 * @return {[type]}
			 */
			function removeErrorStyle() {
				$(this).next(".error-msg").remove().end().parents(".field").removeClass("error");
			}

			function renderTips(){
				this.$('[data-tip]').each(function(index,e){
					var tip = $(e).attr('data-tip');
					$(e).append('<i class="sem-helper-tip icomoon icomoon-help" data-sem-key="'+tip+'"></i>');
				});
			}

			//国际化
			Language.init(function() {

				$("#profile-main").i18n();
				$("#common-loader").fadeOut();
				bindValidate();
				renderTips();
				operateOrgprofile("get").then(function(result) {
					bindOrguserInfo(result.data);
				}, function(res) {
					U.parseError(res);
				});

			});
		});
	});
});
