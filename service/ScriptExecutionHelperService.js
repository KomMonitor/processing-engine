'use strict';

var KomMonitorDataFetcher = require('./KomMonitorDataFetcherService');
// module for reading/writing from/to hard drive
var fs = require("fs");

// aquire connection details to KomMonitor data management api instance from environment variables
const kommonitorDataManagementHost = process.env.KOMMONITOR_DATA_MANAGEMENT_HOST;
const kommonitorDataManagementPort = process.env.KOMMONITOR_DATA_MANAGEMENT_PORT;
const kommonitorDataManagementBasepath = process.env.KOMMONITOR_DATA_MANAGEMENT_BASEPATH;

// construct fixed starting URL to make requests against running KomMonitor data management api
const kommonitorDataManagementURL = kommonitorDataManagementHost + ":" + kommonitorDataManagementPort + kommonitorDataManagementBasepath;

async function executeDefaultComputation(job, scriptId, targetDate, baseIndicatorIds, georesourceIds){
  // TODO for each spatial unit perform script execution, receive response GeoJSON and make POST call to data management API
  // TODO for that compute for the lowest spatial unit and after that aggregate to all superior units!
  // TODO also receive default parameter values for script execution from data management API, should not be part of the script itself
  return new Promise(function(resolve, reject) {

    try {
      var scriptCodeAsString = await KomMonitorDataFetcher.fetchScriptCodeById(kommonitorDataManagementURL, scriptId);
      var baseIndicatorsMap = await KomMonitorDataFetcher.fetchIndicatorsByIds(kommonitorDataManagementURL, baseIndicatorIds, targetDate, "Stadtteilebene");
      var georesourcesMap = await KomMonitorDataFetcher.fetchGeoresourcesByIds(kommonitorDataManagementURL, georesourceIds, targetDate);
      var allSpatialUnits = await KomMonitorDataFetcher.fetchAvailableSpatialUnits(kommonitorDataManagementURL, targetDate);

      var lowestSpatialUnit_geoJSON = "";
      //map of objects
      var superiorSpatialUnits = "";
      var defaultProcesParameters = "";

      // TODO best as map/array of URLs since for each spatial unit a different indicator dataset is computed.
      var urlToCreatedResource = "";
      resolve(urlToCreatedResource);
    }
    catch(err) {
        console.log("Error during execution of defaultIndicatorComputation with error: " + err);
        resolve(err);
    }
  });
}

exports.executeDefaultComputation = executeDefaultComputation;

async function executeCustomizedComputation(job, scriptId, targetDate, baseIndicatorIds, georesourceIds, targetSpatialUnitId, customProcessProperties){
  return new Promise(function(resolve, reject) {

    try {
      var scriptCodeAsString = await KomMonitorDataFetcher.fetchScriptCodeById(kommonitorDataManagementURL, scriptId);
      var baseIndicatorsMap = await KomMonitorDataFetcher.fetchIndicatorsByIds(kommonitorDataManagementURL, baseIndicatorIds, targetDate, spatialUnitId);
      var georesourcesMap = await KomMonitorDataFetcher.fetchGeoresourcesByIds(kommonitorDataManagementURL, georesourceIds, targetDate);
      var targetSpatialUnit_geoJSON = await KomMonitorDataFetcher.fetchSpatialUnitById(kommonitorDataManagementURL, spatialUnitId, targetDate);

      // require the script code as new NodeJS module
      fs.writeFileSync('./temporaryNodeModule.js', scriptCode);
      var nodeModuleForIndicator = require("./temporaryNodeModule.js");

      //execute script to compute indicator
      var responseGeoJson = nodeModuleForIndicator.computeIndicator(targetDate, targetSpatialUnit_geoJSON, baseIndicatorsMap, georesourcesMap, customProcessProperties);

      // delete temporarily stored nodeModule file synchronously
      fs.unlinkSync("./temporaryNodeModule.js");

      resolve(responseGeoJson);
    }
    catch(err) {
        console.log("Error during execution of customizedIndicatorComputation with error: " + err);
        resolve(err);
    }
  });
}

exports.executeCustomizedComputation = executeCustomizedComputation;
