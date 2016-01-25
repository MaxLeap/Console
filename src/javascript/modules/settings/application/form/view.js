define([
    'app',
    'Logger',
    '../../common/component/BasicForm',
    'text!./template.html',
    'jquery',
    'underscore',
    'zeroclipboard',
    'i18n'
],function(AppCube,Logger,BasicForm,template,$,_,ZeroClipboard,i18n){
    return BasicForm.extend({
        template: _.template(template),
        renderComponents:function(res){
            //init zeroclipboard
            ZeroClipboard.config({swfPath:"/ZeroClipboard.swf"});
            var client = new ZeroClipboard($('.ui.button.copy-btn'));
            client.on("ready", function(event){
                client.on('aftercopy',function(){
                    Logger.success('common.success.copy',{doI18n:true});
                });
            });
        }
    });
});