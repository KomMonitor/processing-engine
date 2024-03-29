'use strict';

var KomMonitorDataFetcher = require('./KomMonitorDataFetcherService');
var KomMonitorIndicatorPersister = require('./KomMonitorIndicatorPersistanceService');
// module for reading/writing from/to hard drive
var fs = require("fs");
var progressHelper = require("./ProgressHelperService");

const KmHelper = require("kmhelper");

console.log("created the following base URL path to perform GET requests to KomMonitor Data Management API: " + process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET);
console.log("created the following base URL path to perform CRUD requests to KomMonitor Data Management API: " + process.env.KOMMONITOR_DATA_MANAGEMENT_URL_CRUD);

function identifyLowestSpatialUnit(allSpatialUnits, lowestSpatialUnitForComputationName){

  for (const spatialUnitCandidate of allSpatialUnits) {
    // check if units propertyValue "nextLowerHierarchyLevel" is == null || undefined
    // then this is the searched lowest spatial unit
    if(spatialUnitCandidate[0].spatialUnitLevel === lowestSpatialUnitForComputationName)
      return spatialUnitCandidate;
  }

}

async function appendIndicatorsGeoJSONForRemainingSpatialUnits(remainingSpatialUnits, resultingIndicatorsMap, metadataObject_lowestUnit_string, targetDate, nodeModuleForIndicator){
  // first entry of resultingIndicatorsMap contains the computed indicator for the lowest spatial unit
  var indicatorOnLowestSpatialUnit_geoJson = resultingIndicatorsMap.get(metadataObject_lowestUnit_string);

  // elements of remainingSpatialUnits are map items where key='metadata object holding all metadata properties' and value='features as GeoJSON string'
  KmHelper.log("start to aggregate indicators for upper spatial unit hierarchy levels.");

  for (const spatialUnitEntry of remainingSpatialUnits) {

    var metadataObject_string = JSON.stringify(spatialUnitEntry[0]);

    // create a deep copy of the javascript object. it will have no refererences to the original Object
    // this is necessary as we intend to remove content within the computation script --> hence we need only a copy!!!
    let indicatorOnLowestSpatialUnit_geoJson_copy = JSON.parse(JSON.stringify(indicatorOnLowestSpatialUnit_geoJson));

    // looks like Array [key, value]
    var targetSpatialUnitId = spatialUnitEntry[0].spatialUnitId;

    var targetSpatialUnitGeoJson;
    KmHelper.log("fetch spatialUnit as geoJSON with id " + targetSpatialUnitId + " for targetDate " + targetDate + " from dataManagement API for defaultIndicatorComputation.");

    try{
      targetSpatialUnitGeoJson = await KomMonitorDataFetcher.fetchSpatialUnitById(process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET, targetSpatialUnitId, targetDate);
    }
    catch(error){
      KmHelper.logError("Error while fetching spatialUnit with id " + targetSpatialUnitId + " for targetDate " + targetDate + " from dataManagement API for defaultIndicatorComputation. Error is: " + error);
      KmHelper.logError("Error while computing indicator for targetSpatialUnit with id " + targetSpatialUnitId);
      KmHelper.logError("Remaining spatial unit computation will continue."); 
      progressHelper.addFailedSpatialUnitIntegration(spatialUnitEntry[0], "Error while fetching spatialUnit with id " + targetSpatialUnitId + " for targetDate " + targetDate + " from dataManagement API", error); 
    }

    //TODO FIXME use direct lower spatial unit instead of lowest for better performance?
    KmHelper.log("Aggregating indicator on targetSpatialUnit with id " + targetSpatialUnitId);

    if(targetSpatialUnitGeoJson){
      var indicatorGeoJSONForSpatialUnit;
      try{
        indicatorGeoJSONForSpatialUnit = nodeModuleForIndicator.aggregateIndicator(targetDate, targetSpatialUnitGeoJson, indicatorOnLowestSpatialUnit_geoJson_copy);
      }
      catch(error){
        KmHelper.logError("Error while aggregating indicator for targetSpatialUnit with id " + targetSpatialUnitId + ". Error is: " + error);
        KmHelper.logError("Error while computing indicator for targetSpatialUnit with id " + targetSpatialUnitId);
        KmHelper.logError("Remaining spatial unit computation will continue."); 
        progressHelper.addFailedSpatialUnitIntegration(spatialUnitEntry[0], "Error while aggregating indicator for targetSpatialUnit with id " + targetSpatialUnitId, error);
      }

      if(resultingIndicatorsMap.has(metadataObject_string)){
        var existingGeoJSON = resultingIndicatorsMap.get(metadataObject_string);
        existingGeoJSON = appendIndicatorValuesForDate(existingGeoJSON, indicatorGeoJSONForSpatialUnit, targetDate);
        resultingIndicatorsMap.set(metadataObject_string, existingGeoJSON); 
      }
      else{
        resultingIndicatorsMap.set(metadataObject_string, indicatorGeoJSONForSpatialUnit); 
      }
    }
    
  }

  return resultingIndicatorsMap;
}

