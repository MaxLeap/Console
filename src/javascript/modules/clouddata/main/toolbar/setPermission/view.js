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
        var type_array = ['Shared','Private','ReadOnly','Full'];

        return BasicDialog.extend({
            template: template,
            renderComponent:function(res){
                if(res['class']&&res['class']['restAcl']){
                    var type = res['class']['restAcl'];
                    if($.inArray(type,type_array)){
                        this.$('input[value='+type+']').prop('checked',true);
                    }
                }
            },
            getValue:function(){
                return {
                    'class':{
                        'restAcl':this.$('[name=acl-type]:checked').val()
                    }
                }
            },
            render:function(){
                var self = this;
                BasicDialog.prototype.render.call(this);
                AppCube.DataRepository.getStore('Store:Schemas').getPermissionByName(AppCube.currentClass).done(function(res){
                    self.renderComponent(res);
                });
            }
        });
    });