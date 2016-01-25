define([
    'app',
    'C',
    'API',
    'dispatcher',
    'data/Task',
    'data/Store',
    'core/functions/State',
    './common/ExportStore',
    '../common/SchemaStore',
    '../common/ClassStore',
    'moment',
    'jquery',
    'underscore',
    'U'
],function(AppCube,C,API,Dispatcher,Task,Store,State,ExportStore,SchemaStore,ClassStore,moment,$,_,U){

    return [
        {
            name:'Store:Schemas',
            constructor:SchemaStore,
            initialize:true,
            task:Task,
            taskOptions:{
                url: 'Schema',
                formatter:function(res){
                    res = _.isArray(res)?res:[];
                    _.each(res,function(item){
                       if(item.className){
                           item.classDisplayName = U.strEllip(item.className,25);
                       }
                    });
                    return res;
                },
                buffer:[]
            }
        },
        {
            name:'Store:Classes',
            constructor:ClassStore,
            generator:function(options,taskOptions){
                var params = {};
                var page = Dispatcher.request('getValue:Page',{},'Component')||{};
                params.skip = page.skip;
                params.limit = page.limit;
                if(page.order&&page.order.field){
                    params.order = ((page.order.rule>0)?'-':'')+page.order.field;
                }
                var query = Dispatcher.request('get:condition',{},'Component')||{};
                params.where = JSON.stringify(query);
                if(options.relation){
                    query['$relatedTo'] = {
                        object:{
                            __type:"Pointer",
                            className:AppCube.currentClass,
                            objectId:options.relation.relationId
                        },
                        key:options.relation.columnName
                    };
                    params.where = JSON.stringify(query);

                    return {
                        params:params,
                        url:API.get('Class')+'/'+ options.relation.targetClass
                    };
                }else if(options.pointer){
                    return {
                        pointer:true,
                        params:params,
                        url:API.get('Class')+'/'+AppCube.currentClass + '/'+options.pointer
                    }
                }else{
                    return {
                        params:params,
                        url:API.get('Class')+'/'+AppCube.currentClass
                    }
                }
            },
            initialize:false,
            task:Task,
            taskOptions:{
                url: 'Class',
                formatter:function(res,options){
                    if(!res)return [];
                    if(_.isArray(res.results)){
                        return res.results;
                    }else{
                        if(res.objectId){
                            return [res];
                        }else{
                            return [];
                        }
                    }
                },
                buffer:[]
            }
        },
        {
            name:'Store:DataIE',
            constructor:ExportStore,
            initialize:false,
            generator:function(options,taskOptions){
                var params = {};
                if (!options.params) {
                    var page = Dispatcher.request('getValue:TaskList', {}, 'Component');
                    var condition = Dispatcher.request('getValue:TaskCondition', {}, 'Component');
                    var where = {};
                    if($.trim(condition.search)!=""){
                        where.className = {
                            $regex:"\\Q"+$.trim(condition.q)+"\\E",
                            $options:'i'
                        };
                    }
                    if(condition.type!='all'){
                        where.type = parseInt(condition.type);
                    }
                    where.appId = C.get('User.AppId');

                    if(condition.time=='week'){
                        where.createdAt = {$gte:moment().subtract(7,'days').unix()*1000};
                    }else if(condition.time=='month'){
                        where.createdAt = {$gte:moment().subtract(1,'month').unix()*1000};
                    }else if(condition.time=='3month'){
                        where.createdAt = {$gte:moment().subtract(3,'month').unix()*1000};
                    }

                    if (page) {
                        params.skip = page.skip;
                        params.limit = page.limit;
                        params.where = JSON.stringify(where)
                    }
                    if(page.order&&page.order.field){
                        params.order = (page.order.rule>0?'':'-') + page.order.field;
                    }else{
                        params.order = '-updatedAt';
                    }
                } else {
                    params = options.params;
                }
                return {
                    params: params
                };
            },
            task:Task,
            taskOptions:{
                url: 'DataIE.tasks',
                formatter:function(res){
                    res = _.isArray(res)?res:[];
                    return res;
                },
                buffer:[]
            }
        }
    ]
});