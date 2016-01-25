define([
    './Base',
    'dispatcher',
    'jquery',
    'underscore'
],function(EditorCore,Dispatcher,$,_){
    function ACL(args){
        this.input = {};
        this.defaultValue = "";
        var scope = this;
        EditorCore(args,scope);
        _.extend(this,{
            init:function(){
                scope.input = $("<input type=text class='editor-text' placeholder='{\"key\":\"val\",...}'/>")
                    .appendTo(args.container)
                    .bind("keydown.nav", function (e) {
                        if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
                            e.stopImmediatePropagation();
                        }
                    });
                setTimeout(function(){
                    scope.input.focus().select();
                },0);
            },
            loadValue:function(item){
                if(item[args.column.field]==null)item[args.column.field]=undefined;
                var value = JSON.stringify(item[args.column.field]);
                scope.defaultValue = value;
                scope.input.val(value);
            },
            validate:function(){
                try{
                    JSON.parse(scope.input.val());
                }
                catch(e){
                    return {
                        valid: false,
                        msg: "error.format.json"
                    };
                }
                if(!/^\{.*\}$/.test(scope.input.val())){
                    return {
                        valid: false,
                        msg: "error.format.object"
                    };
                }
                return {
                    valid: true,
                    msg: null
                };
            },
            applyValue:function(item, state){
                var row = args.grid.getActiveCell().row;
                var model = args.grid.getData()[row];
                var data = {};
                item[args.column.field] = JSON.parse(state);
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

    return ACL;
});