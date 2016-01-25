define(
    [
        'app',
        'API',
        'U',
        'Logger',
        'marionette',
        'jquery',
        'underscore',
        'com_fun',
        'core/functions/Validator',
        'Q',
        'core/functions/UI',
        'i18n',
        'tpl!./template.html',
        'C'
    ],
    function(AppCube, API, U, Logger, Marionette, $, _, Fun, Validator, Q, UI, i18n, template, C) {

        return Marionette.ItemView.extend({
            template: template,
            events: {
                "click .btn-save": "submitForm"
            },
            render: function(options) {
                var self = this;

                Marionette.ItemView.prototype.render.call(self);
                self.$el.i18n();
                self.initShortUsage(options).setItemDifferentView().addFormLoading();
                self.getTplRenderData().done(function(data) {
                    self.setTplInputValue(data);
                    Fun.initSimpleDropdown("Store:Lang",self.$language,{},data.locale||'en');
                    self.removeFormLoading.call(self);
                });
            },
            initShortUsage: function(options) {
                this.objectId = options.id;
                this.$form = this.$el.find("#email_template_form");
                this.$title = this.$el.find(".item-title");
                this.$name = this.$el.find("input[name=templateName]");
                this.$language = this.$el.find(".dropdown-language");
                this.$from = this.$el.find("input[name=from]");
                this.$content = this.$el.find("textarea[name=content]");
                this.$domain = this.$el.find("input[name=domain]");
                this.$subject = this.$el.find("input[name=subject]");
                this.copySign = this.options.copySign;

                return this;
            },
            setItemDifferentView: function() {
                var self = this;

                //设置标题
                self.setItemTitle();
                self.renderTips();
                return self;
            },
            setItemTitle: function() {
                //区分编辑还是新建
                var i18nKey = (this.options && this.options.title) || 'unkown';

                this.$title.attr("data-i18n", i18nKey).i18n();
                return this;
            },
            renderTips: function() {
                this.$('[data-tip]').each(function(index,e){
                    var tip = $(e).attr('data-tip');
                    $(e).append('<i class="sem-helper-tip icomoon icomoon-help" data-sem-key="'+tip+'"></i>');
                });
            },
            getTplRenderData: function() {
                var self = this,
                    q = Q.defer(),
                    emtpyData = {
                        templateName: "",
                        locale: 'en',
                        subject: '',
                        domain: '',
                        content: "",
                        from: ""
                    },
                    objectId = self.objectId,
                    storeName = self.options.storeName;


                if (objectId) {

                    AppCube.DataRepository.getStore(storeName).getDataById(objectId).done(function(res) {
                        
                        res = self.defaultTplI18n(res);
                       
                        q.resolve(res);
                    });
                } else {
                    q.resolve(emtpyData);
                }

                return q.promise;
            },
            defaultTplI18n:function(item){
                var defaultMap = {
                    verify_email_tpl:"Verify Email",
                    reset_password_tpl:"Reset Password Email"
                };
                var defaultI8NMap  = {
                    verify_email_tpl:"settings.label.verify-email",
                    reset_password_tpl:"settings.label.reset-password-email"
                };

                if(item){
                    if(item.type===0&&defaultMap[item.templateName]){
                        item.templateName = i18n.t(defaultI8NMap[item.templateName])||defaultMap[item.templateName];
                    }
                }

                return item;
            },
            setTplInputValue: function(data) {
                var self = this,
                    copySign = this.copySign;

                if(copySign){
                    self.$name.val("COPY_OF_"+data.templateName);
                }else{
                    self.$name.val(data.templateName);
                    //set disable
                    if (self.objectId && data.type === 0) {
                        self.$name.add(self.$language).addClass("disabled").attr("disabled", "disabled");
                    }
                }
                // self.$language.dropdown("set selected",data.locale);
                self.$from.val(data.from);
                self.$domain.val(data.domain);
                self.$subject.val(data.subject);
                self.$content.val(data.content);
                
            },
            getValue: function() {
                var sendArg;

                sendArg = {
                    templateName: this.$name.val(),
                    locale: this.$language.dropdown("get value"),
                    subject: this.$subject.val(),
                    domain: this.$domain.val(),
                    content: this.$content.val(),
                    from: this.$from.val()
                };

                //delete templateName because change it show name
                if(this.objectId&&!this.copySign){
                    delete sendArg.templateName;
                }

                return sendArg;

            },
            addFormLoading: function() {
                this.$form.addClass("loading");
                return this;
            },
            removeFormLoading: function() {
                this.$form.removeClass("loading");
                return this;
            },
            isValid: function() {
                //编辑时密码可填可不填,邮箱可填可不填
                //但是填了需要验证
                var self = this;

                return Validator.check(this.$form);
            },
            submitForm: function() {
                var self = this,
                    value = self.getValue(),
                    storeName = self.options.storeName,
                    valid = self.isValid(),
                    copySign = self.copySign,
                    objectId = self.objectId || null;

                //form表单验证
                if (valid) {
                    self.addFormLoading();
                    if (objectId&&!copySign) {
                        AppCube.DataRepository.getStore(storeName).update(this.objectId, value).then(function(res) {
                            U.jumpTo('#email');
                            Logger.success("common.success.update", {
                                doI18n: true
                            });
                        }).finally(function() {
                            self.removeFormLoading();
                        });
                    } else {
                        AppCube.DataRepository.getStore(storeName).add(value).then(function(res) {
                            self.removeFormLoading();
                            U.jumpTo('#email');
                            Logger.success("common.success.create", {
                                doI18n: true
                            });
                        }).finally(function() {
                            self.removeFormLoading();
                        });
                    }
                }
            }
        });
    });
