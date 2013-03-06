'use strict';
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

angular.module('t1App', [])

  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainController'
      })
      .otherwise({
        redirectTo: '/'
      });
      //$locationProvider.html5Mode(true);
  })
  .filter('dateFormatter', function() {
    // filter is a factory function
    return function(theDate) {
      var formattedDate = "", d;
      if (typeof theDate == 'undefined') {
        formattedDate = '--';
      }
      else if (theDate == null) { }
      else if (isNumber(theDate)) {
        d = new Date(theDate);
        formattedDate = d.format('M d H:i:s');
      }
      else if (typeof theDate == 'string') {
        d = new Date(Date.parse(theDate));
        formattedDate = d.format('M d H:i:s');
      }
      else if (theDate instanceof Date) {
        formattedDate = theDate.format('M d H:i:s');
      }
      return formattedDate;
    };
  });

// angular
//     .module('usergrid', ['ngResource'])
//     .factory('TodoList',
//              ['$resource', function($resource) {
//                  return $resource(ugUrl,
//                                   {},
//                                       { query: {method:'GET', isArray:true} });
//              }]);
