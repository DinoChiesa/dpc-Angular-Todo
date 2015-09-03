// log.js
// ------------------------------------------------------------------
//
// Writes things to a log div. usage:
//   var log = new Log('elementId');
//   log.write('something');
//
// created: Sat Jun 22 16:15:26 2013
// last saved: <2015-July-15 08:55:52>
// ------------------------------------------------------------------
//
// Copyright © 2013 Dino Chiesa
// All rights reserved.
//
// ------------------------------------------------------------------

(function(globalScope){
  'use strict';

  function Log(id) {
    this.elt = document.getElementById(id);
    // race condition - the logging elt may not be rendered yet.
    // This is handled in flushBuffer.
    this.id = id;
    this.buffer = '';
    this.timer = null;
    this.start = (new Date()).getTime();
    this.deferments = 0;
  }

  Log.prototype.write = function(str) {
    var time = ((new Date()) - this.start) / 1000, me = this;
    this.buffer = '[' + time.toFixed(3) + '] ' + str + '<br/>\n' + this.buffer;
    // Insert elements into the DOM in batches, asynchronously,
    // because there may be a lot of messages.
    // It may actually starve, so count the deferments.
    if (this.deferments < 8) {
      clearTimeout(this.timer);
      this.deferments++;
      this.timer = setTimeout(function(){flushBuffer.call(me);}, 250);
    }
    else {
      // synchronous
      flushBuffer.call(me);
    }
  };

  function flushBuffer() {
    var me = this || {};
    if ( ! me.elt && me.id) {
      me.elt = document.getElementById(me.id);
    }
    if (me.elt) {
      me.elt.innerHTML = me.buffer + me.elt.innerHTML;
      me.buffer = '';
      me.deferments = 0;
    }
  }

  if (typeof exports === 'object' && exports) {
    exports.Log = Log;
  }
  else {
    globalScope.Log = Log;
  }

}(this));
