/*global angular, moment, markdown */
var topLevelUrl =  'http://api.phoshow.me:3000';
var baseEndpoint = topLevelUrl + '/api';

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
                            thumb: baseUrl + '/' + val.thumbUrl,
                            timestamp: val.timestamp
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
                    deferred.reject(err);
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
                var results = response.data.message;
                if (response.data.isSuccess) {
                    //add reference to thumbnail
                    deferred.resolve(results.map(function (curVal) {
                        curVal.logo_thumb = curVal.logo.replace(/\.([a-z]{3})$/, '-thumb.$1');
                        return curVal;
                    }));
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
    }

    return {
        getCountdown: getCountdown
    };
});

angular.module('services.news', [])
.factory('news', function ($http, $q) {

    function getNews() {
        var deferred = $q.defer();
        $http.jsonp(baseEndpoint + '/news?callback=JSON_CALLBACK')
            .then(function (response) {
                var results = response.data.message;
                if (response.data.isSuccess) {
                    deferred.resolve(results.map(function (curVal) {
                        //render the content to markdown
                        curVal.content = markdown.toHTML(curVal.content);
                        //produce a human-friendly date output
                        curVal.timeStr = moment(curVal.timestamp).fromNow();
                        return curVal;
                    }));
                } else {
                    deferred.reject('Error in request');
                }
            }, function (err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }

    return {
        getNews: getNews
    };
});

angular.module('services.constants', [])
.factory('constants', function ($http, $q) {
    return {
        sponsorsUrl: topLevelUrl + '/sponsors.html',
        contactUrl: 'http://www.72fest.com/about/contact/ '
    };
});
