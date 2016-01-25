require.config({
    baseUrl: '/javascript',
    waitSeconds: 0,
    urlArgs: "bust=" + (new Date()).getTime(),
    paths: {
        //lib
        jquery: 'lib/jquery/jquery.min',
        underscore: 'lib/underscore/underscore-min',
        nicescroll: 'vendor/jquery.nicescroll/jquery.nicescroll.min',
        store2: 'lib/store/dist/store2.min',
        Q: 'lib/q/q',
        backbone: 'lib/backbone/backbone-min',
        wreqr: 'lib/backbone.wreqr/lib/backbone.wreqr.min',
        tpl: 'lib/requirejs-tpl/tpl',
        text: 'lib/requirejs-text/text',
        marionette: 'lib/backbone.marionette/lib/backbone.marionette.min',
        jquery_ui: 'vendor/jquery-ui/jquery-ui.min',
        easing: 'lib/jquery-easing/jquery.easing.min',
        i18n: 'lib/i18next/i18next.amd.withJQuery.min',
        jquery_event_drag: 'lib/slickgrid/lib/jquery.event.drag-2.2',
        slickgrid_core: 'lib/slickgrid/slick.core',
        slickgrid: 'lib/slickgrid/slick.grid',
        slick_rowselect: 'lib/slickgrid/plugins/slick.rowselectionmodel',
        slick_checkbox: 'vendor/plugin/slick.checkboxselectcolumn',
        moment: 'lib/moment/moment',
        'moment-timezone':'lib/moment-timezone/builds/moment-timezone-with-data.min',
        zeroclipboard: 'lib/zeroclipboard/dist/ZeroClipboard.min',
        daterangepicker: "vendor/bootstrap-daterangepicker/daterangepicker",
        pnotify: "vendor/pnotify/pnotify.core",
        'pnotify.buttons': "vendor/pnotify/pnotify.buttons",
        'pnotify.nonblock': "vendor/pnotify/pnotify.nonblock",
        'visualcaptcha.jquery':'vendor/visualcaptcha.jquery/visualcaptcha.jquery',
        validate: "lib/jquery.validation/dist/jquery.validate.min",
        scrollTo:"lib/jquery.scrollTo/jquery.scrollTo.min",
        pace:"lib/pace/pace.min",
        "jquery-sortable":"lib/jquery-sortable/source/js/jquery-sortable-min",
        //common
        basic: "core/basic",
        data: "core/basic/data",
        event: "core/basic/event",
        net: "core/basic/net",
        view: "core/basic/view",
        other: "core/basic/other",

        dispatcher: "core/functions/Dispatcher",
        U: 'core/functions/Utils',
        Storage:'core/functions/Storage',
        Timezone:'core/functions/Timezone',
        Cookie: 'core/functions/Cookie',
        Logger: 'core/functions/Logger',
        State: 'core/functions/State',
        app: "core/functions/App",
        formatter: "core/functions/Formatter",
        language: "core/functions/Language",
        UI: "core/functions/UI",

        layout: "core/layout",
        container: "core/container",
        component: "core/component",
        emptyView: "core/component/empty/view",
        store: "core/store",
        extend: "core/extend",
        Captcha:"core/functions/Captcha",
        //ui: "core/extend/ui",

        C: "config/Config",
        API: "config/API",
        semanticui: '../semanticui/dist/semantic',
        semanticui_accordion:'../semanticui/dist/components/accordion.min',
        semanticui_checkbox:'../semanticui/dist/components/checkbox.min',
        semanticui_dimmer:'../semanticui/dist/components/dimmer.min',
        semanticui_dropdown:'../semanticui/dist/components/dropdown.min',
        semanticui_form:'../semanticui/dist/components/form.min',
        semanticui_modal:'../semanticui/dist/components/modal.min',
        semanticui_popup:'../semanticui/dist/components/popup.min',
        semanticui_progress:'../semanticui/dist/components/progress.min',
        semanticui_search:'../semanticui/dist/components/search.min',
        semanticui_dropdown2:'../semanticui/dist/components/select2.min',
        semanticui_site:'../semanticui/dist/components/site.min',
        semanticui_state:'../semanticui/dist/components/state.min',
        semanticui_tab:'../semanticui/dist/components/tab.min',
        semanticui_transition:'../semanticui/dist/components/transition.min',
        semanticui_visibility:'../semanticui/dist/components/visibility.min',

        //add common module 
        com_fun:'modules/common/function',
        jsonview:'lib/jquery-jsonview/dist/jquery.jsonview',
        spinjs:'lib/spinjs/spin'
    },
    shim: {
        main: {
            deps: [],
            exports: 'main'
        },
        jquery: {
            deps: [],
            exports: 'jQuery'
        },
        'pnotify.buttons':{
            deps: ['pnotify']
        },
        'pnotify.nonblock':{
            deps: ['pnotify']
        },
        nicescroll: {
            deps: ['jquery']
        },
        'jquery-sortable':{
            deps: ['jquery']
        },
        jquery_event_drag:{
            deps: ['jquery']
        },
        underscore: {
            deps: [],
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        marionette: {
            deps: ['backbone'],
            exports: 'Marionette'
        },
        wreqr: {
            deps: ['backbone']
        },
        easing:{
            deps: ['jquery'],
            exports: 'easing'
        },
        i18n: {
            deps: ['jquery'],
            exports: 'i18n'
        },
        scrollTo: {
            deps: ['jquery']
        },
        slickgrid_core: {
            deps: ['jquery'],
            exports: 'slickgrid_core'
        },
        slickgrid: {
            deps: ['jquery_ui', 'slickgrid_core', 'jquery_event_drag'],
            exports: 'Slick'
        },
        slick_rowselect: {
            deps: ['slickgrid']
        },
        slick_checkbox: {
            deps: ['slickgrid']
        },
        moment:{
            exports: 'moment',
            init: function () {
                window.moment = this.moment;
                return this.moment;
            }
        },
        'moment-timezone':{
            deps: ['moment'],
            exports: 'moment-timezone'
        },
        semanticui:{
            deps: ['jquery']
        },
        semanticui_accordion: {
            deps: ['jquery']
        },
        semanticui_api: {
            deps: ['jquery']
        },
        semanticui_checkbox: {
            deps: ['jquery']
        },
        semanticui_dimmer: {
            deps: ['jquery']
        },
        semanticui_dropdown: {
            deps: ['jquery']
        },
        semanticui_form: {
            deps: ['jquery']
        },
        semanticui_nag: {
            deps: ['jquery']
        },
        semanticui_popup: {
            deps: ['jquery']
        },
        semanticui_progress: {
            deps: ['jquery']
        },
        semanticui_rating: {
            deps: ['jquery']
        },
        semanticui_search: {
            deps: ['jquery']
        },
        semanticui_dropdown2: {
            deps: ['jquery']
        },
        semanticui_shape: {
            deps: ['jquery']
        },
        semanticui_sidebar: {
            deps: ['jquery']
        },
        semanticui_site: {
            deps: ['jquery']
        },
        semanticui_state: {
            deps: ['jquery']
        },
        semanticui_tab: {
            deps: ['jquery']
        },
        semanticui_transition: {
            deps: ['jquery']
        },
        semanticui_video: {
            deps: ['jquery']
        },
        semanticui_visibility: {
            deps: ['jquery']
        },
        semanticui_modal:{
            deps: ['semanticui_transition','semanticui_dimmer'],
            exports: 'semanticui_modal'
        },
        jsonview:{
            deps: ['jquery']
        }
    }
});