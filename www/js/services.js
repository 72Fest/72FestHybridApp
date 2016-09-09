/*global angular */
var baseEndpoint = 'http://api.phoshow.me:3000/api';

angular.module('services.photos', [])
.factory('photos', function ($http, $q, $cordovaFileTransfer) {

    function getPhotos() {
        var deferred = $q.defer();
        $http.jsonp(baseEndpoint + '/photos?callback=JSON_CALLBACK')
            .then(function (response) {
                var isSuccess = response.data.isSuccess,
                    baseUrl,
                    photoData,
                    results;

                if (isSuccess) {
                    baseUrl = response.data.message.metadata.baseUrl;
                    photoData = response.data.message.photos;
                    results = photoData.map(function (val) {
                        return {
                            src: baseUrl + '/' + val.photoUrl,
                            thumb: baseUrl + '/' + val.thumbUrl
                        };
                    });

                    deferred.resolve(results);
                } else {
                    deferred.reject('Error in request');
                }
            }, function (err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }

    function uploadPhoto(filePath) {
        var deferred = $q.defer(),
            uploadURL = baseEndpoint + '/upload?callback=JSON_CALLBACK',
            options = {};

        document.addEventListener('deviceready', function () {
            $cordovaFileTransfer.upload(uploadURL, filePath, options)
                .then(function (result) {
                    deferred.resolve(result);
                }, function (err) {
                    deferred.reject(result);
                }, function (progress) {
                    deferred.notify(progress);
                });
        }, false);

        return deferred.promise;
    }

    return {
        getPhotos: getPhotos,
        uploadPhoto: uploadPhoto
    };
});

angular.module('services.teams', [])
.factory('teams', function ($http, $q) {

    function getTeams() {
        var deferred = $q.defer();
        $http.jsonp(baseEndpoint + '/teams?callback=JSON_CALLBACK')
            .then(function (response) {
                if (response.data.isSuccess) {
                    deferred.resolve(response.data.message);
                } else {
                    deferred.reject('Error in request');
                }
            }, function (err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }

    function getTeam(teamId) {
        var deferred = $q.defer();
        $http.jsonp(baseEndpoint + '/teams/' +
                    teamId + '?callback=JSON_CALLBACK')
            .then(function (response) {
                if (response.data.isSuccess) {
                    deferred.resolve(response.data.message);
                } else {
                    deferred.reject('Error in request');
                }
            }, function (err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }

    return {
        getTeam: getTeam,
        getTeams: getTeams
    };
});

angular.module('services.countdown', [])
.factory('countdown', function ($http, $q) {
    function getCountdown() {
        var deferred = $q.defer();
        $http.jsonp(baseEndpoint + '/countDown?callback=JSON_CALLBACK')
            .then(function (response) {
                if (response.data.isSuccess) {
                    console.dir(response.data.message);
                    //var dummyMessage = {"isSuccess":true,"message":{"caption":"72 Film Fest","time":{"year":2016,"month":10,"day":10,"hour":19,"minute":0,"second":0}}};

                    //deferred.resolve(dummyMessage.message);
                    deferred.resolve(response.data.message);
                } else {
                    deferred.reject('Error in request');
                }
            }, function (err) {
                deferred.reject(err);
            });

        return deferred.promise;
    };

    return {
        getCountdown: getCountdown
    };
});
