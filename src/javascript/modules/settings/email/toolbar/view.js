define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'app',
    'Logger',
    'dispatcher',
    'tpl!./template.html'
], function(_, $, Backbone, Marionette, AppCube,Logger,Dispatcher,template) {
    return Marionette.ItemView.extend({
        template: template,
        events: {
            'keyup input':'changeInput'
        },
        beforeShow:function(){
            var valueEventName = this.options.valueEventName;
            Dispatcher.on('Request.getValue:'+valueEventName,this.getValue,this,'SearchContainer');
        },
        beforeHide:function(){
            var valueEventName = this.options.valueEventName;
            Dispatcher.off('Request.getValue:'+valueEventName,'Component');
        },
        render: function(options) {
        	var self = this;

            Marionette.ItemView.prototype.render.call(self);
           	self.initShortUsage(options).initUI();
        },
        initShortUsage: function(options) {

            this.$title = this.$(".item-title");
            this.objectId = options.id;

            return this;
        },
        initUI:function(){
            var self = this;

        	self.$el.i18n();
            self.renderTips();

        	return self;
        },
        renderTips: function() {
            var self = this;
            self.$el.find('[data-tip]').each(function(index, e) {
                var tip = $(e).attr('data-tip');
                var existI = $(e).find("i[data-sem-key]");
                if ($(e).find("i[data-sem-key]").length != 0) {
                    return;
                }
                $(e).append('<i class="sem-helper-tip" data-sem-key="' + tip + '"></i>');
            });
        },
        getValue:function(){
            var search = this.$('[name=search]').val();
            if(search){
                return JSON.stringify({
                    templateName:{"$regex": "\\Q" + search + "\\E","$options":"i"}
                });    
            }else{
                return {};
            }
        },
        changeInput:function(e){
            var self = this;
            var connectTableValueEventName = self.options.connectTableValueEventName;

            self.updateFilter();
            Dispatcher.request("restorePager:"+connectTableValueEventName,{},'Component');
        },
        updateFilter:(function(){
            return _(function(){
                AppCube.DataRepository.refresh("Store:Email");
            }).debounce(200);
        })()
    });

});
