define([
    'app',
    'C',
    'core/functions/LayoutRender',
    'core/functions/StoreLoader',
    'modules/common/bootstrapper',
    './general/layout',
	'./application/layout',
	'./notification/layout',
    './authentication/layout',
	'./email/layout',
    './iap/layout',
    './system/layout',
	'./router',
    './store',
    'jquery',
    'backbone',
    'core/functions/UI',
    'pace'
],function(AppCube,C,LayoutRender,StoreLoader,Bootstrapper,
           General,Application,Notification,Authentication,Email,IAP,System,
           Router,store,$,Backbone,UI,Pace){

    Bootstrapper.init(true).done(function(){
        var AppId = C.get('User.AppId');
        if(AppId){
            C.set('Ajax.HTTPHEADER.X-LAS-AppId', AppId);
        }
        //var os = C.get('User.AppOS');
        //if(os!='android'){
        //    $('#main-sidebar .list>a:last').hide();
        //}
        LayoutRender.render(General);
        LayoutRender.render(Application);
        LayoutRender.render(Notification);
        LayoutRender.render(Authentication);
        LayoutRender.render(Email);
        LayoutRender.render(IAP);
        LayoutRender.render(System);
        StoreLoader.load(store);
        AppCube.Router = new Router();
        Backbone.history.start();
    });
});