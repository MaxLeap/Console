define([
    'API', 
    'data/Task', 
    'store/RestStore', 
    'Q', 
    'underscore'
], function( API, Task, RestStore, Q, _) {
    var ItemStore = RestStore.extend({
        urlConfig:function(){
            return API.get("Data.EmailTpl");
        },
        getDataById: function(id) {
            var task = this._origin_data.data;
            var defer = Q.defer();
            var type = this._origin_data.type;
            if (type == 'data') {
                var item = _.find(task, function(o) {
                    return o.id == id;
                });
                defer.resolve(item);
            } else {
                var url = this.urlConfig()+"/" + id;
                Task.create({
                    url: url
                }).start().done(function(res) {
                    defer.resolve(res);
                });
            }
            return defer.promise;

        },
        delete: function(id) {
            var defer = Q.defer();
            var url = this.urlConfig() + "/" + id;
            var tmp_task = Task.create({
                url: url,
                method: 'delete'
            });
            tmp_task.start().done(function(res) {
                if (tmp_task.state != 3) {
                    defer.resolve(res);
                } else {
                    defer.reject(res);
                }
            });
            return defer.promise;
        },
        add: function(options) {
            var defer = Q.defer();
            var url = this.urlConfig();
            var tmp_task = Task.create({
                url: url,
                method: 'post',
                params: options
            });
            tmp_task.start().done(function(res) {
                if (tmp_task.state != 3) {
                    defer.resolve(res);
                } else {
                    defer.reject(res);
                }
            });
            return defer.promise;
        },
        update: function(id, options) {
            var defer = Q.defer();
            var url = this.urlConfig() + "/" + id;
            var tmp_task = Task.create({
                url: url,
                method: 'put',
                params: options
            });
            tmp_task.start().done(function(res) {
                if (tmp_task.state != 3) {
                    defer.resolve(res);
                } else {
                    defer.reject(res);
                }
            });
            return defer.promise;
        }
    });

    ItemStore.create = function(options) {
        var ret = new ItemStore();
        if (ret.initialize(options || {}) == false) {
            return false;
        }
        return ret;
    };

    return ItemStore;
});
