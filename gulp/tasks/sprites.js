var gulp = require('gulp');
var gulpif = require('gulp-if');
try{
    var sprite = require('css-sprite').stream;
    gulp.task('sprites', function () {
        function singleSprite(flag, ratio){
            gulp.src(['src/images/sicons'+flag+'/*.png'])
                .pipe(sprite({
                    name: 'sprite'+flag,
                    style: '_sprite'+flag+'.scss',
                    cssPath: '/images/',
                    processor: 'scss',
                    margin: 5 * ratio,
                    orientation: 'binary-tree',
                    prefix: 'sicon'
                }))
                .pipe(gulpif('*.png', gulp.dest('src/images'), gulp.dest('src/scss/')))
        }
        singleSprite('', 1);
    });
}catch(e){}
