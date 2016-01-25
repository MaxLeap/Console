define([
    './Base',
    'dispatcher',
    'jquery',
    'underscore',
    'semanticui_checkbox'
],function(EditorCore,Dispatcher,$,_){
    function Boolean(args){
        this.input = {};
        this.defaultValue = "";
        var scope = this;
        EditorCore(args, scope);
        _.extend(this, {
            init:function () {
                scope.input = $('<div class="boolean-editor">' +
                '<div class="ui radio checkbox true">' +
                '<input type="radio" name="boolean" value="true" class="hidden">' +
                '<label>True</label></div>' +
                '<div class="ui radio checkbox false">' +
                '<input type="radio" name="boolean" value="false" class="hidden">' +
                '<label>False</label></div>' +
                '</div>');
                scope.input.appendTo(args.container);
                scope.input.children('.ui.radio').checkbox();
            },
            destroy:function(){
                scope.input.children('.ui.radio').checkbox('destroy');
                scope.input.unbind('.slick');
                scope.input.remove();
            },
            isValueChanged:function(){
                return (scope.input.find('.checked').is('.true') != scope.defaultValue )||(typeof scope.defaultValue!="boolean");
            },
            serializeValue:function () {
                return scope.input.find('.checked').is('.true');
            },
            loadValue:function(item){
                var value = item[args.column.field]?true:false;
                if(typeof item[args.column.field] !='object'){
                    scope.defaultValue = item[args.column.field];
                }
                scope.input.find('.ui.radio.'+value).checkbox('set checked');
            }
        });
        this.init();
    }

    return Boolean;
});