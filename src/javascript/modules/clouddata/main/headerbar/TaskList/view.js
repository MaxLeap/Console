define(
    [
        'app',
        'dispatcher',
        'core/functions/Validator',
        'tpl!./template.html',
        'component/dialog/BasicDialog',
        './PageTable/view',
        'underscore',
        'jquery',
        'i18n'
    ],
    function (AppCube,Dispatcher,Validator,template,BasicDialog,PageTable,_,$,i18n) {
        return BasicDialog.extend({
            template: template,
            events:{
                'click .dropdown-parts .item':'updateFilter',
                'keyup input[name=search]':'changeInput',
                'click .btn-detail':'showDetail'
            },
            beforeShow:function(){
                BasicDialog.prototype.beforeShow.call(this);
                Dispatcher.on('Request.getValue:TaskCondition', this.getValue, this, 'Component');
                $('#app-dialog .btn-back').bind('click.dataie',this.showMainTable.bind(this));
            },
            beforeHide:function(){
                if(this.tableView){
                    this.tableView.beforeHide();
                    this.tableView.destroy();
                    this.tableView = null;
                }
                Dispatcher.off('Request.getValue:TaskCondition', 'Component');
                BasicDialog.prototype.beforeHide.call(this);
                $('#app-dialog .btn-back').unbind('click.dataie');
            },
            changeInput:function(e){
                var self = this;
                if (this.onInterval) {
                    clearTimeout(this.onInterval);
                }
                this.onInterval = setTimeout(function () {
                    self.updateFilter(e);
                }, 200);
            },
            updateFilter:function(){
                Dispatcher.trigger('startRefresh:Store:DataIE',{},'Component');
                AppCube.DataRepository.refresh('Store:DataIE');
            },
            getValue:function(){
                var time = this.$('.dropdown-parts.time').dropdown('get value');
                var type = this.$('.dropdown-parts.type').dropdown('get value');
                var search = this.$('[name=search]').val();
                return {
                    time:time,
                    type:type,
                    search:search
                }
            },
            renderTable:function(options){
                var view = new PageTable(options.table);
                view.setElement(this.$('.table-content').get(0));
                view.beforeShow();
                this.tableView = view;
                view.render();
            },
            renderSubTable:function(res){
                this.$('.sub-table td.class-name').text($.isArray(res.classNames)?res.classNames.join(" ,"):"");
                this.$('.sub-table td.type').text(i18n.t('clouddata.tag.task-type-'+res.type));
                this.$('.sub-table td.desc').text(res.desc);
            },
            renderLogs:function(res){
                this.$('.sub-table .log-content').append(res.error);
                this.$('.sub-table .log-content').append(res.info);
            },
            showMainTable:function(){
                this.$('.toolbar').show();
                this.$('.table-content').show();
                this.$('.sub-table .log-content').html('');
                this.$('.sub-table').hide();
                $('#app-dialog .btn-back').removeClass('visible');
                Dispatcher.request('startFetchProcess',{},'Component');
            },
            showSubTable:function(){
                this.$('.toolbar').hide();
                this.$('.table-content').hide();
                this.$('.sub-table').show();
                $('#app-dialog .btn-back').addClass('visible');
                Dispatcher.request('stopFetchProcess',{},'Component');
            },
            render:function(options){
                BasicDialog.prototype.render.call(this,options);
                //set value first
                this.$('.dropdown-parts.type').dropdown('set selected','all');
                this.$('.dropdown-parts.time').dropdown('set selected','week');
                this.renderTable(options);
            },
            showDetail:function(e){
                var self = this;
                var taskID = $(e.currentTarget).attr('data-value');
                AppCube.DataRepository.getStore('Store:DataIE').getDataById(taskID).done(function(res){
                    self.renderSubTable(res);
                    self.showSubTable();
                });
                AppCube.DataRepository.getStore('Store:DataIE').getLogFromTask(taskID).done(function(res){
                    self.renderLogs(res);
                });
            }

        });
    });