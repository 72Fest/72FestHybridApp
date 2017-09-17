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

.controller('HomeCtrl', function ($scope, $rootScope, $interval, $cordovaDialogs, news) {
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

    // triggered every time notification received
    $rootScope.$on('$cordovaPushV5:notificationReceived', function(event, data){
        $cordovaDialogs.alert(data.message, '72Fest Notification');
    });

    // triggered every time error occurs
    $rootScope.$on('$cordovaPushV5:errorOcurred', function(event, e){
        // e.message
        console.log('got push error', e.message);
    });

    //get latest news when app returns from the background
    document.addEventListener('resume', function () {
        getNews();
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

.controller('PhotosCtrl', function ($scope, $timeout, $q, photos, votes, socketio, $interval, $cordovaCamera, $cordovaSocialSharing, $ionicLoading, $cordovaPreferences) {
    var options = {
        quality: 80,
        allowEdit: false,
        saveToPhotoAlbum: true,
        correctOrientation:true
    };

    var cachedPhotos = [];
    var cachedVotes = {};
    var voteStates = {};
    var photoLimit = 4;
    var photoLimitIdx = 0;
    var PREF_VOTES_DICT_NAME = '72FestVotes';
    var isAvailableToFetch = true;

    function processTimestamp(tsStr) {
        var ts = moment(tsStr);
        return ts.fromNow();
    }

    function hasMorePhotos() {
        var startIdx = photoLimit * photoLimitIdx;
        return (startIdx <= cachedPhotos.length - 1) ? true : false;
    }

    function getNextPhotos() {
        if (hasMorePhotos() && isAvailableToFetch) {
            var startIdx = photoLimit * photoLimitIdx,
                vals = cachedPhotos.slice(startIdx, startIdx + photoLimit),
                mapAddtlData = function (obj) {
                    //compute string version of timestamp
                    obj.timeStr = processTimestamp(obj.timestamp);
                    //retrieve current number of votes
                    obj.votes = getVote(obj.id);
                    //get current state for vote
                    obj.isVoted = getVoteState(obj.id);
                    return obj;
                };

            isAvailableToFetch = false;
            //retrieve all vote states for new images before proceeding

            updateVoteStates(vals).finally(function () {
                $timeout(function () {
                    //append values and add additional data
                    $scope.photos = $scope.photos.concat(vals).map(mapAddtlData);
                    console.log('we got results and new length is:' + $scope.photos.length);
                    photoLimitIdx += 1;
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    //we got results, and are no longer pending
                    isAvailableToFetch = true;
                });
            });
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
        var message = '#72FilmFest',
            subject = 'A photo shared from 72 Film Fest',
            file = photoPath;

        $cordovaSocialSharing
            .share(message, subject, file) // Share via native share sheet
            .then(function(result) {
                // Success!
            }, function(err) {
                // An error occured. Show a message to the user
            });
    }

    function getVote(photoId) {
        return cachedVotes[photoId] || 0;
    }

    function getVoteState(photoId) {
        return voteStates[photoId] || false;
    }

    function updateVoteStates(curPhotos) {
        var checkDict = function (photoData) {
            return $cordovaPreferences.fetch(photoData.id, PREF_VOTES_DICT_NAME)
                .then(function (result) {
                    voteStates[photoData.id] = result || false;
                    return result;
                }, function (err) {
                    console.log('Error retrieving vote status: ' + err);
                    voteStates[photoData.id] = false;
                    return false;
                });
        };

        //loop through each photo and check the status
        return curPhotos.reduce(function (prevPromise, curObj) {
            return prevPromise.then(function (result) {
                return checkDict(curObj);
            });
        }, $q.when());
    }

    function getVotes() {
        return votes.getVotes()
            .then(function (results) {
                //cachedVotes
                results.forEach(function (curObj) {
                    cachedVotes[curObj.id] = curObj.votes;
                });
                return results.votes;
            }, function (err) {
                console.log(err);
                return err;
            });
    }

    function castVote(photoId, isYes) {
        votes.castVote(photoId, isYes)
            .then(function (result) {
                var idx;
                //the vote was a success, save the vote state
                voteStates[photoId] = isYes;
                $cordovaPreferences.store(photoId, isYes, PREF_VOTES_DICT_NAME);

                //update the value in the photos array
                for (idx = 0; idx < $scope.photos.length; idx++) {
                    if ($scope.photos[idx].id === photoId) {
                        $timeout(function () {
                            $scope.photos[idx].isVoted = isYes;
                        });
                        break;
                    }
                }
            }, function (err) {
                console.log('failed to retrieve vote results', err);
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
        getVotes()
            .then(getPhotos)
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

    socketio.socket.on('voteCast', function (voteData) {
        var idx,
            curObj,
            photoId = voteData.id,
            voteTotal = voteData.votes;

        //cache new vote total
        cachedVotes[photoId] = voteTotal;

        //check if photo is retrieved, if so, update value
        //and let data binding do the rest
        for (idx = 0; idx < $scope.photos.length; idx++) {
            curObj = $scope.photos[idx];
            if (curObj.id === photoId) {
                $timeout(function () {
                    curObj.votes = voteTotal;
                });
                break;
            }
        }
    });

    $scope.uploadProgress = 0;
    $scope.sharePhoto = sharePhoto;
    $scope.getNextPhotos = getNextPhotos;
    $scope.hasMorePhotos = hasMorePhotos;
    $scope.castVote = castVote;
    $scope.getVote = getVote;

    $interval(function () {
        var genTimestamp = function (obj) {
            obj.timeStr = processTimestamp(obj.timestamp);
            return obj;
        };

        $scope.photos = $scope.photos.map(genTimestamp);
    }, 45000);

    document.addEventListener('resume', function () {
        $scope.refreshPhotos();
    });

    //get current votes then load in photos
    getVotes()
        .then(getPhotos)
        .then(function (results) {
            getNextPhotos();
        });
})

.controller('CreditsCtrl', function ($scope, sponsors) {
    //pass in sponsors URL as a trustred resource
    sponsors.getSponsors()
        .then(function (results) {
            $scope.sponsors = results;
        });

    $scope.openUrl = function (url) {
        window.open(url, '_system');
    };
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
