define([
    'app',
    'API',
    'dispatcher',
    'core/functions/UI',
    'Logger',
    '../../common/component/BasicForm',
    'text!./template.html',
    'jquery',
    'underscore',
    'i18n',
    "semanticui_checkbox"
],function(AppCube,API,Dispatcher,UI,Logger,BasicForm,template,$,_,i18n){
    return BasicForm.extend({
        template: _.template(template),
        events:{
            "click .button.submit":"saveData",
            "click .add-facebook-app":"addFbApp",
            "click .fbapp-item .fa-times-circle":"deleteFbApp"
        },
        addFbApp:function(){
            var node = $('<div class="fbapp-item container-flex">' +
            '<input type="text" class="flex-1" name="authConfig.faceBookAuth.appInfos[]appId" data-i18n="[placeholder]settings.placeholder.fbid"/>' +
            '<input type="text" class="flex-1" name="authConfig.faceBookAuth.appInfos[]secret" data-i18n="[placeholder]settings.placeholder.fbsecret" style="margin-left: 10px;"/>' +
                //'<i class="fa fa-lg fa-times-circle"></i>' +
            '</div>').appendTo(this.$('.fbapp-list'));
            node.i18n();
        },
        deleteFbApp:function(e){
            $(e.currentTarget).parent('.fbapp-item').remove();
        },
        renderComponents:function(res){
            if(window.locale === 'zh'){
                $('.locale_en_only').remove();
            }

            this.$('.ui.checkbox').checkbox();
            if(res.faceBookKey && res.faceBookKey.length<1){
                this.addFbApp();
            }
        }
    });
});