async function executeDefaultComputation(job, scriptId, targetIndicatorId, targetDates, baseIndicatorIds, georesourceIds, defaultProcessProperties, useAggregationForHigherSpatialUnits){

  if (useAggregationForHigherSpatialUnits){
    return await executeDefaultComputation_withAggregationToHigherSpatialUnits(job, scriptId, targetIndicatorId, targetDates, baseIndicatorIds, georesourceIds, defaultProcessProperties);
  }
  else{
    return await executeDefaultComputation_withIndividualComputationPerSpatialUnit(job, scriptId, targetIndicatorId, targetDates, baseIndicatorIds, georesourceIds, defaultProcessProperties);
    
  }
}

exports.executeDefaultComputation = executeDefaultComputation;

async function executeDefaultComputation_withAggregationToHigherSpatialUnits (job, scriptId, targetIndicatorId, targetDates, baseIndicatorIds, georesourceIds, defaultProcessProperties){
  try {
    var scriptCodeAsByteArray;
    var georesourcesMap;
    var allSpatialUnits;
    var targetIndicatorMetadata;
    var lowestSpatialUnitForComputationName;
    try{
      scriptCodeAsByteArray = await KomMonitorDataFetcher.fetchScriptCodeById(process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET, scriptId);
      progressHelper.persistJobProgress(job.id, "defaultComputation", 20);
      targetIndicatorMetadata = await KomMonitorDataFetcher.fetchIndicatorMetadataById(process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET, targetIndicatorId);
      progressHelper.persistJobProgress(job.id, "defaultComputation", 40);
      lowestSpatialUnitForComputationName = targetIndicatorMetadata.lowestSpatialUnitForComputation;
    }
    catch(error){
      KmHelper.logError("Error while fetching resources from dataManagement API for defaultIndicatorComputation. Error is: " + error);
      throw error;
    }      

    // require the script code as new NodeJS module
    fs.writeFileSync("./tmp/tmp.js", scriptCodeAsByteArray);
    var nodeModuleForIndicator = require("../tmp/tmp.js");
    // var nodeModuleForIndicator = require("../resources/example-scripts/kommonitor-node-module_Distanz_Naheste_Grundschule.js");

    // result map containing entries where key="spatialUnitMetadataObject" and value="computed indicator GeoJSON"
    var resultingIndicatorsMap = new Map();

    for (const targetDate of targetDates) {
      georesourcesMap = await KomMonitorDataFetcher.fetchGeoresourcesByIds(process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET, georesourceIds, targetDate);

      allSpatialUnits = await KomMonitorDataFetcher.fetchTargetSpatialUnitAndHigher(process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET, targetDate, lowestSpatialUnitForComputationName);
     
      // will look like Array [metadataObject, geoJSON]
      var lowestSpatialUnit = identifyLowestSpatialUnit(allSpatialUnits, lowestSpatialUnitForComputationName);

      // delete lowestSpatialUnit from map object and create a new var holding the remaining entries
      allSpatialUnits.delete(lowestSpatialUnit[0]);
      var remainingSpatialUnits = allSpatialUnits;

      // retrieve baseIndicators for initial (lowest) spatial unit
      var baseIndicatorsMap_lowestSpatialUnit;
      try{
        baseIndicatorsMap_lowestSpatialUnit = await KomMonitorDataFetcher.fetchIndicatorsByIds(process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET, baseIndicatorIds, targetDate, lowestSpatialUnit[0].spatialUnitId);
      }
      catch(error){
        KmHelper.logError("Error while fetching baseIndicators for lowestSpatialUnit from dataManagement API for defaultIndicatorComputation. Error is: " + error);
        throw error;
      }
      
      //execute script to compute indicator
      try{
        var indicatorGeoJson_lowestSpatialUnit = await nodeModuleForIndicator.computeIndicator(targetDate, lowestSpatialUnit[1], baseIndicatorsMap_lowestSpatialUnit, georesourcesMap, defaultProcessProperties);

        var metadataObject_lowestUnit_string = JSON.stringify(lowestSpatialUnit[0]);

        if(resultingIndicatorsMap.has(metadataObject_lowestUnit_string)){
          var existingGeoJSON = resultingIndicatorsMap.get(metadataObject_lowestUnit_string);
          existingGeoJSON = appendIndicatorValuesForDate(existingGeoJSON, indicatorGeoJson_lowestSpatialUnit, targetDate);
          resultingIndicatorsMap.set(metadataObject_lowestUnit_string, existingGeoJSON); 
        }
        else{
          resultingIndicatorsMap.set(metadataObject_lowestUnit_string, indicatorGeoJson_lowestSpatialUnit); 
        }

        progressHelper.persistJobProgress(job.id, "defaultComputation", 70);

        // after computing the indicator for the lowest spatial unit
        // we can now aggregate the result to all remaining superior units!
        try{
          resultingIndicatorsMap = await appendIndicatorsGeoJSONForRemainingSpatialUnits(remainingSpatialUnits, resultingIndicatorsMap, metadataObject_lowestUnit_string, targetDate, nodeModuleForIndicator);
        }
        catch(error){
          KmHelper.logError("Error while processing indicatorComputation for remaining spatialUnits for defaultIndicatorComputation. Error is: " + error);
          throw error;
        }
      }
      catch(error){
        KmHelper.logError("Error while calling indicator computation method from custom script. Error is: " + error);
      }
    }

    try{
      // if error occured then clean up temp files and temp node module

      // delete temporarily stored nodeModule file synchronously
      delete require.cache[require.resolve('../tmp/tmp.js')];
      fs.unlinkSync("./tmp/tmp.js");
    }
    catch (error){
      KmHelper.logError("Catched Error while calling indicator computation method from custom script. Error is: " + error);
    }

    progressHelper.persistJobProgress(job.id, "defaultComputation", 80);

    // after computing the indicator for every spatial unit
    // send PUT requests against KomMonitor data management API to persist results permanently
    var resultUrl;
    try{
      resultUrl = await KomMonitorIndicatorPersister.putIndicatorForSpatialUnits(process.env.KOMMONITOR_DATA_MANAGEMENT_URL_CRUD, targetIndicatorMetadata, targetDates, resultingIndicatorsMap);

    }
    catch(error){
      KmHelper.logError("Error while persisting computed indicators for all spatialUnits within dataManagement API for defaultIndicatorComputation. Error is: " + error);
      throw error;
    }

    progressHelper.persistJobProgress(job.id, "defaultComputation", 90);

    return resultUrl;
  }
  catch(err) {
      KmHelper.logError("Error during execution of defaultIndicatorComputation with error: " + err);
      throw err;
  }
}

