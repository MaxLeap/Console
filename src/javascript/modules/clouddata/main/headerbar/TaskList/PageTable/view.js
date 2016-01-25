define([
    'app',
    'dispatcher',
    'component/table/PageTable/view',
    'extend/ui/AdvancedTable',
    'marionette',
    'underscore',
    'i18n'
],function(AppCube,Dispatcher,PageTable,AdvancedTable,Marionette,_,i18n){
    return PageTable.extend({
        beforeShow:function(){
            PageTable.prototype.beforeShow.call(this);
            var storeName = this.options.storeName;
            Dispatcher.on('refresh:' + storeName, this.renderComponent, this, 'Component');
            Dispatcher.on('startRefresh:'+storeName,this.showLoading,this,'Component');
            Dispatcher.on('Request.stopFetchProcess', this.stopFetchProcess, this, 'Component');
            Dispatcher.on('Request.startFetchProcess', this.startFetchProcess, this, 'Component');
            Dispatcher.on('Request.updateStatus', this.updateStatus, this, 'Component');
        },
        beforeHide:function(){
            var storeName = this.options.storeName;
            Dispatcher.off('refresh:' + storeName, 'Component');
            Dispatcher.off('startRefresh:'+storeName,'Component');
            Dispatcher.off('Request.stopFetchProcess', 'Component');
            Dispatcher.off('Request.startFetchProcess', 'Component');
            Dispatcher.off('Request.updateStatus', 'Component');
            this.stopFetchProcess();
            PageTable.prototype.beforeHide.call(this);
        },
        startFetchProcess:function(){
            this.fetchProcess();
        },
        stopFetchProcess:function(){
            if(this.fetchProcessHandler){
                clearTimeout(this.fetchProcessHandler);
            }
        },
        updateStatus:function(options){
            if(options.process!=-1){
                var space = this.$('td>span[data-value='+options.taskId+']');
                var number = parseFloat(options.process);
                if(isNaN(number))number = 0;
                space.text((number*100).toFixed(0)+'%');
                if(options.status){
                    space.parent().next().text(i18n.t('clouddata.tag.task-status-'+options.status));
                }
            }else{
                AppCube.DataRepository.getStore('Store:DataIE').updateTaskById(options.taskId).done(function(res){
                    Dispatcher.request('updateStatus',{
                        taskId:res.objectId,
                        process:res.process,
                        status:res.status
                    },'Component');
                });
            }
        },
        fetchProcess:function(){
            var self = this;
            if(this.runningTask.length == 0)return;
            this.fetchProcessHandler = setTimeout(function(){
                AppCube.DataRepository.getStore('Store:DataIE').getProcess(self.runningTask).done(function(res){
                    self.runningTask = [];
                    _.forEach(res,function(process,id){
                        if(process!=-1){
                            self.runningTask.push(id);
                        }
                        Dispatcher.request('updateStatus',{
                            taskId:id,
                            process:process
                        },'Component');
                    });
                    self.fetchProcess();
                });
            },1000);
        },
        renderComponent:function(res){
            this.stopFetchProcess();
            this.runningTask = [];
            var self = this;
            _.forEach(res,function(item){
                if(item.status==1){
                    self.runningTask.push(item.objectId);
                }
            });
            this.startFetchProcess();
            PageTable.prototype.renderComponent.call(this);
        },
        showLoading: function () {
            this.$('.view-placeholder').addClass('relative show');
            this.$('tbody').hide();
            if(this.$('.view-placeholder>.no-data-view').is(":visible")){
                this.$('.view-placeholder>.no-data-view').hide();
            }
            this.$('.view-placeholder>.loading-view').show();
        },
        hideLoading: function () {
            this.$('.view-placeholder').removeClass('relative show');
            this.$('tbody').show();
            this.$('.view-placeholder>.loading-view').hide();
        },
        render: function () {
            Marionette.ItemView.prototype.render.call(this);
            this.$el.i18n();
            this.table = new AdvancedTable(this.$('.table-view'), {}, this.options.columns, this.options.options);
            this.initGrid();
            this.refresh();
        }
    })
});