'use strict';

var fs = require("fs");

// collect log Messages and write them to progress file every once in a while
let logArray_defaultComputation = [];

let logArray_customComputation = [];

exports.persistJobProgress = function(jobId, jobType, progress){

  let object = {
    "jobId": jobId,
    "jobType": jobType,
    "progress": progress,
    "logs": [],
  }

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