async function executeDefaultComputation_withIndividualComputationPerSpatialUnit (job, scriptId, targetIndicatorId, targetDates, baseIndicatorIds, georesourceIds, defaultProcessProperties){
  try {
    var scriptCodeAsByteArray;
    var georesourcesMap;
    var allSpatialUnits;
    var targetIndicatorMetadata;
    try{
      scriptCodeAsByteArray = await KomMonitorDataFetcher.fetchScriptCodeById(process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET, scriptId);
      progressHelper.persistJobProgress(job.id, "defaultComputation", 20);
      targetIndicatorMetadata = await KomMonitorDataFetcher.fetchIndicatorMetadataById(process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET, targetIndicatorId);
      progressHelper.persistJobProgress(job.id, "defaultComputation", 40);

    }
    catch(error){
      KmHelper.logError("Error while fetching resources from dataManagement API for defaultIndicatorComputation. Error is: " + error);
      throw error;
    }      

    

    // require the script code as new NodeJS module
    fs.writeFileSync("./tmp/tmp.js", scriptCodeAsByteArray);
    var nodeModuleForIndicator = require("../tmp/tmp.js");
    // var nodeModuleForIndicator = require("../resources/example-scripts/kommonitor-node-module_Distanz_Naheste_Grundschule.js");

    // result map containing entries where key="spatialUnitMetadataObject" and value="computed indicator GeoJSON"
    var resultingIndicatorsMap = new Map();

    for (const targetDate of targetDates) {
      //execute script to compute indicator
      try{

        georesourcesMap = await KomMonitorDataFetcher.fetchGeoresourcesByIds(process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET, georesourceIds, targetDate);

        allSpatialUnits = await KomMonitorDataFetcher.fetchTargetSpatialUnitAndHigher(process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET, targetDate, targetIndicatorMetadata.lowestSpatialUnitForComputation);        

        // after computing the indicator for the lowest spatial unit
        // we can now aggregate the result to all remaining superior units!
        try{
          resultingIndicatorsMap = await computeIndicatorsGeoJSONForAllSpatialUnits(allSpatialUnits, georesourcesMap, baseIndicatorIds, defaultProcessProperties, resultingIndicatorsMap, targetDate, nodeModuleForIndicator);
        }
        catch(error){
          KmHelper.logError("Error while processing indicatorComputation for remaining spatialUnits for defaultIndicatorComputation. Error is: " + error);
          throw error;
        }
      }
      catch(error){
        KmHelper.logError("Error while calling indicator computation method from custom script. Error is: " + error);      
      } 
    }

    progressHelper.persistJobProgress(job.id, "defaultComputation", 80);

    try{
      // if error occured then clean up temp files and temp node module

      // delete temporarily stored nodeModule file synchronously
      delete require.cache[require.resolve('../tmp/tmp.js')];
      fs.unlinkSync("./tmp/tmp.js");
    }
    catch (error){
      KmHelper.logError("Catched Error while removing temp indicator computation module. Error is: " + error);
    }

    // after computing the indicator for every spatial unit
    // send PUT requests against KomMonitor data management API to persist results permanently
    var resultUrl;
    try{
      resultUrl = await KomMonitorIndicatorPersister.putIndicatorForSpatialUnits(process.env.KOMMONITOR_DATA_MANAGEMENT_URL_CRUD, targetIndicatorMetadata, targetDates, resultingIndicatorsMap);

    }
    catch(error){
      KmHelper.logError("Error while persisting computed indicators for all spatialUnits within dataManagement API for defaultIndicatorComputation. Error is: " + error);
      throw error;
    }

    progressHelper.persistJobProgress(job.id, "defaultComputation", 90);

    return resultUrl;
  }
  catch(err) {
      KmHelper.logError("Error during execution of defaultIndicatorComputation with error: " + err);
      throw err;
  }
}

