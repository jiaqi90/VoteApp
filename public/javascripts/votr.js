var app = angular.module('votr', ['ngResource', 'ngRoute']);

app.config(function($routeProvider) {
  $routeProvider
    .when('/', {templateUrl: 'event-list.html', controller: 'EventListCtrl'})
    .when('/login', {templateUrl: 'login.html', controller: 'LoginCtrl'})
    .when('/logout', {templateUrl: 'login.html', controller: 'LogoutCtrl'})
    .otherwise({redirectTo: '/'}); 
});

app.config(function($httpProvider) {
  $httpProvider.interceptors.push(function($rootScope, $location, $q) {
    return {
      'request': function(request) {
        //redirect to login page if not logged in
        $rootScope.loggedIn = $rootScope.loggedIn || $rootScope.username;
        if (!$rootScope.loggedIn && $location.path() != '/login') {
          $location.path('/login');        
        }
        return request;
      },
      'responseError': function(rejection) {
        //not logged-in to the web service, redirect to login page
        if (rejection.status === 401 && $location.path() != '/login') {
          console.log('not logged in to web services');
          $rootScope.loggedIn = false;
          $location.path('/login');
        }
        return $q.reject(rejection);          
      }
    };
  });
});  

app.factory('EventService', function($resource) {
  return $resource('/api/events/:id');
});

app.factory('SessionService', function($resource) {
  return $resource('/api/sessions');
});  

app.controller('LoginCtrl', function($scope, $rootScope, $location, SessionService) {
  $scope.user = {username: '', password: ''};
  
  $scope.login = function() {
    $scope.user = SessionService.save($scope.user, function(success) {
      $rootScope.loggedIn = true;
      $location.path('/');
    }, function(error) {
      $scope.loginError = true;
    });
  };
});

app.controller('LogoutCtrl', function($rootScope, $location, SessionService) {
  (new SessionService()).$delete(function(success) {
    $rootScope.loggedIn = false;
    $location.path('/login');
  });
});


app.controller('EventListCtrl', function($scope, $location, EventService) {
  
  EventService.query(function(events){
    $scope.events = events;
  });

  $scope.editEvent = function(event) {
    $scope.opts = ['on', 'off', 'special'];

    if (event === 'new') {
      $scope.newEvent = true;
      $scope.event = {name: '', special: 'false',  shortname: '', phonenumber: '', state: '', voteoptions: [{id:1, name: ''}]};
    }
    else if (event === 'special'){
      $scope.newEvent = true;
      $scope.specialEvent = true;
      $scope.event = {name: '', shortname: '', special: 'true', phonenumber: '', state: '', voteoptions: [{id:1, name: ''}]};
    }
    else {
      $scope.newEvent = false;
      $scope.event = event;
    }
  };

  $scope.save = function() {
    if (!$scope.event._id) {
      var newEvent = new EventService($scope.event);
      newEvent.$save(function(){
        $scope.events.push(newEvent);
      });
    }
    else {
      $scope.events.forEach(function(e) {
        if (e._id === $scope.event._id) {
          e.$save();
        }
      });          
    }
  };

  $scope.delete = function() {
    $scope.events.forEach(function(e, index) {
      if (e._id == $scope.event._id) {
        $scope.event.$delete({id: $scope.event._id, rev: $scope.event._rev}, function() {
          $scope.events.splice(index, 1);
        });
      }
    });
  };

  $scope.addVoteOption = function() {
    if($scope.event.isSpecial){
      $scope.event.voteoptions.push({id: $scope.event.voteoptions.length+$scope.event.voteValue, name: null});
    }
  };

  $scope.removeVoteOption = function(vo) {
    $scope.event.voteoptions.splice(vo.id-1, 1);
    // need to make sure id values run from 1..x (web service constraint)
    $scope.event.voteoptions.forEach(function(vo, index) {
      vo.id = index+1;
    });
  };

  $scope.clearEvents = function(){
    $scope.event = [];
    console.log('clear event list');
  }
});