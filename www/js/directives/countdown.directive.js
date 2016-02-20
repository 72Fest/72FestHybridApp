/*global angular, console */
(function () {
    angular.module('ff.countdown', ['services.countdown'])
    .directive('ffCountdown', function (countdown) {
        return {
            restrict: 'AE',
            templateUrl: 'templates/countdown.html',
            link: function (scope, element, attrs) {
                scope.caption = "Test";
                scope.remainingTime = {
                    day: "--",
                    hour: "--",
                    minute: "--",
                    second: "--"
                };

                countdown.getCountdown()
                    .then(function (result) {
                        scope.remainingTime = result.time;
                    }, function (err) {
                        console.error('Major fail when trying to retrieve countdown:' + err);
                    });
            }
        };
    });
}());
//
//    var formatTimeValue = function (val) {
//        return (val < 10) ? "0" + val : val;
//    };
//
///*jslint nomen: true */
///*global define, _*/
//
//define([
//    'underscore',
//    'backbone',
//    'util/ConfigManager'
//], function (_, Backbone, ConfigManager) {
//    'use strict';
//
//    var formatTimeValue,
//        CountdownModel;
//
//
//    CountdownModel = Backbone.Model.extend({
//
//        //TODO: add a config var for this
//        url: function () {
//            return ConfigManager.baseAPIURL + "/countDown?callback=?";
//        },
//
//        initialize: function () {
//            var that = this;
//
//            //Attempt to retreive countdown data from the endpoint
//            this.fetch({
//                success: function (m) {
//                    //the REST call was successful so start the timer
//                    that.startTimer(that);
//                },
//                error: function () {
//                    var timeLeft = {};
//                    console.log("Failed to fetch countdown data. The end point is not reachable!");
//
//                    //update model's caption
//                    that.set({caption: "72 Fest Unreachable"});
//                }
//            });
//        },
//
//        defaults: {
//            caption: "Loading ...",
//            time: "",
//            remainingTime:  {
//                day: "--",
//                hour: "--",
//                minute: "--",
//                second: "--"
//            }
//        },
//
//        validate: function (attrs, options) {
//        },
//
//        parse: function (response, options) {
//            return response;
//        },
//
//        startTimer: function (model) {
//            //calc the time left
//
//            var t = model.get("time"), //retrieve the end time
//                timeLeft = {},
//                endDate = new Date(t.year, t.month - 1, t.day, t.hour, t.minute, t.second),
//                timeDiff,
//                curSecs,
//                endSecs = endDate.getTime() / 1000,
//                secsInMin = 60,
//                secsInHour = secsInMin * 60,
//                secsInDay = secsInHour * 24;
//
//            setInterval(function () {
//                var curDate = new Date();
//                timeLeft = {};
//                curSecs = curDate.getTime() / 1000;
//                timeDiff = endSecs - curSecs;
//
//                if (timeDiff <= 0) {
//                    //Time has expired, zero everything out
//                    timeLeft.day = "00";
//                    timeLeft.hour = "00";
//                    timeLeft.minute = "00";
//                    timeLeft.second = "00";
//                } else {
//                    //there still is time left, caclulate the difference
//                    timeLeft.day = formatTimeValue(Math.floor(timeDiff / secsInDay));
//                    timeLeft.hour = formatTimeValue(Math.floor((timeDiff / secsInHour) % 24));
//                    timeLeft.minute = formatTimeValue(Math.floor((timeDiff / secsInMin) % 60));
//                    timeLeft.second = formatTimeValue(Math.floor(timeDiff % secsInMin));
//                }
//
//                //update the time to trigger the renderer in the view
//                model.set({remainingTime: timeLeft});
//            }, 1000);
//        }
//    });
//
//
//    return CountdownModel;
//});
