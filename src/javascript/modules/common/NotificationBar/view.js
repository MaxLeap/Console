define([
    'app',
    'dispatcher',
    'tpl!./template.html',
    'tpl!./childTemplate.html',
    'marionette',
    'jquery',
    'underscore',
    'moment',
    'nicescroll'
], function (AppCube, Dispatcher, template, childTemplate, Marionette, $, _, moment, Nicescroll) {
    return Marionette.ItemView.extend({
        template: template,
        childTemplate: childTemplate,
        events: {
            "click .toggle-notification": "toggleDisplay",
            "click .notification-body>li": "toggleClose",
            "click .ui.breadcrumb>.section": "toggleType",
            "click": "cancelClick",
            "click .btn-refresh": "refresh"
        },
        init: function () {
        },
        beforeShow: function () {
        },
        cancelClick: function (e) {
            e.stopPropagation();
        },
        toggleClose: function (e) {
            var self = this;
            this.$('.notification-dropdown').removeClass('open');
            this.$('.notification-dropdown').stop(true, true).animate(
                {'opacity': 0}, 200, 'linear',
                function () {
                    self.$('.notification-dropdown').css('transform', 'rotateY(180deg)').hide();
                }
            );
            $('body').unbind('click.notification');
            if (e)e.stopPropagation();
        },
        toggleShow: function (e) {
            var self = this;
            $('.dropdown').removeClass('open');
            this.$('.notification-dropdown').addClass('open');
            this.$('.notification-dropdown').show();
            this.$('.notification-dropdown').stop(true, true).animate(
                {'opacity': 1}, {
                    duration: 200,
                    step: function (now, fx) {
                        $(this).css({
                            'transform': 'rotateY(' + 180 * (1 - now) + 'deg)',
                            'opacity': now
                        });
                        self.scrollContent.resize();
                    }
                }
            );
            //bindClose
            $('body').unbind('click.notification').bind('click.notification', function (e) {
                self.toggleClose();
            });
            if (e)e.stopPropagation();
        },
        toggleType: function (e) {
            this.type = $(e.currentTarget).attr('data-value');
            this.$('.ui.breadcrumb>.section').removeClass('active');
            $(e.currentTarget).addClass('active');
            this.renderComponent();
            e.stopPropagation();
        },
        toggleDisplay: function (e) {
            if (!this.$('.notification-dropdown').hasClass('open')) {
                this.toggleShow();
            } else {
                this.toggleClose();
            }
            e.stopPropagation();
        },
        render: function () {
            Marionette.ItemView.prototype.render.call(this);
            this.type = 'msgs';
            this.scrollContent = this.$('.notification-dropdown-content').niceScroll();
            this.refresh();
        },
        renderComponent: function (res) {
            this.$('.btn-refresh').removeClass('loading');
            this.$('.tip-updated, .tip-loading').toggle();
            var storeName = this.options.storeName;
            var self = this;
            AppCube.DataRepository.fetch(storeName, this.type).done(function (res) {
                self.renderNotificationMsg(res);
            });
        },
        renderNotificationMsg: function (res) {
            //var list = [];
            //_.forEach(res, function (item) {
            //    item.time = moment(item.time).format('MM/DD/YYYY');
            //    list.push($(childTemplate(item)));
            //});
            //this.$('.notification-body').html(list);
            //var count = res.length;
            //if (count) {
            //    this.$('.toggle-notification>.badge').text(count);
            //    this.$('.ui.breadcrumb>.section:eq(0)>span:eq(1)').text(count);
            //    this.$('.notification-body').show();
            //    this.$('.notification-empty-view').hide();
            //} else {
            //    this.$('.toggle-notification>.badge').text(0);
            //    this.$('.ui.breadcrumb>.section:eq(0)>span:eq(1)').text(0);
            //    this.$('.toggle-notification>.badge').hide();
            //    this.$('.notification-body').hide();
            //    this.$('.notification-empty-view').show();
            //}
            var self = this;
            if (this.refreshTask)clearTimeout(this.refreshTask);
            setTimeout(function () {
                self.refresh();
            }, this.options.refreshInterval || 180 * 1000);
        },
        refresh: function () {
            var storeName = this.options.storeName;
            AppCube.DataRepository.refresh(storeName);
        },
        beforeHide: function () {
        }
    });
});