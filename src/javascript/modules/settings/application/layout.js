define([
    './form/view',
    'core/functions/Formatter',
    'layout/BasicLayout',
    'container/BasicContainer'
],function(Form,Formatter,BasicLayout,BasicContainer){

    return {
        'application':{
            constructor:BasicLayout,
            root:'#settings-application',
            //store:store
            state:{
                'default':[
                    {
                        container:BasicContainer,
                        root:'.container',
                        template:'<div class="container-normal"></div>',
                        components:[
                            {
                                name:'application-form',
                                constructor:Form,
                                options:{
                                    stateName:'application'
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