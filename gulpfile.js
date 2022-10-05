const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const del = require('del');
const merge = require('merge-stream');
const through = require('through2');
const config = require('./gulpconfig');

// ----------------------------------------------
// Options
// ----------------------------------------------

const options = {
    clean: {
        dir: [
            config.remoteAssetsPath + '/css/**',
            config.remoteAssetsPath + '/js/**'
        ],
    },

    // ##################### STYLES

    styles: {
        src: config.srcPath + '/scss/*.scss',
        watch: config.srcPath + '/scss/**/*.scss',
        sass: { includePaths: ['node_modules'] },
        postcss: [
            autoprefixer({ cascade: false }),
            cssnano({ preset: ['default', { discardComments: { removeAll: true } }] }),
        ],
        dest: config.remoteAssetsPath + '/css',
    },

    // ##################### SCRIPTS

    scripts: [
        {
            src: [
                'node_modules/swiper/swiper-bundle.min.js',
                // 'node_modules/webfontloader/webfontloader.js',
                // 'node_modules/fg-loadcss/dist/loadCSS.js',
                config.srcPath + '/js/main/*.js',
            ],
            concat: 'homepage-dev.js',
            dest: config.remoteAssetsPath + '/js',
        },

        {
            src: config.srcPath + '/js/pages/*.js',
            babel: { presets: ['@babel/preset-env'] },
            dest: config.remoteAssetsPath + '/js',
        },

        {
            src: config.srcPath + '/js/lib/*.js',
            dest: config.remoteAssetsPath + '/js',
        },
    ],

    // ##################### FONTS

    fonts: {
        src: 'node_modules/@fortawesome/fontawesome-free/webfonts/*.{eot,svg,ttf,woff,woff2}',
        dest: config.remoteAssetsPath + '/fonts',
    }
};

// ----------------------------------------------
// Helpers
// ----------------------------------------------

function $if( condition, callback ) {
    return condition ? callback() : through.obj();
}

// ----------------------------------------------
// Clean
// ----------------------------------------------

const clean = () => del( options.clean.dir );

// ----------------------------------------------
// Fonts
// ----------------------------------------------

function fonts() {
    return gulp
        .src( options.fonts.src )
        .pipe( gulp.dest( options.fonts.dest ) );
}

// ----------------------------------------------
// Debug
// ----------------------------------------------

function debugStyles() {
    return gulp
        .src( options.styles.src, { sourcemaps: true })
        .pipe( sass( options.styles.sass ))
        .pipe( postcss( options.styles.postcss ))
        .pipe( gulp.dest( options.styles.dest, { sourcemaps: true } ) );
}

function debugScripts() {
    return merge(
        options.scripts.map(( script ) => {
            return gulp
                .src( script.src, { sourcemaps: true })
                .pipe( $if( script.babel, () => babel( script.babel ) ) )
                .pipe( $if( script.concat, () => concat( script.concat ) ) )
                .pipe( gulp.dest( script.dest, { sourcemaps: true } ) );
        })
    );
}

const debug = gulp.series( clean, gulp.parallel( debugStyles, debugScripts, fonts ) );

// ----------------------------------------------
// Release
// ----------------------------------------------

function releaseStyles() {
    return gulp
        .src( options.styles.src )
        .pipe( sass( options.styles.sass ) )
        .pipe( postcss( options.styles.postcss ) )
        .pipe( gulp.dest( options.styles.dest ) );
}

function releaseScripts() {
    return merge(
        options.scripts.map(( script ) => {
            return gulp
                .src( script.src )
                .pipe( $if( script.babel, () => babel( script.babel ) ) )
                .pipe( $if( script.concat, () => concat( script.concat ) ) )
                .pipe( uglify() )
                .pipe( gulp.dest( script.dest ) );
        })
    );
}

const release = gulp.series( clean, gulp.parallel( releaseStyles, releaseScripts, fonts ) );

// ----------------------------------------------
// Watch
// ----------------------------------------------

function debugWatch() {
    gulp.watch( options.styles.watch, debugStyles );
    options.scripts.forEach( ( script ) => gulp.watch( script.src, debugScripts ) );
}

function releaseWatch() {
    gulp.watch(options.styles.watch, releaseStyles);
    options.scripts.forEach( ( script ) => gulp.watch( script.src, releaseScripts ) );
}

// ----------------------------------------------
// Tasks
// ----------------------------------------------

exports.debug = debug;
exports.release = release;
exports.debugWatch = debugWatch;
exports.releaseWatch = releaseWatch;
exports.watch = releaseWatch;
exports.default = release;
exports.styles = releaseStyles;
exports.scripts = releaseScripts;
exports.fonts = fonts;
