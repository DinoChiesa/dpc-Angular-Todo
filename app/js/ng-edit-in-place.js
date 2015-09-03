// edit-in-place.js
// ------------------------------------------------------------------
//
// edit-in-place attribute
//
// created: Wed Jul 29 13:39:36 2015
// last saved: <2015-September-02 19:01:03>

(function(window, document, undefined) {
  'use strict';

  window
    .angular
    .module('t1App')
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
  });
})(window, document);
