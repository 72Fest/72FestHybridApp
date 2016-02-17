
/*jslint browser: true*/
/*global angular, cordova */
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
    'ionic',
    'ion-gallery',
    'starter.controllers',
    'services.photos',
    'services.teams'
])

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            window.StatusBar.styleDefault();
        }
    });
})

.config(function ($stateProvider, $urlRouterProvider, $sceDelegateProvider) {
    $stateProvider

    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })

    .state('app.photos', {
        url: '/photos',
        views: {
            'menuContent': {
                templateUrl: 'templates/photos.html',
                controller: 'PhotosCtrl'
            }
        }
    })

    .state('app.home', {
            url: '/home',
            views: {
                'menuContent': {
                    templateUrl: 'templates/home.html'
                }
            }
        })
        .state('app.teams', {
            url: '/teams',
            views: {
                'menuContent': {
                    templateUrl: 'templates/teams.html',
                    controller: 'TeamsCtrl'
                }
            }
        })

    .state('app.single', {
        url: '/teams/:id',
        views: {
            'menuContent': {
                templateUrl: 'templates/team.html',
                controller: 'TeamCtrl'
            }
        }
    })

    .state('app.credits', {
        url: '/credits',
        views: {
            'menuContent': {
                templateUrl: 'templates/credits.html',
                controller: 'CreditsCtrl'
            }
        }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/teams');

    // whitelist certain URLs to be accessed within the app
    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        'https://*.youtube.com/**',
        'http://*.youtube.com/**',
        'http://*.vimeo.com/**'
    ]);
});
