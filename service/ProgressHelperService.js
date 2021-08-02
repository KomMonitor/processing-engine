'use strict';

var fs = require("fs");

// collect log Messages and write them to progress file every once in a while
let logArray_defaultComputation = [];

let logArray_customComputation = [];

let spatialUnitIntegration = [];

exports.persistJobProgress = function(jobId, jobType, progress){

  let object = {
    "jobId": jobId,
    "jobType": jobType,
    "progress": progress,
    "logs": [],
    "spatialUnitIntegration": spatialUnitIntegration
  };

  if(jobType == "defaultComputation"){
    object.logs = logArray_defaultComputation; 
  }
  else{
    object.logs = logArray_customComputation;   
  }

  fs.writeFileSync("./tmp/progress_" + jobType + "_" + jobId + ".json", ""+ JSON.stringify(object));
  return;
}

exports.readJobProgress = function(jobId, jobType){
  var fileString = fs.readFileSync("./tmp/progress_" + jobType + "_" + jobId + ".json", 'utf8');

  let object = JSON.parse(fileString);

  return object;
}

exports.clearLogs_defaultComputation = function(){
  logArray_defaultComputation = [];
};

exports.clearLogs_customComputation = function(){
  logArray_customComputation = [];
};

exports.addInfoLog_defaultComputation = function(log){
  logArray_defaultComputation.push({
    message: log,
    type: "INFO"
  });
};

exports.addErrorLog_defaultComputation = function(log){
  logArray_defaultComputation.push({
    message: log,
    type: "ERROR"
  });
};

exports.addInfoLog_customComputation = function(log){
  logArray_customComputation.push({
    message: log,
    type: "INFO"
  });
};

exports.addErrorLog_customComputation = function(log){
  logArray_customComputation.push({
    message: log,
    type: "ERROR"
  });
};

exports.clearSpatialUnitIntegration = function(){
  spatialUnitIntegration = [];
};

exports.addSuccessfulSpatialUnitIntegration = function(targetDates, targetSpatialUnitMetadata, indicatorGeoJson){
  spatialUnitIntegration.push({
    "spatialUnitId": targetSpatialUnitMetadata.spatialUnitId,
    "spatialUnitName": targetSpatialUnitMetadata.spatialUnitLevel,
    "numberOfIntegratedIndicatorFeatures": indicatorGeoJson.features ? indicatorGeoJson.features.length : null,
    "numberOfIntegratedTargetDates": targetDates.length,
    "integratedTargetDates": targetDates,
    "errorOccurred": null
  });
};

exports.addFailedSpatialUnitIntegration = function(targetSpatialUnitMetadata, customErrorMessage, error){
  let errorOccurred = {
    "message": "",
    "code": 500
  };
  if(customErrorMessage){
    errorOccurred.message = customErrorMessage + " - ";
  }
  errorOccurred.message += error.message;
    if (error.response) {
        errorOccurred.code = error.response.status || 500;

        if (error.response.data && error.response.data.error_description) {
            errorOccurred.message += " - " + error.response.data.error_description;
        }
        else if (error.response.data && error.response.data.message) {
            errorOccurred.message += " - " + error.response.data.message;
        }
    }

  let isDone = false;

  for (let index = 0; index < spatialUnitIntegration.length; index++) {
    const item = spatialUnitIntegration[index];
    
    if (item.spatialUnitId == targetSpatialUnitMetadata.spatialUnitId){
      item.errorsOccurred.push(errorOccurred);
      isDone = true;
    }
  }

  if(! isDone){
    spatialUnitIntegration.push({
      "spatialUnitId": targetSpatialUnitMetadata.spatialUnitId,
      "spatialUnitName": targetSpatialUnitMetadata.spatialUnitLevel,
      "numberOfIntegratedIndicatorFeatures": 0,
      "numberOfIntegratedTargetDates": 0,
      "integratedTargetDates": null,
      "errorsOccurred": [errorOccurred]
    });
  }

  
};
