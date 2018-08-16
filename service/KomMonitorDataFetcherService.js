'use strict';

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

  //TODO implment
  var scriptCodeAsString = "";
  return scriptCodeAsString;
}

/**
 * send request against KomMonitor DataManagement API to fetch spatial unit according to id
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch spatial unit
 * spatialUnitId String unique identifier of the spatial unit
 *
 * returns spatial unit as GeoJSON string
 **/
exports.fetchSpatialUnitById = function(baseUrlPath, spatialUnitId) {
  console.log("fetching spatial unit from KomMonitor data management API for id " + spatialUnitId);

  //TODO implment
  var spatialUnit_geojsonString = "";
  return spatialUnit_geojsonString;
}

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

  //TODO implment
  var georesource_geojsonString = "";
  return georesource_geojsonString;
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

  //TODO implment
  var georesource_metadata = "";
  return georesource_metadata;
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

  //TODO implment
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

  //TODO implment
  var indicator_geojsonString = "";
  return indicator_geojsonString;
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

  //TODO implment
  var indicator_metadata = "";
  return indicator_metadata;
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

  //TODO implment
  var indicatorsMap = new Map();

  indicatorIds.forEach(function(indicatorId) {
    var indicatorMetadata = fetchIndicatorMetadataById(baseUrlPath, indicatorId);
    var indicatorName = indicatorMetadata.datasetName;
    var indicator_geojsonString = fetchIndicatorById(baseUrlPath, indicatorId, targetDate, targetSpatialUnitId);
    indicatorsMap.set(indicatorName, indicator_geojsonString);
  });

  return indicatorsMap;
}
