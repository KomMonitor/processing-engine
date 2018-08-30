'use strict';

var KomMonitorDataFetcher = require('./KomMonitorDataFetcherService');
var KomMonitorIndicatorPersister = require('./KomMonitorIndicatorPersistanceService');
// module for reading/writing from/to hard drive
var fs = require("fs");
var dns = require("dns");
var tmp = require("temporary");

// aquire connection details to KomMonitor data management api instance from environment variables
const kommonitorDataManagementHost = process.env.KOMMONITOR_DATA_MANAGEMENT_HOST;
const kommonitorDataManagementPort = process.env.KOMMONITOR_DATA_MANAGEMENT_PORT;
const kommonitorDataManagementBasepath = process.env.KOMMONITOR_DATA_MANAGEMENT_BASEPATH;

dns.lookup(kommonitorDataManagementHost, console.log);

// construct fixed starting URL to make requests against running KomMonitor data management api
const kommonitorDataManagementURL = "http://" + kommonitorDataManagementHost + ":" + kommonitorDataManagementPort + kommonitorDataManagementBasepath;

console.log("created the following base URL path to connect to KomMonitor Data Management API: " + kommonitorDataManagementURL);

function identifyLowestSpatialUnit(allSpatialUnits){
  var lowestSpatialUnit = null;

  //iterator syntax exmple
  // var iterator1 = map1[Symbol.iterator]();
  //
  // for (let item of iterator1) {
  //   console.log(item);
  //   // expected output: Array ["0", "foo"]
  //   // expected output: Array [1, "bar"]
  // }

  var iterator = allSpatialUnits[Symbol.iterator]();
  for (let spatialUnitCandidate of iterator) {
    // check if units propertyValue "nextLowerHierarchyLevel" is == null || undefined
    // then this is the searched lowest spatial unit
    var nextLowerHierarchyLevelPropertyValue = spatialUnitCandidate[0].nextLowerHierarchyLevel;
    if(nextLowerHierarchyLevelPropertyValue == null || nextLowerHierarchyLevelPropertyValue == undefined)
      return spatialUnitCandidate;
  }
}

function appendIndicatorsGeoJSONForRemainingSpatialUnits(remainingSpatialUnits, resultingIndicatorsMap, idOfLowestSpatialUnit, targetDate, nodeModuleForIndicator){
  // first entry of resultingIndicatorsMap contains the computed indicator for the lowest spatial unit
  var indicatorOnLowestSpatialUnit_geoJson = resultingIndicatorsMap.get(idOfLowestSpatialUnit);

  // elements of remainingSpatialUnits are map items where key='metadata object holding all metadata properties' and value='features as GeoJSON string'
  var spatialUnitIterator = remainingSpatialUnits[Symbol.iterator]();

  for (let spatialUnitEntry of spatialUnitIterator) {
    // looks like Array [key, value]
    var targetSpatialUnitId = spatialUnitEntry[0].spatialUnitId;

    var targetSpatialUnitGeoJson = KomMonitorDataFetcher.fetchSpatialUnitById(kommonitorDataManagementURL, targetSpatialUnitId, targetDate);

    var indicatorGeoJSONForSpatialUnit = nodeModuleForIndicator.aggregateIndicator(targetDate, targetSpatialUnitGeoJson, indicatorOnLowestSpatialUnit_geoJson);

    resultingIndicatorsMap.set(targetSpatialUnitId, indicatorGeoJSONForSpatialUnit);
  }

  return resultingIndicatorsMap;
}

