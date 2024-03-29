'use strict';

 // axios os used to execute HTTP requests in a Promise-based manner
 const axios = require("axios");

 const targetDateHelper = require("./TargetDateHelperService");
 const encryptionHelper = require("./EncryptionHelperService");
 var keycloakHelper = require("kommonitor-keycloak-helper");
 keycloakHelper.initKeycloakHelper(process.env.KEYCLOAK_AUTH_SERVER_URL, process.env.KEYCLOAK_REALM, process.env.KEYCLOAK_RESOURCE, process.env.KEYCLOAK_CLIENT_SECRET, process.env.KEYCLOAK_ADMIN_RIGHTS_USER_NAME, process.env.KEYCLOAK_ADMIN_RIGHTS_USER_PASSWORD, process.env.KOMMONITOR_ADMIN_ROLENAME);


 const KmHelper = require("../resources/KmHelper");

 const simplifyGeometryParameterName = process.env.GEOMETRY_SIMPLIFICATION_PARAMETER_NAME;
 const simplifyGeometryParameterValue = process.env.GEOMETRY_SIMPLIFICATION_PARAMETER_VALUE;
 const simplifyGeometriesParameterQueryString = simplifyGeometryParameterName + "=" + simplifyGeometryParameterValue;

/**
 * send request against KomMonitor DataManagement API to fetch scriptCode acording to id
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch script
 * scriptId String unique identifier of the script containing NodeJS code
 *
 * returns script code of a NodeJS module as string
 **/
