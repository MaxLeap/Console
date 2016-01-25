module.exports = {
    copy:{
        src:'src/',
        dest_en:'public/',
        dest_zh:'public2/'
    },
    minifycss:{
        src:'./public/css/*.css',
        dest_en:'./public/css/',
        dest_zh:'./public2/css/'
    },
    template:{
        module_src:'./views/*.html',
        other_src:'./views/prelogin/*.html',
        dest_en:'./public',
        dest_zh:'./public2',
        data:{
            app_name: 'Console',
            livereload:'',
            timeNow:Date.now()
        }
    },
    clean:{
        en_dir:[
            '.tmp',
            'public/fonts',
            'public/images',
            'public/javascript',
            'public/stylesheets',
            'public/semanticui',
            'public/tinymce',
            'public/ZeroClipboard.swf',
            'public/*.html',
            'public/nginx'
        ],
        zh_dir:[
            '.tmp',
            'public2/fonts',
            'public2/images',
            'public2/javascript',
            'public2/stylesheets',
            'public2/semanticui',
            'public2/tinymce',
            'public2/ZeroClipboard.swf',
            'public2/*.html',
            'public2/nginx'
        ]
    },
    serve:{
        main:"app.js",
        supervisor:{
            args: ["--dev"],
            watch: ["app"],
            ignore: ["tasks", "src", "node_modules", "public", "views"],
            pollInterval: 500,
            extensions: ["js"],
            exec: "node",
            debug: true,
            debugBrk: false,
            harmony: true,
            noRestartOn: "exit",
            forceWatch: true,
            quiet: false
        },
        watch:[
            "./views/**/*.html",
            "./src/javascript/modules/**/*.js",
            "./src/javascript/modules/**/*.html",
            "./src/javascript/config.js",
            "./src/stylesheets/*.css"
        ]
    },
    browserSync:{
        watch:[
            "./views/**/*.html",
            "./src/javascript/modules/**/*.js",
            "./src/javascript/modules/**/*.html",
            "./src/javascript/config.js",
            "./src/stylesheets/*.css"
        ]
    },
    I18N:[{
        url:'http://10.10.10.126:5000/locales/en/',
        dist:'src/locales/dev'
    },{
        url:'http://10.10.10.126:5000/locales/en/',
        dist:'src/locales/en'
    },{
        url:'http://10.10.10.126:5000/locales/zh/',
        dist:'src/locales/zh'
    }]
};