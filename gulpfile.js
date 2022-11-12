// Все переменные, в ковычках-пакеты которые подключены
const { src, dest, series, watch} = require('gulp');/*команды плагина галп*/
const concat = require('gulp-concat'); /*конкатенация(слияние) файлов*/
const htmlMin = require('gulp-htmlmin');/*минификатор HTML*/
const autoprefixer = require('gulp-autoprefixer');/*автопрефиксер, вставка префиксов там где нужно для работы в старых браузерах*/
const cleanCss = require('gulp-clean-css');/*слияние и минификация CSS*/
const svgSprite = require('gulp-svg-sprite');/*создание спрайтов*/
// const image = require('gulp-image');/*обработка изображений*/
const babel = require('gulp-babel');/*конвертация JS  в старые версии русскоязычная документация https://only-to-top.ru/blog/tools/2019-10-20-gulp-babel.html*/
const terser = require('gulp-terser');/*современная минификация и оптимизация JS*/
const notify = require('gulp-notify');/*выводит ошибки при сборке Gulp*/
const sourcemaps = require('gulp-sourcemaps');/*карта зависимосттей для возможности посмотреть источник в котором записаа строка*/
const del = require('del');/*удаление файлов*/
const browserSync = require('browser-sync').create();/*плагин для запуска лайфсервера*/
const rev = require('gulp-rev')
const revCollector = require('gulp-rev-collector')
const rename = require('gulp-rename')
const versionNumber = require("gulp-version-number");


// ТАСКИ ДЛЯ GULP

// Удаление папки разработки и продакшена перед компиляцией
const clean = () => {
    return del(['cwcbox','prod'])
}

const cleanRev = () => {
  return del(['cwcbox/rev/assets/'])
}
// ТАСКИ ДЛЯ РАБОЧЕЙ ПАПКИ

// перенос ресурсов в рабочую папку
const resourses = () => {
    return src('src/resourses/**')
    .pipe(dest('cwcbox/resourses'))
}
// перенос шрифтов в рабочую папку
const fonts = () => {
  return src('src/fonts/**')
  .pipe(dest('cwcbox/fonts'))
}
// перенос HTML в разработку
const htmlDist = () => {
  return src('src/index.html')
  .pipe(versionNumber({
    'value': '%DT%',
    'output': {
      'file': 'cwcbox/version.json'
    }
  }))
  .pipe(dest('cwcbox/'))
  .pipe(browserSync.stream()) /*отслеживание*/
}

// перенос HTA в разработку
const htaDist = () => {
  return src(['src/**/*.hta', 'src/**/*.php'])
  .pipe(dest('cwcbox'))
  .pipe(browserSync.stream()) /*отслеживание*/
}
// компиляция стилей CSS
const styles = () => {
  return src('src/css/**/*.css')
  .pipe(autoprefixer(
    { cascade: false,
      grid: 'autoplace',}
      ))
      .pipe(dest('cwcbox/css'))
      .pipe(browserSync.stream()) /*отслеживание*/
    }

    // компиляция JS в папку разработки
    const scripts = () => {
      return src([
        'src/js/**/*.js'
      ])
      .pipe(babel({
        presets: ["@babel/preset-env"],
  }))
  .pipe(dest('cwcbox/js'))
  .pipe(browserSync.stream()) /*отслеживание*/
}

const fileRev = () => {
  return src(['cwcbox/css/*.css', 'cwcbox/js/*.js', 'cwcbox/*.html', 'cwcbox/*.hta','cwcbox/*.ico', 'cwcbox/*.php'])
  .pipe(rev())
  .pipe(dest('cwcbox/rev/assets/'))
  .pipe(rev.manifest())
  .pipe(dest('cwcbox/rev/'))
}

// таск лайфсервера
const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: 'cwcbox'
    }
  })
}
// перенос дополнительных ресурсов в рабочую папку
const software = () => {
  return src('src/software/**')
  .pipe(dest('cwcbox'))
}
// ОТСЛЕЖИВАНИЕ
watch('src/resourses/**', resourses);
watch('src/**/*.html', htmlDist);
watch('src/**/*.hta', htaDist);
watch('src/**/*.php', htaDist);
watch('src/css/**/*.css', styles);
watch('src/js/**/*.js', scripts);

// ТАСКИ ДЛЯ ПЕРЕНОСА В ПАПКУ ГОТОВОГО ПРОЕКТА

const storage = () => {
  return src('src/storage/**')
  .pipe(dest('cwcbox/storage'))
}
const tokens = () => {
  return src('src/tokens/**')
  .pipe(dest('cwcbox/tokens'))
}
// ОБЩАЯ КОМАНДА ДЛЯ ЗАПУСКА GULP
exports.default = series(clean, storage, tokens, resourses, fonts, htaDist, styles, scripts, htmlDist, fileRev, cleanRev, software, watchFiles)