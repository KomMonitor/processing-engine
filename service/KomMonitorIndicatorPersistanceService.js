'use strict';

 // axios os used to execute HTTP requests in a Promise-based manner
 const axios = require("axios");

 const progressHelper = require('./ProgressHelperService');

 const targetDateHelper = require("./TargetDateHelperService");
 const keycloakHelper = require("./KeycloakHelperService");

 const KmHelper = require("../resources/KmHelper");

 const indicator_date_prefix = "DATE_";

 function buildPutRequestBody(targetDates, targetSpatialUnitId, indicatorGeoJson){
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
  KmHelper.log("Number of input features for PUT indicator request: " + indicatorFeatures.length);
  var putRequestBody = {};
  putRequestBody.applicableSpatialUnit = targetSpatialUnitId;
  putRequestBody.indicatorValues = new Array();

  // now for each element of inputFeatures create object and append to array
  for (const indicatorFeature of indicatorFeatures) {
  
      var indicatorValueObject = {};
      indicatorValueObject.spatialReferenceKey = indicatorFeature.properties[process.env.FEATURE_ID_PROPERTY_NAME];
  
      indicatorValueObject.valueMapping = new Array();

      for (const targetDate of targetDates) {
        var targetDateWithPrefix = indicator_date_prefix + targetDate;

        if(!indicatorFeature.properties.hasOwnProperty(targetDateWithPrefix)){
          continue;
        }
  
        if(indicatorFeature.properties[targetDateWithPrefix] == undefined || Number.isNaN(indicatorFeature.properties[targetDateWithPrefix])){
          KmHelper.log("Input contains NaN or UNDEFINED values as indicator value. Will set its value to 'null' for NoData. The feature has featureName: " + indicatorFeature.properties[process.env.FEATURE_NAME_PROPERTY_NAME]);
          indicatorFeature.properties[targetDateWithPrefix] = null;
        }
      
        var valueMappingObject = {};
        valueMappingObject.indicatorValue = indicatorFeature.properties[targetDateWithPrefix];
        valueMappingObject.timestamp = targetDate;
        indicatorValueObject.valueMapping.push(valueMappingObject);
        
    }

    putRequestBody.indicatorValues.push(indicatorValueObject);
  }

  KmHelper.log("Number of produced PUT request body features: " + putRequestBody.indicatorValues.length);

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
exports.putIndicatorById = async function(baseUrlPath, targetIndicatorId, targetIndicatorName, targetDates, targetSpatialUnitMetadata, indicatorGeoJson) {

  var maxNumberOfTargetDatesPerRequest = Number(process.env.MAX_NUMBER_OF_TARGET_DATES_PER_PUT_REQUEST);

  if(targetDates && targetDates.length < maxNumberOfTargetDatesPerRequest){
    return await buildAndExecutePutRequest(baseUrlPath, targetIndicatorId, targetIndicatorName, targetDates, targetSpatialUnitMetadata, indicatorGeoJson);
  }
  else{
    // split up to multiple requsts
    var chunkedTargetDatesArray = chunkArray(targetDates, maxNumberOfTargetDatesPerRequest);

    /*
    var resultObject = {};
        resultObject.indicatorId = targetIndicatorId;
        resultObject.indicatorName = targetIndicatorName;
        resultObject.spatialUnitId = targetSpatialUnitId;
        resultObject.spatialUnitName = targetSpatialUnitMetadata.spatialUnitLevel;
        resultObject.targetDates = targetDates;
        resultObject.urlToPersistedResource = baseUrlPath + "/indicators/" + targetIndicatorId + "/" + targetSpatialUnitId;
    */
    var resultObject;
    for (const targetDates_chunked of chunkedTargetDatesArray) {
      if(!resultObject){
        resultObject = await buildAndExecutePutRequest(baseUrlPath, targetIndicatorId, targetIndicatorName, targetDates_chunked, targetSpatialUnitMetadata, indicatorGeoJson);
      }
      else{
        var tmpResultObject = await buildAndExecutePutRequest(baseUrlPath, targetIndicatorId, targetIndicatorName, targetDates_chunked, targetSpatialUnitMetadata, indicatorGeoJson);
        // resultObject.targetDates = targetDates; 
      }
    }
    return resultObject;
  }

  
};

/**
 * Returns an array with arrays of the given size.
 *
 * @param array {Array} Array to split
 * @param chunkSize {Integer} Size of every group
 */
function chunkArray(array, chunk_size){
  var results = [];

  // make copy - otherwise other spatial units have no date left...
  var arrayCopy = JSON.parse(JSON.stringify(array));
  
  while (arrayCopy.length) {
      results.push(arrayCopy.splice(0, chunk_size));
  }
  
  return results;
}

async function buildAndExecutePutRequest(baseUrlPath, targetIndicatorId, targetIndicatorName, targetDates, targetSpatialUnitMetadata, indicatorGeoJson){
  var targetSpatialUnitId = targetSpatialUnitMetadata.spatialUnitId;
  var targetSpatialUnitName = targetSpatialUnitMetadata.spatialUnitLevel;
  KmHelper.log("Sending PUT request against KomMonitor data management API for indicatorId " + targetIndicatorId + " and targetSpatialUnitId " + targetSpatialUnitId + " and targetDates " + targetDates );

  var putRequestBody = buildPutRequestBody(targetDates, targetSpatialUnitName, indicatorGeoJson);

  var config = await keycloakHelper.getKeycloakAxiosConfig();
  config.headers["Content-Type"] = "application/json";
  config.maxContentLength = Infinity;
  config.maxBodyLength = Infinity;

  //PUT /indicators/{indicatorId}
  return await axios.put(baseUrlPath + "/indicators/" + targetIndicatorId,
        putRequestBody,
        config)
    .then(response => {
      // response.data should be the respective GeoJSON as String
      KmHelper.log("Received response code " + response.status);
      if (response.status == 200){
        var resultObject = {};
        // resultObject.indicatorId = targetIndicatorId;
        // resultObject.indicatorName = targetIndicatorName;
        // resultObject.spatialUnitId = targetSpatialUnitId;
        // resultObject.spatialUnitName = targetSpatialUnitMetadata.spatialUnitLevel;
        // resultObject.targetDates = targetDates;
        resultObject = baseUrlPath + "/indicators/" + targetIndicatorId + "/" + targetSpatialUnitId;

        return resultObject;
      }

      else
        throw Error("Error when persisting indicator. Response code " + response.status + ". Status text: " + response.statusText);
    })
    .catch(error => {
      KmHelper.logError("Error when PUTing indicator. Error was: " + error);
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
 * indicatorSpatialUnitsMap Map map of indicator entries, where key="targetSpatialUnitMetadataObject_asString" and value="indicatorGeoJson"
 *
 * returns array of URLs pointing to created resources
 **/
exports.putIndicatorForSpatialUnits = async function(baseUrlPath, targetIndicatorId, targetIndicatorName, targetDates, indicatorSpatialUnitsMap) {
  KmHelper.log("Sending PUT requests to persist indicators within KomMonitor data management API");

  var resultUrl = "";

  // var iterator = indicatorSpatialUnitsMap[Symbol.iterator]();

  // for (let indicatorSpatialUnitsEntry of iterator) {
  for (const indicatorSpatialUnitsEntry of indicatorSpatialUnitsMap){
    try{
      resultUrl = await exports.putIndicatorById(baseUrlPath, targetIndicatorId, targetIndicatorName, targetDates, JSON.parse(indicatorSpatialUnitsEntry[0]), indicatorSpatialUnitsEntry[1]);

      progressHelper.addSuccessfulSpatialUnitIntegration(targetDates, JSON.parse(indicatorSpatialUnitsEntry[0]), indicatorSpatialUnitsEntry[1]);
    }
    catch(error){
      progressHelper.addFailedSpatialUnitIntegration(JSON.parse(indicatorSpatialUnitsEntry[0]), "Error while integrating computed indicator data into database", error);
      throw error;
    }
  }

  return resultUrl;
}
