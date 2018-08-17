'use strict';

 // axios os used to execute HTTP requests in a Promise-based manner
 const axios = require("axios");

 const targetDateHelper = require("./TargetDateHelperService");

/**
 * send request against KomMonitor DataManagement API to fetch scriptCode acording to id
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch script
 * scriptId String unique identifier of the script containing NodeJS code
 *
 * returns script code of a NodeJS module as string
 **/
exports.fetchScriptCodeById = function(baseUrlPath, scriptId) {
  console.log("fetching script code from KomMonitor data management API for id " + scriptId);

  //GET /process-scripts/{scriptId}/scriptCode
  axios.get(baseUrlPath + "/process-scripts/" + scriptId + "/scriptCode")
    .then(response => {
      // response.data should be the script as String
      return response.data;
    })
    .catch(error => {
      console.log("Error when fetching script code. Error was: " + error);
    });
}

/**
 * send request against KomMonitor DataManagement API to fetch spatial unit according to id
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch spatial unit
 * spatialUnitId String unique identifier of the spatial unit
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 *
 * returns spatial unit as GeoJSON string
 **/
exports.fetchSpatialUnitById = function(baseUrlPath, spatialUnitId, targetDate) {
  console.log("fetching spatial unit from KomMonitor data management API for id " + spatialUnitId + " and targetDate " + targetDate);

  var year = targetDateHelper.getYearFromTargetDate(targetDate);
  var month = targetDateHelper.getMonthFromTargetDate(targetDate);
  var day = targetDateHelper.getDayFromTargetDate(targetDate);

  //GET /spatial-units/{spatialUnitId}/{year}/{month}/{day}
  axios.get(baseUrlPath + "/spatial-units/" + spatialUnitId + "/" + year + "/" + month + "/" + day)
    .then(response => {
      // response.data should be the respective GeoJSON as String
      return response.data;
    })
    .catch(error => {
      console.log("Error when fetching spatial unit. Error was: " + error);
    });
}

/**
 * send request against KomMonitor DataManagement API to fetch all available spatial unit metadata entries as array
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch spatial unit
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 *
 * returns spatial units metadata entries as an array
 **/
exports.fetchSpatialUnitsMetadata = function(baseUrlPath, targetDate) {
  console.log("fetching available spatial units metadata from KomMonitor data management API for targetDate " + targetDate);

  var year = targetDateHelper.getYearFromTargetDate(targetDate);
  var month = targetDateHelper.getMonthFromTargetDate(targetDate);
  var day = targetDateHelper.getDayFromTargetDate(targetDate);

  //GET /spatial-units
  axios.get(baseUrlPath + "/spatial-units")
    .then(response => {
      // response.data should be the respective array of metadata entries as JSON
      return response.data;
    })
    .catch(error => {
      console.log("Error when fetching spatial units metadata. Error was: " + error);
    });
}

/**
 * send request against KomMonitor DataManagement API to fetch all available spatial units as a map
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch spatial unit
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 *
 * returns spatial units as a map containing all units, wheres key='meaningful name of the spatial unit' and value='features as GeoJSON string'
 **/
  async function fetchAvailableSpatialUnits(baseUrlPath, targetDate) {
    console.log("fetching available spatial units from KomMonitor data management API for targetDate " + targetDate);

    var year = targetDateHelper.getYearFromTargetDate(targetDate);
    var month = targetDateHelper.getMonthFromTargetDate(targetDate);
    var day = targetDateHelper.getDayFromTargetDate(targetDate);

    // get spatial units metadata to aquire knowledge of existing units
    var spatialUnitsMetadata = await fetchSpatialUnitsMetadata(targetDate);

    var spatialUnitsMap = new Map();
    //iterate over all entries and fill map
    spatialUnitsMetadata.forEach(function(element) {

      var spatialUnitId = spatialUnitsMetadata.spatialUnitId;
      var spatialunitName = spatialUnitsMetadata.spatialUnitLevel;
      var spatialUnit_geoJSON = await fetchSpatialUnitById(baseUrlPath, spatialUnitId, targetDate);

      spatialUnitsMap.set(spatialunitName, spatialUnit_geoJSON);
    });
    return spatialUnitsMap;
  }

/**
 * send request against KomMonitor DataManagement API to fetch all available spatial units as a map
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch spatial unit
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 *
 * returns spatial units as a map containing all units, wheres key='meaningful name of the spatial unit' and value='features as GeoJSON string'
 **/
exports.fetchAvailableSpatialUnits = fetchAvailableSpatialUnits;

/**
 * send request against KomMonitor DataManagement API to fetch georesource according to id
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch georesource
 * georesourceId String unique identifier of the georesource
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 *
 * returns georesource as GeoJSON string
 **/
