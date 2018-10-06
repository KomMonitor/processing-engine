'use strict';

 // axios os used to execute HTTP requests in a Promise-based manner
 const axios = require("axios");

 const targetDateHelper = require("./TargetDateHelperService");

 const indicator_date_prefix = "DATE_";

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

  var targetDateWithPrefix = indicator_date_prefix + targetDate;
  var indicatorFeatures = indicatorGeoJson.features;
  console.log("Number of input features for PUT indicator request: " + indicatorFeatures.length);
  var putRequestBody = {};
  putRequestBody.applicableSpatialUnit = targetSpatialUnitId;
  putRequestBody.indicatorValues = new Array();

  // now for each element of inputFeatures create object and append to array
  indicatorFeatures.forEach(function(indicatorFeature){

    if(indicatorFeature.properties[targetDateWithPrefix] == null || indicatorFeature.properties[targetDateWithPrefix] == undefined || Number.isNaN(indicatorFeature.properties[targetDateWithPrefix])){
      throw new Error("Input contains NULL or NAN values as indicator value. Thus aborting request to update indicator features.");
    }

    var indicatorValueObject = {};
    indicatorValueObject.spatialReferenceKey = indicatorFeature.properties.spatialUnitFeatureId;

    indicatorValueObject.valueMapping = new Array();
    var valueMappingObject = {};
    valueMappingObject.indicatorValue = indicatorFeature.properties[targetDateWithPrefix];
    valueMappingObject.timestamp = targetDate;
    indicatorValueObject.valueMapping.push(valueMappingObject);

    putRequestBody.indicatorValues.push(indicatorValueObject);
  });

  console.log("Number of produced PUT request body features: " + putRequestBody.indicatorValues.length);

  return putRequestBody;
 }

/**
 * send PUT request against KomMonitor DataManagement API to update indicator for targetDate. This persists the submitted indicator values permanently.
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to update indicator
 * targetIndicatorId String unique identifier of the indicator
 * targetIndicatorName String name of the indicator
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 * targetSpatialUnitMetadata Object target spatial unit metadata object
 * indicatorGeoJson Object GeoJson object of the indicator spatial features.
 *
 * returns URL pointing to created resource
 **/
exports.putIndicatorById = function(baseUrlPath, targetIndicatorId, targetIndicatorName, targetDate, targetSpatialUnitMetadata, indicatorGeoJson) {
  var targetSpatialUnitId = targetSpatialUnitMetadata.spatialUnitId;
  var targetSpatialUnitName = targetSpatialUnitMetadata.spatialUnitLevel;
  console.log("Sending PUT request against KomMonitor data management API for indicatorId " + targetIndicatorId + " and targetDate " + targetDate + " and targetSpatialUnitId " + targetSpatialUnitId);

  var year = targetDateHelper.getYearFromTargetDate(targetDate);
  var month = targetDateHelper.getMonthFromTargetDate(targetDate);
  var day = targetDateHelper.getDayFromTargetDate(targetDate);

  var putRequestBody = buildPutRequestBody(targetDate, targetSpatialUnitName, indicatorGeoJson);

  //PUT /indicators/{indicatorId}
  return axios.put(baseUrlPath + "/indicators/" + targetIndicatorId,
        putRequestBody,
        {headers: {"Content-Type": "application/json"}})
    .then(response => {
      // response.data should be the respective GeoJSON as String
      console.log("Received response code " + response.status);
      if (response.status == 200){
        var resultObject = {};
        resultObject.indicatorId = targetIndicatorId;
        resultObject.indicatorName = targetIndicatorName;
        resultObject.spatialUnitId = targetSpatialUnitId;
        resultObject.spatialUnitName = targetSpatialUnitMetadata.spatialUnitLevel;
        resultObject.targetDate = targetDate;
        resultObject.urlToPersistedResource = baseUrlPath + "/indicators/" + targetIndicatorId + "/" + targetSpatialUnitId + "/" + year + "/" + month + "/" + day;

        return resultObject;
      }

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
 * targetIndicatorName String name of the indicator
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 * indicatorSpatialUnitsMap Map map of indicator entries, where key="targetSpatialUnitMetadataObject" and value="indicatorGeoJson"
 *
 * returns array of URLs pointing to created resources
 **/
exports.putIndicatorForSpatialUnits = async function(baseUrlPath, targetIndicatorId, targetIndicatorName, targetDate, indicatorSpatialUnitsMap) {
  console.log("Sending PUT requests to persist indicators within KomMonitor data management API");

  var responseArray = new Array();

  // var iterator = indicatorSpatialUnitsMap[Symbol.iterator]();

  // for (let indicatorSpatialUnitsEntry of iterator) {
  for (const indicatorSpatialUnitsEntry of indicatorSpatialUnitsMap){
    try{
      var resultUrl = await exports.putIndicatorById(baseUrlPath, targetIndicatorId, targetIndicatorName, targetDate, indicatorSpatialUnitsEntry[0], indicatorSpatialUnitsEntry[1]);
      responseArray.push(resultUrl);
    }
    catch(error){
      throw error;
    }
  }

  return responseArray;
}
