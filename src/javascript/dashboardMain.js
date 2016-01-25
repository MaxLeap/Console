require(['main','jquery'], function() {

	require(['modules/common/bootstrapper', 'jquery'], function(B, $) {
		$("#header-nav").data("welcome-sign", true);

		B.init().done(function() {
			$('#create_app,#entry-main').i18n();
			var entryMain = $("#entry-main");

			var len_nav = entryMain.find("li").length;

			entryMain.i18n();


			if (len_nav == 0) {

				$("#no_navmenu").fadeIn();
			}
		});

	});

});
