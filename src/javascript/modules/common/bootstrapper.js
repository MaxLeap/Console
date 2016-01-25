define([
    'app',
    'language',
    'dispatcher',
    'core/functions/UI',
    'other/Account',
    'other/StateMachine',
    'data/DataRepository',
    'store/RestStore',
    'data/Task',
    './AppList/view',
    './NotificationBar/view',
    'API',
    'U',
    'C',
    'Q',
    'jquery',
    'Storage',
    'Cookie',
    'underscore',
    'moment',
    'semanticui_popup',
    'i18n',
    'Timezone',
    './Contact'
], function (AppCube, Language, Dispatcher, UI, Account, S, DataRepository, RestStore, Task, AppList, NotificationBar, API, U, C, Q, $, Storage, Cookie, _, moment, SemanticuiPopup, i18n,Timezone,Contact) {

    var defer = Q.defer();

    var moduleList = [
        'clouddata',
        'settings'
    ];

    var mini_icon = {
        'userpermission':'icomoon icomoon-useradm',
        'orgprofile':'icomoon icomoon-orgprofile'
    };

    var icon_map = {
        'dashboard': 'dashboard',
        'clouddata': 'icomoon-devcenter',
        'settings': 'icomoon-setting',
        'profile': 'icomoon-useri',
        'orgprofile':'icomoon-orgprofile'
    };

    var group_map = {
        'clouddata': 'dev-center'
    };

    //不需要显示AppList
    var noAppListModules = ['dashboard','profile','createapp','product'];
    //需要补全hash的模块
    var saveHashModules = ['settings'];
    //权限映射表
    var permissionMap = {
        dashboard:'DASHBOARD',
        clouddata:'DEV_CENTER',
        settings:'SETTINGS',
        orgprofile: 'ORG_PROFILE'
    };
    //解析当前URL
    var curUrl = U.parseCurrentUrl();

    function setAppId(appId){
        if (appId) {
            C.set('User.AppId', appId);
            Storage.set('current_app_id', appId);
        }
    }

    function goLogout(){
        if(!AppCube.User)throw new Error('You should initialize Account first');
        AppCube.User.logout();
    }

    function goNoPermission(){
        var currentModule = curUrl.module;
        if(currentModule!='dashboard')U.jumpTo('/nopermission');
    }

    function initPermission(res){
        //开源项目不检查权限
        AppCube.User.set('permissions',['DASHBOARD','DEV_CENTER','SETTINGS','ORG_PROFILE']);
        AppCube.User.set('orgId',res.orgId);
        AppCube.User.set('roles',res.roles);
        AppCube.User.set('timezone',res.timezone);
        AppCube.User.set('email',res.email);
        AppCube.User.set('username',res.username);
        AppCube.User.set('userType',res.userType);
        AppCube.User.set('orgId',res.orgId);
        if(!Storage.get('language'))Storage.set('language',res.language);
    }
    function checkPermission(){
        AppCube.DataRepository.fetch('Store:UserProfile').done(function(res){
            if(!res.orgId){
                S.execute('no_session_token');
            }else{
                initPermission(res);

                var currentModule = curUrl.module;
                var hasPermission = true;
                if(hasPermission){
                    S.execute('has_permission');
                }else{
                    S.execute('no_permission');
                }
            }
        },function(){
            throw new Error('ServerError');
        });
    }

    function needAppList(){
        //init HTTP HEADER
        var currentModule = curUrl.module;
        var condition = $.inArray(currentModule,noAppListModules)!=-1?'not_need_app_list':'need_app_list';
        S.execute(condition);
    }

    function initStore(){
        var permissionTask = Task.create({
            url: API.get('OrgUsers') + '/' + AppCube.User.get('userId'),
            formatter: function (res) {
                //mock  使模块出现在dashbaord菜单中
                //res.permissions.push('ORG_PROFILE');
                return res;
            },
            method: 'GET',
            buffer: {}
        });

        var AppListTask = Task.create({
            url: API.get('App'),
            formatter: function (res) {
                return _.isArray(res) ? res.sort(function (a, b) {
                    return a.name > b.name ? 1 : -1;
                }) : [];
            },
            method: 'GET',
            buffer: []
        });
        var store = RestStore.create({name: 'Store:AllAppList'});
        store.setData(AppListTask);
        store.refreshData();
        var store2 = RestStore.create({name: 'Store:UserProfile'});
        store2.setData(permissionTask);
        store2.refreshData();
    }

    function showErrorPage(){}

    function loadAppList() {
        AppCube.DataRepository.fetch('Store:AllAppList').done(function(res){
            S.execute('load_success',res);
        },function(){
            S.execute('load_fail');
            defer.reject();
        });
    }

    function checkAppId(userApps){
        if(!$.isArray(userApps)||!userApps.length){
            S.execute('not_in_app_list');
        }else{
            var app;
            var appId = C.get('User.AppId');
            if (!(app = _.findWhere(userApps, {objectId: appId}))) {
                if(!userApps[0]||!userApps[0].objectId)throw new Error('Dirty Data in AppList');
                appId = userApps[0].objectId;
                app = userApps[0];
            }
            C.set('User.AppIcon',app.metadata?app.metadata.icon:"");
            C.set('User.AppName',app.name?app.name:"");
            setAppId(appId);
            S.execute('in_app_list');
        }
    }

    function checkCreateAppPermission(applist){
        //开源项目默认有权限创建
        S.execute('can_create',applist);
    }

    function startApplication(){
        initMenu();
        AppCube.User.renderUserInfo();
        $('#main-sidebar,#header-nav,#main-container,#main-container>.sidebar').i18n();
        UI.initTooltips();
        //UI.initPortlet();
        UI.initScreenNotification();
        UI.bindLogout();
        $('#common-loader').fadeOut();
        defer.resolve();
    }

    function startApplicationWithAppList(){
        startApplication();
        var view = new AppList({
            storeName: 'Store:AllAppList'
        });
        view.init();
        view.setElement(document.getElementById("app-selector"));
        view.beforeShow();
        view.render();
    }

    function startApplicationWithAppListAndForbidCreate(){
        startApplicationWithAppList();
        $('#app-selector .create-app').remove();
    }

    function startApplicationAndForbidCreate(){
        var currentModule = curUrl.module;
        if(currentModule=='createapp'||(currentModule=='dashboard'&&AppCube.User.get('userType')==2)){
            goNoPermission();
        }else{
            startApplication();
            $('#create_app').remove();
        }
    }

    function showGuide(){
        //CacheLastPage
        var currentModule = curUrl.module;
        Storage.set('pagebeforecreateapp',currentModule);
        U.jumpTo('/createapp');
    }

    /* Local Function*/

    function initStateMachine(){
        S.setState('EnterPage');
        S.register('EnterPage','no_session_token','NotLogin',goLogout);
        S.register('EnterPage','expire_session_token','NotLogin',goLogout);
        S.register('EnterPage','has_session_token','Login',checkPermission);
        S.register('Login','no_session_token','NotLogin', goLogout);
        S.register('Login','no_permission','NoPermission', goNoPermission);
        S.register('Login','has_permission','HasPermission',needAppList);
        S.register('HasPermission','need_app_list','StartLoadingList',loadAppList);
        S.register('HasPermission','not_need_app_list','NotNeedApp',checkCreateAppPermission);
        S.register('NotNeedApp','can_create','StartPage',startApplication);
        S.register('NotNeedApp','can_not_create','StartPage',startApplicationAndForbidCreate);

        S.register('StartLoadingList','load_success','LoadingComplete',checkCreateAppPermission);
        S.register('StartLoadingList','load_fail','LoadingError',showErrorPage);

        S.register('LoadingComplete','can_create','CanCreate',checkAppId);
        S.register('CanCreate','not_in_app_list','NoApp',showGuide);
        S.register('CanCreate','in_app_list','StartPage',startApplicationWithAppList);

        S.register('LoadingComplete','can_not_create','CanNotCreate',checkAppId);
        S.register('CanNotCreate','not_in_app_list','NoPermission',goNoPermission);
        S.register('CanNotCreate','in_app_list','NoPermission',startApplicationWithAppListAndForbidCreate);

    }

    function initMenu() {
        var app_menu = $('#module-menu .menu-content');
        var currentModule = curUrl.module;
        var menuPermissions = AppCube.User.get('permissions');
        var all_direct_menu = [];
        _.forEach(moduleList, function (moduleName) {
            if($.inArray(permissionMap[moduleName],menuPermissions)>-1){
                var groupName = group_map[moduleName]?group_map[moduleName]:moduleName;
                var node = $('<li><a href="/' + moduleName + '"><i class="icomoon ' + icon_map[moduleName] + '"></i><span data-i18n="common.module.' + getModuleI18nName(groupName) + '"></span></a></li>');
                //userpermiss 直接和用户注销操作放在一起
                if(moduleName!='userpermission'&&moduleName!='billing'&&moduleName!='orgprofile'&&moduleName!='subscription'){
                    all_direct_menu.push(node);
                }else{
                    var node_special='<div class="item"><a href="/'+moduleName+'"><i class="'+mini_icon[moduleName]+'"></i><span data-i18n="common.module.'+getModuleI18nName(groupName)+'"></span></a></div>';
                    $(node_special).insertBefore($("#user-menu .profile"));
                }
            }
        });

        if(currentModule == 'dashboard'){
            _.forEach(all_direct_menu,function(value,i){
                if(value.find("a[href='/dashboard'],a[href='/userpermission'],a[href='/billing']").length!=0 ){
                    all_direct_menu[i]='';
                }
            });
            $('<ul class="app-list app-menu-items"></ul>').insertBefore($("#create_app_warpper")).append(all_direct_menu);
            var empty_length = 8 - $('ul.app-menu-items>li').length;
            for(var i=0;i<empty_length;i++){
                $('ul.app-menu-items').append('<li class="empty"></li>');
            }
            $('#header-nav').append('<div class=" page-title">'+i18n.t('common.module.dashboard')+'</div>')
        }else{
            $('<ul class="app-list app-menu-items"></ul>').appendTo(app_menu).append(all_direct_menu);
        }

        $('#module-menu>.icomoon-menu').on('click.appmenu', function (e) {
            function hideMenu(){
                $(document).off('click.appmenu');
                app_menu.removeClass('active');
            }

            if(!app_menu.hasClass('active')){
                app_menu.addClass('active');
                e.stopPropagation();

                $(document).on('click.appmenu',hideMenu);
                $(document).on('click.appmenu','#module-menu',function(e){
                    e.stopPropagation();
                });
            }else{
                hideMenu();
            }
        });

    }
    //only change settings module name
    function getModuleI18nName(orginName){
        var orgType = 'App';

        if(orginName=='settings'){
            return "app-settings";
        }else{
            return  orginName;
        }
    }
    function handleUrl() {
        function saveCurrentUrl() {
            var temp_curUrl = U.parseCurrentUrl();
            if (temp_curUrl) Storage.set("lastUrl", temp_curUrl);
        }

        var lastUrl = Storage.get("lastUrl");
        if (
            curUrl
            && curUrl.hash == ""
            && lastUrl
            && lastUrl.hash != ""
            && curUrl.module != ""
            && curUrl.module == lastUrl.module
            && ($.inArray(curUrl.module.toLowerCase(), saveHashModules) > -1)
            )
        {
            var newUrl = "";
            //handle lastUrl hash
            if(/^#(\w+)\//.test(lastUrl.hash)){
                var action = RegExp.$1;
                if(lastUrl.module == 'analytics'&&action == 'funnels'){
                    action = 'conversions';
                }
                lastUrl.hash = '#'+action;
            }

            if (curUrl.appId != "") {
                newUrl = curUrl.origin + "/" + curUrl.module + "/apps/" + curUrl.appId + "/" + lastUrl.hash;
            } else {
                newUrl = curUrl.origin + "/" + curUrl.module + lastUrl.hash;
            }
            if (newUrl != "") {
                U.jumpTo(newUrl);
            }
        } else {
            //无需跳转
            saveCurrentUrl();
            window.onhashchange = function () {
                saveCurrentUrl();
            }
        }

    }

    function loadDataFromStorageAndUrl () {
        var appId = Storage.get('current_app_id');

        var momentCode = Storage.get('moment');

        C.set('moment',momentCode);

        if (appId) C.set('User.AppId', appId);

        /(\w+\.)?(\w+)\./.test(window.location.hostname);
        var prefix = RegExp.$1;
        var SessionToken = Cookie.get(prefix+'sessionToken')||Storage.get('sessionToken');

        if (SessionToken) C.set('User.SessionToken', SessionToken);

        var Timezone = Storage.get('timezone');

        if(Timezone) C.set('User.Timezone', Timezone);

        var pathname = window.location.pathname;

        if (/^\/\w+\/apps\/(\w+)(\/)?$/.test(pathname)) setAppId(RegExp.$1);
    }

    return {
        init:function(){
            //读取缓存HASH并更新URL
            handleUrl();
            AppCube.DataRepository = DataRepository.create();
            AppCube.DataRepository.start();
            AppCube.User = Account.create();
            //国际化
            Language.init(function(){
                //插入模块名
                var currentModule = curUrl.module;

                var groupName = group_map[currentModule]?group_map[currentModule]:currentModule;

                $('#main-toolbar>.module-name').html('<div class="group-name" data-i18n="common.module.'+getModuleI18nName(groupName)+'"></div><div class="menu-name"></div>');

                loadDataFromStorageAndUrl();//load data(session_token...) from Storage
                initStateMachine();
                if(C.get('User.SessionToken')){
                    var SessionToken = C.get('User.SessionToken');
                    if (SessionToken) {
                        C.set('Ajax.HTTPHEADER.X-LAS-Session-Token', SessionToken);
                    }
                    initStore();
                    S.execute('has_session_token');
                }else{
                    S.execute('no_session_token');
                }

                $('#main-sidebar>.list>a').click(function(e){
                    var module_index = $(e.currentTarget).attr('data-value');
                    var showMenu = $('#main-container>.sidebar li[data-module='+module_index+']');
                    if(showMenu.length){
                        window.location.hash = showMenu.eq(0).children('a').attr('href');
                    }
                });


            });

            return defer.promise;
        }
    };
});