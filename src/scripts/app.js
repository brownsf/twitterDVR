'use strict';

// declare modules
angular.module('Authentication', []);
angular.module('Home', []);

angular.module('BasicHttpAuthExample', [
    'Authentication',
    'Home',
    'ngRoute',
    'ngCookies',
    'ui.bootstrap.datepicker', 'ui.bootstrap.tpls'
]).controller('header', function ($scope, $http, $location, $window, userService) {
    $scope.token = $window.sessionStorage.token;
    var tokenTwt = userService.getToken();
    $scope.formData = {}
    // reset login status
    $scope.login = function () {

        var responsePromise =
            $http({
                method: 'POST',
                url: '/authenticate',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: $.param({
                    username: $scope.formData.username,
                    password: $scope.formData.password
                })
            })

        responsePromise.success(function (response) {
            $scope.token = response.token;
            $window.sessionStorage.setItem('token', response.token);
            userService.addId(response.data._id);


            $location.path("/");
        });


    };

    var loc = $location.path();

    if (tokenTwt == null) {

        var twitterAccess = $http.get('/api/getOneUser');
        twitterAccess.success(function (data) {
            console.log(data);
            userService.addToken(data.data.token);
        });

    }
    $scope.template = {name: 'template1.html', url: 'templates/login.html'};
})
    .controller('LoginController',
    function ($scope, $http, $location, $window, userService) {

        $scope.template = {name: 'template1.html', url: 'templates/login.html'};


    })
    .controller('HomeController',
    function ($scope, $http, userService) {

        var token = window.sessionStorage.token;

        $scope.user_id = userService.getId();

        if (token.length <= 0) {

        }
        $scope.following = [];
        $scope.ids = [];
        var followerApi = $http.get('/api/twitter_followers');
        console.log('test');
        followerApi.success(function (data) {
            $scope.following = data.users;
            $scope.cursor = data.next_cursor;
        });
        $scope.user_sub = function () {
            console.log($scope.ids);
        }
        $scope.moreFollowing = function () {

            var moreFollowerApi = $http.get('/api/twitter_followers/' + $scope.cursor);
            moreFollowerApi.success(function (data) {
                console.log(data);
                $scope.following.pop();
                $scope.following = $scope.following.concat(data.users);
                $scope.cursor = data.next_cursor;
            });
        }

        $scope.setFollow = function () {
            console.log($scope.ids);
            var setFollow = $http.post('/api/twitter_followers', $.param({
                ids: $scope.ids,
                start: $scope.startTime,
                end: $scope.endTime
            }));

        }

    })
    .config(['$routeProvider', function ($routeProvider) {

        $routeProvider
            .when('/login', {
                controller: 'LoginController',
                templateUrl: 'modules/authentication/views/login.html',
                hideMenus: true
            })

            .when('/', {
                controller: 'HomeController',
                templateUrl: 'modules/home/views/pick_users.html'
            })

            .otherwise({redirectTo: '/login'});
    }])
    .service('userService', function () {
        var user = {};


        var addId = function (u_id) {
            user.user_id = u_id;
        }

        var getId = function () {
            return user.user_id;
        }

        var addToken = function (token) {
            user.token = token;
        }

        var getToken = function () {
            return user.token;
        }

        return {
            addId: addId,
            getId: getId,
            addToken: addToken,
            getToken: getToken
        };


    })
    .factory('authInterceptor', function ($rootScope, $q, $window) {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                if ($window.sessionStorage.token) {
                    config.headers = {
                        'x-access-token': $window.sessionStorage.token,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                }
                return config;
            },
            response: function (response) {
                if (response.status === 401) {
                    // handle the case where the user is not authenticated
                }
                return response || $q.when(response);
            }
        };
    })
    .directive('calendar', function () {
        return {
            require: 'ngModel',
            link: function (scope, el, attr, ngModel) {
                $(el).datepicker({
                    dateFormat: 'yy-mm-dd',
                    onSelect: function (dateText) {
                        scope.$apply(function () {
                            ngModel.$setViewValue(dateText);
                        });
                    }
                });
            }
        };
    })
    .run(function ($rootScope, $location, $window, userService) {
        // register listener to watch route changes
        $rootScope.$on("$routeChangeStart", function (event, next, current) {

            var token = $window.sessionStorage.token;
            if (token == null) {
                // no logged user, we should be going to #login
                $location.path("/login");
            }
            var twtToken = userService.getToken();
            if (twtToken == null) {

                //$location.path("/twitter");
            }

        })
    })
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    });