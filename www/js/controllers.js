/*global angular, console */
angular.module('starter.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeLogin();
        }, 1000);
    };
})

.controller('TeamsCtrl', function ($scope, teams) {
    $scope.teams = [];

    teams.getTeams()
        .then(function (results) {
            $scope.teams = results;
        }, function (err) {
            console.log('err:', err);
        });
})

.controller('TeamCtrl', function ($scope, $stateParams, teams) {
    console.log('$stateParams:', $stateParams);
    $scope.team = {};

    teams.getTeam($stateParams.id)
        .then(function (results) {
            $scope.team = results;
            console.dir(results);
        }, function (err) {
            console.log('err:', err);
        });
})

.controller('PhotosCtrl', function ($scope, photos, $cordovaCamera) {
    var options = {
        quality: 80,
        allowEdit: false,
        saveToPhotoAlbum: true,
        correctOrientation:true
    };

    function getPhotos() {
        photos.getPhotos()
            .then(function (results) {
                $scope.photos = results;
            }, function (err) {
                console.log('err:', err);
            });
    }

    function capturePhoto(isUsingCamera) {
        document.addEventListener('deviceready', function () {
            options.destinationType = Camera.DestinationType.FILE_URI;
            //set source type to retrieve photo from camera
            options.sourceType =
                isUsingCamera ? Camera.PictureSourceType.CAMERA :
                    Camera.PictureSourceType.PHOTOLIBRARY;

            $cordovaCamera.getPicture(options).then(function(imageURI) {
                photos.uploadPhoto(imageURI)
                    .then(function (result) {
                        console.log(result);
                        getPhotos();
                    }, function (err) {
                        //TODO: report any errors
                        console.error(err);
                    }, function (progress) {
                        var percentage = (progress.loaded/progress.total) * 100;
                        //TODO: update progress bar
                        console.log('percentage:' + percentage);
                    });
            }, function(err) {
              // error
            });
        }, false);
    }

    $scope.photos = [];
    $scope.columns = 4;

    $scope.takePhotoFromCamera = function () {
        capturePhoto(true);
    };

    $scope.takePhotoFromAlbum = function () {
        capturePhoto(false);
    };

    //load in photos
    getPhotos();
})

.controller('CreditsCtrl', function ($scope) {

});
