require(['main','jquery'], function (){
    require([
        'app',
        'C',
        'Storage',
        'language',
        'jquery',
        './modules/common/contact'
    ],function(AppCube,C,Storage,lang,$,Contact){

        var initApp = function(){
            $('body').i18n();
        };

        $('#common-loader').hide();
        lang.setDefaultLanguage('prelogin',initApp);
    });
});