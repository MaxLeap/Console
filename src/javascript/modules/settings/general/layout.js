define([
    './form/view',
    'core/functions/Formatter',
    'layout/BasicLayout',
    'container/BasicContainer'
],function(Form,Formatter,BasicLayout,BasicContainer){

    return {
        'general':{
            constructor:BasicLayout,
            root:'#settings-general',
            //store:store
            state:{
                'default':[
                    {
                        container:BasicContainer,
                        root:'.container',
                        template:'<div class="container-normal"></div>',
                        components:[
                            {
                                name:'general-form',
                                constructor:Form,
                                options:{
                                    stateName:'general'
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