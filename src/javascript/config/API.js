define(['C', 'U'], function (C, U) {
    var api = {};
    var urlBase = document.location.protocol + "//" + document.location.hostname + (document.location.port?(":"+document.location.port):"");
    var apiVersion = '2.0';
    var apiPrefix = {
        'App': urlBase + '/' + apiVersion + '/apps',
        'Data': urlBase + '/' + apiVersion + '/',
        'Class':urlBase + '/' + apiVersion + '/classes',
        'User':urlBase + '/' + apiVersion + '/users',
        'Product':urlBase + '/' + apiVersion + '/products',
        'Passport':urlBase + '/' + apiVersion + '/passport',
        'Installation':urlBase + '/' + apiVersion + '/installations',
        'Role':urlBase + '/' + apiVersion + '/roles',
        'OrgUsers': urlBase + '/' + apiVersion + '/orgUsers',
        'Users': urlBase + '/' + apiVersion + '/',
        'Files': urlBase + '/' + apiVersion + '/files',
        'Schema': urlBase + '/' + apiVersion + '/schemas',
        'Country': urlBase + '/' + apiVersion + '/location/country',
        'Lang': urlBase + '/' + apiVersion + '/location/lang',
        'captcha':urlBase + '/' + apiVersion + '/captcha/',

        /*Data Import&Export*/
        "DataIE":urlBase+"/"+apiVersion+"/dataie",
        "Pay":urlBase + "/" + apiVersion + "/pay",
        "SMS":urlBase + "/" + apiVersion + "/sms"
    };

    var apiSuffix = {
        EmailTpl:function(){
            return 'apps/'+C.get('User.AppId')+'/emailtemplates';
        },
        SingleApp: function () {
            return 'apps/'+C.get('User.AppId');
        },
        Schema: function () {
            return '/schemas/';
        },
        Batch: function () {
            return '/batch/';
        },
        Installation:function(){
            return '/_Installation';
        },
        register:function() {
            return '/register';
        },
        requestPasswordReset: function () {
            return '/requestPasswordReset';
        },
        requestEmailVerify: function() {
            return '/requestEmailVerify';
        } ,
        verifyEmail:function () {
            return '/verifyEmail';
        },
        resetPassword:function () {
            return '/resetPassword';
        }
    };

    api.get = function (key) {
        var arr = key.split('.');
        var prefix = apiPrefix[arr[0]];
        if(arr[1]){
            return apiSuffix[arr[1]]?(prefix+apiSuffix[arr[1]]()):prefix+'/'+arr[1].toLowerCase();
        }else{
            return prefix;
        }
    };

    return api;
});