async function computeIndicatorsGeoJSONForAllSpatialUnits(allSpatialUnits, georesourcesMap, baseIndicatorIds, defaultProcessProperties, resultingIndicatorsMap, targetDate, nodeModuleForIndicator){
  
  const spatialUnitIterator = allSpatialUnits.entries();

  var nextSpatialUnit = spatialUnitIterator.next().value;

  while(nextSpatialUnit){

    var metadataObject_string = JSON.stringify(nextSpatialUnit[0]);

    // retrieve baseIndicators
    var baseIndicatorsMap_nextSpatialUnit;
    try{
      baseIndicatorsMap_nextSpatialUnit = await KomMonitorDataFetcher.fetchIndicatorsByIds(process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET, baseIndicatorIds, targetDate, nextSpatialUnit[0].spatialUnitId);
    }
    catch(error){
      KmHelper.logError("Error while fetching baseIndicators for nextSpatialUnit from dataManagement API for defaultIndicatorComputation. Error is: " + error);
      KmHelper.logError("Error while computing indicator for targetSpatialUnit with id " + nextSpatialUnit[0].spatialUnitId + ". Error is: " + error);
      KmHelper.logError("Remaining spatial unit computation will continue.");      
      progressHelper.addFailedSpatialUnitIntegration(nextSpatialUnit[0], "Error while fetching baseIndicators for nextSpatialUnit from dataManagement API for defaultIndicatorComputation", error);
    }

    if(baseIndicatorsMap_nextSpatialUnit){
      try{
        var indicatorGeoJson_nextSpatialUnit = await nodeModuleForIndicator.computeIndicator(targetDate, nextSpatialUnit[1], baseIndicatorsMap_nextSpatialUnit, georesourcesMap, defaultProcessProperties);
  
        // we now want to append only the resulting date to n existing entry
        // f there is no existing entry, then set it initially
        if(resultingIndicatorsMap.has(metadataObject_string)){
          var existingGeoJSON = resultingIndicatorsMap.get(metadataObject_string);
          existingGeoJSON = appendIndicatorValuesForDate(existingGeoJSON, indicatorGeoJson_nextSpatialUnit, targetDate);
          resultingIndicatorsMap.set(metadataObject_string, existingGeoJSON); 
        }
        else{
          resultingIndicatorsMap.set(metadataObject_string, indicatorGeoJson_nextSpatialUnit); 
        }    
      }
      catch(error){
        KmHelper.logError("Error while computing indicator for targetSpatialUnit with id " + nextSpatialUnit[0].spatialUnitId + ". Error is: " + error);
        KmHelper.logError("Remaining spatial unit computation will continue.");
        progressHelper.addFailedSpatialUnitIntegration(nextSpatialUnit[0], "Error while computing indicator for targetSpatialUnit with id " + nextSpatialUnit[0].spatialUnitId, error);
      } 
    }      

    nextSpatialUnit = spatialUnitIterator.next().value;
  }
  
  return resultingIndicatorsMap;

}