function executeDefaultComputation(job, scriptId, targetIndicatorId, targetDate, baseIndicatorIds, georesourceIds, defaultProcessProperties){
  // TODO for each spatial unit perform script execution, receive response GeoJSON and make POST call to data management API
  // TODO for that compute for the lowest spatial unit and after that aggregate to all superior units!
  // TODO also receive default parameter values for script execution from data management API, should not be part of the script itself
  return new Promise(async function(resolve, reject) {

    try {
      var scriptCodeAsByteArray = await KomMonitorDataFetcher.fetchScriptCodeById(kommonitorDataManagementURL, scriptId);
      var georesourcesMap = await KomMonitorDataFetcher.fetchGeoresourcesByIds(kommonitorDataManagementURL, georesourceIds, targetDate);
      var allSpatialUnits = await KomMonitorDataFetcher.fetchAvailableSpatialUnits(kommonitorDataManagementURL, targetDate);

      // will look like Array [metadataObject, geoJSON]
      var lowestSpatialUnit = identifyLowestSpatialUnit(allSpatialUnits);

      // delete lowestSpatialUnit from map object and create a new var holding the remaining entries
      allSpatialUnits.delete(lowestSpatialUnit[0]);
      var remainingSpatialUnits = allSpatialUnits;

      // retrieve baseIndicators for initial (lowest) spatial unit
      var baseIndicatorsMap_lowestSpatialUnit = await KomMonitorDataFetcher.fetchIndicatorsByIds(kommonitorDataManagementURL, baseIndicatorIds, targetDate, lowestSpatialUnit[0].spatialUnitId);

      var tmpFile = new tmp.File();
      var tmpFilePath = tmpFile.path;

      // require the script code as new NodeJS module
      fs.writeFileSync(tmpFilePath, scriptCodeAsByteArray);
      var nodeModuleForIndicator = require(tmpFilePath);

      //execute script to compute indicator
      var indicatorGeoJson_lowestSpatialUnit = nodeModuleForIndicator.computeIndicator(targetDate, lowestSpatialUnit[1], baseIndicatorsMap_lowestSpatialUnit, georesourcesMap, defaultProcessProperties);

      // result map containing entries where key="spatialUnitId" and value="computed indicator GeoJSON"
      var resultingIndicatorsMap = new Map();
      resultingIndicatorsMap.set(lowestSpatialUnit[0].spatialUnitId, indicatorGeoJson_lowestSpatialUnit);

      // after computing the indicator for the lowest spatial unit
      // we can now aggregate the result to all remaining superior units!
      resultingIndicatorsMap = await appendIndicatorsGeoJSONForRemainingSpatialUnits(remainingSpatialUnits, resultingIndicatorsMap, idOfLowestSpatialUnit, targetDate, nodeModuleForIndicator);

      // delete temporarily stored nodeModule file synchronously
      // fs.unlinkSync("./temporaryNodeModule.js");
      tmpFile.unlink();

      // after computing the indicator for every spatial unit
      // send PUT requests against KomMonitor data management API to persist results permanently
      // TODO implement
      var urlsToPersistedResources = KomMonitorIndicatorPersister.putIndicatorForSpatialUnits(kommonitorDataManagementURL, targetIndicatorId, targetDate, resultingIndicatorsMap);

      resolve(urlsToPersistedResources);
    }
    catch(err) {
        console.log("Error during execution of defaultIndicatorComputation with error: " + err);
        reject(err);
    }
  });
}

exports.executeDefaultComputation = executeDefaultComputation;

function executeCustomizedComputation(job, scriptId, targetDate, baseIndicatorIds, georesourceIds, targetSpatialUnitId, customProcessProperties){
  return new Promise(async function(resolve, reject) {

    try {
      var scriptCodeAsByteArray = await KomMonitorDataFetcher.fetchScriptCodeById(kommonitorDataManagementURL, scriptId);
      var baseIndicatorsMap = await KomMonitorDataFetcher.fetchIndicatorsByIds(kommonitorDataManagementURL, baseIndicatorIds, targetDate, targetSpatialUnitId);
      var georesourcesMap = await KomMonitorDataFetcher.fetchGeoresourcesByIds(kommonitorDataManagementURL, georesourceIds, targetDate);
      var targetSpatialUnit_geoJSON = await KomMonitorDataFetcher.fetchSpatialUnitById(kommonitorDataManagementURL, targetSpatialUnitId, targetDate);

      var tmpFile = new tmp.File();
      var tmpFilePath = tmpFile.path;

      // require the script code as new NodeJS module
      fs.writeFileSync(tmpFilePath, scriptCodeAsByteArray);
      var nodeModuleForIndicator = require(tmpFilePath);

      //execute script to compute indicator
      var responseGeoJson = nodeModuleForIndicator.computeIndicator(targetDate, targetSpatialUnit_geoJSON, baseIndicatorsMap, georesourcesMap, customProcessProperties);

      // delete temporarily stored nodeModule file synchronously
      // fs.unlinkSync(tmpFilePath);
      tmpFile.unlink();

      resolve(responseGeoJson);
    }
    catch(err) {
        console.log("Error during execution of customizedIndicatorComputation with error: " + err);
        reject(err);
    }
  });
}

exports.executeCustomizedComputation = executeCustomizedComputation;
