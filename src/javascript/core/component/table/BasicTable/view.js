define(
    [
        'app',
        'U',
        'dispatcher',
        'tpl!./template.html',
        'marionette',
        'jquery',
        'underscore',
        'extend/ui/AdvancedTable',
        'i18n'
    ],
    function (AppCube, U, Dispatcher, template, Marionette, $, _, AdvancedTable,i18n) {

        return Marionette.ItemView.extend({
            template: template,
            events: {
                'click th.sorted': 'changeSort'
            },
            init: function () {
                var storeName = this.options.storeName;
                Dispatcher.on('refresh:' + storeName, this.renderComponent, this, 'Component');
            },
            beforeShow: function () {
            },
            initGrid: function () {
                var title = this.options.doI18n?i18n.t(this.options.title):this.options.title;
                this.$('.caption').text(title);
                this.initSort();
            },
            initSort: function () {
                this.order = this.options.order;
            },
            setSort: function (field, rule) {
                this.$('th.sorted').removeClass('ascending descending');
                this.$('th[data-value="' + field + '"]').addClass(rule);
                this.order = rule == '' ? false : {rule: (rule == 'ascending' ? 1 : -1), field: field};
            },
            changeSort: function (e) {
                var field = $(e.currentTarget).attr('data-value');
                var rule = $(e.currentTarget).hasClass('descending') ? 'ascending' : 'descending';
                this.setSort(field, rule);
                if (!this.options.static_data) {
                    this.refresh();
                } else {
                    this.renderComponent();
                }
                e.stopPropagation();
            },
            renderComponent: function () {
                var self = this;
                var storeName = this.options.storeName;
                var stateName = this.options.stateName;
                var options = this.getValue();
                AppCube.DataRepository.fetch(storeName, stateName, options).done(function (res) {
                    self.renderGrid(res);
                });
            },
            showLoading: function () {
                this.$('.view-placeholder').addClass('show');
                this.$('tbody').hide();
                if(this.$('.view-placeholder>.no-data-view').is(":visible")){
                    this.$('.view-placeholder>.no-data-view').hide();
                }
                this.$('.view-placeholder>.loading-view').show();
            },
            hideLoading: function () {
                this.$('.view-placeholder').removeClass('show');
                this.$('tbody').show();
                this.$('.view-placeholder>.loading-view').hide();
            },
            showNoData: function () {
                this.$('.view-placeholder').addClass('show relative');
                this.$('.view-placeholder>.no-data-view').show();
                this.$('thead').addClass('no-border');
            },
            hideNoData: function () {
                this.$('.view-placeholder').removeClass('show relative');
                this.$('.view-placeholder>.no-data-view').hide();
                this.$('thead').removeClass('no-border');
            },
            renderGrid: function (data) {
                this.hideLoading();
                if (!data || data.length == 0){
                    this.showNoData();
                }else{
                    this.hideNoData();
                }
                this.table.render(data, this.options.columns, _.extend({}, this.options.options, this.order));
            },
            render: function () {
                Marionette.ItemView.prototype.render.call(this);
                this.table = new AdvancedTable(this.$('.table-view'), {}, this.options.columns, this.options.options);
                this.initGrid();
                this.$el.i18n();
                if (!this.options.static_data) {
                    this.refresh();
                } else {
                    this.renderComponent();
                }
            },
            getValue: function (){
                var order = this.order;
                return {
                    order: order
                };
            },
            refresh: function () {
                var storeName = this.options.storeName;
                this.showLoading();
                AppCube.DataRepository.refresh(storeName);
            },
            beforeHide: function () {
                if(this.table)this.table.destroy();
            }
        });
    });