exports.fetchScriptCodeById = async function(baseUrlPath, scriptId) {
  KmHelper.log("fetching script code from KomMonitor data management API for id " + scriptId);

  var config = await keycloakHelper.requestAccessToken();

  //GET /process-scripts/{scriptId}/scriptCode
  return await axios.get(baseUrlPath + "/process-scripts/" + scriptId + "/scriptCode", config)
    .then(response => {
      // response.data should be the script as byte[]
      response = encryptionHelper.decryptAPIResponseIfRequired(response);
      return response.data;
    })
    .catch(error => {
      KmHelper.logError("Error when fetching script code. Error was: " + error);
      throw error;
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
exports.fetchSpatialUnitById = async function(baseUrlPath, spatialUnitId, targetDate) {
  KmHelper.log("fetching spatial unit from KomMonitor data management API for id " + spatialUnitId + " and targetDate " + targetDate);

  var config = await keycloakHelper.requestAccessToken();

  var year = targetDateHelper.getYearFromTargetDate(targetDate);
  var month = targetDateHelper.getMonthFromTargetDate(targetDate);
  var day = targetDateHelper.getDayFromTargetDate(targetDate);

  //GET /spatial-units/{spatialUnitId}/{year}/{month}/{day}
  return await axios.get(baseUrlPath + "/spatial-units/" + spatialUnitId + "/" + year + "/" + month + "/" + day + "?" + simplifyGeometriesParameterQueryString, config)
    .then(response => {
      // response.data should be the respective GeoJSON as String
      response = encryptionHelper.decryptAPIResponseIfRequired(response);
      return response.data;
    })
    .catch(error => {
      KmHelper.logError("Error when fetching spatial unit. Error was: " + error);
      throw error;
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
exports.fetchSpatialUnitsMetadata = async function(baseUrlPath, targetDate) {
  KmHelper.log("fetching available spatial units metadata from KomMonitor data management API for targetDate " + targetDate);

  var config = await keycloakHelper.requestAccessToken();

  var year = targetDateHelper.getYearFromTargetDate(targetDate);
  var month = targetDateHelper.getMonthFromTargetDate(targetDate);
  var day = targetDateHelper.getDayFromTargetDate(targetDate);

  //GET /spatial-units
  return await axios.get(baseUrlPath + "/spatial-units", config)
    .then(response => {
      // response.data should be the respective array of metadata entries as JSON
      response = encryptionHelper.decryptAPIResponseIfRequired(response);
      return response.data;
    })
    .catch(error => {
      KmHelper.logError("Error when fetching spatial units metadata. Error was: " + error);
      throw error;
    });
}

/**
 * send request against KomMonitor DataManagement API to fetch all available spatial units as a map
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch spatial unit
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 *
 * returns spatial units as a map containing all units, wheres key='metadata object holding all metadata properties' and value='features as GeoJSON string'
 **/
  async function fetchAvailableSpatialUnits(baseUrlPath, targetDate) {
    KmHelper.log("fetching available spatial units from KomMonitor data management API for targetDate " + targetDate);

    var year = targetDateHelper.getYearFromTargetDate(targetDate);
    var month = targetDateHelper.getMonthFromTargetDate(targetDate);
    var day = targetDateHelper.getDayFromTargetDate(targetDate);

    // get spatial units metadata to aquire knowledge of existing units
    var spatialUnitsMetadata;
    try{
      spatialUnitsMetadata = await exports.fetchSpatialUnitsMetadata(baseUrlPath, targetDate);
    }
    catch(error){
      throw error;
    }


    var spatialUnitsMap = new Map();
    //iterate over all entries and fill map
    try{
      for (const spatialUnitMetadata of spatialUnitsMetadata){

        var spatialUnitId = spatialUnitMetadata.spatialUnitId;
        var spatialUnit_geoJSON;
        try{
          spatialUnit_geoJSON = await exports.fetchSpatialUnitById(baseUrlPath, spatialUnitId, targetDate);
        }
        catch(error){
          throw error;
        }

        spatialUnitsMap.set(spatialUnitMetadata, spatialUnit_geoJSON);
      };
    }
    catch(error){
      throw error;
    }
    return spatialUnitsMap;
  }

  function findIndexByAttributeValue(array, attributeName, attributeValue) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attributeName] === attributeValue) {
            return i;
        }
    }
    return -1;
  }

  /**
   * send request against KomMonitor DataManagement API to fetch the submitted targetSpatialUnit and all higher spatial units as a map
   *
   * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch spatial unit
   * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
   * targetSpatialUnitName String the name of the targetSpatialUnit level
   *
   * returns spatial units as a map containing all units, wheres key='metadata object holding all metadata properties' and value='features as GeoJSON string'
   **/
     exports.fetchTargetSpatialUnitAndHigher = async function(baseUrlPath, targetDate, targetSpatialUnitName) {
      KmHelper.log("fetching available spatial units from KomMonitor data management API for targetDate " + targetDate);

      var year = targetDateHelper.getYearFromTargetDate(targetDate);
      var month = targetDateHelper.getMonthFromTargetDate(targetDate);
      var day = targetDateHelper.getDayFromTargetDate(targetDate);

      // get spatial units metadata to aquire knowledge of existing units
      var spatialUnitsMetadata;
      try{
        spatialUnitsMetadata = await exports.fetchSpatialUnitsMetadata(baseUrlPath, targetDate);
      }
      catch(error){
        throw error;
      }

      // filter the returned list of spatialUnitsMetadata objects and remove those that do not fulfill the criteria "be the target spatial unit or be a higher level"
      // make us of the fact that KomMonitor data API returns a sorted list, where spatial units are sorted in decreasing order (beginning with the highest less detailed level)
      // hence we may inspect the index of the target unit and simply remove all units that come after that index
      var indexOfTargetUnit = findIndexByAttributeValue(spatialUnitsMetadata, "spatialUnitLevel", targetSpatialUnitName);
      spatialUnitsMetadata.length = indexOfTargetUnit + 1; // this will remove all trailing elements after index

      var spatialUnitsMap = new Map();
      //iterate over all entries and fill map
      try{
        for (const spatialUnitMetadata of spatialUnitsMetadata){

          var spatialUnitId = spatialUnitMetadata.spatialUnitId;
          var spatialUnit_geoJSON;
          try{
            spatialUnit_geoJSON = await exports.fetchSpatialUnitById(baseUrlPath, spatialUnitId, targetDate);
          }
          catch(error){
            // throw error;
            KmHelper.logError("Error while fetching spatial unit for target date '" + targetDate + "'. Error was \n" + error);
          }

          spatialUnitsMap.set(spatialUnitMetadata, spatialUnit_geoJSON);
        };
      }
      catch(error){
        throw error;
      }
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
exports.fetchGeoresourceById = async function(baseUrlPath, georesourceId, targetDate) {
  KmHelper.log("fetching georesource from KomMonitor data management API for id " + georesourceId + " and targetDate " + targetDate);

  var year = targetDateHelper.getYearFromTargetDate(targetDate);
  var month = targetDateHelper.getMonthFromTargetDate(targetDate);
  var day = targetDateHelper.getDayFromTargetDate(targetDate);

  var config = await keycloakHelper.requestAccessToken();

  //GET /georesources/{georesouceId}/{year}/{month}/{day}
  return await axios.get(baseUrlPath + "/georesources/" + georesourceId + "/" + year + "/" + month + "/" + day + "?" + simplifyGeometriesParameterQueryString, config)
    .then(response => {
      // response.data should be the respective GeoJSON as String
      response = encryptionHelper.decryptAPIResponseIfRequired(response);
      return response.data;
    })
    .catch(error => {
      KmHelper.logError("Error when fetching georesource. Error was: " + error);
      KmHelper.logError("Send back empty FeatureCollection of georesource");
      throw error;
    });
};

/**
 * send request against KomMonitor DataManagement API to fetch georesource metadata according to id
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch georesource
 * georesourceId String unique identifier of the georesource
 *
 * returns georesource metadata
 **/
exports.fetchGeoresourceMetadataById = async function(baseUrlPath, georesourceId) {
  KmHelper.log("fetching georesource metadata from KomMonitor data management API for id " + georesourceId);

  var config = await keycloakHelper.requestAccessToken();

  //GET /georesources/{georesouceId}
  return await axios.get(baseUrlPath + "/georesources/" + georesourceId, config)
    .then(response => {
      // response.data should be the respective georesource metadata JSON object
      response = encryptionHelper.decryptAPIResponseIfRequired(response);
      return response.data;
    })
    .catch(error => {
      KmHelper.logError("Error when fetching georesource metadata. Error was: " + error);
      throw error;
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
exports.fetchGeoresourcesByIds = async function(baseUrlPath, georesourceIds, targetDate) {
  KmHelper.log("fetching georesources from KomMonitor data management API as a map object");

  var georesourcesMap = new Map();

  try{
    for (const georesourceId of georesourceIds){
      var georesourceMetadata;
      var georesource_geojsonString;
      try{
        georesourceMetadata = await exports.fetchGeoresourceMetadataById(baseUrlPath, georesourceId);
        georesource_geojsonString = await exports.fetchGeoresourceById(baseUrlPath, georesourceId, targetDate);
      }
      catch(error){
        throw error;
      }

      var georesourceName = georesourceMetadata.datasetName;
      var georesourceIdKey = georesourceMetadata.georesourceId;
      georesourcesMap.set(georesourceName, georesource_geojsonString);
      georesourcesMap.set(georesourceIdKey, georesource_geojsonString);
    };
  }
  catch(error){
    throw error;
  }

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
exports.fetchIndicatorById = async function(baseUrlPath, indicatorId, targetDate, targetSpatialUnitId) {
  KmHelper.log("fetching indicator from KomMonitor data management API for id " + indicatorId + " and targetDate " + targetDate + " and targetSpatialUnitId " + targetSpatialUnitId);

  var year = targetDateHelper.getYearFromTargetDate(targetDate);
  var month = targetDateHelper.getMonthFromTargetDate(targetDate);
  var day = targetDateHelper.getDayFromTargetDate(targetDate);

  var config = await keycloakHelper.requestAccessToken();

  //GET /indicators/{indicatorId}/{targetSpatialUnitId}/{year}/{month}/{day}
  return await axios.get(baseUrlPath + "/indicators/" + indicatorId + "/" + targetSpatialUnitId + "/" + year + "/" + month + "/" + day + "?" + simplifyGeometriesParameterQueryString, config)
    .then(response => {
      // response.data should be the respective GeoJSON as String
      response = encryptionHelper.decryptAPIResponseIfRequired(response);
      return response.data;
    })
    .catch(error => {
      KmHelper.logError("Error when fetching indicator. Error was: " + error);
      throw error;
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
exports.fetchIndicatorMetadataById = async function(baseUrlPath, indicatorId) {
  KmHelper.log("fetching indicator metadata from KomMonitor data management API for id " + indicatorId);

  KmHelper.log("Perform GET request against: " + baseUrlPath + "/indicators/" + indicatorId);

  var config = await keycloakHelper.requestAccessToken();

  //GET /indicators/{indicatorId}
  return await axios.get(baseUrlPath + "/indicators/" + indicatorId, config)
    .then(response => {
      // response.data should be the respective indicator metadata JSON object
      response = encryptionHelper.decryptAPIResponseIfRequired(response);
      KmHelper.log("got indicatorMetadata response object: " + response);
      KmHelper.log("Response has status: " + response.status);
      KmHelper.log("Response has data: " + response.data);
      return response.data;
    })
    .catch(error => {
      KmHelper.logError("Error when fetching indicator metadata. Error was: " + error);
      throw error;
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
exports.fetchIndicatorsByIds = async function(baseUrlPath, indicatorIds, targetDate, targetSpatialUnitId) {
  KmHelper.log("fetching indicators from KomMonitor data management API as a map object");

  var indicatorsMap = new Map();

  try{
    for (const indicatorId of indicatorIds){
      var indicatorMetadata;
      var indicator_geojsonString;
      try{
        indicatorMetadata = await exports.fetchIndicatorMetadataById(baseUrlPath, indicatorId);
        KmHelper.log("Fetched indicatorMetadata: " + indicatorMetadata);
        indicator_geojsonString = await exports.fetchIndicatorById(baseUrlPath, indicatorId, targetDate, targetSpatialUnitId);
      }
      catch (error){
        KmHelper.logError("Something went wrong when featching indicators by Ids. Error message: " + error.message);
        throw error;
      }
      var indicatorName = indicatorMetadata.indicatorName;
      var indicatorIdKey = indicatorMetadata.indicatorId;
      indicatorsMap.set(indicatorName, indicator_geojsonString);
      indicatorsMap.set(indicatorIdKey, indicator_geojsonString);
    };
  }
  catch(error){
      throw error;
  }

  return indicatorsMap;
}
