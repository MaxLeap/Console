define([
    './form/view',
    'core/functions/Formatter',
    'layout/BasicLayout',
    'container/BasicContainer'
],function(Form,Formatter,BasicLayout,BasicContainer){

    return {
        'iap':{
            constructor:BasicLayout,
            root:'#settings-iap',
            //store:store
            state:{
                'default':[
                    {
                        container:BasicContainer,
                        root:'.container',
                        template:'<div class="container-normal"></div>',
                        components:[
                            {
                                name:'iap-form',
                                constructor:Form,
                                options:{
                                    stateName:'iap'
                                },
                                extend:{
                                    storeName:"Store:Application"
                                }
                            }
                        ]
                    }
                ]
            }
        }
    }
});