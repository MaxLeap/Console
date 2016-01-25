define(
    [
        'app',
        'C',
        'U',
        'Logger',
        'API',
        'tpl!./template.html',
        'component/dialog/BasicDialog',
        'jquery'
    ],
    function (AppCube,C,U,Logger,API,template,BasicDialog,$) {

        var type_array = ['OrgUser','MasterKey','AppUser','APIKey'];

        return BasicDialog.extend({
            template: template,
            events:{
                "change input[name=acl-type]":"toggleType",
                "keyup input":"autoCheck"
            },
            renderComponent:function(res){
                if(res['creator']&&res['creator']['type']){
                    var type = res['creator']['type'];
                    if($.inArray(type,type_array)>=0){
                        this.$('input[value='+type+']').prop('checked',true);
                        if(type == 'AppUser'||type == 'OrgUser'){
                            this.$('.field.append').show();
                            this.$('[name=id]').val(res['creator']['id']);
                        }
                    }
                }else{
                    this.$('.field.append').show();
                }
            },
            isValid:function(){
                var type = this.$('[name=acl-type]:checked').val();
                if(type=='MasterKey'||type=='APIKey'){
                    return true;
                }else{
                    return BasicDialog.prototype.isValid.call(this);
                }
            },
            toggleType:function(){
                var type = this.$('[name=acl-type]:checked').val();
                if(type == 'AppUser'||type == 'OrgUser'){
                    this.$('.field.append').show();
                }else{
                    this.$('.field.append').hide();
                }
            },
            getValue:function(){
                var type = this.$('[name=acl-type]:checked').val();
                var creator = {type:type};
                if(type == 'AppUser'||type == 'OrgUser'){
                    creator.id = this.$('[name=id]').val();
                }
                return {
                    creator:creator
                };
            },
            render:function(option){
                BasicDialog.prototype.render.call(this);
                this.renderComponent(option.acl_value);
            }
        });
    });