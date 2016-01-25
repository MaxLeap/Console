define([
    'app',
    'C',
    'core/functions/UI',
    'Logger',
    '../../common/component/BasicForm',
    'text!./template.html',
    'jquery',
    'underscore',
    'i18n'
],function(AppCube,C,UI,Logger,BasicForm,template,$,_,i18n){
    return BasicForm.extend({
        template: _.template(template),
        events:{
            "click .button.submit":"saveData",
            "click #apple-cert-upload>.upload-confirm":"uploadCertFile"
        },
        renderComponents:function(res){
            var self = this;
            self.applecert = res.cert||false;
            self.loadFile = false;
            UI.bindUploader(this.$('#apple-cert-upload>.upload-choose'),null,function(){
                self.loadFile = true;
                var el = self.$('input[type=file]');
                var file = el.get(0).files[0];
                if(!file){
                    self.$('#apple-cert-error').hide();
                    self.$('#apple-cert-desc').show();
                    self.$('#apple-cert-selected').hide();
                    self.loadFile = false;
                    return;
                }
                if(file.type!="application/x-pkcs12"){
                    self.$('#apple-cert-error').show();
                    self.$('#apple-cert-desc').hide();
                    self.$('#apple-cert-selected').hide();
                    Logger.error("error.format.file-type",{doI18n:true});
                    self.applecert = false;
                    return;
                }
                var reader = new FileReader();
                reader.onload = function(e){
                    var result = e.target.result;
                    if(!result){
                        self.$('#apple-cert-error').show();
                        self.$('#apple-cert-desc').hide();
                        self.$('#apple-cert-selected').hide();
                        Logger.error("error.local.cert-file",{doI18n:true});
                        self.applecert = false;
                    }else{
                        self.$('#apple-cert-error').hide();
                        self.$('#apple-cert-desc').hide();
                        self.$('#apple-cert-selected').show();
                        self.applecert = result.replace('data:application/x-pkcs12;base64,','');
                    }
                };
                reader.readAsDataURL(file);

            });
        },
        getValue:function(){
            var data = {
                appleConfig:{},
                gcmConfig:{}
            };
            //var os = C.get('User.AppOS');
            //if(os=='ios'){
                if(this.applecert){
                    data.appleConfig.key = this.applecert;
                }
                data.appleConfig.password = this.$('[name="pushConfig.appleConfig.password"]').val();
            //}else{
                data.gcmConfig.apiKey = this.$('[name="pushConfig.gcmConfig.apiKey"]').val();
                data.gcmConfig.senderId = this.$('[name="pushConfig.gcmConfig.senderId"]').val();
            //}
            return data;
        },
        saveData:function(e){
            if(this.loadFile&&!this.applecert){
                Logger.error("error.local.cert-file",{doI18n:true});
                return;
            }
            var self = this;
            var data = this.getValue();
            $(e.currentTarget).addClass('loading');
            AppCube.DataRepository.getStore('Store:Application').updateSetting(data).then(function(res){
                Logger.success('common.success.update',{doI18n:true});
                AppCube.DataRepository.refresh('Store:Application');
                if(self.applecert){
                    self.$('#apple-cert-desc').addClass('success').html('<span data-i18n="settings.tag.cert-uploaded">'+i18n.t('settings.tag.cert-uploaded')+'</span>');
                }
            }).finally(function(){
                $(e.currentTarget).removeClass('loading');
            });
        }
    });
});