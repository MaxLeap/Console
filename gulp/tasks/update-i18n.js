var gulp = require('gulp'),
    config = require("./../config"),
    download = require("download"),
    downs = config.I18N;
var exec = require('child_process').exec;
var runSequence = require('run-sequence');

gulp.task("updateI18N",function(done){
    var completeSign = 0;
    
    downs.map(function(item,index){
        var urlComFiles = item.url+"component.json";
        var urlPreFiles = item.url+"prelogin.json";
        var dist = item.dist;
        var downInstance = new download({mode: '755'});
        downInstance.get(urlComFiles).get(urlPreFiles).dest(dist).run(function(err){
            if(err){
                console.log(err);
            }else{
                console.log(""+item.url+" i18n files get");
            }
            completeSign++;
            //console.log(completeSign,index,downs.length);
            //不管更新失败与否，都执行下一步
            if(completeSign == downs.length){
                console.log('done updatei18n');
                done();
            }
        });
    });

});

gulp.task("updatePublicI18N",['updateI18N'], function (done) {
    exec('cp -R src/locales/  public/locales/ && cp -R src/locales/  public2/locales/', function (err) {
        if(err){
            console.log(err);
        }else{
            console.log("public && public2 i18n update ok");
        }
        done();
    });
});
