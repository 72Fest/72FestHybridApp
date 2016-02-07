/*global angular */
var photos = angular.module('services.photos', []),
    baseEndpoint = 'http://api.phoshow.me:3000/api';


photos.factory('photos', function ($http, $q) {
    var deferred = $q.defer();

    function getPhotos() {
        $http.jsonp(baseEndpoint + '/photos?callback=JSON_CALLBACK')
            .then(function (response) {
                var isSuccess = response.data.isSuccess,
                    baseUrl,
                    photoData;

                if (isSuccess) {
                    baseUrl = response.data.message.metadata.baseUrl;
                    photoData = response.data.message.photos;
                    deferred.resolve({
                        url: baseUrl,
                        data: photoData
                    });
                } else {
                    deferred.reject('Error in request');
                }
            }, function (err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }

    return {
        getPhotos: getPhotos
    };
});
