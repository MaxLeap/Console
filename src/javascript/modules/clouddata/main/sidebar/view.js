define([
    'app',
    'U',
    'Logger',
    'dispatcher',
    'core/functions/UI',
    './newClass/view',
    'tpl!./template.html',
    'marionette',
    'jquery',
    'underscore',
    'i18n',
    'nicescroll'
], function (AppCube,U,Logger,Dispatcher, UI, newClass, template, Marionette, $, _, i18n,nicescroll) {
    return Marionette.ItemView.extend({
        template: template,
        events: {
            "keyup .search-input": "filterList",
            "click .ui.button.add-class":"addClass",
            "click .ui.button.import-class":"importClass"
        },
        init:function(){
            var storeName = this.options.storeName;
            this.childTemplate = _.template('' +
                '<li class="list-item" data-value="<%= objectId %>" data-count="<%= count %>" data-name="<%= className %>">' +
                '<a href="#classes/<%= className %>"><%= classDisplayName %><span class="badge"><%= count %></span></a>' +
                '</li>');
            Dispatcher.on('refresh:' + storeName, this.renderComponent, this, 'Component');
        },
        beforeShow:function(){
            var eventName = this.options.valueEventName;
            Dispatcher.on('Request.getValue:' + eventName, this.getValue, this, 'Component');
            Dispatcher.on('show:Class',this.highLightItem,this,'Layout');
            Dispatcher.on('show:Pointer',this.highLightItem,this,'Layout');
            Dispatcher.on('show:Relation',this.highLightSubItem,this,'Layout');
        },
        beforeHide:function(){
            var eventName = this.options.valueEventName;
            Dispatcher.off('show:Class','Layout');
            Dispatcher.off('show:Pointer','Layout');
            Dispatcher.off('show:Relation','Layout');
            Dispatcher.off('Request.getValue:' + eventName, 'Component');
        },
        addClass:function(){
            var storeName = this.options.storeName;
            UI.showDialog(i18n.t("clouddata.title.new-class"),newClass,{
                size:'small',
                btns:{
                    negative:'common.form.cancel',
                    positive:'common.form.create'
                },
                success:function(view){
                    if(view.isValid()) {
                        var value = view.getValue();
                        view.showLoading();
                        AppCube.DataRepository.getStore(storeName).addData(value).done(function(res){
                            AppCube.DataRepository.refresh('Store:Schemas');
                            Logger.success(i18n.t("common.success.create"));
                            U.goTo('classes/'+value.className);
                            UI.hideDialog();
                        },function(){
                            view.hideLoading();
                        });
                    }
                }
            });
        },
        importClass:function(){
            Dispatcher.request('ImportClass',{},'Component');
        },
        filterList: function (e) {
            var self = this;
            if (this.onInterval) {
                clearTimeout(this.onInterval);
            }
            this.onInterval = setTimeout(function () {
                self.filterListHandler(e);
            }, 200);
        },
        filterListHandler: function (e) {
            var value = $(e.currentTarget).val();
            this.$('.container>ul>.list-msg').hide();
            this.$('.container>ul>.list-item').show();
            var length = 0;
            if (value) {
                this.$('.container>ul>.list-item').each(function () {
                    var name = $(this).attr('data-name').toLowerCase();
                    if (name.indexOf(value.toLowerCase()) == -1) {
                        $(this).hide();
                    } else {
                        length++;
                    }
                });
            }
            if (length <= 0 && value != "") {
                this.showNoData();
            }
        },
        renderDropdown:function(data){
            var root = this.$('.container>ul');
            root.find('.list-item').remove();
            var tmp = [];
            var template = this.childTemplate;
            _.forEach(data, function (item) {
                if(item.className){
                    var li = $(template(item)).addClass('list-item');
                    tmp.push(li);
                }
            });
            root.append(tmp);
            this.$('.container').niceScroll();
            if(/relation\/[a-zA-Z0-9_]+\/\w+\/([a-zA-Z0-9_]+)/.test(window.location.hash)){
                this.highLightSubItem({className:AppCube.currentClass,columnName:RegExp.$1});
            }else{
                this.highLightItem({className:AppCube.currentClass});
            }
        },
        highLightItem:function(options){
            this.$('.list-item.sub').remove();
            if(options.className){
                this.$('.list-item').removeClass('active');
                this.$('.list-item[data-name='+options.className+']').addClass('active');
            }
        },
        highLightSubItem:function(options){
            this.$('.list-item').removeClass('active');
            this.$('.list-item.sub').remove();
            var node = $('<li class="list-item active sub"><a href="javascript:void(0)"><i class="icomoon icomoon-arrow"></i>'+options.columnName+'</a></li>');
            this.$('.list-item[data-name='+options.className+']').addClass('active').after(node);
        },
        getValue:function(){
            return false;
        },
        showNoData: function () {
            this.$('.container>ul>.list-msg').show();
        },
        hideNoData: function () {
            this.$('.container>ul>.list-msg').hide();
        },
        renderComponent: function () {
            var self = this;
            var storeName = this.options.storeName;
            var stateName = this.options.stateName;
            this.hideNoData();
            AppCube.DataRepository.fetch(storeName, stateName).done(function (res) {
                self.renderDropdown(res);
            });
        },
        render:function(){
            Marionette.ItemView.prototype.render.call(this);
            this.$el.i18n();
            this.renderComponent();
        }
    });
});