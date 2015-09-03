// ng-textarea-popover.js
// ------------------------------------------------------------------
//
// a textarea-popover element
//
// created: Wed Jul 29 13:59:49 2015
// last saved: <2015-September-02 19:01:00>


(function(window, document, undefined) {
  'use strict';

  function f1DDCF3795 (scope /*, elt, attrs */) {
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
      scope.text = origValue || ''; // necessary?
    };

    scope.acceptEdits = function() {
      scope.stopEdits();
      scope.onSave({value: scope.text, previousValue: origValue});
    };

    scope.toggleEdits = function( /* $event */) {
      if (scope.isEditing) {
        scope.discardEdits();
      }
      else {
        origValue = scope.text || '';
        scope.isEditing = true;
        scope.editBoxStyle = {display:'block'};
        scope.popoverStyle = {display:'none'};
      }
    };
  }

  window
    .angular
    .module('t1App')
    // textarea-popover element
    .directive( 'textareaPopover', function( /* $compile, $http */) {
      return {
        restrict: 'E',
        scope: { text : '=ngModel', onSave:'&' },
        templateUrl: 'views/textarea-popover.htm',
        link: f1DDCF3795
      };
    });

})(window, document);
