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
                "click .list>.checkbox":"toggleAll",
                "click .master.checkbox":"toggleMaster",
                "keyup input":"autoCheck"
            },
            template: template,
            toggleMaster:function(e){
                if($(e.currentTarget).hasClass('checked')){
                    this.$('.list>.ui.checkbox').checkbox('set checked');
                }else{
                    this.$('.list>.ui.checkbox').checkbox('set unchecked');
                }
                this.isValid();
            },
            toggleAll:function(){
                var unchecked = this.$('.list .checkbox').not('.checked').length;
                if(unchecked==0){
                    this.$('.ui.checkbox.master').checkbox('set checked');
                }else{
                    this.$('.ui.checkbox.master').checkbox('set unchecked');
                }
                this.isValid();
            },
            getValue:function(){
                var classNames = [];
                this.$('.list>.checkbox.checked').each(function(index,e){
                    var name = $(e).attr('data-value');
                    classNames.push(name);
                });
                var desc = this.$('[name=desc]').val();
                return {
                    classNames:classNames,
                    desc:desc
                }
            },
            isValid:function(){
                return Validator.validate(this.$('.validate.class-list'),this.getValue());
            },
            render:function(options){
                BasicDialog.prototype.render.call(this,options);
                var self = this;
                AppCube.DataRepository.fetch('Store:Schemas').done(function(list){
                    var checkbox = [];
                    _.forEach(list,function(item){
                        checkbox.push($('<div class="ui checkbox" data-value="'+item.className+'"><input type="checkbox"><label>'+item.className+'</label></div>'));
                    });
                    self.$('.list').html(checkbox);
                    self.$('.list>.ui.checkbox').checkbox();
                });
            }
        });
    });