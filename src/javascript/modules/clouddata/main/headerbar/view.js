define(
    [
        'app',
        'U',
        'Logger',
        './ImportData/view',
        './ExportData/view',
        './TaskList/view',
        'core/functions/UI',
        'dispatcher',
        'tpl!./template.html',
        'marionette',
        'jquery',
        'i18n',
        'semanticui_dropdown',
        'semanticui_checkbox'
    ],
    function (AppCube,U,Logger,importData,exportData,taskList,UI,Dispatcher,template,Marionette,$,i18n) {

        return Marionette.ItemView.extend({
            events:{
                "click .item.data-import":"importData",
                "click .item.data-export":"exportData",
                "click .item.task-list":"showTaskList"
            },
            template: template,
            beforeShow:function(){
                Dispatcher.on('Request.ImportClass',this.importData,this,'Component');
            },
            beforeHide:function(){
                Dispatcher.off('Request.ImportClass','Component');
            },
            render:function(){
                Marionette.ItemView.prototype.render.call(this);
                this.$el.i18n();
                this.$('.ui.dropdown').dropdown({
                    action:'hide'
                });
            },
            importData:function(options){
                UI.showDialog(i18n.t("clouddata.tag.import-class"),importData,{
                    specialDialogUI:'import-class',
                    options:{
                        isWaiting:options.isWaiting
                    },
                    btns:{
                        negative:'common.form.cancel',
                        others:[
                            {
                                name:'clouddata.tag.finish-import',
                                className:'blue btn-import'
                            },{
                                name:'clouddata.tag.wait-complete',
                                className:'red btn-wait'
                            },{
                                name:'clouddata.tag.retry',
                                className:'red btn-retry'
                            },{
                                name:'clouddata.tag.continue-import',
                                className:'blue btn-continue'
                            }
                        ]
                    }
                });
            },
            exportData:function(){
                UI.showDialog(i18n.t("clouddata.tag.data-export"),exportData,{
                    btns: {
                        negative: 'common.form.cancel',
                        positive: 'clouddata.tag.data-export'
                    },
                    success:function(view){
                        if(view.isValid()){
                            var value = view.getValue();
                            view.showLoading();
                            AppCube.DataRepository.getStore("Store:DataIE").ExportData(value).then(function(){
                                Logger.success(i18n.t("common.success.create"));
                                UI.hideDialog();
                            }).finally(function(){
                                view.hideLoading();
                            });
                        }
                    }
                });
            },
            showTaskList:function(){
                UI.showDialog(i18n.t("clouddata.tag.task-list"),taskList,{
                    btns: {
                        others:[
                            {
                                name:'clouddata.tag.back',
                                className:'basic btn-back'
                            }
                        ]
                    },
                    observeChanges:true,
                    specialDialogUI:'task-list',
                    table:this.options.table
                });
            }
        });
    });