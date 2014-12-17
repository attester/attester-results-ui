module.exports = function (config) {
    config.set({
        basePath : './',
        files : ["node_modules/angular/angular.js", "node_modules/angular-mocks/angular-mocks.js", "app/js/*.js",
                "test/**/*.js"],
        singleRun : true,
        frameworks : ['mocha', 'chai'],
        browsers : ['Firefox'],
        plugins : ['karma-mocha', 'karma-firefox-launcher', 'karma-chai']
    });
};