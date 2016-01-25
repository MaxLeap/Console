var app_config = require('../config/app.json');
var server_config = require('../config/server.json');

if(process.argv[2] === '--dev'){
    app_config.livereload = '<script src="http\:\/\/localhost\:35728\/livereload.js?snipver=1"><\/script>';
}else{
    app_config.livereload ='';
}
module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('prelogin/login',app_config);
        // res.redirect('/dashboard');
    });

    app.get('/forgot', function (req, res) {
        res.render('prelogin/forgot',app_config);
    });

    app.get('/login', function (req, res) {
        res.render('prelogin/login',app_config);
        // res.send(200,"hhh");
    });
    app.get('/nopermission', function (req, res) {
        res.render('prelogin/nopermission',app_config);
    });
    app.get('/register', function (req, res) {
        res.render('prelogin/register',app_config);
    });
    app.get('/verifyemail', function (req, res) {
        res.render('prelogin/verifyemail',app_config);
    });
    app.get('/verify', function (req, res) {
        res.render('prelogin/verify',app_config);
    });
    app.get('/regnotify', function (req, res) {
        res.render('prelogin/regnotify',app_config);
    });
    app.get('/resetnotify', function (req, res) {
        res.render('prelogin/resetnotify',app_config);
    });
    app.get('/resetpassword', function (req, res) {
        res.render('prelogin/resetpassword',app_config);
    });

    app.get(/^\/(\w+)(\/)?(\/apps\/(\w+)(\/)?)?$/, function (req, res) {
        res.render(server_config['views_prefix'] + req.params[0], app_config);
    });
};