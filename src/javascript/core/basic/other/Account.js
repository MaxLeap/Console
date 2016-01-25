define([
        'basic/Object',
        'Cookie',
        'Storage',
        'C',
        'U',
        'jquery',
        'underscore',
        'i18n',
        'semanticui_dropdown'
    ],
    function (CObject, Cookie, Storage, C, U, $, _, i18n) {

        var defaults = [];

        var Account = CObject.extend({
            initialize: function (options) {
                this._configure(options);
                this.syncAccountInfo();
                return true;
            },
            _configure: function (options) {
                if (this.options) options = _.extend({}, _.result(this, 'options'), options);
                this.options = _.pick(options, defaults);
            },
            syncAccountInfo: function () {
                //todo create Task
                this.set('username', Storage.get('username'));
                this.set('email', Storage.get('email'));
                this.set('userType', Storage.get('userType'));
                this.set('roleType', Storage.get('roleType'));
                /(\w+\.)?(\w+)\./.test(window.location.hostname);
                var prefix = RegExp.$1;
                this.set('userId', Cookie.get(prefix+'userId')||Storage.get('userId'));
            },
            clearUserData:function() {
                var lastUrl = Storage.get('lastUrl');
                var vistedIntrosSelector = Storage.get('vistedIntrosSelector');
                Storage.clear();
                Cookie.clear();
                if(lastUrl){
                    Storage.set('lastUrl',lastUrl);
                }
                if(vistedIntrosSelector){
                    Storage.set('vistedIntrosSelector',vistedIntrosSelector);
                }
            },
            logout: function () {
                this.clearUserData();
                U.jumpTo('/login');
            },
            renderUserInfo: function () {
                var user = this.username || this.email || '';
                $('#user-menu').i18n();
                $('#user-menu').dropdown({
                    duration:100,
                    action:'select',
                    onChange:function(value, text, $choice){
                        console.log($choice);
                        console.log($choice.find("a")[0]);
                        $choice.find("a")[0].click();
                    }
                });
            },
            destroy: function () {
            }
        });

        Account.create = function (options) {
            var ret = new Account();
            if (ret.initialize(options) == false) {
                return false;
            }
            return ret;
        };

        return Account;
    });