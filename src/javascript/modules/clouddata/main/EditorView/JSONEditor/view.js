define(
    [
        'jquery',
        'underscore',
        'core/functions/Validator',
        'component/dialog/BasicDialog'
    ],
    function ($,_,Validator,BasicDialog) {

        return BasicDialog.extend({
            events:{
                "keyup textarea":"autoCheck"
            },
            template: _.template('<div class="field"><textarea name="content" class="validate"></textarea></div>'),
            getValue:function(){
                return this.$('textarea').val();
            },
            render:function(options){
                BasicDialog.prototype.render.call(this,options);
                this.$('textarea').addClass('validate-'+options.options.type).val(options.options.value);
            }
        });
    });