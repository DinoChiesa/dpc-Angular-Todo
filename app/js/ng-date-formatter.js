// ng-date-formatter.js
// ------------------------------------------------------------------
//
// requires dateFormat.js, which extends the Date() object with a format()
// method that mimic's PHP's Date.format().
//
// created: Wed Jul 29 13:40:49 2015
// last saved: <2015-September-02 13:50:45>

angular
  .module('t1App')
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
