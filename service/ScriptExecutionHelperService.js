'use strict';

var KomMonitorDataFetcher = require('./KomMonitorDataFetcherService');
var KomMonitorIndicatorPersister = require('./KomMonitorIndicatorPersistanceService');
// module for reading/writing from/to hard drive
var fs = require("fs");
var dns = require("dns");
var tmp = require("temporary");
var progressHelper = require("./progressHelperService");

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

  for (const spatialUnitCandidate of allSpatialUnits) {
    // check if units propertyValue "nextLowerHierarchyLevel" is == null || undefined
    // then this is the searched lowest spatial unit
    var nextLowerHierarchyLevelPropertyValue = spatialUnitCandidate[0].nextLowerHierarchyLevel;
    if(nextLowerHierarchyLevelPropertyValue == null || nextLowerHierarchyLevelPropertyValue == undefined)
      return spatialUnitCandidate;
  }
}

async function appendIndicatorsGeoJSONForRemainingSpatialUnits(remainingSpatialUnits, resultingIndicatorsMap, idOfLowestSpatialUnit, targetDate, nodeModuleForIndicator){
  // first entry of resultingIndicatorsMap contains the computed indicator for the lowest spatial unit
  var indicatorOnLowestSpatialUnit_geoJson = resultingIndicatorsMap.get(idOfLowestSpatialUnit);

  // elements of remainingSpatialUnits are map items where key='metadata object holding all metadata properties' and value='features as GeoJSON string'
  console.log("start to aggregate indicators for upper spatial unit hierarchy levels.");

  for (const spatialUnitEntry of remainingSpatialUnits) {

    // create a deep copy of the javascript object. it will have no refererences to the original Object
    // this is necessary as we intend to remove content within the computation script --> hence we need only a copy!!!
    let indicatorOnLowestSpatialUnit_geoJson_copy = JSON.parse(JSON.stringify(indicatorOnLowestSpatialUnit_geoJson));

    // looks like Array [key, value]
    var targetSpatialUnitId = spatialUnitEntry[0].spatialUnitId;

    var targetSpatialUnitGeoJson;
    console.log("fetch spatialUnit as geoJSON with id " + targetSpatialUnitId + " for targetDate " + targetDate + " from dataManagement API for defaultIndicatorComputation.");

    try{
      targetSpatialUnitGeoJson = await KomMonitorDataFetcher.fetchSpatialUnitById(kommonitorDataManagementURL, targetSpatialUnitId, targetDate);
    }
    catch(error){
      console.error("Error while fetching spatialUnit with id " + targetSpatialUnitId + " for targetDate " + targetDate + " within dataManagement API for defaultIndicatorComputation. Error is: " + error);
      throw error;
    }

    //TODO FIXME use direct lower spatial unit instead of lowest for better performance?
    console.log("Aggregating indicator on targetSpatialUnit with id " + targetSpatialUnitId);

    var indicatorGeoJSONForSpatialUnit;
    try{
      indicatorGeoJSONForSpatialUnit = nodeModuleForIndicator.aggregateIndicator(targetDate, targetSpatialUnitGeoJson, indicatorOnLowestSpatialUnit_geoJson_copy);
    }
    catch(error){
      console.error("Error while aggregating indicator for targetSpatialUnit with id " + targetSpatialUnitId + ". Error is: " + error);
      throw error;
    }

    resultingIndicatorsMap.set(spatialUnitEntry[0], indicatorGeoJSONForSpatialUnit);
  }

  return resultingIndicatorsMap;
}

