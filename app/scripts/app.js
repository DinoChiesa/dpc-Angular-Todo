/*global Log: false */

'use strict';

// function isNumber(n) {
//   return !isNaN(parseFloat(n)) && isFinite(n);
// }

var log = new Log('logging');
log.write('hello app.js');

angular

 .module('t1App', ['ui.bootstrap'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.htm',
        controller: 'MainController'
      })
      .otherwise({
        redirectTo: '/'
      });
      //$locationProvider.html5Mode(true);
  })

  // edit-in-place attribute
  .directive( 'editInPlace', function() {
    return {
      restrict: 'A',
      scope: { value: '=editInPlace', onSaveFn: '&onSave', onCancelFn: '&onCancel' },
      template: '<span ng-click="handleClick()" ng-bind="value"></span><input ng-model="modelCopy" style="width:100%;"></input>',
      link: function ( $scope, element /* , attrs */ ) {
        // Let's get a reference to the input element, as we'll want to reference it.
        var inputChild = angular.element( element.children()[1] ),
            previousValue;

        element.addClass( 'edit-in-place' );
        $scope.editing = false;

        // This directive edits a copy of the value, not the actual
        // value. Important because if the value is included in a sorted
        // list, then the sorting will be active during editing, which
        // can cause UI surprises. Elements can get sorted out from
        // under the cursor during live editing, and can then lose
        // focus. By editint a copy of the value, the actual model
        // remains the same.  The model gets updated later, by the
        // controller, when this directive calls the onSaveFn. At that
        // point re-sort (if any) occurs. Joy ensues.
        $scope.modelCopy = $scope.value;

        $scope.handleClick = function() {
          if ( ! $scope.editing) {
            $scope.beginEdit();
          }
        };

        // activate editing mode
        $scope.beginEdit = function () {
          $scope.editing = true;
          previousValue = $scope.value;

          // When the css class is 'active', the input box gets displayed.
          // See the css for details.
          element.addClass( 'active' );

          // Now, focus the element.
          // `angular.element()` returns a chainable array, like jQuery. To access
          // a native DOM function, reference the first element in the array.
          inputChild[0].focus();
        };

        // When the user leaves the input box, stop editing and accept the changes
        inputChild.prop( 'onblur', function() {
          if ( $scope.editing ) {
            $scope.acceptEdits();
          }
        });

        // has the user pressed the RETURN or ESCAPE key from within the input box?
        inputChild.prop( 'onkeyup', function(e) {
          if ($scope.editing) {
            if (e.keyCode === 13) {
              $scope.acceptEdits();
            }
            else if (e.keyCode === 27) {
              $scope.cancelEdits();
            }
          }
        });

        // Accept edits
        $scope.acceptEdits = function () {
          if ($scope.editing) {
            $scope.editing = false;
            element.removeClass( 'active' );
            if ($scope.modelCopy !== previousValue) {
              // This directive does not update the model directly. It's up to
              // the controller to "accept" the changes and apply them to the
              // original model.
              $scope.onSaveFn({value: $scope.modelCopy, previousValue: previousValue});
            }
          }
        };

        // Cancel edits
        $scope.cancelEdits = function () {
          if ($scope.editing) {
            $scope.editing = false;
            element.removeClass( 'active' );
            // wrap this assignment so that the view gets updated
            $scope.$apply(function() {
              $scope.value = previousValue;
            });
            $scope.onCancelFn({value: $scope.value});
          }
        };
      }
    };
  })

// textarea-popover element
  .directive( 'textareaPopover', function( /* $compile, $http */) {
    return {
      restrict: 'E',
      scope: { item : '=ngModel', onSave:'&' },
      templateUrl: 'views/textarea-popover.htm',
      link: function (scope /*, elt, attrs */) {
        var origValue;
        scope.stopEdits = function() {
          scope.isEditing = false;
          scope.popoverStyle = {display:'none'};
          scope.editBoxStyle = {display:'none'};
        };

        scope.stopEdits();

        scope.directiveMouseOver = function( /* thing */) {
          if (!scope.isEditing ) {
            // display the popout only if not already editing
            scope.popoverStyle = {display:'block'};
          }
        };

        scope.directiveMouseLeave = function( /* thing */) {
          scope.popoverStyle = {display:'none'};
        };

        scope.discardEdits = function() {
          scope.stopEdits();
          scope.item.notes = origValue || '';
        };

        scope.acceptEdits = function() {
          scope.stopEdits();
          scope.onSave({previousValue: origValue});
        };

        scope.toggleEdits = function( /* $event */) {
          if (scope.isEditing) {
            scope.discardEdits();
          }
          else {
            origValue = scope.item.notes || '';
            scope.isEditing = true;
            scope.editBoxStyle = {display:'block'};
            scope.popoverStyle = {display:'none'};
          }
        };
      }
    };
  })

  .filter('dateFormatter', function() {
    // filter is a factory function
    return function(theDate) {
      var formattedDate = '', d, defaultFormat = 'Y M d H:i:s';
      if (typeof theDate === 'undefined') {
        formattedDate = '--';
      }
      else if (theDate === null) { }
      else if (angular.isNumber(theDate)) {
        if (theDate>0) {
          d = new Date(theDate);
          formattedDate = d.format(defaultFormat);
        }
        else {
          formattedDate = '--';
        }
      }
      else if (typeof theDate === 'string') {
        d = new Date(Date.parse(theDate));
        formattedDate = d.format(defaultFormat);
      }
      else if (theDate instanceof Date) {
        formattedDate = theDate.format(defaultFormat);
      }
      return formattedDate;
    };
  });

angular.module( 'ui.bootstrap.popover', [ 'ui.bootstrap.tooltip' ] )
// for popovers with a template
  .directive( 'popoverTemplatePopup', function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&', template: '@' },
      templateUrl: 'template/popover/popover-template.html'
    };
  })

  .directive( 'popoverTemplate', [ '$tooltip', function ( $tooltip ) {
    return $tooltip( 'popoverTemplate', 'popover', 'click' );
  }]);

angular
  .module('template/popover/popover-template.html', [])
  .run(['$templateCache', function($templateCache) {
    $templateCache.put('views/popover-template.html',
                       '<div class="popover {{placement}}"\n' +
                       //                     '     style=\'width: 400px\'\n' +
                       '     ng-class="{ in: isOpen(), fade: animation() }">\n' +
                       '  <div class="arrow"></div>\n' +
                       '  <div class="popover-inner" tt-load-template-in-sibling="{{template}}"></div>\n' +
                       '</div>\n' +
                       '');
  }]);



log.write('ng configured');
