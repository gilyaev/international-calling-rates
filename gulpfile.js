var gulp = require('gulp'),
   uglify = require('gulp-uglify'),
   concat = require('gulp-concat'),
   minify = require('gulp-minify-css'),
   rename = require('gulp-rename');

gulp.task('js', function() {
  return gulp.src(['js/bike.js', 'js/app.js'])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./build'))
    .pipe(rename('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./build'));
});

gulp.task('css', function () {
    gulp.src('css/*.css')
        .pipe(minify({keepBreaks: true}))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./build'))
    ;
});

gulp.task('default', ['js', 'css'], function(){});