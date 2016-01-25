define([
    'app',
    'Storage',
    'dispatcher',
    'C',
    'tpl!./template.html',
    'component/filter/BasicFilterGroup/view',
    'jquery',
    'underscore',
    'moment',
    'daterangepicker'
],function(AppCube,Storage,Dispatcher,C,template,BasicFilterGroup,$,_,moment,daterangepicker){

    return BasicFilterGroup.extend({
        events:{
            "click .button.clear-all":"clearAllItem"
        },
        template:template,
        beforeShow:function(){
            BasicFilterGroup.prototype.beforeShow.call(this);
            Dispatcher.on('click:addCondition', this.addItemHandler, this, 'Component');
            //Dispatcher.on('show:Class',this.resetCondition,this,'Filter');
            //Dispatcher.on('show:Pointer',this.resetCondition,this,'Filter');
            //Dispatcher.on('show:Relation',this.resetCondition,this,'Filter');
        },
        beforeHide:function(){
            Dispatcher.off('click:addCondition', 'Component');
            //Dispatcher.off('show:Class','Filter');
            //Dispatcher.off('show:Pointer','Filter');
            //Dispatcher.off('show:Relation','Filter');
            BasicFilterGroup.prototype.beforeHide.call(this);
        },
        addItemHandler:function(){
            var item = this.addItem();
            item.init();
            if(item.beforeShow)item.beforeShow();
            item.render({
                op_list: C.get('Filter'),
                column_list:this.column_list
            });
        },
        updateItem:function(index,type,value,column_type){
            var item = this.children[index];
            if(item){
                if(type=='column'&&item.data.column!=value){
                    this.setColumn(item,value,column_type);
                }else if(type=='op'&&item.data.op!=value){
                    this.setOp(item,value);
                }else if(type=='value'){
                    this.setValue(item,value);
                }
            }else{
                throw new Error("BasicFilterGroup: child("+index+") not exist");
            }
        },
        setColumn:function(item,value,type){
            item.data.column = value;
            item.data.type = type;
            item.data.op = null;
            item.data.value = null;
            item.renderComponent();
        },
        setOp:function(item,value){
            item.data.op = value;
            item.data.value = null;
            item.renderComponent();
            if(value=='before'||value=='after'){
                this.$('.date-editor').each(function(){
                    var dtp = $(this).data('daterangepicker');
                    if(dtp) dtp.remove()
                });
                moment.locale(Storage.get('moment'));
                this.$('.date-editor').daterangepicker({
                    singleDatePicker:true,
                    autoApply:true,
                    opens:'left',
                    timePicker:true,
                    timePicker24Hour:true,
                    timePickerSeconds:true
                });
                item.$('.date-editor').focus();
            }else if(value=='exists'||value=='not exists'){
                item.data.value = (value=='exists'?true:false);
            }
        },
        setValue:function(item,value){
            item.data.value = value;
        },
        setColumns:function(res){
            var columns = [];
            columns.push({name:"objectId",type:"String"});
            columns.push({name:"createdAt",type:"Date"});
            columns.push({name:"updatedAt",type:"Date"});
            this.column_list = _.map(columns.concat(res),function(item){
                return {
                    name:item.name,
                    value:item.type
                }
            });
        },
        getValue:function(){
            return this.condition;
        },
        generateCondition:function(){
            var values = _.chain(this.children).values().map(function(item){
                var tmp = item.data.value;
                if(item.data.type == 'Number'){
                    try{
                        tmp = parseFloat(item.data.value);
                    }catch(e){
                        tmp = 0;
                    }
                    if(isNaN(tmp))tmp = null;
                }
                return {
                    field:item.data.column,
                    op:item.data.op,
                    type:item.data.type,
                    value:tmp
                }
            }).reject(function(item){
                return !item.field||!item.op
            }).value();
            var condition = {};
            _.forEach(values,function(item){
                var value;
                if(_.contains(['eq','ne','gt','gte','lt','lte'],item.op)){
                    value = JSON.parse('{"$'+item.op+'":'+JSON.stringify(item.value)+'}');
                }else if(item.op=='exists'||item.op=='not exists'){
                    value = {$exists:item.op=='exists'}
                }else if(item.op=='before'||item.op=='after'){
                    value = item.op=='before'?{$lte:item.value}:{$gte:item.value};
                }else if(item.op=='start with'){
                    value = {$regex:'^\\Q'+item.value+'\\E'};
                }else if(item.op=='in'||item.op=='nin'){
                    var array = item.value?item.value.split(','):[];
                    value = item.op=='in'?{$in:array}:{$nin:array};
                }else if(item.op=='contains'||item.op=='not contains'){
                    value = item.op=='contains'?{$eq:item.value}:{$ne:item.value};
                }else{
                    value = {};
                }
                condition[item.field] = _.extend({},condition[item.field],value);
            });
            return condition;
        },
        resetCondition:function(){
            this.clearAllItem();
            this.condition = {};
            this.condition_count = 0;
        },
        clearAllItem:function(){
            BasicFilterGroup.prototype.clearAllItem.call(this);
            this.condition_count = 0;
        },
        applyCondition:function(){
            this.condition = this.generateCondition();
            this.condition_count = _.keys(this.children).length;
            Dispatcher.trigger('apply:Condition',this.condition,'Component');
            this.clearAllItem();
        },
        renderCondition:function(){
            var self = this;
            function convertData(type,value){
                var result;
                if(type=='Object'||type=='Array'){
                    try{
                        result = JSON.stringify(value);
                    }catch(e){}
                }else if(type=='Date'){
                    result = value;
                }else{
                    result = value;
                }
                return result;
            }
            _.forEach(this.condition,function(item,key){
                var child = self.addItem();
                child.init();
                if(child.beforeShow)child.beforeShow();
                var data = {
                    op_list: C.get('Filter'),
                    column_list:self.column_list
                };
                data.column = key;
                var type = _.find(self.column_list,function(item){
                    return item.name == key;
                });
                data.type = type?type.value:'String';
                if(item.$eq){
                    data.op = data.type=='Array'?'contains':'eq';
                    data.value = convertData(data.type,item.$eq);
                }
                else if(item.$ne){
                    data.op = data.type=='Array'?'not contains':'ne';
                    data.value = convertData(data.type,item.$ne);
                }
                else if(item.$gt){
                    data.op = 'gt';
                    data.value = convertData(data.type,item.$gt);
                }
                else if(item.$gte){
                    data.op = data.type=='Date'?'after':'gte';
                    data.value = convertData(data.type,item.$gte);
                }
                else if(item.$lt){
                    data.op = 'lt';
                    data.value = convertData(data.type,item.$lt);
                }
                else if(item.$lte){
                    data.op = data.type=='Date'?'before':'lte';
                    data.value = convertData(data.type,item.$lte);
                }
                else if(typeof item.$exists == 'boolean'){
                    data.op = item.$exists?'exists':'not exists';
                }
                else if(item.$regex){
                    data.op = 'start with';
                    data.value = item.$regex.slice(3,-2);
                }
                else if(item.$in){
                    data.op = 'in';
                    data.value = item.value;
                }
                else if(item.$nin){
                    data.op = 'nin';
                    data.value = item.value;
                }
                child.render(data);
            });
        },
        render:function(options){
            BasicFilterGroup.prototype.render.call(this,options);
            if(options.columns){
                this.setColumns(options.columns);
            }
            this.condition = options.condition;
            this.renderCondition();
        }
    });
});