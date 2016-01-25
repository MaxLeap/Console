define([
    'app',
    'C',
    'core/functions/UI',
    'core/functions/LayoutRender',
    'core/functions/StoreLoader',
    'modules/common/bootstrapper',
    './main/layout',
	'./router',
    './store',
    'jquery',
    'backbone',
    'i18n'
],function(AppCube,C,UI,LayoutRender,StoreLoader,Bootstrapper,
           Main,
           Router,store,$,Backbone,i18n){

    Bootstrapper.init(true).done(function(){
        var AppId = C.get('User.AppId');
        if(AppId){
            C.set('Ajax.HTTPHEADER.X-LAS-AppId', AppId);
        }
        $('#main-toolbar .module-name').append('<div class="menu-name">'+i18n.t('common.module.clouddata')+'</div>');
        LayoutRender.render(Main);
        StoreLoader.load(store);
        AppCube.Router = new Router();
        Backbone.history.start();
    });
});