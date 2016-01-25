define([
    'C',
    'underscore',
    'core/functions/Formatter',
    '../common/CloudDataLayout',
    '../common/CloudDataContainer',
    '../common/CloudDataToolbarContainer',
    'text!./toolbar/filter/FilterItem.html',
    './headerbar/ImportData/controller',
    './headerbar/view',
    './sidebar/view',
    './toolbar/view',
    './PageGrid/view',
    'i18n'
],function(C,_,Formatter,CloudDataLayout,CloudDataContainer,CloudDataToolbarContainer,FilterItem,ImportData,HeaderBar,Sidebar,ToolBar,PageGrid,i18n){

    return {
        'main':{
            constructor:CloudDataLayout,
            root:'#clouddata-main',
            state:{
                'default':[
                    {
                        container:CloudDataToolbarContainer,
                        template: '<div class="container-normal"></div>',
                        components:[
                            {
                                name:'import-controller',
                                constructor:ImportData,
                                options:{}
                            },
                            {
                                name:'data-headerbar',
                                constructor:HeaderBar,
                                options:{
                                    table:{
                                        doI18n:true,
                                        title:'',
                                        valueEventName:'TaskList',
                                        storeName:'Store:DataIE',
                                        page:[
                                            {value:10,name:'10'},
                                            {value:20,name:'20'},
                                            {value:30,name:'30'}
                                        ],
                                        columns:[
                                            {
                                                name: "clouddata.tag.classname",
                                                field: "classNames",
                                                id: "classNames",
                                                width:250,
                                                sortable: true,
                                                formatter:function(row, cell, value, columnDef, dataContext){
                                                    return $.isArray(value)?value.join(", "):"";
                                                }
                                            },
                                            {
                                                name: "clouddata.tag.type",
                                                field: "type",
                                                id: "type",
                                                formatter:function(row, cell, value, columnDef, dataContext){
                                                    return i18n.t('clouddata.tag.task-type-'+value);
                                                }
                                            },
                                            {
                                                name: "clouddata.tag.process",
                                                field: "process",
                                                id: "process",
                                                formatter:function(row, cell, value, columnDef, dataContext){
                                                    var number = parseFloat(value);
                                                    if(isNaN(number))number = 0;
                                                    return '<span data-value="'+dataContext['objectId']+'">'+(number*100).toFixed(0)+'%</span>';
                                                }
                                            },
                                            {
                                                name: "clouddata.tag.status",
                                                field: "status",
                                                id: "status",
                                                formatter:function(row, cell, value, columnDef, dataContext){
                                                    return i18n.t('clouddata.tag.task-status-'+value);
                                                }
                                            },
                                            {
                                                name: "clouddata.tag.download",
                                                field: "s3path",
                                                id: "s3path",
                                                width:100,
                                                formatter:function(row, cell, value, columnDef, dataContext){
                                                    if(dataContext["type"]==0){
                                                        return '<a class="action" href="'+value+'" target="_blank"><i class="action icon download"></i></a>';
                                                    }else{
                                                        return '';
                                                    }
                                                }
                                            },
                                            {
                                                name: "clouddata.tag.logs",
                                                field: "objectId",
                                                id: "objectId",
                                                formatter:function(row, cell, value, columnDef, dataContext){
                                                    return '<a class="link btn-detail" data-value="'+value+'" href="javascript:void(0)">'+i18n.t('clouddata.tag.details')+'</a>';
                                                }
                                            }
                                        ],
                                        options: _.extend({},C.get('UI.Table'),{doI18n:true})
                                    }
                                },
                                extend:{}
                            }
                        ]
                    },
                    {
                        container:CloudDataContainer,
                        root:'.sidebar',
                        template:'<div class="sidebar"></div>',
                        components:[
                            {
                                name:'data-sidebar',
                                constructor:Sidebar,
                                options:{},
                                extend:{
                                    storeName:"Store:Schemas"
                                }
                            }
                        ]
                    },
                    {
                        container:CloudDataContainer,
                        root:'.content',
                        template:'<div class="main-content"></div>',
                        components:[
                            {
                                name:'data-toolbar',
                                constructor:ToolBar,
                                options:{
                                    filter:{
                                        childOptions:{
                                            childTemplate:FilterItem
                                        }
                                    }
                                },
                                extend:{}
                            },
                            {
                                name:'data-page-grid',
                                constructor:PageGrid,
                                options:{
                                    title:'',
                                    with_checkbox:true,
                                    valueEventName:'Page',
                                    page:[
                                        {value:100,name:'100'},
                                        {value:50,name:'50'},
                                        {value:25,name:'25'}
                                    ],
                                    columns:[
                                        {
                                            name: "CreatedAt",
                                            field: "createdAt",
                                            id: "createdAt",
                                            sortable: true
                                        },
                                        {
                                            name: "ObjectId",
                                            field: "objectId",
                                            id: "objectId",
                                            sortable: true
                                        },
                                        {
                                            name: "String",
                                            field: "string_col",
                                            id: "string_col",
                                            sortable: true
                                        }
                                    ],
                                    options:C.get('UI.SlickGrid')
                                },
                                extend:{
                                    storeName:"Store:Classes"
                                }
                            }
                        ]
                    }
                ],
                'pointer':[],
                'relation':[]
            }
        }
    }
});