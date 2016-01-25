define([
    './form/view',
    'core/functions/Formatter',
    'layout/BasicLayout',
    'container/BasicContainer'
],function(Form,Formatter,BasicLayout,BasicContainer){

    return {
        'authentication':{
            constructor:BasicLayout,
            root:'#settings-authentication',
            state:{
                'default':[
                    {
                        container:BasicContainer,
                        root:'.container',
                        template:'<div class="container-normal"></div>',
                        components:[
                            {
                                name:'authentication-form',
                                constructor:Form,
                                options:{
                                    stateName:'authentication'
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