define(
    [
        'tpl!./template.html',
        'component/dialog/BasicDialog'
    ],
    function (template,BasicDialog) {

        return BasicDialog.extend({
            events:{
                "keyup input":"autoCheck"
            },
            template: template,
            getValue:function(){
                return {
                    __type:'GeoPoint',
                    latitude:parseFloat(this.$('[name=latitude]').val()),
                    longitude:parseFloat(this.$('[name=longitude]').val()),
                }
            },
            render:function(options){
                BasicDialog.prototype.render.call(this,options);
                if(options.options.value){
                    this.$('[name=latitude]').val(options.options.value.latitude||0);
                    this.$('[name=longitude]').val(options.options.value.longitude||0);
                }
            }
        });
    });