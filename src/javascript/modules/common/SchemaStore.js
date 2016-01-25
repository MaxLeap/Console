define(['API', 'data/Task', 'store/RestStore', 'Q', 'underscore'], function (API, Task, RestStore, Q, _) {
    var SchemaStore = RestStore.extend({
        addKey: function (id, key, type, target) {
            var defer = Q.defer();
            var url = API.get('Schema') + '/' + id + '/addKey';
            var key_obj = {};
            key_obj[key] = {type: type};
            if (type == "Pointer" || type == "Relation") {
                key_obj[key].className = target;
            }
            var tmp_task = Task.create({
                url: url,
                method: 'put',
                params: {keys: key_obj}
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
        deleteKey: function (id, key) {
            var defer = Q.defer();
            var url = API.get('Schema') + '/' + id + '/delKey';
            var key_obj = {};
            key_obj[key] = {__op: "Delete"};
            var tmp_task = Task.create({
                url: url,
                method: 'put',
                params: {keys: key_obj}
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
        getPermissionByName: function (name) {
            var defer = Q.defer();
            this.getData().done(function (res) {
                var find = _.find(res, function (item) {
                    return item.className == name;
                });
                defer.resolve(find ? find.clientPermission : {});
            });
            return defer.promise;
        },
        getKeysByName: function (name) {
            var defer = Q.defer();
            this.getData().done(function (res) {
                var find = _.find(res, function (item) {
                    return item.className == name;
                });
                defer.resolve(find ? _.map(find.keys, function (item, index) {
                    var obj = {name: index, type: item.type};
                    if (item.type == 'Relation') {
                        obj.className = name;
                        obj.targetClass = item.className;
                    } else {
                        if (item.className)obj.className = item.className;
                    }
                    return obj;
                }) : []);
            });
            return defer.promise;
        },
        setPermission: function (id, options) {
            var defer = Q.defer();
            var url = API.get('Schema') + '/' + id + '/permissions';
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
        }
    });

    SchemaStore.create = function (options) {
        var ret = new SchemaStore();
        if (ret.initialize(options || {}) == false) {
            return false;
        }
        return ret;
    };

    return SchemaStore;
});