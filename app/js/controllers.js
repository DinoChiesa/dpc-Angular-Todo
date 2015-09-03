/*global log: false, angular: false, window: false */

'use strict';

//log.write('controllers.js');

// just a unique id for local Storage
var html5AppId = '076F20E4-2B21-43B0-8A9D-AC017BBDDA97';

// the base URL in usergrid.  This one is an Apigee Edge proxy (for tracing purposes)
var ugBaseUrl = 'http://cheeso-test.apigee.net/v1/todolist';
    //ugBaseUrl = 'https://api.usergrid.com/myorg/mytodolistapp';

// the URL for retrieving items for the todo list
var ugUrl = ugBaseUrl + '/users/me/owns/items';

//log.write('ugBaseUrl: ' + ugBaseUrl);

function TodoItem(desc) {
  return {
    text      : desc,
    created   : new Date().toJSON(),
    modified  : null,
    completed : null,
    tags      : "",
    status    : 0,
    priority  : 2,
    done      : false
  };
}

function MainController ($scope, $http, $modal /*, $httpProvider , $compile */ ) {
  var dialogModel = {}, token, reUrl = new RegExp('https?://[^/]+(/.*)$'), httpConfig;

  $scope.todoItems = [];
  $scope.sortKey = 'text';
  $scope.sortReverse = false;
  $scope.priorities = [ { num:1, name:'high'}, {num:2, name:'normal'}, {num:3, name:'low'}];
  $scope.securityContext = null;

  $scope.filter = {
    priority: 0,
    descText : '',
    tagsText : '',
    complete : 0,
    completeOptions : [ { num:0,name:'all'},
                        { num:1,name:'completed'},
                        { num:2,name:'open'}],
    priorityOptions : [ { num:0,name:'any'},
                        { num:1, name:'high'}, {num:2, name:'normal'}, {num:3, name:'low'}]
  };

  $scope.dialogOpts = {
    backdrop: 'static', // true ??
    keyboard: true,
    backdropClick: false,
    templateUrl: 'views/login-register-dialog.htm',
    controller: 'LoginRegisterDialogController',

    // resolve is a hash of functions used to inject data into the controller
    resolve: {
      dialogModel: function() { return angular.copy(dialogModel); },
      options : function() { }
    }
  };

  log.write('MainController');
  // check for existing, working token
  token = window.localStorage.getItem(html5AppId + '.bearerToken');
  if (token) {
    // check the token
    httpConfig = { headers:{ 'Authorization': 'Bearer ' + token, 'Accept': 'application/json'} };
    $http.get(ugBaseUrl + '/users/me', httpConfig)
      .success(function ( response ) {
        // success implies the token is valid
        $scope.securityContext = { access_token : token, user: response.entities[0]};
        log.write('OAuth token: ' + $scope.securityContext.access_token);
        log.write('user uuid: ' + $scope.securityContext.user.uuid);
        $http.defaults.headers.common.Authorization = 'Bearer ' + $scope.securityContext.access_token;
        initialRetrieve();
      })
      .error(function(data, status, headers, config) {
        // in case of error, probably the token is expired. Remove it and get a new one.
        log.write('OAuth token validation failed');
        window.localStorage.removeItem(html5AppId + '.bearerToken');
        // storing checked=true is just for diagnostic purposes
        $scope.securityContext = { checked : true };
      });
  }
  else {
    $scope.securityContext = { checked : true };
  }


  $scope.openRegisterDialog = function() {
    dialogModel = {};
    $scope.dialogOpts.resolve.options = function() {
        return {
          wantIdentity: true,
          title: 'Please Register...',
          actionButtonText: 'Register'
        };
    };
    var promise = $modal.open($scope.dialogOpts);
    return promise.result.then(function(result){
      if (result) {
        register(result);
      }
    });
  };

  $scope.openLoginDialog = function(keepErrorMsg) {
    if ( ! keepErrorMsg && dialogModel.errorMessage) { delete dialogModel.errorMessage; }

    $scope.dialogOpts.resolve.options = function() {
        return {
          wantIdentity: false,
          title: 'Sign in...',
          actionButtonText: 'Sign in'
        };
    };
    var promise = $modal.open($scope.dialogOpts);

    return promise.result.then(function(result){
      if (result) {
        login(result, initialRetrieve);
      }
    });
  };

  $scope.logout = function() {
    log.write('signing out user ' + $scope.securityContext.user.uuid);
    delete $http.defaults.headers.common.Authorization;
    window.localStorage.removeItem(html5AppId + '.bearerToken');
    $scope.todoItems = [];
    $scope.securityContext = { checked : true }; // checked and not authenticated
  };

  // see http://docs.angularjs.org/api/ng.$http
  // after login:
  // $httpProvider.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;

  function login(creds, success) {
    // curl -X POST -i -H "Content-Type: application/json"
    //     "https://api.usergrid.com/my-org/my-app/token"
    //     -d '{"grant_type":"password","username":"john.doe","password":"testpw"}'

    // success response:
    // {
    //   "access_token": "5wuGd-eeee-yyyy",
    //   "expires_in": 3600,
    //   "user": {
    //     "uuid": "6941ef6d-0dd0-4040-881d-c7abf5f339cc",
    //     "type": "user",
    //     "name": "Firstname Lastname",
    //     "created": 1372287618225,
    //     "modified": 1372287618225,
    //     "username": "Himself",
    //     "email": "person@example.com",
    //     "activated": true,
    //     "picture": "http://www.gravatar.com/avatar/d5e3ed864e42e13c54a427bd230dcf3d"
    //   }
    // }

    // subsequently, use this in http requests:
    // Authorization: Bearer {access_token}
    var loginPayload = { 'grant_type': 'password', username: creds.username, password: creds.password },
        loginHttpConfig = { headers:{ 'Content-Type': 'application/json', 'Accept': 'application/json'} };

    $http.post(ugBaseUrl + '/token', loginPayload, loginHttpConfig)
      .success(function (response) {
        var token = response.access_token;
        $scope.securityContext = response;
        $scope.securityContext.checked = true;
        log.write('OAuth token: ' + token);
        window.localStorage.setItem(html5AppId + '.bearerToken', token);
        $http.defaults.headers.common.Authorization = 'Bearer ' + token;
        // necessary?
        httpConfig = { headers:{ 'Authorization': 'Bearer ' + token, 'Accept': 'application/json'} };
        if (dialogModel.errorMessage) { delete dialogModel.errorMessage; }
        creds.password = null;
        success();
      })
      .error(function(data, status, headers, config) {
        log.write('login failed');
        if (data && data.error_description) {
          dialogModel.errorMessage = data.error_description;
        }
        $scope.securityContext.checked = true;
        dialogModel.username = creds.username;
        // retry the login
        $scope.openLoginDialog(true);
      });
  }

  function register(creds) {
    // curl -X POST -i -H "Content-Type: application/json"
    //     "https://api.usergrid.com/my-org/my-app/users"
    //     -d '{"username":"john.doe","password":"testpw"}'

    // success response:
    // {
    //   "action" : "post",
    //   "application" : "00e1e88a-8610-11e2-8abc-02e81ac5a17b",
    //   "params" : { },
    //   "path" : "/users",
    //   "uri" : "http://api.usergrid.com/dino/todolist/users",
    //   "entities" : [ {
    //     "uuid" : "e23197ea-e02c-11e2-8f94-4548b396870f",
    //     "type" : "user",
    //     "created" : 1372449415262,
    //     "modified" : 1372449415262,
    //     "username" : "Schlotsky",
    //     "activated" : true,
    //     ...

    // subsequently, can login with those credentials.
    var registerPayload = { username: creds.username, password: creds.password, email: creds.email, name: creds.name },
        localHttpConfig = { headers:{ 'Content-Type': 'application/json', 'Accept': 'application/json'} };

    $http.post(ugBaseUrl + '/users', registerPayload, localHttpConfig)
      .success(function (response) {
        var user = response.entities[0];
        if (user && user.activated) {
          log.write('successfully created a new user: ' + user.uuid);
          login(creds, initialRetrieve);
        }
      })
      .error(function(data, status /*, headers, config */) {
        log.write('registration failed: ' + status);
        if (data && data.error_description) {
          dialogModel.errorMessage = data.error_description;
        }
        dialogModel.username = creds.username;
        // retry the registration
        $scope.openRegisterDialog();
      });
  }

  function chainingErrorHandler(scope, action, data, status, headers, chain) {
    log.write(action + ' failed (' + status + ')...' + JSON.stringify(data));

    if (data) {

      // if (action === 'delete' && data.error === 'unauthorized') {
      //   log.write('see USERGRID-1713. fixed 15 July?');
      // } else

      if (data.error === 'expired_token') {
        // need to re-authenticate
        scope.logout();
      }
    }
    if (chain) {
      chain.call(null, data, status, headers);
    }
  }


  function shortUrl(url) {
    var m = reUrl.exec(url);
    if ( ! m) {return '??';}
    return m[1];
  }

  function initialRetrieve() {
    log.write('get items from UG ' + shortUrl(ugUrl));
    //log.write('httpConfig: ' + JSON.stringify(httpConfig));
    $http.get(ugUrl + '?limit=100')
      .success(function(data){
        log.write('got ' + data.entities.length + ' items');
        $scope.todoItems = data.entities;
      })
      .error(function(response, code /*, headers, config */) {
        log.write('failed to get items from UG: ' + code);
      });
  }


  $scope.addTodo = function () {
    var item = new TodoItem($scope.newItemText);
    log.write('New item: ' + $scope.newItemText);
    if (item.created !== null && item.created instanceof Date) {
      item.created = new Date(Date.parse(item.created)).toJSON();
    }
    if (item.completed !== null && (item.completed > 0) && item.completed instanceof Date) {
      item.completed = new Date(Date.parse(item.completed)).toJSON();
    }

    $http.post(ugUrl, item) // create and implicitly associate
      .success(function(data){
        var newItem = data.entities[0];
        log.write('New item created:' + JSON.stringify(newItem));
        $scope.todoItems.push( newItem );
      })
      .error(function(data, status, headers /*,  config */) {
        chainingErrorHandler($scope,'addItem', data, status, headers /*,  chain */);
      });
    $scope.newItemText = '';
  };


  $scope.itemNormalizationFunction = function(item) {
    var val = item[$scope.sortKey];
    if ($scope.sortKey === 'created' || $scope.sortKey === 'completed' || $scope.sortKey === 'due') {
      if (isNaN(val)) { return 0;}
      return val;
    }
    return val;
  };


  $scope.setSort = function($event) {
    var oldKey = $scope.sortKey,
        header = $event.currentTarget.innerHTML, fakeItem = new TodoItem('this is fake');
    if (fakeItem.hasOwnProperty(header)) {
      $scope.sortKey = header;
    }
    else if (header === 'Desc'){
      $scope.sortKey = 'text';
    }
    else if (header === '?'){
      $scope.sortKey = 'done';
    }
    if (oldKey === $scope.sortKey) {
      $scope.sortReverse = !$scope.sortReverse;
    }
    else {
      $scope.sortReverse = false;
    }
  };


  $scope.deleteItem = function(item) {
    var url = ugUrl + '/' + item.uuid;
    log.write('delete item: ' + item.uuid);
    log.write('delete url: ' + url);
    $http.delete(url, httpConfig)
      .success(function(content) {
        log.write('deleted:' + JSON.stringify(content));
        $scope.todoItems.splice($scope.todoItems.indexOf(item),1);
      })
      .error(function(data, status, headers /*,  config */) {
        chainingErrorHandler($scope,'delete', data, status, headers /*,  chain */);
      });
  };

  $scope.onCheckedChanged = function(item) {
    var url = ugUrl + '/' + item.uuid;
    item.completed = (item.done) ? new Date().valueOf() : null;
    log.write('onCheckedChanged: ' + item.uuid + ', text:' + item.text);
    $http.put(url, item)
      .success(function( /*content*/) {
        log.write('UG updated, done:' + item.done);
      })
      .error(function(data, status, headers /*,  config */) {
        chainingErrorHandler($scope, (item.done)?'check':'uncheck', data, status, headers /*,  chain */);
      });
  };

  $scope.updateItemPriority = function(item) {
    var url = ugUrl + '/' + item.uuid;
    log.write('Item: ' + item.uuid + ', priority:' + item.priority);
    //item.priority = value;
    $http.put(url, item)
      .success(function( /*content*/) {
        log.write('UG updated, priority:' + item.priority);
      })
      .error(function(data, status, headers /*,  config */) {
        chainingErrorHandler($scope, 'priorityChange', data, status, headers /*,  chain */);
      });
  };

  $scope.updateItemText = function(value, previousValue, item) {
    var url = ugUrl + '/' + item.uuid;
    log.write('Item: ' + item.uuid + ', text:' + value);
    //log.write(JSON.stringify(item));
    item.text = value; // accept the edited value
    log.write(JSON.stringify(item));
    $http.put(url, item)
      .success(function( /*content*/) {
        log.write('UG updated, text:' + item.text);
      })
      .error(function(data, status, headers /*,  config */) {
        chainingErrorHandler($scope, 'updateItemText', data, status, headers /*,  chain */);
      });
  };

  $scope.updateItemNotes = function(value, previousValue, item) {
    var url = ugUrl + '/' + item.uuid;
    log.write('Item: ' + item.uuid + ', notes:' + value);
    item.notes = value; // copy the new value into the item
    $http.put(url, item)
      .success(function( /*content*/) {
        log.write('UG updated, notes:' + item.notes);
      })
      .error(function(data, status, headers /*,  config */) {
        chainingErrorHandler($scope, 'updateItemNotes', data, status, headers /*,  chain */);
      });
  };

  $scope.updateItemTags = function(value, previousValue, item) {
    var url = ugUrl + '/' + item.uuid;
    log.write('Item: ' + item.uuid + ', tags:' + value);
    item.tags = value; // accept the edited value
    $http.put(url, item)
      .success(function( /*content*/) {
        log.write('UG updated, tags:' + item.tags);
      })
      .error(function(data, status, headers /*,  config */) {
        chainingErrorHandler($scope, 'updateItemTags', data, status, headers /*,  chain */);
      });
  };


  $scope.getTotalTodos = function () {
    return $scope.todoItems.length;
  };

  $scope.getShownTodos = function () {
    return $scope.todoItems.filter($scope.filtered).length;
  };

  $scope.filtered = function(item) {
    var include = true;
    function trimit(s) { return s.trim(); }

    // 1. filter on done-ness
    if ($scope.filter.complete !== 0) {
      include = (item.done && $scope.filter.complete === 1) ||
        (!item.done && $scope.filter.complete === 2);
    }

    // 2. filter on text
    if (include && $scope.filter.descText && $scope.filter.descText.length > 0) {
      include = (item.text.indexOf($scope.filter.descText) > -1);
    }

    // 3. filter on tags
    if (include && $scope.filter.tagsText && $scope.filter.tagsText.length > 0) {
      if (item.tags && item.tags.length > 0) {
        var tagsToFind = $scope.filter.tagsText.split(',').map(trimit);
        include = tagsToFind.some(function (v) {
          return item.tags.split(',').map(trimit).indexOf(v) >= 0;
        });
      }
      else {
        include = false;
      }
    }

    // 4. filter on priority
    if (include && $scope.filter.priority !== 0) {
      include = (item.priority === $scope.filter.priority);
    }

    return include;
  };
}



function LoginRegisterDialogController ($scope, $modalInstance, dialogModel, options) {
  $scope.dialogModel = dialogModel;
  $scope.options = options;
  $scope.cancel = $modalInstance.dismiss;
  $scope.login = function(result){
    $modalInstance.close(result);
  };
}


// this is used in views/main.htm to collapse the log viewer panel
function CollapseDemoController($scope) {
  $scope.isCollapsed = true;
  $scope.getButtonSymbol = function() {
    return ($scope.isCollapsed) ? '<' : '>';
  };
}

angular
  .module('t1App')
  .controller('MainController', ['$scope', '$http', '$modal', MainController])
  .controller('CollapseDemoController', ['$scope', CollapseDemoController])
  .controller('LoginRegisterDialogController',
              ['$scope', '$modalInstance', 'dialogModel', 'options',
               LoginRegisterDialogController]);
