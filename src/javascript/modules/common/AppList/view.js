define([
    'app',
    'C',
    'U',
    'Storage',
    'Logger',
    'dispatcher',
    'core/functions/UI',
    'text!./template.html',
    'marionette',
    'jquery',
    'underscore',
    'i18n',
    'semanticui_dropdown'
], function (AppCube, C, U, Storage, Logger, Dispatcher, UI, template, Marionette, $, _, i18n,semanticui_dropdown2) {
    return Marionette.ItemView.extend({
        template: _.template(template),
        events: {
            "click .scrolling>.item": "changeApp",
            "keyup input": "changeAppByKey"
        },
        init: function () {
            var pathname = window.location.pathname;
            var moduleName = '';
            if (/^\/(\w+)(\/?|\/apps\/\w+(\/)?)$/.test(pathname)) {
                moduleName = RegExp.$1;
            }
            var storeName = this.options.storeName;
            this.childTemplate = _.template('\
            <div class="item" data-name="<%= name %>" data-value="<%= objectId %>" data-link="/' + moduleName + '/apps/<%= objectId %>">\
                <img class="ui mini avatar image" src="<% if(metadata.icon){ %><%= metadata.icon %><% }else{ %>/images/appicon.svg<% } %>">\
                <span><%= name %></span>\
            </div>');

            Dispatcher.on('refresh:' + storeName, this.renderComponent, this, 'Component');
        },
        beforeShow: function () {
            var eventName = this.options.valueEventName;
            Dispatcher.on('Request.getValue:' + eventName, this.getValue, this, 'Component');
        },
        beforeHide: function () {
            var eventName = this.options.valueEventName;
            Dispatcher.off('Request.getValue:' + eventName, 'Component');
            this.$('.ui.dropdown').each(function (index, el) {
                if ($(el).data('moduleDropdown')) {
                    $(el).dropdown('destroy')
                }
            });
        },
        changeAppByKey:function(e){
            if(e.keyCode == 13){
                var link = $(".scrolling>.item.selected").attr('data-link');
                U.jumpTo(link);
            }
        },
        changeApp: function (e) {
            if ($(e.currentTarget).hasClass('disabled'))return;
            var link = $(e.currentTarget).attr('data-link');
            U.jumpTo(link);
        },
        renderDropdown: function (data) {
            var tmp = [];
            var template = this.childTemplate;
            _.forEach(data, function (item) {
                tmp.push($(template(item)));
            });
            this.$('.scrolling').html(tmp);
            this.$el.i18n();
            this.$('.ui.dropdown').dropdown({
                message:{
                    noResults:i18n.t('common.title.not-found')
                }
            });

            //set default
            var appId = C.get('User.AppId');
            if (appId) {
                var app = _.find(data, function (item) {
                    return item.objectId == appId;
                });
                if (app) {
                    var metadata = app.metadata || {};
                    var icon_url = metadata.icon || '/images/appicon.svg';
                    this.setValue(appId, app.name, icon_url);
                }
            }
        },
        renderComponent: function () {
            var self = this;
            var storeName = this.options.storeName;
            var stateName = this.options.stateName;
            AppCube.DataRepository.fetch(storeName, stateName).done(function (res) {
                self.renderDropdown(res);
            });
        },
        render: function () {
            Marionette.ItemView.prototype.render.call(this);
            this.renderComponent();
        },
        refresh: function () {
            var storeName = this.options.storeName;
            AppCube.DataRepository.refresh(storeName);
        },
        setValue: function (value, name, icon_url) {
            if (!this.$('.ui.dropdown').data('moduleDropdown')) {
                this.$('.ui.dropdown').dropdown();
            }
            this.$('.ui.dropdown').dropdown('set text', '<img class="ui mini avatar image" src="' + icon_url + '"><span>' + name + '</span>');
            this.$('.ui.dropdown').dropdown('set value', value);
        },
        getValue: function () {
            return this.$('.ui.dropdown').dropdown('get value');
        }
    })
});