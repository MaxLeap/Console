define([
    'C',
    'API',
    'data/Task',
    'store/RestStore',
    'Q',
    'jquery',
    'underscore'
], function (C, API, Task, RestStore, Q, $ , _) {
    var ExportStore = RestStore.extend({
        updateTaskById: function (id) {
            var task = this._origin_data.data;
            var defer = Q.defer();
            var url = task.options.url + '/' + id;
            Task.create({
                url: url
            }).start().done(function (res) {
                defer.resolve(res);
            });
            return defer.promise;
        },
        ImportData:function(options){
            var defer = Q.defer();
            var url = API.get('DataIE') + '/apps/' + C.get('User.AppId') + '/import';
            var tmp_task = Task.create({
                url: url,
                method: 'post',
                params: options
            });
            tmp_task.start().done(function (res) {
                if (tmp_task.state != 3) {
                    defer.resolve(res);
                } else {
                    defer.reject(res);
                }
            });
            return defer.promise;
        },
        ExportData:function(options){
            var defer = Q.defer();
            var url = API.get('DataIE') + '/apps/' + C.get('User.AppId') + '/export';
            var tmp_task = Task.create({
                url: url,
                method: 'post',
                params: options
            });
            tmp_task.start().done(function (res) {
                if (tmp_task.state != 3) {
                    defer.resolve(res);
                } else {
                    defer.reject(res);
                }
            });
            return defer.promise;
        },
        getProcess:function(ids){
            var defer = Q.defer();
            var url = API.get('DataIE') + '/tasks/' + C.get('User.AppId') + '/process';
            var tmp_task = Task.create({
                url: url,
                method: 'post',
                params: ids||[]
            });
            tmp_task.start().done(function (res) {
                if (tmp_task.state != 3) {
                    defer.resolve(res);
                } else {
                    defer.reject(res);
                }
            });
            return defer.promise;
        },
        getLogFromTask:function(id){
            var defer = Q.defer();
            var url = API.get('DataIE') + '/tasks/' + id + '/log';
            var tmp_task = Task.create({
                url: url,
                formatter:function(res){
                    if(!$.isArray(res))
                        return {
                            error:[],
                            info:[]
                        };
                    var error = [],info = [];
                    _.forEach(res,function(item){
                        if(item.level == "2"){
                            error.push($('<p class="error">'+item.createdAt+(item.seq>0?(' '+item.seq+' '):'')+' '+item.message+'</p>'));
                        }else if(item.level == "0"){
                            info.push($('<p class="info">'+item.createdAt+(item.seq>0?(' '+item.seq+' '):'')+' '+item.message+'</p>'));
                        }else if(item.level == "1"){
                            info.push($('<p class="warning">'+item.createdAt+(item.seq>0?(' '+item.seq+' '):'')+' '+item.message+'</p>'));
                        }
                    });
                    return {
                        error:error,
                        info:info
                    }
                }
            });
            tmp_task.start().done(function (res) {
                if (tmp_task.state != 3) {
                    defer.resolve(res);
                } else {
                    defer.reject(res);
                }
            });
            return defer.promise;
        }
    });

    ExportStore.create = function (options) {
        var ret = new ExportStore();
        if (ret.initialize(options || {}) == false) {
            return false;
        }
        return ret;
    };

    return ExportStore;
});