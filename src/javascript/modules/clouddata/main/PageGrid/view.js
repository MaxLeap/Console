define([
    'app',
    'U',
    'Q',
    'core/functions/UI',
    'core/functions/Column',
    'core/functions/ColumnFormatter',
    'core/functions/Editor',
    '../EditorView/StringEditor/view',
    '../EditorView/JSONEditor/view',
    '../EditorView/GeoEditor/view',
    '../EditorView/ACLEditor/view',
    'i18n',
    'basic/net/Uploader',
    'Logger',
    'tpl!./template.html',
    'dispatcher',
    'component/slickgrid/PageGrid/view',
    'marionette',
    'jquery',
    'scrollTo',
    'underscore',
    'slickgrid',
    'slick_rowselect',
    'slick_checkbox'
],function(AppCube,U,Q,UI,Column,ColumnFormatter,Editor,

           StringEditor,JSONEditor,GeoEditor,ACLEditor,

           i18n,Uploader,Logger,template,Dispatcher,PageGrid,Marionette, $, scrollTo, _, Slick){
    var GridBottom = 300;

    return PageGrid.extend({
        template: template,
        events:{
            'click .perpage.buttons:not(.disabled)>.button': 'changePerpage',
            'click .page.buttons>.button': 'changePage',
            'click th.sortable': 'changeSort',

            "click .h-scroll.left":"scrollLeft",
            "click .h-scroll.right":"scrollRight",

            "click .button.add-row":"addRow",

            "click .cell-string>.btn-edit":"editString",
            "click .cell-geopoint>.btn-edit":"editGeo",
            "click .cell-file>.btn-edit":"chooseImage",
            "change .cell-file>input[type=file]":"uploadImage",
            "click .cell-file>.btn-remove":"removeImage",
            "click .cell-acl>.btn-edit":"editACL",
            "click .cell-array>.btn-edit,.cell-object>.btn-edit":"editJSON",
            "click .cell-date>.btn-edit,.cell-number>.btn-edit,.cell-bool>.btn-edit,.cell-pointer>.btn-edit":"editGrid"
        },
        beforeShow:function(){
            PageGrid.prototype.beforeShow.call(this);
            Dispatcher.on('show:Class',this.renderClass,this,'Layout');
            Dispatcher.on('show:Pointer',this.renderPointer,this,'Layout');
            Dispatcher.on('show:Relation',this.renderRelation,this,'Layout');
            Dispatcher.on('add:Row',this.addRow,this,'Component');
            Dispatcher.on('delete:Row',this.deleteRow,this,'Component');
            Dispatcher.on('apply:Condition',this.refreshGrid,this,'Component');
            Dispatcher.on('create:Class',this.createRecord,this,'Component');
            Dispatcher.on('Request.create:Class',this.createRecord,this,'Component');
            Dispatcher.on('update:Class',this.updateRecord,this,'Component');
            Dispatcher.on('Request.update:Class',this.updateRecord,this,'Component');
            Dispatcher.on('refresh:Grid',this.refreshGrid,this,'Component');
            Dispatcher.on('refresh:Store:Schemas',this.updateColumn,this,'Component');
            Dispatcher.on('Request.get:mask', this.getMask, this, 'Component');
            Dispatcher.on('Request.get:originColumns', this.getOriginColumns, this, 'Component');
            Dispatcher.on('Request.set:mask', this.setMask, this, 'Component');
            Dispatcher.on('Request.set:Hscroll', this.initHorizontalScroll, this, 'Component');
            var eventName = this.options.valueEventName;
            Dispatcher.on('Request.getValue:' + eventName, this.getValue, this, 'Component');
            $(window).bind('resize.'+this.cid,this,this.resizeGrid.bind(this));
        },
        beforeHide:function(){
            PageGrid.prototype.beforeHide.call(this);
            Dispatcher.off('show:Class','Layout');
            Dispatcher.off('show:Pointer','Layout');
            Dispatcher.off('show:Relation','Layout');
            Dispatcher.off('add:Row','Component');
            Dispatcher.off('delete:Row','Component');
            Dispatcher.off('apply:Condition','Component');
            Dispatcher.off('create:Class','Component');
            Dispatcher.off('Request.create:Class','Component');
            Dispatcher.off('update:Class','Component');
            Dispatcher.off('Request.update:Class','Component');
            Dispatcher.off('refresh:Grid','Component');
            Dispatcher.off('refresh:Store:Schemas','Component');
            Dispatcher.off('Request.get:mask','Component');
            Dispatcher.off('Request.get:originColumns','Component');
            Dispatcher.off('Request.set:mask','Component');
            Dispatcher.off('Request.set:Hscroll', 'Component');
            var eventName = this.options.valueEventName;
            Dispatcher.off('Request.getValue:' + eventName, 'Component');
            $(window).unbind('resize.'+this.cid);
            this.$('.slick-viewport').unbind('scroll.'+this.cid);
        },
        initGrid: function () {
            if (this.options.page && this.options.page.length > 0) {
                this.initPage();
            }
            this.initSort();
            this.mask = [];
            this.changeColumn = true;
            this.columnDef = [];
        },
        initColumns:function(columns){
            var result = [];
            var self = this;
            if(this.options.with_checkbox){
                result.push(this.checkboxColumn.getColumnDefinition());
            }
            //push basic columns
            result.push(new Column.String('objectId',{editor:Editor.Fixed,cssClass:"cell-fixed"}));
            result.push(new Column.Date('createdAt',{editor:Editor.Fixed,cssClass:"cell-fixed",formatter:ColumnFormatter.FixedDateFormatter}));
            result.push(new Column.Date('updatedAt',{editor:Editor.Fixed,cssClass:"cell-fixed",formatter:ColumnFormatter.FixedDateFormatter}));
            result.push(new Column.ACL('ACL'));
            _.forEach(columns,function(item){
                var type = item.type;
                var className = AppCube.currentClass;
                if(type == "Relation"){
                    result.push(new Column[type](item.name,{className:item.className,targetClass:item.targetClass}));
                }
                else if(type == "Pointer"){
                    result.push(new Column[type](item.name,{className:item.className}));
                }
                else{
                    if(className == '_User'){
                        if(item.name == 'password'){
                            type = 'Password';
                        }
                    }
                    if(Column[type])
                        result.push(new Column[type](item.name));
                }
            });
            this.columnDef = result;
            //filter visible
            return _.reject(result,function(item){
                return _.contains(self.mask,item.field);
            });
        },
        resizeGrid:function(){
            var self = this;
            if (this.onInterval) {
                clearTimeout(this.onInterval);
            }
            this.onInterval = setTimeout(function () {
                self.resizeGridHandler();
            }, 100);
        },
        resizeGridHandler:function(){
            var gridHeight = $(window).height()-GridBottom;
            this.$('.grid-content').css('min-height',gridHeight);
            this.$('.grid-content').css('height',gridHeight);
            this.grid.invalidate();
            this.initHorizontalScroll();
        },
        scrollGrid:function(e){
            var self = this;
            if (this.onInterval) {
                clearTimeout(this.onInterval);
            }
            this.onInterval = setTimeout(function () {
                self.initHorizontalScroll();
            }, 100);
        },
        getMask:function(){
            return this.mask;
        },
        setMask:function(mask){
            this.mask = mask;
            this.updateColumn();
        },
        refreshGrid:function(){
            this.page = 1;
            this.refresh();
        },
        addRow:function(){
            this.grid.getEditorLock().commitCurrentEdit();
            var data = {};
            this.columnDef.forEach(function(item){
                if(item.field!="sel"){
                    data[item.field] = null;
                }
            });
            this.grid.setSelectedRows([]);
            var gridData = this.grid.getData();
            gridData.splice(0,0,data);
            this.grid.invalidate();
            this.hideNoData();
        },
        deleteRow:function(){
            var self = this;
            var row_idx = this.grid.getSelectedRows();
            this.grid.setSelectedRows([]);
            var data = this.grid.getData();
            var delete_oid = [];
            var new_data = _.reject(data,function(item,index){
                if(_.contains(row_idx, index)){
                    if(item.objectId)delete_oid.push(item.objectId);
                    return true;
                }else{
                    return false;
                }
            });
            this.grid.setData(new_data);
            this.grid.invalidate();
            if(delete_oid.length>0){
                var storeName = this.options.storeName;
                if(this.isRelation){
                    AppCube.DataRepository.getStore(storeName).batchRemoveRelation(delete_oid,this.columnName,this.relationClass,this.relationId).done(function(){
                        Logger.success(i18n.t("common.success.delete"));
                        self.refreshGrid();
                        AppCube.DataRepository.refresh("Store:Schemas");
                    });
                }else{
                    AppCube.DataRepository.getStore(storeName).batchRemove(delete_oid).done(function(){
                        Logger.success(i18n.t("common.success.delete"));
                        self.refreshGrid();
                        AppCube.DataRepository.refresh("Store:Schemas");
                    });
                }
            }
        },
        createRecord:function(options){
            var self = this;
            var tmp = options.data;
            var data = {};
            var p;
            var storeName = this.options.storeName;
            _.forEach(tmp,function(item,index){
                if(item!=null)data[index] = item;
            });
            if(this.isRelation){
                p = AppCube.DataRepository.getStore(storeName).addRelationData(data,this.relationClass,this.columnName,this.relationId);
                p.done(function(){
                    Logger.success(i18n.t("common.success.create"));
                    self.refreshGrid();
                    AppCube.DataRepository.refresh("Store:Schemas");
                });
            }else{
                p = AppCube.DataRepository.getStore(storeName).addData(data);
                p.done(function(){
                    Logger.success(i18n.t("common.success.create"));
                    self.refreshGrid();
                    AppCube.DataRepository.refresh("Store:Schemas");
                });
            }
            return p;
        },
        updateRecord:function(options){
            var self = this;
            var data = options.data;
            var oid = options.model.objectId;
            var storeName = this.options.storeName;
            var p;
            if(oid){
                if(this.isRelation){
                    p = AppCube.DataRepository.getStore(storeName).updateRelationData(oid, this.relationClass, data);
                }else{
                    p = AppCube.DataRepository.getStore(storeName).updateData(oid, data);
                }
                p.done(function () {
                    Logger.success(i18n.t("common.success.update"));
                    self.refreshGrid();
                });
                return p;
            }else{
                Logger.error('objectId is needed')
            }
        },
        showNoData:function(){
            this.$('.view-placeholder').show();
            this.$('.view-placeholder>.no-data-view-with-create').show();
            this.$('.pagination').hide();
        },
        hideNoData:function(){
            this.$('.view-placeholder').hide();
            this.$('.view-placeholder>.no-data-view-with-create').hide();
            this.$('.pagination').show();
        },
        showLoading:function(){
            this.$('.view-placeholder').show();
            this.$('.view-placeholder>.loading-view').show();
        },
        hideLoading:function(){
            this.$('.view-placeholder').hide();
            this.$('.view-placeholder>.loading-view').hide();
        },
        render:function(){
            Marionette.ItemView.prototype.render.call(this);
            this.$el.i18n();
            //render checkbox row in the table and set default height
            if(this.options.with_checkbox){
                this.checkboxColumn = new Slick.CheckboxSelectColumn({cssClass: "slick-cell-checkboxsel"});
            }
            var gridHeight = $(window).height()-GridBottom;
            this.$('.grid-content').css('height',gridHeight);
            this.grid = new Slick.Grid(this.$('.grid-content'),[], [], this.options.options);
            if(this.options.with_checkbox){
                this.grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
                this.grid.registerPlugin(this.checkboxColumn);
            }

            this.grid.onSelectedRowsChanged.subscribe(function(e,args){
                Dispatcher.trigger('select:Row',{disabled:(args.rows.length==0)},'Component');
            });

            this.grid.onValidationError.subscribe(function(e,args){
                $(args.cellNode).addClass('error');
                Logger.error(i18n.t(args.validationResults.msg));
            });

            this.$('.slick-viewport').bind('scroll.'+this.cid,this,this.scrollGrid.bind(this));

            this.initGrid();
            //bind upload-icon
            $('#upload-icon').bind('click.dataie',function(){
                if($(this).hasClass('complete')||$(this).hasClass('error')){
                    Dispatcher.request('ImportClass',{isWaiting:$(this).hasClass('complete')},'Component');
                    $(this).removeClass('complete error');
                }
            });
        },
        getColumns:function(){
            var defer = Q.defer();
            var self = this;
            var className = this.isRelation?this.relationClass:AppCube.currentClass;
            AppCube.DataRepository.getStore('Store:Schemas').getKeysByName(className).done(function(columns){
                self.originColumnDef = columns;
                defer.resolve(_.reject(columns,function(item){
                    return _.contains(self.mask,item.name);
                }));
            });
            return defer.promise;
        },
        getOriginColumns:function(){
            return this.originColumnDef;
        },
        renderGrid: function (data) {
            var tmp, end, next;
            var self = this;
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

            this.getColumns().done(function(columns){
                var count = $('#data-sidebar>.container .list-item.active').attr('data-count');
                var c = self.initColumns(columns);
                if(count>= 500000){
                    _.forEach(c,function(item){
                        item.sortable = false;
                    });
                    $('#data-toolbar .button.filter').unbind('click.filter').bind('click.filter', function(){
                        Logger.error(i18n.t('clouddata.tips.cannotsearch'));
                        return false;
                    });
                    $('#data-toolbar>.ui.message').show();
                    GridBottom = 370;
                }else{
                    $('#data-toolbar .button.filter').unbind('click.filter');
                    $('#data-toolbar>.ui.message').hide();
                    GridBottom = 300;
                }
                self.resizeGrid();
                self.grid.setColumns(c);
                self.grid.invalidate();
                self.initHorizontalScroll();
                self.changeColumn = false;
            });

            this.grid.setData(tmp);
            if(!this.changeColumn){
                this.grid.invalidate();
            }
        },
        renderClass:function(options){
            var className = options.className;
            var storeName = this.options.storeName;
            if(className){
                //reset grid
                this.showLoading();
                this.isRelation = false;
                this.isPointer = false;
                this.changeColumn = true;
                this.page = 1;
                this.mask = [];
                this.order = {};
                this.grid.setSortColumns([]);
                this.grid.setSelectedRows([]);
                AppCube.DataRepository.refresh(storeName);
            }
        },
        renderPointer:function(options){
            var className = options.className;
            var storeName = this.options.storeName;
            var self = this;
            if(className){
                //reset grid
                this.showLoading();
                this.isRelation = false;
                this.isPointer = true;
                this.pointerId = options.objectId;
                this.changeColumn = true;
                this.page = 1;
                this.mask = [];
                this.order = {};
                this.grid.setSortColumns([]);
                this.grid.setSelectedRows([]);
                AppCube.DataRepository.refresh(storeName,{
                    pointer:self.pointerId
                });
            }
        },
        renderRelation:function(options){
            var className = options.className;
            var storeName = this.options.storeName;
            var self = this;
            if(className){
                //reset grid
                this.showLoading();
                this.isRelation = true;
                this.isPointer = false;
                this.relationId = options.objectId;
                this.columnName = options.columnName;
                this.changeColumn = true;
                this.page = 1;
                this.mask = [];
                this.order = {};
                this.grid.setSortColumns([]);
                this.grid.setSelectedRows([]);
                AppCube.DataRepository.fetch('Store:Schemas').done(function(res){
                    self.relationClass = self.getTargetClass(res,AppCube.currentClass,self.columnName);
                    AppCube.DataRepository.refresh(storeName,{
                        relation:{
                            relationId:self.relationId,
                            columnName:self.columnName,
                            targetClass:self.relationClass
                        }
                    });
                });
            }
        },
        getValue: function (){
            var limit = this.perpage + 1;
            var skip = (this.page - 1) * (this.perpage);
            var order = this.order;
            //if(!order){
            //    order = {
            //        rule:1,
            //        field:'createdAt'
            //    };
            //}
            if(this.isRelation){
                return {
                    limit: limit,
                    skip: skip,
                    order: order,
                    relation:{
                        relationId:this.relationId,
                        columnName:this.columnName,
                        targetClass:this.relationClass
                    }
                };
            }else if(this.isPointer){
                return {
                    limit: limit,
                    skip: skip,
                    order: order,
                    pointer:this.pointerId
                };
            }else{
                return {
                    limit: limit,
                    skip: skip,
                    order: order
                };
            }
        },
        getTargetClass:function(schemas,className,columnName){
            var item = _.find(schemas,function(s){
                return s.className == className;
            });
            var column = _.find(item?item.keys:{},function(c,index){
                return index == columnName
            });
            return column?column.className:false;
        },
        updateColumn:function(){
            var self = this;
            this.getColumns().done(function(columns){
                self.grid.setColumns(self.initColumns(columns));
                self.grid.invalidate();
                self.initHorizontalScroll();
            });
        },
        refresh: function () {
            var storeName = this.options.storeName;
            this.showLoading();
            AppCube.DataRepository.refresh(storeName,this.getValue());
            AppCube.DataRepository.refresh('Store:Schemas',this.getValue());
        },
        initHorizontalScroll:function(){
            var container = this.$('.slick-viewport');
            var content = this.$('.slick-viewport>.grid-canvas');
            var hiddenWidth = content.width()-container.width();
            var scrollLeft = container.scrollLeft();
            this.$('.h-scroll.left').toggleClass('disabled',scrollLeft<=1);
            this.$('.h-scroll.right').toggleClass('disabled',hiddenWidth-scrollLeft<=1);
        },
        scrollLeft:function(e){
            if($(e.currentTarget).hasClass('disabled'))return false;
            var containerWidth = this.$('.slick-viewport').width();
            this.$('.slick-viewport').scrollTo({left:'-='+containerWidth+'px',top:'+=0px'},200);
        },
        scrollRight:function(e){
            if($(e.currentTarget).hasClass('disabled'))return false;
            var containerWidth = this.$('.slick-viewport').width();
            this.$('.slick-viewport').scrollTo({left:'+='+containerWidth+'px',top:'+=0px'},200);
        },


        /*
            Editor
         */

        editACL:function(){
            var cell = this.grid.getActiveCell();
            var item = this.grid.getData()[cell.row];
            UI.showDialog(i18n.t("clouddata.title.edit-acl"),ACLEditor,{
                acl_value:_.extend({},item["ACL"],true),
                size:'small',
                success:function(view){
                    if(view.isValid()) {
                        var acl = view.getValue();
                        view.showLoading();
                        Dispatcher.request('update:Class', {
                            model: item,
                            data: {ACL: acl}
                        }, 'Component').then(function () {
                            UI.hideDialog();
                        }).done(function () {
                            view.hideLoading();
                        });
                    }
                }
            });
        },
        editGrid:function(e){
            $(e.currentTarget).parent().trigger('dblclick');
        },
        editString:function(){
            var cell = this.grid.getActiveCell();
            var item = this.grid.getData()[cell.row];
            var column = this.grid.getColumns()[cell.cell];
            UI.showDialog("",StringEditor,{
                specialDialogUI:'editor',
                options:{
                    value:item[column.field]
                },
                onVisible:function(){
                    var self = this;
                    setTimeout(function(){
                        $(self).find('textarea').focus().select();
                    },0);
                },
                success:function(view){
                    var data = {};
                    data[column.field] = view.getValue();
                    view.showLoading();
                    Dispatcher.request('update:Class',{model:item,data:data},'Component').then(function(){
                        UI.hideDialog();
                    }).done(function(){
                        view.hideLoading();
                    });
                }
            });
        },
        editJSON:function(e){
            var type = $(e.currentTarget).parent().is('.cell-array')?'array':'object';
            var cell = this.grid.getActiveCell();
            var item = this.grid.getData()[cell.row];
            var column = this.grid.getColumns()[cell.cell];
            UI.showDialog("",JSONEditor,{
                specialDialogUI:'editor',
                options:{
                    type:type,
                    value:item[column.field]?JSON.stringify(item[column.field]):""
                },
                onVisible:function(){
                    var self = this;
                    setTimeout(function(){
                        $(self).find('textarea').focus().select();
                    },0);
                },
                success:function(view){
                    if(view.isValid()) {
                        var data = {};
                        data[column.field] = JSON.parse(view.getValue());
                        view.showLoading();
                        Dispatcher.request('update:Class', {model: item, data: data}, 'Component').then(function () {
                            UI.hideDialog();
                        }).done(function () {
                            view.hideLoading();
                        });
                    }
                }
            });
        },
        editGeo:function(){
            var cell = this.grid.getActiveCell();
            var item = this.grid.getData()[cell.row];
            var column = this.grid.getColumns()[cell.cell];
            UI.showDialog("",GeoEditor,{
                specialDialogUI:'geo-editor',
                options:{
                    value:item[column.field]
                },
                autofocus:true,
                success:function(view){
                    if(view.isValid()){
                        var data = {};
                        data[column.field] = view.getValue();
                        view.showLoading();
                        Dispatcher.request('update:Class',{model:item,data:data},'Component').then(function(){
                            UI.hideDialog();
                        }).done(function(){
                            view.hideLoading();
                        });
                    }
                }
            });
        },
        chooseImage:function(e){
            if($(e.currentTarget).hasClass('disabled'))return;
            $(e.currentTarget).next("input[type=file]").click();
        },
        startUploadAnimation:function(el,size){
            //init animation
            var speed = 400*1024/size;
            if(speed < 0.1)speed = 0.1;
            if(speed > 0.8)speed = 0.8;
            var step = 0,damp_rate = 0.5,end_value = 0.98;
            var animationHandler;
            el.parent().unbind('dblclick.me').bind('dblclick.me',function(e){
                e.stopPropagation();
            });
            var frame = function(){
                animationHandler = setTimeout(function(){
                    //limit step
                    step+=speed;
                    if(step>end_value)step = end_value;
                    el.prevAll('.progress-bar').children('.percent').css('width',step*100+'%');
                    //limit speed
                    if(speed>0.001){
                        speed*=damp_rate;
                    }
                    if(step < end_value)frame();
                },400);
            };
            frame();
            return function(){
                clearTimeout(animationHandler);
                el.parent().unbind('dblclick.me');
            };
        },
        uploadImage:function(e){
            var el = $(e.currentTarget);
            el.siblings('.btn-edit').hide();
            el.siblings('.progress-bar').addClass('active');
            var grid = this.grid;
            var columns = grid.getColumns();
            var cell = grid.getActiveCell();
            var columnName = columns[cell.cell].field;
            var item = grid.getData()[cell.row];
            //init animation
            var stopAnimation = this.startUploadAnimation(el,e.target.files[0].size);
            var handler = new Uploader({
                $el:el,
                checkImage:false,
                onSuccess:function(res){
                    var result;
                    var data = {};
                    try{
                        result = JSON.parse(res);
                    }catch(e){
                        result = {};
                    }
                    item[columnName] = {
                        __type: "File",
                        name:result.name,
                        url:U.parseUrl(result.url)
                    };
                    stopAnimation();
                    el.prevAll('.progress-bar').children('.percent').css('width','100%');

                    if(item.objectId != "" && item.objectId){
                        data[columnName] = item[columnName];
                        Dispatcher.trigger('update:Class',{model:item,data:data},'Component');
                    }else{
                        _.forEach(item,function(value,index){
                            if(index!='objectId'&&index!='createdAt'&&index!='updatedAt'){
                                data[index]=value;
                            }
                        });
                        Dispatcher.trigger('create:Class',{model:item,data:data},'Component');
                    }
                    Logger.success(i18n.t('common.success.upload'));
                },
                onError:function(xhr,d){
                    stopAnimation();
                    el.prevAll('.progress-bar').addClass('error');
                    Logger.error(xhr);
                }
            });
            handler.uploadFile();
        },
        removeImage:function(e){
            var grid = this.grid;
            var columns = grid.getColumns();
            var cell = grid.getActiveCell();
            var columnName = columns[cell.cell].field;
            var data = {};
            var item = grid.getData()[cell.row];
            item[columnName] = {
                __type: "File",
                name:"",
                url:""
            };
            data[columnName] = item[columnName];
            Dispatcher.trigger('update:Class',{model:item,data:data},'Component');
        }
    });
});