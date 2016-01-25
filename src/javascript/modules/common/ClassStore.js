define([
    'app',
    'API',
    'data/Task',
    'store/RestStore',
    'Q',
    'underscore'
], function (AppCube, API, Task, RestStore, Q, _) {
    var ClassStore = RestStore.extend({
        updateData: function (id, options) {
            var task = this._origin_data.data;
            var defer = Q.defer();
            var type = this._origin_data.type;
            if (type == 'data') {
                var item = _.find(task, function (o) {
                    return o.id == id;
                });
                _.extend(item, options);
                //todo
                defer.resolve(item);
            } else {
                var url = API.get("Class") + '/' + AppCube.currentClass + '/' + id;
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
            }
            return defer.promise;
        },
        updateRelationData: function (id, relationClass, options) {
            var task = this._origin_data.data;
            var defer = Q.defer();
            var type = this._origin_data.type;
            if (type == 'data') {
                var item = _.find(task, function (o) {
                    return o.id == id;
                });
                _.extend(item, options);
                //todo
                defer.resolve(item);
            } else {
                var url = API.get("Class") + '/' + relationClass + '/' + id;
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
            }
            return defer.promise;
        },
        addRelationData: function (options, relationClass, columnName, relationId) {
            var defer = Q.defer();
            var self = this;
            var tmp_task = Task.create({
                url: API.get("Class") + '/' + relationClass,
                method: 'post',
                params: options
            });
            tmp_task.start().done(function (res) {
                if (tmp_task.state != 3) {
                    self.updateRelation(columnName, relationClass, res.objectId, relationId).done(function (res) {
                        defer.resolve(res);
                    }, function () {
                        defer.reject(res);
                    });
                } else {
                    defer.reject(res);
                }
            });
            return defer.promise;
        },
        updateRelation: function (columnName, relationClass, recordId, relationId) {
            var defer = Q.defer();
            var data = JSON.parse('{"' + columnName + '":{"__op":"AddRelation","objects":[{"__type":"Pointer","className":"' + relationClass + '","objectId":"' + recordId + '"}]}}');
            var tmp_task = Task.create({
                url: API.get("Class") + '/' + AppCube.currentClass + '/' + relationId,
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
        },
        batchRemoveRelation: function (ids, columnName, relationClass, relationId) {
            var defer = Q.defer();
            if (!_.isArray(ids) || ids.length == 0) {
                throw new Error('length must gt 0');
            }
            var pointers = [];
            _.forEach(ids, function (id) {
                var pointer = {__type: "Pointer"};
                pointer.className = relationClass;
                pointer.objectId = id;
                pointers.push(pointer);
            });
            var data = JSON.parse('{"' + columnName + '":{"__op":"RemoveRelation"}}');
            data[columnName].objects = pointers;

            var tmp_task = Task.create({
                url: API.get('Class') + '/' + AppCube.currentClass + '/' + relationId,
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
        },
        batchRemove: function (ids) {
            var defer = Q.defer();
            if (!_.isArray(ids) || ids.length == 0) {
                throw new Error('length must gt 0');
            }
            var url = API.get('Data.Batch');
            var sub_url = API.get('Class') + '/' + AppCube.currentClass;
            var requests = [];
            _.forEach(ids, function (id) {
                requests.push({
                    method: "delete",
                    path: sub_url + '/' + id
                });
            });
            var tmp_task = Task.create({
                url: url,
                method: 'post',
                params: {
                    requests: requests
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

    ClassStore.create = function (options) {
        var ret = new ClassStore();
        if (ret.initialize(options || {}) == false) {
            return false;
        }
        return ret;
    };

    return ClassStore;
});