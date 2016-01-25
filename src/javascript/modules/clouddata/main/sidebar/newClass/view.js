define(
    [
        'app',
        'tpl!./template.html',
        'component/dialog/BasicDialog',
        'jquery',
        'underscore'
    ],
    function (AppCube,template,BasicDialog,$,_) {

        return BasicDialog.extend({
            events:{
                "keyup input":"autoCheck"
            },
            template: template,
            getValue:function(){
                var name = this.$('[name=name]').val();
                return {
                    className:name,
                    clientPermission:{
                        'class':{
                            restAcl:this.$('[name=acl-type]:checked').val()
                        }
                    }
                }
            }
        });
    });