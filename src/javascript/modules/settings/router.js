define([
    'app',
    'C',
    'dispatcher',
    'jquery',
    'backbone',
    'marionette'
], function (AppCube,C,Dispatcher,$,Backbone,Marionette) {
    return Backbone.Marionette.AppRouter.extend({
        appRoutes:{
            "(:action)(/:state)(/:objectId)":"renderPageLayout"
        },
        controller:{
            renderPageLayout:function(action,state,objectId){
                //var os = C.get('User.AppOS');
                //if(os!='android'&&action=='iap')action = 'general';
                if(!action)action='general';
                this.renderSideBar(action);
                Dispatcher.trigger('hide',{action:action,state:state,options:{id:objectId}},'Layout');
                Dispatcher.trigger('show',{action:action,state:state,options:{id:objectId}},'Layout');
            },
            renderSideBar:function(mname){
                var parentMenu = $('#main-sidebar .list>a[href=#'+mname+']');
                $('#main-sidebar .list>a').removeClass('active');
                parentMenu.addClass('active');
                var parentMenuName = parentMenu.find('.tip').text();
                $('#main-toolbar .menu-name').text(parentMenuName);
            }
        }
    });
});