define(
    [
        'app',
        'U',
        'Logger',
        'core/functions/UI',
        'dispatcher',
        './addColumn/view',
        './deleteColumn/view',
        './setPermission/view',
        './filter/FilterView',
        'tpl!./template.html',
        'marionette',
        'jquery',
        'underscore',
        'i18n',
        'semanticui_dropdown',
        'semanticui_checkbox'
    ],
    function (AppCube,U,Logger,UI,Dispatcher,addColumnView,deleteColumnView,setPermission,FilterView,template,Marionette,$,_,i18n) {

        return Marionette.ItemView.extend({
            events:{
                "click .button.add-row":"addRow",
                "click .button.delete-row":"deleteRow",
                "click .button.add-col":"addCol",

                "click .item.delete-col":"deleteCol",
                "click .item.delete-class":"deleteClass",
                "click .item.set-permission":"setPermission",

                "click .ui.refresh":"refreshGrid",
                "click .ui.fullscreen":"toggleFullScreen",
                "click .ui.show-column":"renderColumnMenuBeforeOpen",
                "click .ui.show-column .item":"toggleColumnItem",
                "click .button.filter":"toggleFilter"
            },
            template: template,
            beforeShow:function(){
                Dispatcher.on('show:Class',this.toggleStatusClass,this,'Layout');
                Dispatcher.on('show:Pointer',this.toggleStatusPointer,this,'Layout');
                Dispatcher.on('show:Relation',this.toggleStatusRelation,this,'Layout');
                Dispatcher.on('apply:Condition',this.applyCondition,this,'Component');
                Dispatcher.on('Request.get:condition', this.getValue, this, 'Component');
                Dispatcher.on('select:Row',this.toggleDelRow,this,'Component');
            },
            beforeHide:function(){
                Dispatcher.off('show:Class','Layout');
                Dispatcher.off('show:Pointer','Layout');
                Dispatcher.off('show:Relation','Layout');
                Dispatcher.off('apply:Condition','Component');
                Dispatcher.off('Request.get:condition', 'Component');
                Dispatcher.off('select:Row','Component');
            },

            addRow:function(e){
                if($(e.currentTarget).hasClass('disabled'))return;
                Dispatcher.trigger('add:Row',{},'Component');
            },
            deleteRow:function(e){
                if($(e.currentTarget).hasClass('disabled'))return;
                UI.showDialog(i18n.t("clouddata.title.delete-row"),i18n.t("clouddata.tip.sure-delete"),{
                    size:'small',
                    success:function(){
                        Dispatcher.trigger('delete:Row',{},'Component');
                        UI.hideDialog();
                    }
                });
            },
            addCol:function(e){
                if($(e.currentTarget).hasClass('disabled'))return;
                UI.showDialog(i18n.t("clouddata.title.add-column"),addColumnView,{
                    success:function(view){
                        if(view.isValid()) {
                            var value = view.getValue();
                            view.showLoading();
                            AppCube.DataRepository.getStore("Store:Schemas").addKey(
                                AppCube.currentClass,
                                value.className,
                                value.type,
                                value.targetClass
                            ).then(function(res){
                                    AppCube.DataRepository.refresh("Store:Schemas");
                                    Logger.success(i18n.t("common.success.create"));
                                    UI.hideDialog();
                                }).finally(function(){
                                    view.hideLoading();
                                });
                        }
                    }
                });
            },
            deleteCol:function(e){
                if($(e.currentTarget).hasClass('disabled'))return;
                UI.showDialog(i18n.t("clouddata.title.delete-column"),deleteColumnView,{
                    size:'small',
                    success:function(view){
                        if(view.isValid()) {
                            var value = view.getValue();
                            view.showLoading();
                            AppCube.DataRepository.getStore("Store:Schemas").deleteKey(
                                AppCube.currentClass,
                                value.className
                            ).then(function(res){
                                    Logger.success(i18n.t("common.success.delete"));
                                    AppCube.DataRepository.refresh("Store:Schemas");
                                    UI.hideDialog();
                                }).finally(function(){
                                    view.hideLoading();
                                });
                        }
                    }
                });
            },
            deleteClass:function(e){
                if($(e.currentTarget).hasClass('disabled'))return;
                UI.showDialog(i18n.t("clouddata.title.delete-class"),i18n.t("clouddata.tip.sure-delete"),{
                    size:'small',
                    success:function(){
                        AppCube.DataRepository.getStore("Store:Schemas").deleteData(AppCube.currentClass).done(function(){
                            Logger.success(i18n.t("common.success.delete"));
                            AppCube.DataRepository.refresh("Store:Schemas");
                            U.goTo("classes");
                            UI.hideDialog();
                        });
                    }
                });
            },
            setPermission:function(e){
                if($(e.currentTarget).hasClass('disabled'))return;
                UI.showDialog(i18n.t("clouddata.title.set-permission"),setPermission,{
                    success:function(view){
                        var value = view.getValue();
                        view.showLoading();
                        AppCube.DataRepository.getStore("Store:Schemas").setPermission(AppCube.currentClass,value).then(function(){
                            Logger.success(i18n.t("common.success.change"));
                            AppCube.DataRepository.refresh("Store:Schemas");
                            UI.hideDialog();
                        }).finally(function(){
                            view.hideLoading();
                        });
                    }
                });
            },
            //initFilter:function(){
            //    var view = new FilterView(this.options.filter);
            //    view.setElement(this.$('#filter-content').get(0));
            //    view.beforeShow();
            //    this.filterView = view;
            //    view.render();
            //},
            toggleDelRow:function(options){
                this.$('.delete-row').addClass('disabled');
                if(!options.disabled&&!this.$('.delete-row').hasClass('locked')){
                    this.$('.delete-row').removeClass('disabled');
                }
            },
            toggleFullScreen:function(e){
                $('#clouddata-main').toggleClass('full');
                $(e.currentTarget).children('i').toggleClass('icomoon-expand icomoon-quit-fullscreen');
                Dispatcher.request('set:Hscroll',{}, 'Component');
            },
            toggleStatusClass:function(){
                this.clearCondition();
                //this.setTitle(AppCube.currentClass);
                this.$('.add-row,.add-col,.more,.filter,.refresh').removeClass('disabled');
                this.$('.delete-row').removeClass('locked');
                $('#data-page-grid .pagination .perpage.buttons').removeClass('disabled');
            },
            toggleStatusPointer:function(){
                this.clearCondition();
                //this.setTitle(AppCube.currentClass);
                this.$('.add-row,.add-col,.more,.filter,.refresh').addClass('disabled');
                this.$('.delete-row').addClass('locked');
                $('#data-page-grid .pagination .perpage.buttons').addClass('disabled');
            },
            toggleStatusRelation:function(){
                this.clearCondition();
                //if(/relation\/[a-zA-Z0-9_]+\/\w+\/([a-zA-Z0-9_]+)/.test(window.location.hash)){
                //    this.setTitle(AppCube.currentClass,RegExp.$1);
                //}
                this.$('.add-row,.refresh').removeClass('disabled');
                this.$('.add-col,.more,.filter').addClass('disabled');
                this.$('.delete-row').removeClass('locked');
                $('#data-page-grid .pagination .perpage.buttons').removeClass('disabled');
            },
            //setTitle:function(title,subtitle){
            //    this.$('.breadcrumb').html('');
            //    if(subtitle){
            //        this.$('.breadcrumb').append('<a href="#classes/'+title+'" class="section">'+title+'</a>');
            //        this.$('.breadcrumb').append('<i class="right angle icon divider"></i>');
            //        this.$('.breadcrumb').append('<div class="active section">'+subtitle+'</div>');
            //    }else{
            //        this.$('.breadcrumb').append('<div class="active section">'+title+'</div>');
            //    }
            //},
            render:function(){
                Marionette.ItemView.prototype.render.call(this);
                this.$el.i18n();
                this.$('.ui.dropdown.more').dropdown({
                    action:'hide'
                });
                this.$('.ui.dropdown.show-column').dropdown({
                    action:'nothing'
                });
            },
            refreshGrid:function(e){
                if($(e.currentTarget).hasClass('disabled'))return;
                $(e.currentTarget).addClass("active");
                setTimeout(function(){
                    $(e.currentTarget).removeClass("active");
                },300);
                Dispatcher.trigger('refresh:Grid',{},'Component');
            },
            renderColumnMenuBeforeOpen:function(e){
                if($(e.currentTarget).hasClass('visible'))return;

                var columns = Dispatcher.request('get:originColumns',{},'Component');
                var mask = Dispatcher.request('get:mask',{},'Component');
                var new_columns = [];
                _.forEach(['objectId','createdAt','updatedAt','ACL'],function(name){
                    new_columns.push({name:name,checked: !_.contains(mask,name)});
                });
                _.forEach(columns,function(item,index){
                    new_columns.push({
                        name:item.name,
                        checked: !_.contains(mask,item.name)
                    })
                });
                var parent = this.$('.ui.dropdown.show-column .scrolling.menu').html('');
                _.forEach(new_columns,function(item){
                    parent.append('<div class="item"><div class="ui checkbox" data-value="'+item.name+'"><input type="checkbox" '+(item.checked?"checked":"")+' ><label>'+item.name+'</label></div></div>');
                });
                this.$('.ui.dropdown.show-column').dropdown('refresh');
                this.$('.ui.dropdown.show-column .checkbox').checkbox();
            },
            toggleColumnItem:function(e){
                var $e = $(e.srcElement||e.target);

                if( $e.attr('class') == 'item'){
                    $e.find("label").click();
                    return false;
                }else if( $e.is('label') ){

                    var mask = [];
                    this.$('.show-column .item>.checkbox').each(function(index,item){
                        if(!$(item).checkbox('is checked')){
                            mask.push($(item).attr('data-value'));
                        }
                    });
                    Dispatcher.request('set:mask',mask,'Component');
                    e.stopPropagation();
                }
                //console.log($e);
            },
            toggleFilter:function(e){
                var self = this;
                if($(e.currentTarget).hasClass('disabled'))return;
                AppCube.DataRepository.getStore('Store:Schemas').getKeysByName(AppCube.currentClass).done(function(res){
                    UI.showDialog(i18n.t("clouddata.title.set-filter"),FilterView, _.extend({},{
                        specialDialogUI:'set-filter',
                        btns:{
                            negative:'common.form.cancel',
                            positive:'common.form.apply',
                            others:[{
                                name:'common.title.add-condition',
                                className:'icon basic add-condition',
                                icon:'plus',
                                onClick:'addCondition'
                            }]
                        },
                        observeChanges:true,
                        columns:res,
                        condition:self.filterCondition?self.filterCondition:{},
                        success:function(view){
                            view.applyCondition();
                            UI.hideDialog();
                        }
                    },self.options.filter));
                })
            },
            getValue:function(){
                return this.filterCondition;
            },
            clearCondition:function(){
                this.$('.button.filter').removeClass('active');
                this.filterCondition = false;
            },
            applyCondition:function(condition){
                this.filterCondition = condition;
                if(condition&&_.keys(condition).length != 0){
                    this.$('.button.filter').addClass('active');
                }else{
                    this.$('.button.filter').removeClass('active');
                }
            }
        });
    });