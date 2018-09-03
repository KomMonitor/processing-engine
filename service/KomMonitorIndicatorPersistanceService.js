'use strict';

 // axios os used to execute HTTP requests in a Promise-based manner
 const axios = require("axios");

 const targetDateHelper = require("./TargetDateHelperService");

 function buildPutRequestBody(targetDate, targetSpatialUnitId, indicatorGeoJson){
   // the request body has follwing structure:
// {
//   "indicatorValues": [
//     {
//       "spatialReferenceKey": "spatialReferenceKey",
//       "valueMapping": [
//         {
//           "indicatorValue": 0.8008282,
//           "timestamp": "2000-01-23"
//         },
//         {
//           "indicatorValue": 0.8008282,
//           "timestamp": "2000-01-23"
//         }
//       ]
//     },
//     {
//       "spatialReferenceKey": "spatialReferenceKey",
//       "valueMapping": [
//         {
//           "indicatorValue": 0.8008282,
//           "timestamp": "2000-01-23"
//         },
//         {
//           "indicatorValue": 0.8008282,
//           "timestamp": "2000-01-23"
//         }
//       ]
//     }
//   ],
//   "applicableSpatialUnit": "applicableSpatialUnit"
// }

  var indicatorFeatures = indicatorGeoJson.features;
  var putRequestBody = {};
  putRequestBody.applicableSpatialUnit = targetSpatialUnitId;
  putRequestBody.indicatorValues = new Array(indicatorFeatures.length);

  // now for each element of inputFeatures create object and append to array
  indicatorFeatures.forEach(function(indicatorFeature){
    var indicatorValueObject = {};
    indicatorValueObject.spatialReferenceKey = indicatorFeature.properties.spatialUnitId;

    indicatorValueObject.valueMapping = new Array(1);
    var valueMappingObject = {};
    valueMappingObject.indicatorValue = indicatorFeature.properties[targetDate];
    valueMappingObject.timestamp = targetDate;
    indicatorValueObject.valueMapping.push(valueMappingObject);

    putRequestBody.indicatorValues.push(indicatorValueObject);
  });

  return putRequestBody;
 }

/**
 * send PUT request against KomMonitor DataManagement API to update indicator for targetDate. This persists the submitted indicator values permanently.
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to update indicator
 * targetIndicatorId String unique identifier of the indicator
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 * targetSpatialUnitId String unique identifier of the target spatial unit
 * indicatorGeoJson Object GeoJson object of the indicator spatial features.
 *
 * returns URL pointing to created resource
 **/
exports.putIndicatorById = function(baseUrlPath, targetIndicatorId, targetDate, targetSpatialUnitId, indicatorGeoJson) {
  console.log("Sending PUT request against KomMonitor data management API for indicatorId " + targetIndicatorId + " and targetDate " + targetDate + " and targetSpatialUnitId " + targetSpatialUnitId);

  var year = targetDateHelper.getYearFromTargetDate(targetDate);
  var month = targetDateHelper.getMonthFromTargetDate(targetDate);
  var day = targetDateHelper.getDayFromTargetDate(targetDate);

  var putRequestBody = buildPutRequestBody(targetDate, targetSpatialUnitId, indicatorGeoJson);

  //PUT /indicators/{indicatorId}
  return axios.put(baseUrlPath + "/indicators/" + targetIndicatorId,
        putRequestBody,
        {headers: {"Content-Type": "application/json"}})
    .then(response => {
      // response.data should be the respective GeoJSON as String
      console.log("Received response code " + response.status);
      if (response.status == 200)
        return baseUrlPath + "/indicators/" + indicatorId + "/" + targetSpatialUnitId + "/" + year + "/" + month + "/" + day;
      else
        throw Error("Error when persisting indicator. Response code " + response.status + ". Status text: " + response.statusText);
    })
    .catch(error => {
      console.log("Error when fetching indicator. Error was: " + error);
      throw error;
    });
}

/**
 * send PUT request against KomMonitor DataManagement API to update indicators according to spatialUnitIds
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance.
 * targetIndicatorId String unique identifier of the indicator
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 * indicatorSpatialUnitsMap Map map of indicator entries, where key="targetSpatialUnitId" and value="indicatorGeoJson"
 *
 * returns array of URLs pointing to created resources
 **/
exports.putIndicatorForSpatialUnits = async function(baseUrlPath, targetIndicatorId, targetDate, indicatorSpatialUnitsMap) {
  console.log("Sending PUT requests to persist indicators within KomMonitor data management API");

  var urlResponseArray = new Array();

  // var iterator = indicatorSpatialUnitsMap[Symbol.iterator]();

  // for (let indicatorSpatialUnitsEntry of iterator) {
  for (const indicatorSpatialUnitsEntry of indicatorSpatialUnitsMap){
    try{
      var resultUrl = await putIndicatorById(baseUrlPath, targetIndicatorId, targetDate, indicatorSpatialUnitsEntry[0], indicatorSpatialUnitsEntry[1]);
      urlResponseArray.push(resultUrl);
    }
    catch(error){
      throw error;
    }
  }

  return urlResponseArray;
}
