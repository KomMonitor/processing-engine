'use strict';

 // axios os used to execute HTTP requests in a Promise-based manner
 const axios = require("axios");

 const targetDateHelper = require("./TargetDateHelperService");

/**
 * send PUT request against KomMonitor DataManagement API to update indicator for targetDate. This persists the submitted indicator values permanently.
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to update indicator
 * targetIndicatorId String unique identifier of the indicator
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 * targetSpatialUnitId String unique identifier of the target spatial unit
 * indicatorGeoJson Object GeoJson object of the indicator spatial features.
 *
 * returns true, if operation was successful; false otherwise
 **/
exports.putIndicatorById = function(baseUrlPath, targetIndicatorId, targetDate, targetSpatialUnitId, indicatorGeoJson) {
  // console.log("fetching indicator from KomMonitor data management API for id " + indicatorId + " and targetDate " + targetDate + " and targetSpatialUnitId " + targetSpatialUnitId);
  //
  // var year = targetDateHelper.getYearFromTargetDate(targetDate);
  // var month = targetDateHelper.getMonthFromTargetDate(targetDate);
  // var day = targetDateHelper.getDayFromTargetDate(targetDate);
  //
  // //GET /indicators/{indicatorId}/{year}/{month}/{day}
  // axios.get(baseUrlPath + "/indicators/" + indicatorId + "/" + year + "/" + month + "/" + day)
  //   .then(response => {
  //     // response.data should be the respective GeoJSON as String
  //     return response.data;
  //   })
  //   .catch(error => {
  //     console.log("Error when fetching indicator. Error was: " + error);
  //   });
}

/**
 * send PUT request against KomMonitor DataManagement API to update indicators according to ids
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance.
 * indicatorId String unique identifier of the indicator
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 * indicatorSpatialUnitsMap Map map of indicator entries, where key="targetSpatialUnitId" and value="indicatorGeoJson"
 *
 * returns indicators as a map containing all indicators, wheres key='meaningful name of the indicator' and value='indicator as GeoJSON string'
 **/
exports.putIndicatorForSpatialUnits = function(baseUrlPath, indicatorId, targetDate, indicatorSpatialUnitsMap) {
  // console.log("fetching indicators from KomMonitor data management API as a map object");
  //
  // var indicatorsMap = new Map();
  //
  // indicatorIds.forEach(function(indicatorId) {
  //   var indicatorMetadata = fetchIndicatorMetadataById(baseUrlPath, indicatorId);
  //   var indicatorName = indicatorMetadata.datasetName;
  //   var indicator_geojsonString = fetchIndicatorById(baseUrlPath, indicatorId, targetDate, targetSpatialUnitId);
  //   indicatorsMap.set(indicatorName, indicator_geojsonString);
  // });
  //
  // return indicatorsMap;
}
