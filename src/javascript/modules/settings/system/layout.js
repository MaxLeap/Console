define([
    './form/view',
    'core/functions/Formatter',
    'layout/BasicLayout',
    'container/BasicContainer'
],function(Form,Formatter,BasicLayout,BasicContainer){

    return {
        'system':{
            constructor:BasicLayout,
            root:'#settings-system',
            //store:store
            state:{
                'default':[
                    {
                        container:BasicContainer,
                        root:'.container',
                        template:'<div class="container-normal"></div>',
                        components:[
                            {
                                name:'system-form',
                                constructor:Form,
                                options:{
                                    stateName:'system'
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