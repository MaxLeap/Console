define(
    [
        'app',
        'tpl!./template.html',
        'component/dialog/BasicDialog'
    ],
    function (AppCube, template, BasicDialog) {
        return BasicDialog.extend({
            template: template,
            getValue: function(){
                var password = this.$('[name=password]').val();
                return {
                    password:password
                }
            }
        });
    });