define(
    [
        'underscore',
        'component/dialog/BasicDialog'
    ],
    function (_,BasicDialog) {

        return BasicDialog.extend({
            events:{
                "keyup textarea":"autoCheck"
            },
            template: _.template('<div class="field"><textarea name="content"></textarea></div>'),
            getValue:function(){
                return this.$('textarea').val();
            },
            render:function(options){
                BasicDialog.prototype.render.call(this,options);
                this.$('textarea').val(options.options.value);
            }
        });
    });