exports.fetchGeoresourceById = function(baseUrlPath, georesourceId, targetDate) {
  console.log("fetching georesource from KomMonitor data management API for id " + georesourceId + " and targetDate " + targetDate);

  var year = targetDateHelper.getYearFromTargetDate(targetDate);
  var month = targetDateHelper.getMonthFromTargetDate(targetDate);
  var day = targetDateHelper.getDayFromTargetDate(targetDate);

  //GET /georesources/{georesouceId}/{year}/{month}/{day}
  axios.get(baseUrlPath + "/georesources/" + georesourceId + "/" + year + "/" + month + "/" + day)
    .then(response => {
      // response.data should be the respective GeoJSON as String
      return response.data;
    })
    .catch(error => {
      console.log("Error when fetching georesource. Error was: " + error);
    });
}

/**
 * send request against KomMonitor DataManagement API to fetch georesource metadata according to id
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch georesource
 * georesourceId String unique identifier of the georesource
 *
 * returns georesource metadata
 **/
exports.fetchGeoresourceMetadataById = function(baseUrlPath, georesourceId) {
  console.log("fetching georesource metadata from KomMonitor data management API for id " + georesourceId);

  //GET /georesources/{georesouceId}
  axios.get(baseUrlPath + "/georesources/" + georesourceId)
    .then(response => {
      // response.data should be the respective georesource metadata JSON object
      return response.data;
    })
    .catch(error => {
      console.log("Error when fetching georesource metadata. Error was: " + error);
    });
}

/**
 * send request against KomMonitor DataManagement API to fetch georesources according to ids
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance.
 * georesourceIds String array of unique identifiers of the georesources
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 *
 * returns georesources as a map containing all georesources, wheres key='meaningful name of the georesource' and value='georesource as GeoJSON string'
 **/
exports.fetchGeoresourcesByIds = function(baseUrlPath, georesourceIds, targetDate) {
  console.log("fetching georesources from KomMonitor data management API as a map object");

  var georesourcesMap = new Map();

  georesourceIds.forEach(function(georesourceId) {
    var georesourceMetadata = fetchGeoresourceMetadataById(baseUrlPath, georesourceId);
    var georesourceName = georesourceMetadata.datasetName;
    var georesource_geojsonString = fetchGeoresourceById(baseUrlPath, georesourceId, targetDate);
    georesourcesMap.set(georesourceName, georesource_geojsonString);
  });

  return georesourcesMap;
}

/**
 * send request against KomMonitor DataManagement API to fetch indicator according to id
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch indicator
 * indicatorId String unique identifier of the indicator
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 * targetSpatialUnitId String unique identifier of the target spatial unit
 *
 * returns indicator as GeoJSON string
 **/
exports.fetchIndicatorById = function(baseUrlPath, indicatorId, targetDate, targetSpatialUnitId) {
  console.log("fetching indicator from KomMonitor data management API for id " + indicatorId + " and targetDate " + targetDate + " and targetSpatialUnitId " + targetSpatialUnitId);

  var year = targetDateHelper.getYearFromTargetDate(targetDate);
  var month = targetDateHelper.getMonthFromTargetDate(targetDate);
  var day = targetDateHelper.getDayFromTargetDate(targetDate);

  //GET /indicators/{indicatorId}/{year}/{month}/{day}
  axios.get(baseUrlPath + "/indicators/" + indicatorId + "/" + year + "/" + month + "/" + day)
    .then(response => {
      // response.data should be the respective GeoJSON as String
      return response.data;
    })
    .catch(error => {
      console.log("Error when fetching indicator. Error was: " + error);
    });
}

/**
 * send request against KomMonitor DataManagement API to fetch indicator metadata according to id
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch indicator
 * indicatorId String unique identifier of the indicator
 *
 * returns indicator metadata
 **/
exports.fetchIndicatorMetadataById = function(baseUrlPath, indicatorId) {
  console.log("fetching indicator metadata from KomMonitor data management API for id " + indicatorId);

  //GET /indicators/{indicatorId}
  axios.get(baseUrlPath + "/indicators/" + indicatorId)
    .then(response => {
      // response.data should be the respective indicator metadata JSON object
      return response.data;
    })
    .catch(error => {
      console.log("Error when fetching georesource metadata. Error was: " + error);
    });
}

/**
 * send request against KomMonitor DataManagement API to fetch indicators according to ids
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance.
 * indicatorIds String array of unique identifiers of the indicators
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 * targetSpatialUnitId String unique identifier of the target spatial unit
 *
 * returns indicators as a map containing all indicators, wheres key='meaningful name of the indicator' and value='indicator as GeoJSON string'
 **/
exports.fetchIndicatorsByIds = function(baseUrlPath, indicatorIds, targetDate, targetSpatialUnitId) {
  console.log("fetching indicators from KomMonitor data management API as a map object");

  var indicatorsMap = new Map();

  indicatorIds.forEach(function(indicatorId) {
    var indicatorMetadata = fetchIndicatorMetadataById(baseUrlPath, indicatorId);
    var indicatorName = indicatorMetadata.datasetName;
    var indicator_geojsonString = fetchIndicatorById(baseUrlPath, indicatorId, targetDate, targetSpatialUnitId);
    indicatorsMap.set(indicatorName, indicator_geojsonString);
  });

  return indicatorsMap;
}
