/*global angular, console, Camera, moment, document */
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

.controller('HomeCtrl', function ($scope, $rootScope, $interval, news) {
    var timestampUpdateInterval = 45000;
    $scope.news = [];

    function getNews() {
        return news.getNews()
            .then(function (results) {
                $scope.news = results;
                return results;
            }, function (err) {
                console.log('err:', err);
                return err;
            });
    }

    function updateTimestamps() {
        $scope.news.forEach(function(curObj) {
            curObj.timeStr = moment(curObj.timestamp).fromNow();
        });
    }

    $interval(function () {
        updateTimestamps();
    }, timestampUpdateInterval);

    //when we return back to this view, update the news
    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name === 'app.home') {
            getNews();
        }
    });

    getNews();
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

.controller('PhotosCtrl', function ($scope, $timeout, photos, $cordovaCamera, $cordovaSocialSharing, $ionicLoading) {
    var options = {
        quality: 80,
        allowEdit: false,
        saveToPhotoAlbum: true,
        correctOrientation:true
    };

    var cachedPhotos = [];
    var photoLimit = 4;
    var photoLimitIdx = 0;

    function processTimestamp(tsStr) {
        var ts = moment(tsStr);
        return ts.fromNow();
    }

    function hasMorePhotos() {
        var startIdx = photoLimit * photoLimitIdx;
        return (startIdx <= cachedPhotos.length - 1) ? true : false;
    }

    function getNextPhotos() {
        if (hasMorePhotos()) {
            var startIdx = photoLimit * photoLimitIdx,
                vals = cachedPhotos.slice(startIdx, startIdx + photoLimit),
                genTimestamp = function (obj) {
                    obj.timeStr = processTimestamp(obj.timestamp);
                    return obj;
                };

            $scope.photos = $scope.photos.concat(vals).map(genTimestamp);
            photoLimitIdx += 1;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
    }

    function getPhotos() {
        return photos.getPhotos()
            .then(function (results) {
                cachedPhotos = results;
                return cachedPhotos.slice(0);
            }, function (err) {
                console.log('err:', err);
                return err;
            });
    }

    function capturePhoto(isUsingCamera) {
        document.addEventListener('deviceready', function () {
            options.destinationType = Camera.DestinationType.FILE_URI;
            options.saveToPhotoAlbum = isUsingCamera;
            //set source type to retrieve photo from camera
            options.sourceType =
                isUsingCamera ? Camera.PictureSourceType.CAMERA :
                    Camera.PictureSourceType.PHOTOLIBRARY;

            $cordovaCamera.getPicture(options).then(function(imageURI) {
                photos.uploadPhoto(imageURI)
                    .then(function (result) {
                        $scope.refreshPhotos();
                        $ionicLoading.hide().then(function(){
                            console.log('The loading indicator is now hidden');
                        });
                    }, function (err) {
                        console.error('Failed to upload photo!');
                        alert(err);
                        $ionicLoading.hide().then(function(){
                            console.log('The loading indicator is now hidden');
                        });
                    }, function (progress) {
                        var percentage = (progress.loaded/progress.total) * 100;

                        $timeout(function () {
                            $scope.uploadProgress = Math.round(percentage);
                        });

                        //TODO: update progress bar
                        console.log('percentage:' + percentage);
                    });

                $ionicLoading.show({
                    template: 'Uploading photo ...<br><ion-spinner ng-hide="uploadProgress === 100"></ion-spinner><br>{{uploadProgress}}%',
                    scope: $scope
                }).then(function(){
                    console.log('The loading indicator is now displayed');
                });

            }, function(err) {
              // error
            });
        }, false);
    }

    function sharePhoto(photoPath) {
        var message = '#72Fest',
            subject = 'Photo shared from 72Fest',
            file = photoPath;

        $cordovaSocialSharing
            .share(message, subject, file) // Share via native share sheet
            .then(function(result) {
                // Success!
            }, function(err) {
                // An error occured. Show a message to the user
            });
    }

    $scope.photos = [];
    $scope.columns = 4;

    $scope.takePhotoFromCamera = function () {
        capturePhoto(true);
    };

    $scope.takePhotoFromAlbum = function () {
        capturePhoto(false);
    };

    $scope.refreshPhotos = function () {
        getPhotos()
            .then(function () {
                //reset the photo index and grab latest photos
                photoLimitIdx = 0;
                $scope.photos = [];
                getNextPhotos();
            })
            .finally(function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
    };

    $scope.uploadProgress = 0;
    $scope.sharePhoto = sharePhoto;
    $scope.getNextPhotos = getNextPhotos;
    $scope.hasMorePhotos = hasMorePhotos;

    //load in photos
    getPhotos()
        .then(function (results) {
            getNextPhotos();
        });
})

.controller('CreditsCtrl', function ($scope, $sce, constants) {
    //pass in sponsors URL as a trustred resource
    $scope.sponsorsUrl = $sce.trustAsResourceUrl(constants.sponsorsUrl);
})

.controller('ContactCtrl', function ($scope, $sce, $ionicLoading, constants) {
    var frame = document.getElementById('contact-frame');

    frame.addEventListener('load', function (e) {
        $ionicLoading.hide();
    });
    $ionicLoading.show({
        template: 'Loading contact form...'
    });

    //pass in sponsors URL as a trustred resource
    $scope.contactUrl = $sce.trustAsResourceUrl(constants.contactUrl);
});
