var gulp = require('gulp'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifyCSS = require('gulp-minify-css');

// uglify JS task
gulp.task('scripts', function(){
  gulp.src('js/src/*.js')
      .pipe(uglify())
      .pipe(rename('app.min.js'))
      .pipe(gulp.dest('js/'));
});

// minify CSS task
gulp.task('styles', function(){
  gulp.src('css/src/style.css')
      .pipe(minifyCSS())
      .pipe(rename('css/main.min.css'))
      .pipe(gulp.dest('./'));
});

//concat all min.css files task
gulp.task('concat', function(){
  gulp.src('css/*.min.css')
      .pipe(concat('style.css'))
      .pipe(gulp.dest('./css/'));
});

// watch task
gulp.task('watch', function(){
  gulp.watch('css/src/*.css', ['styles']);
  gulp.watch('js/src/*.js', ['scripts']);
});


gulp.task('default', ['scripts', 'styles', 'watch']);
