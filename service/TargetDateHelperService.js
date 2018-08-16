'use strict';

/**
 * split up target date string
 *
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 *
 * returns array of split components; i.e. array[0]=YEAR, array[1]=MONTH, array[2]=DAY
 **/
exports.getTargetDateComponentsArray = function(targetDate){
  return targetDate.split("-");
}

exports.getYearFromTargetDate = function(targetDate){
  var targetDateComponents = getTargetDateComponentsArray(targetDate);
  return targetDateComponents[0];
}

exports.getMonthFromTargetDate = function(targetDate){
  var targetDateComponents = getTargetDateComponentsArray(targetDate);
  return targetDateComponents[1];
}

exports.getDayFromTargetDate = function(targetDate){
  var targetDateComponents = getTargetDateComponentsArray(targetDate);
  return targetDateComponents[2];
}
