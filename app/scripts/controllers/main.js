'use strict';

var TodoItem = function(desc) {
  return {
    text      : desc,
    created   : new Date().toJSON(),
    completed : null,
    status    : 0,
    done      : false
  };
};

var usergridDotCom = 'https://api.usergrid.com',
    userGridOrg    = 'dino',
    userGridApp    = 'todolist',
    ugBaseUrl      = usergridDotCom + '/' + userGridOrg + '/' + userGridApp,
    ugUrl          = ugBaseUrl + '/items'; // set up in UG manager UI

angular
  .module('t1App')
  .controller('MainController', function ($scope, $http) {

    $scope.todoItems = [ ];

    // retrieve items in the todo list
    $http.get(ugUrl + '?limit=100').success(function(data){
      $scope.todoItems = data.entities;
    });

    $scope.addTodo = function () {
      var item = new TodoItem($scope.newItemText);
      if (item.created != null && item.created instanceof Date) {
        item.created = new Date(Date.parse(item.created)).toJSON();
      }
      if (item.completed != null && item.completed instanceof Date) {
        item.completed = new Date(Date.parse(item.created)).toJSON();
      }
      $scope.todoItems.push( item );

      $http.post(ugUrl, item).success(function(data){
        // console.log("UG updated");
      });

      $scope.newItemText = "";
    };

    $scope.deleteItem = function(item) {
      var url = ugUrl + '/' + item.uuid;
      $http.delete(url);
      $scope.todoItems.splice($scope.todoItems.indexOf(item),1);
    };

    $scope.onCheckedChanged = function(item) {
      var url = ugUrl + '/' + item.uuid;
      item.completed = (item.done) ? new Date().toJSON() : null;
      $http.put(url, item); // update
    };

    $scope.getTotalTodos = function () {
      return $scope.todoItems.length;
    };

  });
