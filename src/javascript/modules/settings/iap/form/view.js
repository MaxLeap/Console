define([
    'app',
    'Logger',
    '../../common/component/BasicForm',
    'text!./template.html',
    'jquery',
    'underscore',
    'i18n'
],function(AppCube,Logger,BasicForm,template,$,_,i18n){
    return BasicForm.extend({
        template: _.template(template)
    });
});