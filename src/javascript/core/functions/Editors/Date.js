define([
    'C',
    'Storage',
    './Base',
    'dispatcher',
    'jquery',
    'underscore',
    'moment',
    'daterangepicker'
],function(C,Storage,EditorCore,Dispatcher,$,_,moment){

    var commonFormatter = "YYYY-MM-DD HH:mm:ss.SSS";

    function Date(args){
        this.input = {};
        this.defaultValue = "";
        var scope = this;
        EditorCore(args, scope);
        _.extend(this, {
            init: function () {
                scope.input = $('<input type="text" class="app-calendar" name="daterangepicker_start">');
                scope.input.appendTo(args.container)
                    .bind("keydown.nav", function (e) {
                        if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
                            e.stopImmediatePropagation();
                        }
                    });

                moment.locale(Storage.get('moment'));
                scope.input.daterangepicker({
                    singleDatePicker:true,
                    autoApply:true,
                    opens:'left',
                    timePicker:true,
                    timePicker24Hour:true,
                    timePickerSeconds:true
                });
                scope.input.on('apply.daterangepicker', function (ev, picker) {
                    args.commitChanges();
                });
                scope.input.on('cancel.daterangepicker', function (ev, picker) {
                    args.cancelChanges();
                });
            },
            loadValue:function(item){
                var value = item[args.column.field]||{};
                scope.defaultValue = value.iso||"";
                scope.input.val(scope.defaultValue);
                if(scope.defaultValue){
                    var calendar = scope.input.data('daterangepicker');
                    if(calendar){
                        calendar.setStartDate(scope.defaultValue);
                        calendar.setEndDate(scope.defaultValue);
                    }
                }
                scope.input.focus();
            },
            isValueChanged:function(){
                return (!(scope.input.val() == "" && scope.defaultValue == null)) && ((scope.input.val()+'.000') != scope.defaultValue);
            },
            destroy:function(){
                scope.input.data('daterangepicker').remove();
                scope.input.remove();
            },
            applyValue: function (item, state) {
                var row = args.grid.getActiveCell().row;
                var model = args.grid.getData()[row];
                var data = {};
                var date = moment(state, commonFormatter).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
                item[args.column.field] = {
                    __type: "Date",
                    iso: date
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

    return Date;
});