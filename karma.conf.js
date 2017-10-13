module.exports = function (config) {
    config.set({
        basePath : './',
        files : ["node_modules/angular/angular.js", "node_modules/angular-mocks/angular-mocks.js", "app/js/*.js",
                "test/**/*.js"],
        preprocessors: {
            'app/js/*.js': [ 'webpack' ]
        },
        singleRun : true,
        frameworks : ['mocha', 'chai'],
        browsers : ['Firefox'],
        plugins : ['karma-mocha', 'karma-firefox-launcher', 'karma-chai', 'karma-webpack']
    });
};