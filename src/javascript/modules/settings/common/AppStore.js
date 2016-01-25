define([
    'API',
    'data/Task',
    'store/RestStore',
    'Q',
    'underscore'
], function (API, Task, RestStore, Q, _) {
    var AppStore = RestStore.extend({
        removeApp:function(option){
            var task = this._origin_data.data;
            var defer = Q.defer();
            var url = task.options.url+'/delete';
            var tmp_task = Task.create({
                url: url,
                method: 'post',
                params:option
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
        updateData: function (options) {
            var task = this._origin_data.data;
            var defer = Q.defer();
            var url = task.options.url;
            var tmp_task = Task.create({
                url: url,
                method: 'put',
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
        updateOfflineanalysis: function (options) {
            var task = this._origin_data.data;
            var defer = Q.defer();
            var url = task.options.url;
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
        updateSetting:function(data){
            var defer = Q.defer();
            var tmp_task = Task.create({
                url: API.get('Marketing')+'/push/setting',
                method: 'put',
                params: data
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

    AppStore.create = function (options) {
        var ret = new AppStore();
        if (ret.initialize(options || {}) == false) {
            return false;
        }
        return ret;
    };

    return AppStore;
});