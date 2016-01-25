define([
    'C',
    'dispatcher',
    'data/Task',
    'data/Store',
    './common/AppStore',
    'underscore'
],function(C,Dispatcher,Task,Store,AppStore,_){

    return [
        {
            name:'Store:Application',
            constructor:AppStore,
            initialize:false,
            task:Task,
            taskOptions:{
                url: 'Data.SingleApp',
                formatter:function(res){
                    return res;
                },
                buffer:{}
            },
            state:{
                general:function(model,options){
                    var metadata = model.metadata||(model.metadata={});
                    var platforms = model.platforms||{};
                    var appStoreIds = model.appStoreIds||{};
                    var urlSchemas = model.urlSchemas||{};
                    //var os = C.get('User.AppOS');
                    /^((http|https):\/\/)?(.*)/.test(metadata.url);
                    var url = RegExp.$1?metadata.url:('http://'+RegExp.$3);
                    return {
                        //os:os,
                        app_name:model.name,
                        //以前没设定的认为是App
                        appType:model.appType||'App',
                        default_lang:model.defaultLang,
                        production:metadata.production,
                        product_name:metadata.name,
                        app_url:metadata.url?url:'',
                        desc:metadata.desc,
                        app_icon:metadata.icon,
                        itunesid:appStoreIds.itunesId,
                        package:appStoreIds.packageName,
                        uandroid:urlSchemas.android,
                        uios:urlSchemas.ios,
                        enableCreateObject:model.enableCreateObject,
                        platforms:platforms,
                        ios:platforms['iTunes App Store'],
                        android:platforms['Google Play Store'],
                        web:platforms['Web'],
                        windows:platforms['Windows App Store']
                    }
                },
                application:function(model,options){
                    return {
                        objectId:model.objectId,
                        clientKey:model.clientKey,
                        restAPIKey:model.restAPIKey,
                        javascriptKey:model.javascriptKey,
                        netKey:model.netKey,
                        masterKey:model.masterKey
                    }
                },
                notification:function(data,options){
                    var push = data.pushConfig||(data.pushConfig={});
                    var appleConfig = push.appleConfig||(push.appleConfig={});
                    var windowsConfig = push.windowsConfig||(push.windowsConfig={});
                    var gcmConfig = push.gcmConfig||(push.gcmConfig={});
                    //var os = C.get('User.AppOS');
                    return {
                        //enabled:push.enable,
                        //os:os,
                        cert:(typeof appleConfig.key=='string'?appleConfig.key:false),
                        password:(typeof appleConfig.password=='string'?appleConfig.password:''),
                        apiKey:(typeof gcmConfig.apiKey=='string'?gcmConfig.apiKey:''),
                        senderId:(typeof gcmConfig.senderId=='string'?gcmConfig.senderId:''),
                        sid:(typeof windowsConfig.packageSid=='string'?windowsConfig.packageSid:''),
                        client_secret:(typeof windowsConfig.clientSecret=='string'?windowsConfig.clientSecret:'')
                    }
                },
                email:function(data){
                    var emailConfig = data.emailConfig||(data.emailConfig={});
                    return {
                        verifyEmail:emailConfig.verifyEmail,
                        pwdResetPage:emailConfig.pwdResetPage,
                        pwdSucessPage:emailConfig.pwdSucessPage,
                        verifySucessPage:emailConfig.verifySucessPage,
                        invalidLinkPage:emailConfig.invalidLinkPage
                    }
                },
                authentication:function(data){
                    var authConfig = data.authConfig||(data.authConfig={});
                    var faceBookAuth = authConfig.faceBookAuth||(authConfig.faceBookAuth={});
                    var twitterAuth = authConfig.twitterAuth||(authConfig.twitterAuth={});
                    return {
                        anonymousUser:authConfig.anonymousUser || false,
                        baseUserName:authConfig.baseUserName || false,
                        defaultAuth:authConfig.defaultAuth,
                        faceBookAuth:faceBookAuth.authEnable || false,
                        faceBookKey:faceBookAuth.appInfos || [],
                        twitterAuth:twitterAuth.authEnable || false,
                        twitterKey:twitterAuth.consumerKeys
                    }
                },
                iap:function(data){
                    var IAP = data.iap||(data.iap={});
                    var googleIAP = IAP.GooglePlay||(IAP.GooglePlay={});
                    var amazonIAP = IAP.Amazon||(IAP.Amazon={});
                    //var os = C.get('User.AppOS');
                    return {
                        //os:os,
                        googleRefreshToken:googleIAP.refreshToken,
                        googleClientId:googleIAP.clientId,
                        googleClientSecret:googleIAP.clientSecret,
                        googleDefaultAccessToken:googleIAP.defaultAccessToken,
                        amazonDevelopSecret:amazonIAP.developerSecret
                    }
                },
                system:function(model,options){
                    return {
                        enableOfflineAna:model.enableOfflineAna
                    }
                }
            }
        },
        {
            name: 'Store:Lang',
            constructor: Store,
            initialize: true,
            task: Task,
            taskOptions: {
                url: 'Lang',
                formatter: function (res) {
                    if (!res) {
                        return [];
                    } else {
                        var data = _.map(res, function (item) {
                            return {
                                id: item.code,
                                text: item.name
                            };
                        });
                        return _.sortBy(data, function (item) {
                            return item.text
                        });
                    }
                }
            }
        }
    ]
});