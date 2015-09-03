


 // popover-textarea directive
  .directive( 'popoverTextarea', function( /* $compile, $http */) {
    var popoverTpl =
      '<div class="popover editable-container editable-popup fade in right" ng-style="editBoxStyle" ' +
      '     style="top: -28px; left: 32px; z-index: 9999; margin-top: 0px; position:absolute; width:auto;">' +
      '  <div class="arrow" style="top:38px;"></div>' +
      '  <div class="popover-inner">' +
      '    <h3 class="popover-title">Notes</h3>' +
      '    <div class="popover-content">' +
      '      <div class="control-group">' +
      '        <div>' +
      '          <div class="editable-input">' +
      '            <textarea class="input-large" rows="5" ng-model="item.notes"></textarea>' +
      '          </div>' +
      '          <div class="editable-buttons">' +
      '            <button class="btn btn-primary editable-submit" type="button" ng-click="acceptEdits($event)">' +
      '              <i class="icon-ok icon-white"></i>' +
      '            </button>' +
      '            <button class="btn editable-cancel" type="button" ng-click="discardEdits($event)">' +
      '              <i class="icon-remove"></i>' +
      '            </button>' +
      '          </div>' +
      '        </div>' +
      '        <div class="editable-error-block help-block" style="display: none;"></div>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</div>',

        buttonTpl =
      '<a class="btn btn-mini btn-info notes-button" ng-click="toggleEdits($event)">' +
      '<i class="icon-edit icon-white"></i></a>';

    return {
      restrict: 'E',
      scope: { item : '=ngModel', onSave:'&'},
      //templateUrl: 'views/textarea-popover.html',
      compile: function(element /*, attrs */) {
        var elaboratedHtml = '<div style="position:relative;">' + buttonTpl + popoverTpl + '</div>';
        element.replaceWith(elaboratedHtml);

        // the link fn
        return function (scope /*, elt, attrs*/) {
          var origValue;
          scope.isEditing = false;
          scope.value = '';
          scope.editBoxStyle = {display:'none'};

          scope.discardEdits = function() {
            scope.isEditing = false;
            scope.editBoxStyle = {display:'none'};
          };

          scope.acceptEdits = function() {
            scope.isEditing = false;
            scope.editBoxStyle = {display:'none'};
            scope.onSave({previousValue: origValue});
          };

          scope.toggleEdits = function( /* $event */) {
            if (scope.isEditing) {
              scope.discardEdits();
            }
            else {
              scope.value = origValue = scope.item.notes || '';
              scope.isEditing = true;
              scope.editBoxStyle = {display:'block'};
            }
          };
        };
      }
    };
  })

/* Local Variables:   */
/* js-indent-level: 4 */
/* End:               */
