define(
    [
        'app',
        'core/functions/Validator',
        'tpl!./template.html',
        'component/dialog/BasicDialog',
        'underscore',
        'jquery'
    ],
    function (AppCube,Validator,template,BasicDialog,_,$) {
        return BasicDialog.extend({
            events:{
                "click .type-selector .item":"chooseType",
                "click .target-selector .item":"chooseTarget",
                "click .dropdown-parts .item":"autoCheck",
                "keyup input":"autoCheck"
            },
            template: template,
            isValid:function(){
                var type = this.$('.type-selector').dropdown('get value');
                var target = this.$('.target-selector').dropdown('get value');
                return Validator.validate(this.$('.target-selector'),{type:type,target:target})&&Validator.check(this.$el);
            },
            chooseTarget:function(){
                this.isValid();
            },
            getValue:function(){
                var name = this.$('[name=column-name]').val();
                var type = this.$('.type-selector').dropdown('get value');
                var target = this.$('.target-selector').dropdown('get value');
                return {
                    type:type,
                    className:name,
                    targetClass:target
                };
            },
            chooseType:function(){
                var self = this;
                var type = this.$('.type-selector').dropdown('get value');
                if(type=="Pointer"||type=="Relation"){
                    AppCube.DataRepository.fetch('Store:Schemas').done(function(columns){
                        var parent = self.$('.target-selector .menu').html('');
                        _.forEach(columns,function(item){
                            if(!(item.className==AppCube.currentClass&&type=="Relation")){
                                parent.append('<div class=item data-value="'+item.className+'">'+item.className+'</div>');
                            }
                        });
                        self.$('.target-selector').dropdown('refresh');
                        self.$('.target-selector').dropdown('clear').i18n();
                        self.$('.target-selector').closest('.field').show();
                    });
                }else{
                    this.$('.target-selector').dropdown('clear');
                    this.$('.target-selector').closest('.field').hide();
                }
            }
        });
    });