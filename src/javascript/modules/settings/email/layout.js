define([
    'app',
    'core/functions/Formatter',
    'layout/BasicLayout',
    'container/BasicContainer',
    '../../common/ToolbarContainer',
    'C',
    './store',
    './item/view',
    './list/view',
    './toolbar/view',
    './verify/view'
], function(AppCube, Formatter, BasicLayout, BasicContainer, ToolbarContainer, C, store, Form, Table, Toolbar,verify) {

    return {
        'email': {
            constructor: BasicLayout,
            root: '#settings-email',
            store: store,
            state: {
                "default": [
                    {
                        container: ToolbarContainer,
                        template: '<div class="container-normal"></div>',
                        components: [{
                            name: "email-template-toolbar",
                            constructor: Toolbar,
                            options: {
                                valueEventName: "Search",
                                connectTableValueEventName:"TemplateList"
                            }
                        }]
                    }, {
                        container: BasicContainer,
                        root: '.container',
                        template: '<div class="container-normal"></div>',
                        components: [{
                                name: 'email-template-list',
                                constructor: Table,
                                options: {
                                    title: 'settings.title.email-template',
                                    doI18n: true,
                                    valueEventName: 'TemplateList',
                                    tabs:{
                                        components:[{
                                            name:"email-settings-verify",
                                            constructor:verify
                                        }]
                                    },
                                    page: [{
                                        value: 20,
                                        name: '20'
                                    }, {
                                        value: 50,
                                        name: '50'
                                    }, {
                                        value: 100,
                                        name: '100'
                                    }],
                                    columns: [{
                                        name:"settings.field.template-name",
                                        field: "templateName",
                                        id: "templateName",
                                        sortable: true,
                                        formatter: function(row, cell, value, columnDef, dataContext) {
                                            return '<a class="link" href="#email/edit/' + dataContext['objectId'] + '">' + value + '</a>';
                                        }
                                    }, {
                                        name: "settings.field.language",
                                        field: "locale_name",
                                        id: "locale_name",
                                        formatter: function(row, cell, value, columnDef, dataContext) {
                                            return value;
                                        }
                                    }, {
                                        name: "settings.field.subject",
                                        field: "subject",
                                        id: "subject",
                                        sortable: true

                                    }, {
                                        name: "settings.field.action",
                                        cssClass: 'action',
                                        field: "objectId",
                                        id: "objectId",
                                        formatter: function(row, cell, value, columnDef, dataContext) {
                                            var del = '<i class="action trash icon" data-value="' + value + '"></i>';
                                            var copy = '<a class="link" href="#email/copy/' + dataContext['objectId'] + '"><i class="action copy icon" data-value="' + value + '"></i></a>';
                                            if (dataContext['type'] === 0) {
                                                return copy;
                                            } else {
                                                return del + copy;
                                            }
                                        }
                                    }],
                                    options: _.extend({},C.get('UI.Table'),{ doI18n : true })
                                },
                                extend: {
                                    storeName: "Store:Email"
                                }
                        }]
                    }
                ],
                "new": [{
                    container: BasicContainer,
                    root: '.container',
                    template: '<div class="container-normal"></div>',
                    components: [{
                        name: 'email-form',
                        constructor: Form,
                        options: {
                            stateName: 'email',
                            title: 'settings.email.create-new'
                        },
                        extend: {
                            storeName: "Store:Email"
                        }
                    }]
                }],
                "edit": [{
                    container: BasicContainer,
                    root: '.container',
                    template: '<div class="container-normal"></div>',
                    components: [{
                        name: 'email-form',
                        constructor: Form,
                        options: {
                            stateName: 'email',
                            title: 'settings.email.edit'
                        },
                        extend: {
                            storeName: "Store:Email"
                        }
                    }]
                }],
                "copy": [{
                    container: BasicContainer,
                    root: '.container',
                    template: '<div class="container-normal"></div>',
                    components: [{
                        name: 'email-form',
                        constructor: Form,
                        options: {
                            stateName: 'email',
                            title: 'settings.email.copy',
                            copySign: true
                        },
                        extend: {
                            storeName: "Store:Email"
                        }
                    }]
                }],
            }
        }
    }
});
