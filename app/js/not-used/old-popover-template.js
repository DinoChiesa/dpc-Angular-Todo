// old-popover-template.js
// ------------------------------------------------------------------
//
// Description goes here....
//
// created: Wed Jul 29 13:37:43 2015
// last saved: <2015-July-29 13:37:49>

//NOT USED NOW

// create a popover with a template
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


// set the template for a popover. 
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



