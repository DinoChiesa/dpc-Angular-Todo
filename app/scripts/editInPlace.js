// editInPlace.js
// ------------------------------------------------------------------
//
// Description goes here....
//
// created: Sat Jun 22 19:54:32 2013
// last saved: <2013-June-22 20:19:37>
// ------------------------------------------------------------------
//
// Copyright © 2013 Dino Chiesa
// All rights reserved.
//
// ------------------------------------------------------------------


(function(globalScope) {
  'use strict';

  $(document).ready(function() {

    $('span.NOT-editInPlace').live('click', function() {
      var $theDiv = $(this),
          uniqueId = 'id-' + (new Date()).valueOf() + '-' + Math.floor( Math.random()*99999 ),
          $elt = $('<input class="editInPlace-input" type="text"/>');
      $elt.val($theDiv.html()).attr('id', uniqueId);
      $theDiv.replaceWith($elt);

      $('#' + uniqueId).focus().live('blur keyup', function(event) {
        if (event.keyCode && event.keyCode != 13) return false;
        var $theInput = $(this);
        $theDiv.html($theInput.val());
        $theInput.replaceWith($theDiv);
      });
    });

  });

}(this));

/* Local Variables:   */
/* js-indent-level: 4 */
/* End:               */
