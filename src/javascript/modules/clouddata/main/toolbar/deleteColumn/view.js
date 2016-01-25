define(
    [
        'app',
        'tpl!./template.html',
        'component/dialog/BasicDialog',
        'underscore'
    ],
    function (AppCube,template,BasicDialog,_) {
        return BasicDialog.extend({
            events:{
                "click .dropdown-parts .item":"autoCheck"
            },
            template: template,
            getValue:function(){
                var name = this.$('.column-selector').dropdown('get value');
                return {
                    className:name
                };
            },
            render:function(){
                BasicDialog.prototype.render.call(this);
                var self = this;
                AppCube.DataRepository.getStore('Store:Schemas').getKeysByName(AppCube.currentClass).done(function(columns){
                    var parent = self.$('.column-selector .menu').html('');
                    _.forEach(columns,function(item){
                        parent.append('<div class=item data-value="'+item.name+'">'+item.name+'</div>');
                    });
                    self.$('.column-selector').dropdown('refresh');
                });
            }
        });
    });