function appendIndicatorValuesForDate(existingGeoJSON, indicatorGeoJson_nextSpatialUnit, targetDate){
  var map = new Map();

  for (const feature of indicatorGeoJson_nextSpatialUnit.features) {
    map.set(KmHelper.getSpatialUnitFeatureIdValue(feature),KmHelper.getIndicatorValue(feature, targetDate));
  }

  for (let index = 0; index < existingGeoJSON.features.length; index++) {
    const feature = existingGeoJSON.features[index];

    existingGeoJSON.features[index] = KmHelper.setIndicatorValue(feature, targetDate, map.get(KmHelper.getSpatialUnitFeatureIdValue(feature)));
  }

  return existingGeoJSON;
}


async function executeCustomizedComputation(job, scriptId, targetDate, baseIndicatorIds, georesourceIds, targetSpatialUnitId, customProcessProperties){

    try {
      var scriptCodeAsByteArray;
      var baseIndicatorsMap;
      var georesourcesMap;
      var targetSpatialUnit_geoJSON;

      // throw Error();

      try{
        scriptCodeAsByteArray = await KomMonitorDataFetcher.fetchScriptCodeById(process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET, scriptId);
        // job.data.progress = 20;
        progressHelper.persistJobProgress(job.id, "customizedComputation", 20);
        baseIndicatorsMap = await KomMonitorDataFetcher.fetchIndicatorsByIds(process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET, baseIndicatorIds, targetDate, targetSpatialUnitId);
        // job.data.progress = 30;
        progressHelper.persistJobProgress(job.id, "customizedComputation", 30);
        georesourcesMap = await KomMonitorDataFetcher.fetchGeoresourcesByIds(process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET, georesourceIds, targetDate);
        // job.data.progress = 40;
        progressHelper.persistJobProgress(job.id, "customizedComputation", 40);
        targetSpatialUnit_geoJSON = await KomMonitorDataFetcher.fetchSpatialUnitById(process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET, targetSpatialUnitId, targetDate);
        // job.data.progress = 50;
        progressHelper.persistJobProgress(job.id, "customizedComputation", 50);
      }
      catch(error){
        KmHelper.logError("Error while fetching resources from dataManagement API for customizedIndicatorComputation. Error is: " + error);
        throw error;
      }

      // require the script code as new NodeJS module
      fs.writeFileSync("./tmp/tmp.js", scriptCodeAsByteArray);
      var nodeModuleForIndicator = require("../tmp/tmp.js");
      // var nodeModuleForIndicator = require("../resources/kommonitor-node-module_freiraumflaechenBeispiel.js");



      // job.data.progress = 60;
      progressHelper.persistJobProgress(job.id, "customizedComputation", 60);

      //execute script to compute indicator
      var responseGeoJson;
      try{
        responseGeoJson = await nodeModuleForIndicator.computeIndicator(targetDate, targetSpatialUnit_geoJSON, baseIndicatorsMap, georesourcesMap, customProcessProperties);

        // job.data.progress = 90;
        progressHelper.persistJobProgress(job.id, "customizedComputation", 90);

        delete require.cache[require.resolve('../tmp/tmp.js')];

        // delete temporarily stored nodeModule file synchronously
        fs.unlinkSync("./tmp/tmp.js");
      }
      catch(error){
        try{
          // if error occured then clean up temp files and temp node module

          // delete temporarily stored nodeModule file synchronously
          delete require.cache[require.resolve('../tmp/tmp.js')];
          fs.unlinkSync("./tmp/tmp.js");
        }
        catch (error){
          KmHelper.logError("Catched Error while calling indicator computation method from custom script. Error is: " + error);
        }
        KmHelper.logError("Error while calling indicator computation method from custom script. Error is: " + error);
      }

      return responseGeoJson;
    }
    catch(err) {
        KmHelper.logError("Error during execution of customizedIndicatorComputation with error: " + err);
        throw err;
    }
}

exports.executeCustomizedComputation = executeCustomizedComputation;
