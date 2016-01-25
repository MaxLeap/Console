define(
    [
        'app',
        'dispatcher',
        'Logger',
        'core/functions/Validator',
        'C',
        'marionette',
        'jquery',
        'underscore',
        'i18n',
        'semanticui_checkbox'
    ],
    function (AppCube,Dispatcher,Logger,Validator,C,Marionette,$,_,i18n) {
        return Marionette.ItemView.extend({
            events:{
                "click .button.submit":"saveData"
            },
            beforeShow:function(){
                var storeName = this.options.storeName;
                Dispatcher.on('refresh:'+storeName,this.renderTemplate,this,'Component');
            },
            beforeHide:function(){
                var storeName = this.options.storeName;
                Dispatcher.off('refresh:'+storeName,'Component');
                this.$('.ui.checkbox').each(function(index,e){
                    if($(e).data('moduleCheckbox')){
                        $(e).checkbox('destroy');
                    }
                });
            },
            autoCheck:function(e){
                var field = $(e.currentTarget).closest('.field');
                Validator.check(field);
            },
            saveData:function(e){
                var action = AppCube.current_action;
                var data = {};
                if(Validator.check('#'+action+'-form')==false)return;
                this.$el.find('input[name],select[name],textarea[name]').each(function(index,e){
                    var key = e.name;
                    var value = (e.type=='checkbox')? e.checked:e.value;
                    if(key){
                        if(/^([\s\w]+)\.([\s\w]+)$/.test(key)){
                            if(!data[RegExp.$1])data[RegExp.$1]={};
                            data[RegExp.$1][RegExp.$2] = value;
                        }
                        else if(/^([\s\w]+)\.([\s\w]+)\.([\s\w]+)$/.test(key)){
                            if(!data[RegExp.$1])data[RegExp.$1]={};
                            if(!data[RegExp.$1][RegExp.$2])data[RegExp.$1][RegExp.$2]={};
                            data[RegExp.$1][RegExp.$2][RegExp.$3] = value;
                        }
                        else if(/^([\s\w]+)\.([\s\w]+)\.([\s\w]+)\[\]$/.test(key)){
                            if(!data[RegExp.$1])data[RegExp.$1]={};
                            if(!data[RegExp.$1][RegExp.$2])data[RegExp.$1][RegExp.$2]={};
                            data[RegExp.$1][RegExp.$2][RegExp.$3] = value.split(',');
                        }
                        else if(/^([\s\w]+)\.([\s\w]+)\.([\s\w]+)\[\]([\s\w]+)$/.test(key)){
                            if(!data[RegExp.$1])data[RegExp.$1]={};
                            if(!data[RegExp.$1][RegExp.$2])data[RegExp.$1][RegExp.$2]={};
                            if(!data[RegExp.$1][RegExp.$2][RegExp.$3]){
                                data[RegExp.$1][RegExp.$2][RegExp.$3] = [];
                            }

                            if(RegExp.$4=='appId'){
                                if(value!=''){
                                    var tmp = {};
                                    tmp.appId=value;
                                    data[RegExp.$1][RegExp.$2][RegExp.$3].push(tmp);
                                }
                            }else{
                                if(data[RegExp.$1][RegExp.$2][RegExp.$3].length>0) {
                                    var obj = _.last(data[RegExp.$1][RegExp.$2][RegExp.$3]);
                                    obj.secret = value;
                                }
                            }
                        }
                        else{
                            data[key]= value;
                        }
                    }
                });
                $(e.currentTarget).addClass('loading');
                AppCube.DataRepository.getStore('Store:Application').updateData(data).then(function(res){
                    Logger.success(i18n.t('common.success.update'));
                }).finally(function(){
                    $(e.currentTarget).removeClass('loading');
                });
            },
            renderComponents:function(res){},
            renderTips:function(){
                this.$('[data-tip]').each(function(index,e){
                    var tip = $(e).attr('data-tip');
                    $(e).append('<i class="sem-helper-tip icomoon icomoon-help" data-sem-key="'+tip+'"></i>');
                });
            },
            render:function(){
                var storeName = this.options.storeName;
                AppCube.DataRepository.refresh(storeName);
            },
            renderTemplate:function(){
                var self = this;
                var storeName = this.options.storeName;
                var stateName = this.options.stateName;
                AppCube.DataRepository.fetch(storeName,stateName).done(function(res){
                    self.$el.html(self.template(res));
                    self.$el.i18n();
                    self.renderTips();
                    self.renderComponents(res);
                });
            }
        });
    });