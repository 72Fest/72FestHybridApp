
/*jslint browser: true*/
/*global angular, cordova */
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
    'ionic',
    'ngCordova',
    'starter.controllers',
    'services.photos',
    'services.teams',
    'services.constants',
    'services.news',
    'services.votes',
    'services.socketio',
    'services.sponsors',
    'services.pushNotifications',
    'ff.countdown'
])

.run(function ($ionicPlatform, $cordovaPushV5, $cordovaPreferences, pushNotifications, constants) {
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

        // define push notification options
        var pushOptions = {
            ios: {
                alert: 'true',
                badge: 'true',
                sound: 'true',
                clearBadge: 'true'
            },
            windows: {}
        };

        // initialize push notifications service
        $cordovaPushV5.initialize(pushOptions).then(function() {
            // start listening for new notifications
            $cordovaPushV5.onNotification();
            // start listening for errors
            $cordovaPushV5.onError();

            $cordovaPreferences.fetch(constants.PUSH_TOKEN, constants.PREF_DICT)
            .success(function(value) {
                if (!value) {
                    pushNotifications.registerDeviceToken();
                }
                console.log('TOKEN SET: ' + value);
            })
            .error(function(error) {
                console.log('Fetch Error: ' + error);
            });

        });
    });
})

.config(function ($stateProvider, $urlRouterProvider, $sceDelegateProvider, $ionicConfigProvider, $cordovaInAppBrowserProvider) {
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
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
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
    })

    .state('app.contact', {
        url: '/contact',
        views: {
            'menuContent': {
                templateUrl: 'templates/contact.html',
                controller: 'ContactCtrl'
            }
        }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');

    // whitelist certain URLs to be accessed within the app
    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        'http://api.phoshow.me:3000/**',
        'https://*.youtube.com/**',
        'http://*.youtube.com/**',
        'http://*.vimeo.com/**'
    ]);

    //disable showing the last title's text for the nav back button
    $ionicConfigProvider.backButton.previousTitleText(false);

    var defaultOptions = {
        location: 'yes',
        clearcache: 'no',
        toolbar: 'no'
    };

    document.addEventListener('deviceready', function () {
        $cordovaInAppBrowserProvider.setDefaultOptions(defaultOptions);
    }, false);
});