async function executeDefaultComputation(job, scriptId, targetIndicatorId, targetDate, baseIndicatorIds, georesourceIds, defaultProcessProperties){

    try {
      var scriptCodeAsByteArray;
      var georesourcesMap;
      var allSpatialUnits;
      var targetIndicatorMetadata;
      try{
        scriptCodeAsByteArray = await KomMonitorDataFetcher.fetchScriptCodeById(kommonitorDataManagementURL, scriptId);
        progressHelper.persistProgress(job.id, "defaultComputation", 20);
        georesourcesMap = await KomMonitorDataFetcher.fetchGeoresourcesByIds(kommonitorDataManagementURL, georesourceIds, targetDate);
        progressHelper.persistProgress(job.id, "defaultComputation", 30);
        allSpatialUnits = await KomMonitorDataFetcher.fetchAvailableSpatialUnits(kommonitorDataManagementURL, targetDate);
        progressHelper.persistProgress(job.id, "defaultComputation", 40);
        targetIndicatorMetadata = await KomMonitorDataFetcher.fetchIndicatorMetadataById(kommonitorDataManagementURL, targetIndicatorId);
        progressHelper.persistProgress(job.id, "defaultComputation", 50);
      }
      catch(error){
        console.log("Error while fetching resources from dataManagement API for defaultIndicatorComputation. Error is: " + error);
        throw error;
      }

      // will look like Array [metadataObject, geoJSON]
      var lowestSpatialUnit = identifyLowestSpatialUnit(allSpatialUnits);

      // delete lowestSpatialUnit from map object and create a new var holding the remaining entries
      allSpatialUnits.delete(lowestSpatialUnit[0]);
      var remainingSpatialUnits = allSpatialUnits;

      // retrieve baseIndicators for initial (lowest) spatial unit
      var baseIndicatorsMap_lowestSpatialUnit;
      try{
        baseIndicatorsMap_lowestSpatialUnit = await KomMonitorDataFetcher.fetchIndicatorsByIds(kommonitorDataManagementURL, baseIndicatorIds, targetDate, lowestSpatialUnit[0].spatialUnitId);
      }
      catch(error){
        console.error("Error while fetching baseIndicators for lowestSpatialUnit from dataManagement API for defaultIndicatorComputation. Error is: " + error);
        throw error;
      }
      progressHelper.persistProgress(job.id, "defaultComputation", 60);

      // require the script code as new NodeJS module
      fs.writeFileSync("./tmp/tmp.js", scriptCodeAsByteArray);
      var nodeModuleForIndicator = require("../tmp/tmp.js");
      // var nodeModuleForIndicator = require("../resources/kommonitor-node-module_wachstumsstressBeispiel.js");

      //execute script to compute indicator
      var indicatorGeoJson_lowestSpatialUnit = nodeModuleForIndicator.computeIndicator(targetDate, lowestSpatialUnit[1], baseIndicatorsMap_lowestSpatialUnit, georesourcesMap, defaultProcessProperties);

      // result map containing entries where key="spatialUnitMetadataObject" and value="computed indicator GeoJSON"
      var resultingIndicatorsMap = new Map();
      resultingIndicatorsMap.set(lowestSpatialUnit[0], indicatorGeoJson_lowestSpatialUnit);

      progressHelper.persistProgress(job.id, "defaultComputation", 70);

      // after computing the indicator for the lowest spatial unit
      // we can now aggregate the result to all remaining superior units!
      try{
        resultingIndicatorsMap = await appendIndicatorsGeoJSONForRemainingSpatialUnits(remainingSpatialUnits, resultingIndicatorsMap, lowestSpatialUnit[0], targetDate, nodeModuleForIndicator);
      }
      catch(error){
        console.error("Error while processing indicatorComputation for remaining spatialUnits for defaultIndicatorComputation. Error is: " + error);
        throw error;
      }

      // delete temporarily stored nodeModule file synchronously
      fs.unlinkSync("./tmp/tmp.js");

      progressHelper.persistProgress(job.id, "defaultComputation", 80);

      // after computing the indicator for every spatial unit
      // send PUT requests against KomMonitor data management API to persist results permanently
      var resultArray;
      try{
        resultArray = await KomMonitorIndicatorPersister.putIndicatorForSpatialUnits(kommonitorDataManagementURL, targetIndicatorId, targetIndicatorMetadata.indicatorName, targetDate, resultingIndicatorsMap);

      }
      catch(error){
        console.error("Error while persisting computed indicators for all spatialUnits within dataManagement API for defaultIndicatorComputation. Error is: " + error);
        throw error;
      }

      progressHelper.persistProgress(job.id, "defaultComputation", 90);

      return resultArray;
    }
    catch(err) {
        console.log("Error during execution of defaultIndicatorComputation with error: " + err);
        throw err;
    }
}

exports.executeDefaultComputation = executeDefaultComputation;

async function executeCustomizedComputation(job, scriptId, targetDate, baseIndicatorIds, georesourceIds, targetSpatialUnitId, customProcessProperties){

    try {
      var scriptCodeAsByteArray;
      var baseIndicatorsMap;
      var georesourcesMap;
      var targetSpatialUnit_geoJSON;

      try{
        scriptCodeAsByteArray = await KomMonitorDataFetcher.fetchScriptCodeById(kommonitorDataManagementURL, scriptId);
        // job.data.progress = 20;
        progressHelper.persistProgress(job.id, "customizedComputation", 20);
        baseIndicatorsMap = await KomMonitorDataFetcher.fetchIndicatorsByIds(kommonitorDataManagementURL, baseIndicatorIds, targetDate, targetSpatialUnitId);
        // job.data.progress = 30;
        progressHelper.persistProgress(job.id, "customizedComputation", 30);
        georesourcesMap = await KomMonitorDataFetcher.fetchGeoresourcesByIds(kommonitorDataManagementURL, georesourceIds, targetDate);
        // job.data.progress = 40;
        progressHelper.persistProgress(job.id, "customizedComputation", 40);
        targetSpatialUnit_geoJSON = await KomMonitorDataFetcher.fetchSpatialUnitById(kommonitorDataManagementURL, targetSpatialUnitId, targetDate);
        // job.data.progress = 50;
        progressHelper.persistProgress(job.id, "customizedComputation", 50);
      }
      catch(error){
        console.log("Error while fetching resources from dataManagement API for customizedIndicatorComputation. Error is: " + error);
        throw error;
      }

      // require the script code as new NodeJS module
      fs.writeFileSync("./tmp/tmp.js", scriptCodeAsByteArray);
      var nodeModuleForIndicator = require("../tmp/tmp.js");
      // var nodeModuleForIndicator = require("../resources/kommonitor-node-module_wachstumsstressBeispiel.js");

      // job.data.progress = 60;
      progressHelper.persistProgress(job.id, "customizedComputation", 60);

      //execute script to compute indicator
      var responseGeoJson = nodeModuleForIndicator.computeIndicator(targetDate, targetSpatialUnit_geoJSON, baseIndicatorsMap, georesourcesMap, customProcessProperties);

      // job.data.progress = 90;
      progressHelper.persistProgress(job.id, "customizedComputation", 90);

      // delete temporarily stored nodeModule file synchronously
      fs.unlinkSync("./tmp/tmp.js");

      return responseGeoJson;
    }
    catch(err) {
        console.log("Error during execution of customizedIndicatorComputation with error: " + err);
        throw err;
    }
}

exports.executeCustomizedComputation = executeCustomizedComputation;
