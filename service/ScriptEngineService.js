'use strict';


/**
 * retrieve status information and/or results about executing customizable indicator computation.
 * retrieve status information and/or results about executing customizable indicator computation.
 *
 * jobId String unique identifier of the job that performs indicator computation
 * returns List
 **/
exports.getCustomizableIndicatorComputation = function(jobId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "jobId" : "jobId",
  "result_geoJSON" : "result_geoJSON",
  "progress" : 0.80082819046101150206595775671303272247314453125,
  "error" : "error",
  "status" : "ACCEPTED"
}, {
  "jobId" : "jobId",
  "result_geoJSON" : "result_geoJSON",
  "progress" : 0.80082819046101150206595775671303272247314453125,
  "error" : "error",
  "status" : "ACCEPTED"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * retrieve status information and/or results about executing default indicator computation.
 * retrieve status information and/or results about executing default indicator computation.
 *
 * jobId String unique identifier of the job that performs indicator computation
 * returns List
 **/
exports.getDefaultIndicatorComputation = function(jobId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "jobId" : "jobId",
  "result_url" : "result_url",
  "progress" : 0.80082819046101150206595775671303272247314453125,
  "error" : "error",
  "status" : "ACCEPTED"
}, {
  "jobId" : "jobId",
  "result_url" : "result_url",
  "progress" : 0.80082819046101150206595775671303272247314453125,
  "error" : "error",
  "status" : "ACCEPTED"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Initiate execution of a customizable indicator computation.
 * Initiate execution of a customizable indicator computation.
 *
 * scriptInput CustomizableIndicatorComputationInputType details necessary to trigger script execution
 * no response value expected for this operation
 **/
exports.postCustomizableIndicatorComputation = function(scriptInput) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Initiate execution of a default indicator computation.
 * Initiate execution of a default indicator computation.
 *
 * scriptInput DefaultIndicatorComputationInputType details necessary to trigger script execution
 * no response value expected for this operation
 **/
exports.postDefaultIndicatorComputation = function(scriptInput) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}

