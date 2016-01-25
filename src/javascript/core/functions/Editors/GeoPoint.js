define([
    './Base',
    'dispatcher',
    'jquery',
    'underscore'
],function(EditorCore,Dispatcher,$,_){
    function GeoPoint(args){
        this.input = {};
        this.defaultValue = "";
        var scope = this;
        EditorCore(args,scope);
        _.extend(this,{
            init:function(){
                scope.input = $('<input type="text" placeholder="0,0" />')
                    .appendTo(args.container)
                    .bind("keydown.nav", function (e) {
                        if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
                            e.stopImmediatePropagation();
                        }
                    })
                    .focus()
                    .select();
            },
            loadValue:function(item){
                var value = item[args.column.field]||"";
                if(value){
                    scope.defaultValue = [value.latitude,value.longitude];
                    scope.input.val(value.latitude + ',' + value.longitude);
                }else{
                    scope.defaultValue = [0,0];
                }
            },
            validate:function(){
                var array;
                try{
                    array = JSON.parse('['+scope.input.val()+']');
                }catch(e){
                    return {
                        valid: false,
                        msg: "error.format.array"
                    };
                }
                if(array.length!=2){
                    return {
                        valid: false,
                        msg: "error.format.geo"
                    };
                }
                if(!$.isNumeric(array[0])||!$.isNumeric(array[1])){
                    return {
                        valid: false,
                        msg: "error.format.integer"
                    };
                }
                if(Math.abs(array[0])>90||Math.abs(array[1])>180){
                    return {
                        valid: false,
                        msg: "error.format.geo"
                    };
                }
                return {
                    valid: true,
                    msg: null
                };
            },
            getValue:function(){
                var value = [0,0];
                try{
                    value = JSON.parse('['+scope.input.val()+']');
                }catch(e){
                    return [0,0];
                }
                return value;
            },
            setValue:function(value){
                scope.input.val(value.latitude + ',' + value.longitude);
            },
            isValueChanged:function(){
                var array;
                try{
                    array = JSON.parse('['+scope.input.val()+']');
                }catch(e){
                    return true;
                }
                return array.length!=2||(array[0]!=scope.defaultValue[0]||array[1]!=scope.defaultValue[1]);
            },
            serializeValue:function () {
                var value = scope.input.val();
                return JSON.parse('['+value+']');
            },
            applyValue:function(item, state){
                var row = args.grid.getActiveCell().row;
                var model = args.grid.getData()[row];
                var data = {};
                item[args.column.field] = {
                    __type:"GeoPoint",
                    latitude:parseFloat(state[0]||0),
                    longitude:parseFloat(state[1]||0)
                };
                if(item.objectId != "" && item.objectId){
                    data[args.column.field] = item[args.column.field];
                    Dispatcher.trigger('update:Class',{model:model,data:data},'Component');
                }else{
                    _.forEach(item,function(value,index){
                        if(index!='objectId'&&index!='createdAt'&&index!='updatedAt'){
                            data[index]=value;
                        }
                    });
                    Dispatcher.trigger('create:Class',{model:model,data:data},'Component');
                }
            }
        });
        this.init();
    }

    return GeoPoint;
});