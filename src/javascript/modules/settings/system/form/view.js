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
        template: _.template(template),
        getValue:function(){
            return {
                enableOfflineAna:this.$('.offline.checkbox').checkbox('is checked')
            }
        },
        saveData:function(e){
            var data = this.getValue();
            AppCube.DataRepository.getStore('Store:mApplication').updateOfflineanalysis(data).then(function(res){
                Logger.success(i18n.t('common.success.update'));
            }).finally(function(){
                $(e.currentTarget).removeClass('loading');
            });
        }
    });
});