/*global angular, console */
(function () {

    angular.module('ff.countdown', ['services.countdown'])
    .directive('ffCountdown', function (countdown, $interval) {

        function formatTimeValue(val) {
            return (val < 10) ? "0" + val : val;
        }

        function startTimer(scope, endTime) {
            //calc the time left
            var t = endTime, //retrieve the end time
                timeLeft = {},
                endDate = new Date(t.year, t.month - 1, t.day, t.hour, t.minute, t.second),
                timeDiff,
                curSecs,
                endSecs = endDate.getTime() / 1000,
                secsInMin = 60,
                secsInHour = secsInMin * 60,
                secsInDay = secsInHour * 24;

            $interval(function () {
                var curDate = new Date();
                timeLeft = {};
                curSecs = curDate.getTime() / 1000;
                timeDiff = endSecs - curSecs;

                if (timeDiff <= 0) {
                    //Time has expired, zero everything out
                    timeLeft.day = "00";
                    timeLeft.hour = "00";
                    timeLeft.minute = "00";
                    timeLeft.second = "00";
                } else {
                    //there still is time left, caclulate the difference
                    timeLeft.day = formatTimeValue(Math.floor(timeDiff / secsInDay));
                    timeLeft.hour = formatTimeValue(Math.floor((timeDiff / secsInHour) % 24));
                    timeLeft.minute = formatTimeValue(Math.floor((timeDiff / secsInMin) % 60));
                    timeLeft.second = formatTimeValue(Math.floor(timeDiff % secsInMin));
                }

                //update the time to trigger the renderer in the view
                scope.remainingTime = timeLeft;
            }, 1000);
        }

        return {
            restrict: 'AE',
            templateUrl: 'templates/countdown.html',
            link: function (scope, element, attrs) {
                //set defaults
                scope.remainingTime = {
                    day: "--",
                    hour: "--",
                    minute: "--",
                    second: "--"
                };

                //retrieve remaining time
                countdown.getCountdown()
                    .then(function (result) {
                        scope.caption = result.caption;
                        startTimer(scope, result.time);
                    }, function (err) {
                        console.error('Major fail when trying to retrieve countdown:' + err);
                    });
            }
        };
    });
}());
