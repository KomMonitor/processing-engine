'use strict';

  // instantiate Bee-Queue worker queues, which can execute jobs
  // one for defaultIndicatorComputation
  // another for customizedIndicatorComputation
  // use environment variables to establish required connection to redis
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

  // register process function to execute defaultIndicatorComputation jobs
  // this code will be executed when such a job is started
  defaultComputationQueue.process(function (job, done) {
    console.log(`Processing job with id ${job.id}`);

    // here perform default computation
    var scriptId = job.data.scriptId;
    var targetDate = job.data.targetDate;
    var baseIndicatorIds = job.data.baseIndicatorIds;
    var georesourceIds = job.data.georesourceIds;

    console.log(`Submitted job data scriptId: ` + scriptId);
    console.log(`Submitted job data targetDate: ` + targetDate);
    console.log(`Submitted job data baseIndicatorIds: ` + baseIndicatorIds);
    console.log(`Submitted job data georesourceIds: ` + georesourceIds);

    job.data.progress = 5;
    job.save();
    console.log("Successfully parsed request input parameters");

    // now fetch the resources from KomMonitor data management api

    var simpleTestResult = "My Test Result is the parsed script ID: " + scriptId;

    console.log("attaching result to job");
    job.data.result = simpleTestResult;

    console.log("saving job, which was enriched with result: " + job.data.result);
    job.data.progress = 100;
    job.save();

    console.log(`Job execution successful. Job with ID ${job.id} finished`);
    return done();
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

  console.log("getDefaultIndicatorComputation was called for jobId " + jobId);

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
      response.progress = job.data.progress;
      response.result_url = job.data.result;
      response.error = undefined;

      console.log("returning following response object for job with id ${job.id}");
      console.log(response);

      resolve(response);
    });
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

  console.log("postDefaultIndicatorComputation was called");

  // use bee-queue to create a new queue and new job to execute the script
  return new Promise(function(resolve, reject) {
    const job = defaultComputationQueue.createJob(scriptInput);

    job.save().then((job) => {
      console.log("Created new job to execute defaultIndicatorComputation with jobId " + job.id);
      resolve(job.id);
    });
  });
}
