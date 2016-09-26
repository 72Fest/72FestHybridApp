/*global angular, moment, markdown, io */
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
                            id: val.id,
                            src: baseUrl + '/' + val.photoUrl,
                            thumb: baseUrl + '/' + val.thumbUrl,
                            timestamp: val.timestamp,
                            isFilmHour: val.isFilmHour || false,
                            filmHour: val.filmHour || ''
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
.factory('news', function ($http, $q, $sce) {

    function updateMarkdownLinks(nodes) {
        var nodeType = nodes[0],
            nodeData;

        if (nodeType === 'link') {
            nodeData = nodes[1];
            //if we found a link node, add an onclick to
            //open the system browser
            nodeData.class = 'ex-link';
            nodeData['onclick'] = 'window.open(\'' + nodeData.href +  '\', \'_system\', \'location=yes\')';
            nodeData.href = '';
        } else {
            nodes.forEach(function (curNode) {
                if (Array.isArray(curNode)) {
                    updateMarkdownLinks(curNode);
                }
            });
        }

        return nodes;
    }

    function getNews() {
        var deferred = $q.defer();
        $http.jsonp(baseEndpoint + '/news?callback=JSON_CALLBACK')
            .then(function (response) {
                var results = response.data.message;
                if (response.data.isSuccess) {
                    deferred.resolve(results.map(function (curVal) {
                        //create a json map of the markdown
                        var tree = markdown.parse(curVal.content);
                        //we need to update all links to include
                        //some javascript that will open links
                        //into a new window
                        tree = updateMarkdownLinks(tree);

                        //render the object map to HTML now that
                        //we updated all the links
                        curVal.content = $sce.trustAsHtml(markdown.renderJsonML(markdown.toHTMLTree(tree)));

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

angular.module('services.votes', [])
.factory('votes', function ($http, $q, $httpParamSerializer) {
    function getVote(voteId) {
        var deferred = $q.defer();
        $http.jsonp(baseEndpoint + '/votes/' + voteId + '?callback=JSON_CALLBACK')
            .then(function (response) {
                var results = response.data.message;
                if (response.data.isSuccess) {
                    deferred.resolve(results);
                } else {
                    deferred.reject('Error in votesrequest');
                }
            }, function (err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }

    function getVotes() {
        var deferred = $q.defer();
        $http.jsonp(baseEndpoint + '/votes?callback=JSON_CALLBACK')
            .then(function (response) {
                var results = response.data.message;
                if (response.data.isSuccess) {
                    deferred.resolve(results);
                } else {
                    deferred.reject('Error in votesrequest');
                }
            }, function (err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }

    function castVote(photoId, isYes) {
        var deferred = $q.defer(),
            postData = {
                id: photoId,
                unlike: !isYes
            };

        $http.post(baseEndpoint + '/vote', postData)
            .then(function (response) {
                var results = response.data.message;
                if (response.data.isSuccess) {
                    deferred.resolve(results);
                } else {
                    deferred.reject('Error in votesrequest');
                }
            }, function (err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }

    return {
        getVote: getVote,
        getVotes: getVotes,
        castVote: castVote
    };
});

angular.module('services.socketio', [])
.factory('socketio', function ($http, $q) {
    var socket;

    if (window.io) {
        socket = io.connect(topLevelUrl);
    } else {
        //just in case we cannot connect we shouldn't fail
        //we'll pass a dummy object along
        console.warn('Could not connect to socket.io host');
        socket = {
            on: function () {
                //does nothing
            }
        };
    }

    return {
        socket: socket
    };
});

angular.module('services.sponsors', [])
.factory('sponsors', function ($http, $q) {
    function getSponsors() {
        var deferred = $q.defer();
        $http.jsonp(baseEndpoint + '/sponsors?callback=JSON_CALLBACK')
            .then(function (response) {
                var results = response.data.message;
                if (response.data.isSuccess) {
                    //append base URL for all images
                    deferred.resolve(results.map(function (curSponsor) {
                        curSponsor.src = topLevelUrl + '/' + curSponsor.src;
                        return curSponsor;
                    }));
                } else {
                    deferred.reject('Error in sponsors request');
                }
            }, function (err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }

    return {
        getSponsors: getSponsors
    };
});

angular.module('services.notifications', [])
.factory('notifications', function ($cordovaLocalNotification, socketio) {
    var curNotificationIdx = 1;

    function scheduleNotification(title, text) {
        document.addEventListener('deviceready', function () {
            $cordovaLocalNotification.schedule({
                id: curNotificationIdx++,
                title: title,
                text: text,
                data: {
                    customProperty: 'custom value'
                }
            }).then(function (result) {
                console.log('YES:' + result);
            });
        }, false);
    }

    function registerPermission() {
        document.addEventListener('deviceready', function () {
            $cordovaLocalNotification.registerPermission();
            // $scope.scheduleNotification = function () {
            //     $cordovaLocalNotification.schedule({
            //         id: 1,
            //         title: 'Title here',
            //         text: 'Text here',
            //         data: {
            //             customProperty: 'custom value'
            //         }
            //     }).then(function (result) {
            //         console.log('YES:' + result);
            //     });
            // };

            // setTimeout(function () {
            //     $scope.scheduleNotification();
            // }, 5000);
        }, false);
    }

    console.log('going to try and listen');

    socketio.socket.on('photoUploaded', function (photoData) {
        var photo = photoData.photo;
        console.log(photo);
        scheduleNotification('Photo Notification', 'A new photo was just added to the 72Fest gallery');
    });

    document.addEventListener('deviceready', function () {
    }, false);

    return {
        registerPermission: registerPermission
    };
});

angular.module('services.constants', [])
.factory('constants', function ($http, $q) {
    return {
        sponsorsUrl: topLevelUrl + '/sponsors.html',
        contactUrl: 'http://www.72fest.com/about/contact/ '
    };
});
