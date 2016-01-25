/**
 *  list view 
 *  author: wbye
 *  date:  2015.7.2
 */
define([
    'app',
    'Logger',
    'component/table/PageTable/view',
    'core/functions/UI',
    "C",
    'i18n'
], function(AppCube, Logger, PageTable, UI,C,i18n) {

    return PageTable.extend({
        delConfig: {
            DIALOG_TITLE: "Delete Template",
            DIALOG_CONTENT: "Confirm to delete",
            DIALOG_SIZE:"small",
            SUCCESS_DELETE:"common.success.delete"
        },
        events: {
            'click .perpage.buttons>.button': 'changePerpage',
            'click .page.buttons>.button': 'changePage',
            'click th.sorted': 'changeSort',
            'click .trash': "deleteItem"
        },
        initGrid: function () {
            var title = this.options.doI18n?i18n.t(this.options.title):this.options.title;
            var tabs = this.options.tabs;


            this.$('.caption').text(title);
            this.$('.caption').after('<i class="sem-helper-tip icomoon icomoon-help" data-sem-key="settings.tips.mail-templates"></i>');
            if (this.options.page && this.options.page.length > 0) {
                this.initPage();
            }
            if(tabs&&tabs.components&&tabs.components.length>0){
                this.initTabs();
                this.setEmailVerify();
            }
            this.initSort();
        },
        initTabs:function(){
            var tabsComponents = this.options.tabs.components;
            var tabsTag = this.$('.tabs');
            var tempTag =  $('<div class="ui pull-right"></div>');
            $.each(tabsComponents,function(index,item){
                var instanceOfItem = new item.constructor({
                    id:item.name
                });

                tempTag.append(instanceOfItem.render().$el);
            });
            tabsTag.append(tempTag);
        },
        setEmailVerify:function(){
            var self = this;

            AppCube.DataRepository.fetchNew('Store:Application').done(function(res){
                var $checkbox =self.$('.ui.checkbox.verifyemail');
                var inputOfCheckbox =$checkbox .find('input[type=checkbox]');

                inputOfCheckbox.prop('checked',res&&res.emailConfig&&res.emailConfig.verifyEmail||false);
                $checkbox.checkbox();
            });
        },
        deleteItem: function(e) {
            var self = this,
                oid = $(e.currentTarget).attr('data-value'),
                storeName = self.options.storeName,
                config = self.delConfig;

            UI.showDialog(config.DIALOG_TITLE, config.DIALOG_CONTENT, {
                "size": config.DIALOG_SIZE,
                success: function() {
                    AppCube.DataRepository.getStore(storeName).delete(oid).then(function() {
                        Logger.success(config.SUCCESS_DELETE, {
                            doI18n: true
                        });
                        self.refresh();
                    });
                    UI.hideDialog();
                }
            });
        }
    });
});
