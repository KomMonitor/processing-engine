'use strict';

var fs = require("fs");

// collect log Messages and write them to progress file every once in a while
let logArray_defaultComputation = [];
let errorLogArray_defaultComputation = [];

let logArray_customComputation = [];
let errorLogArray_customComputation = [];

exports.persistJobProgress = function(jobId, jobType, progress){

  let object = {
    "jobId": jobId,
    "jobType": jobType,
    "progress": progress,
    "infoLogs": [],
    "errorLogs": []
  }

  if(jobType == "defaultComputation"){
    object.infoLogs = logArray_defaultComputation;
    object.errorLogs = errorLogArray_defaultComputation;    
  }
  else{
    object.infoLogs = logArray_customComputation;
    object.errorLogs = errorLogArray_customComputation;    
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
  errorLogArray_defaultComputation = [];
};

exports.clearLogs_customComputation = function(){
  logArray_customComputation = [];
  errorLogArray_customComputation = [];
};

exports.addInfoLog_defaultComputation = function(log){
  logArray_defaultComputation.push(log);
};

exports.addErrorLog_defaultComputation = function(log){
  errorLogArray_defaultComputation.push(log);
};

exports.addInfoLog_customComputation = function(log){
  logArray_customComputation.push(log);
};

exports.addErrorLog_customComputation = function(log){
  errorLogArray_customComputation.push(log);
};

exports.getInfoLogs_defaultComputation = function(){
  return logArray_customComputation;
};

exports.getErrorLogs_defaultComputation = function(){
  return errorLogArray_customComputation;
};

exports.getInfoLogs_defaultComputation = function(){
  return logArray_customComputation;
};

exports.getErrorLogs_defaultComputation = function(){
  return errorLogArray_customComputation;
};
