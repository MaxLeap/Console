define(
    [
        'app',
        'U',
        'dispatcher',
        'tpl!./template.html',
        'component/table/BasicTable/view',
        'jquery',
        'underscore',
        'i18n',
        'semanticui_dropdown'
    ],
    function (AppCube, U, Dispatcher, template, BasicTable, $, _,i18n) {

        return BasicTable.extend({
            template: template,
            events: {
                'click .perpage.buttons>.button': 'changePerpage',
                'click .page.buttons>.button': 'changePage',
                'click th.sorted': 'changeSort'
            },
            beforeShow: function () {
                var eventName = this.options.valueEventName;
                Dispatcher.on('Request.getValue:' + eventName, this.getValue, this, 'Component');
                Dispatcher.on("Request.restorePager:"+eventName,this.restorePager,this,'Component');
            },
            initGrid: function () {
                var title = this.options.doI18n?i18n.t(this.options.title):this.options.title;
                this.$('.caption').text(title);
                if (this.options.page && this.options.page.length > 0) {
                    this.initPage();
                }
                this.initSort();
            },
            initPage: function () {
                var page = this.options.page;
                var tmp = [];
                _.forEach(page, function (item) {
                    var node = $('<div class="ui button" data-value="' + item.value + '">' + item.name + '</div>');
                    tmp.push(node);
                });
                this.pagebar = {start: 1, end: 1};
                this.perpage = page[0].value;
                this.page = 1;
                this.maxPage = 1;
                this.$('.perpage.buttons').html(tmp);
                this.$('.perpage.buttons>.button[data-value='+this.perpage+']').addClass('active');
            },
            changePerpage: function (e) {
                if($(e.currentTarget).is('.active')||$(e.currentTarget).is('.disabled'))return;

                this.$('.perpage.buttons>.button').removeClass('active');
                $(e.currentTarget).addClass('active');

                this.perpage = parseInt($(e.currentTarget).attr('data-value'));
                this.page = 1;
                if (!this.options.static_data) {
                    this.refresh();
                } else {
                    this.renderComponent();
                }
            },
            changePage: function (e) {
                if ($(e.currentTarget).hasClass('disabled'))return;
                if ($(e.currentTarget).hasClass('prev')) {
                    if (this.page > 1) {
                        $(e.currentTarget).addClass('disabled');
                        this.page--;
                        if (!this.options.static_data) {
                            this.refresh();
                        } else {
                            this.renderComponent();
                        }
                    }
                } else if ($(e.currentTarget).hasClass('next')) {
                    if (this.page < this.maxPage) {
                        $(e.currentTarget).addClass('disabled');
                        this.page++;
                        if (!this.options.static_data) {
                            this.refresh();
                        } else {
                            this.renderComponent();
                        }
                    }
                }
            },
            getValue: function (){
                var limit = this.perpage + 1;
                var skip = (this.page - 1) * (this.perpage);
                var order = this.order;
                return {
                    limit: limit,
                    skip: skip,
                    order: order
                };
            },
            renderPagebar: function (start, end) {
                this.pagebar.start = start;
                this.pagebar.end = end;
                this.$('.page-status').text(start + ' - ' + end);
                this.$('.button.next,.button.prev').addClass('disabled');
                if (this.maxPage > this.page) {
                    this.$('.page.buttons>.next').removeClass('disabled')
                }
                if (this.page > 1) {
                    this.$('.page.buttons>.prev').removeClass('disabled')
                }
            },
            // restore Pager to 1
            restorePager: function () {
                var pagerInfo = this.options.page;
                if(pagerInfo.length!==0){
                    //设置为第一页
                    this.page = 1;
                }
            },
            renderGrid: function (data) {
                var tmp, end, next;
                this.hideLoading();
                if (!data || data.length == 0){
                    this.showNoData();
                }else{
                    this.hideNoData();
                }
                var start = (this.page - 1) * (this.perpage) + 1;
                if (data && data.length > this.perpage) {
                    this.maxPage = this.page + 1;
                    tmp = data.slice(0, -1);
                    end = start + data.length - 2;
                } else {
                    this.maxPage = this.page;
                    tmp = data;
                    end = start + data.length - 1;
                }
                this.renderPagebar(start, end);
                this.table.render(tmp, this.options.columns, _.extend({}, this.options.options, this.order));
            },
            showLoading: function () {
                this.$('.view-placeholder').removeClass('relative').addClass('show');
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
                this.$('.pagination').hide();
                this.$('thead').addClass('no-border');
            },
            hideNoData: function () {
                this.$('.view-placeholder').removeClass('show relative');
                this.$('.view-placeholder>.no-data-view').hide();
                this.$('.pagination').show();
                this.$('thead').removeClass('no-border');
            },
            renderComponent: function () {
                var self = this;
                var storeName = this.options.storeName;
                var stateName = this.options.stateName;
                if (!this.options.static_data)this.showLoading();
                var options = this.getValue();
                AppCube.DataRepository.fetch(storeName, stateName, options).done(function (res) {
                    self.renderGrid(res);
                });
            },
            beforeHide: function () {
                var eventName = this.options.valueEventName;
                Dispatcher.off('Request.getValue:' + eventName, 'Component');
                Dispatcher.off("Request.restorePager:"+eventName,'Component');
                if(this.table)this.table.destroy();
            }
        });
    });