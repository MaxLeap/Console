define([
        'basic/Object',
        'jquery',
        'underscore'
    ],
    function (CObject, $, _) {

        var defaults = [];

        var RequestPool = CObject.extend({
            initialize: function (options) {
                this._configure(options);
                this._request_list = {};
                return true;
            },
            _configure: function (options) {
                if (this.options) options = _.extend({}, _.result(this, 'options'), options);
                this.options = _.pick(options, defaults);
            },
            push: function (key, task) {
                if(typeof this._request_list[key] == 'undefined'){
                    this._request_list[key] = [];
                }
                this._request_list[key].push(task._ajax);
            },
            clear: function(key){
                if(key){
                    this._request_list[key] = [];
                }else{
                    this._request_list = {};
                }
            },
            abortByStoreName:function(storeName){
                if(this._request_list[storeName]&&this._request_list[storeName].length>0){
                    _.forEach(this._request_list[storeName],function(request){
                        request.abort();
                    });
                    this._request_list[storeName] = [];
                }
            }
        });

        RequestPool.create = function (options) {
            var ret = new RequestPool();
            if (ret.initialize(options) == false) {
                return false;
            }
            return ret;
        };

        window.rp12 = RequestPool.create();
        return rp12;
    });