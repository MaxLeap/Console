define([
    'C',
    'dispatcher',
    'data/Task',
    '../common/EmailStore',
    'underscore',
    'language',
    "i18n"
],function(C,Dispatcher,Task,EmailStore,_,Language,i18n){

    return [
        {
            name:'Store:Email',
            constructor:EmailStore,
            initialize:false,
            task:Task,
            taskOptions:{
                url: 'Data.EmailTpl',
                formatter:function(res){

                    res = _.isArray(res.results)?res.results:[];
                    res = defaultTplI18n(res);
                    
                    return res;

                    function defaultTplI18n(res){
                        var defaultMap = {
                            verify_email_tpl:"Verify Email",
                            reset_password_tpl:"Reset Password Email"
                        };
                        var defaultI8NMap  = {
                            verify_email_tpl:"settings.label.verify-email",
                            reset_password_tpl:"settings.label.reset-password-email"
                        };

                        _.each(res,function(item){
                            if(item.type===0&&defaultMap[item.templateName]){
                                // item.templateName = defaultI8NMap[item.templateName];
                                item.templateName = i18n.t(defaultI8NMap[item.templateName])||defaultMap[item.templateName];
                            }
                        });

                        return res;
                    }
                },
                buffer:{},

            },
            generator:function(options,taskOptions){
                var params;
                var tableOptions = Dispatcher.request('getValue:TemplateList',{},'Component');
                var data = Dispatcher.request('getValue:Search',{},'SearchContainer');
                var queryOptions = {};
                
                params = _.extend({},taskOptions.params,options,queryOptions);
                params.where = data;
                
                //order transform
                if(tableOptions&&tableOptions.order){
                    if(tableOptions.order.rule<0){
                        tableOptions.order="-"+tableOptions.order.field;
                    }else{
                        tableOptions.order=tableOptions.order.field;
                    }
                }

                params=_.extend({},params,tableOptions);
                
                return {
                    params: params
                }
            },
            state:{
                email:function(res){
                    return res;
                }
            }
        }
    ]
});