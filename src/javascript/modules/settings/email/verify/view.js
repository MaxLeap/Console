define([
	'marionette',
	'app',
	'tpl!./template.html',
	'Logger',
],function(Marionette,AppCube,template,Logger){
	return Marionette.ItemView.extend({
        template: template,
        events: {
        	"click .ui.checkbox": "updateEmailVerify",
        },
        render: function(options) {
        	var self = this;

            Marionette.ItemView.prototype.render.call(self);
            self.$verifyEmail = self.$el.find(".ui.checkbox");
            return self;
        },
    	updateEmailVerify:function(e){
 			var self = this;
 			       	
        	AppCube.DataRepository.getStore('Store:Application').updateData({
                "emailConfig": {    
                    "verifyEmail": self.$verifyEmail.checkbox("is checked") 
                }
            }).done(function(){
            	Logger.success("common.success.update",{
            		doI18n:true
            	});
            });

        }
    });
});