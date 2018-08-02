'use strict';


  const Queue = require('bee-queue');
  const defaultComputationQueue = new Queue('defaultComputation', {
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    },
    isWorker: true
  });
  const customizedComputationQueue = new Queue('customizedComputation', {
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    },
    isWorker: true
  });

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

    defaultComputationQueue.getJob(jobId, function (err, job) {
      console.log(`Job has status ${job.status}`);

      // response model
      //
      // {
      //  "jobId": "string",
      //  "status": "ACCEPTED",
      //  "progress": 0,
      //  "result_url": "string",
      //  "error": "string"
      // }

      var response = {};
      response.jobId = jobId;
      response.status = job.status;
      response.progress = 42;
      response.result_url = undefined;
      response.error = undefined;

      resolve(response);
  });

  resolve();
});

//   return new Promise(function(resolve, reject) {
//     var examples = {};
//     examples['application/json'] = [ {
//   "jobId" : "jobId",
//   "result_url" : "result_url",
//   "progress" : 0.80082819046101150206595775671303272247314453125,
//   "error" : "error",
//   "status" : "ACCEPTED"
// }, {
//   "jobId" : "jobId",
//   "result_url" : "result_url",
//   "progress" : 0.80082819046101150206595775671303272247314453125,
//   "error" : "error",
//   "status" : "ACCEPTED"
// } ];
//     if (Object.keys(examples).length > 0) {
//       resolve(examples[Object.keys(examples)[0]]);
//     } else {
//       resolve();
//     }
//   });
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
  // use bee-queue to create a new queue and new job to execute the script
  return new Promise(function(resolve, reject) {
    var jobId = "";
    const job = defaultComputationQueue.createJob(scriptInput);

    //job.timeout(10000).retries(2).save().then((job) => {
      // job enqueued, job.id populated
    //});

    job.save().then((job) => {
      jobId = job.id;
    });

    // initiate job execution
    defaultComputationQueue.process(function (job, done) {
      console.log(`Processing job ${job.id}`);

      // here perform default computation
      var scriptId = job.data.scriptId;
      var targetDate = job.data.targetDate;
      var baseIndicatorIds = job.data.baseIndicatorIds;
      var georesourceIds = job.data.georesourceIds;

      var simpleTestResult = "My Test Result is the parsed script ID: " + scriptId;

      return done(null, simpleTestResult);
    });

    resolve(jobId);
  });
}
