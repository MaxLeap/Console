define([
    './Base',
    'dispatcher',
    'jquery',
    'underscore'
],function(EditorCore,Dispatcher,$,_){
    function Fixed(args){
        this.input = {};
        this.defaultValue = "";
        var scope = this;
        EditorCore(args, scope);
        _.extend(this, {
            init:function(){
                scope.input = $("<INPUT type=text class='editor-text' readonly />")
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
            isValueChanged:function(){
                return false;
            },
            loadValue:function(item){
                scope.defaultValue = item[args.column.field]||"";
                scope.input.val(scope.defaultValue.url);
            }
        });
        this.init();
    }

    return Fixed;
});