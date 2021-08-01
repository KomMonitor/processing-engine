'use strict';

  var ScriptExecutionHelper = require('./ScriptExecutionHelperService');
  var fs = require("fs");
  var progressHelper = require("./ProgressHelperService");

  var FileCleaner = require('cron-file-cleaner').FileCleaner;

  const KmHelper = require("../resources/KmHelper");

  const tmpDir = './tmp/';

  if (fs.existsSync(tmpDir)) {
    console.log(`Directory '${tmpDir}' already exists.`);
    startTmpDirWatching(tmpDir);
  }else{
    fs.mkdir(tmpDir, { recursive: true }, (err) => {
      if(err){
        console.error(`Creation of directory '${tmpDir}' failed with error ${err.message}`);
      }else{
        console.log(`Directory '${tmpDir}' has been created succesfully.`);
        startTmpDirWatching(tmpDir);
      }
    });
  }

  function startTmpDirWatching(dir){
    // scan the directory /tmp/ each day at 0 hours and delete every containing file that is older than 1 week hours (302400000 milliseconds)
    console.log(`scan the directory '${dir}' each day at 0 hours and delete every containing file that is older than 1 week (302400000 milliseconds)`);
    var fileWatcher = new FileCleaner(dir, 302400000,  '* * 0 * * *', {
      start: true
    });
  }

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

  customizedComputationQueue.on('succeeded', (job, result) => {
    KmHelper.log(`Job ${job.id} succeeded.`);
  });

  customizedComputationQueue.on('retrying', (job, err) => {
    KmHelper.log(`Job ${job.id} failed with error ${err.message} but is being retried!`);
  });

  customizedComputationQueue.on('failed', (job, err) => {
    KmHelper.log(`Job ${job.id} failed with error ${err.message}`);
  });

  defaultComputationQueue.on('succeeded', (job, result) => {
    KmHelper.log(`Job ${job.id} succeeded.`);
  });

  defaultComputationQueue.on('retrying', (job, err) => {
    KmHelper.log(`Job ${job.id} failed with error ${err.message} but is being retried!`);
  });

  defaultComputationQueue.on('failed', (job, err) => {
    KmHelper.log(`Job ${job.id} failed with error ${err.message}`);
  });

  // register process function to execute defaultIndicatorComputation jobs
  // this code will be executed when such a job is started
  defaultComputationQueue.process(async (job) => {

    progressHelper.clearLogs_defaultComputation();
    
    KmHelper.log(`Processing defaultIndicatorComputation job with id ${job.id}`);

    return new Promise(async function(resolve, reject) {
      try{

        // here perform default computation
        var scriptId = job.data.scriptId;
        var targetIndicatorId = job.data.targetIndicatorId;
        var targetDates = job.data.targetDates;
        var baseIndicatorIds = job.data.baseIndicatorIds;
        var georesourceIds = job.data.georesourceIds;
        var defaultProcessProperties = job.data.defaultProcessProperties;
        var useAggregationForHigherSpatialUnits = job.data.useAggregationForHigherSpatialUnits;

        KmHelper.log(`Submitted job data scriptId: ` + scriptId);
        KmHelper.log(`Submitted job data targetIndicatorId: ` + targetIndicatorId);
        KmHelper.log(`Submitted job data targetDates array: ` + targetDates);
        KmHelper.log(`Submitted job data baseIndicatorIds: ` + baseIndicatorIds);
        KmHelper.log(`Submitted job data georesourceIds: ` + georesourceIds);
        KmHelper.log(`Number of submitted job data defaultProcessProperties: ` + defaultProcessProperties.length);
        KmHelper.log(`Submitted job data useAggregationForHigherSpatialUnits: ` + useAggregationForHigherSpatialUnits);

        defaultProcessProperties.forEach(function(property) {
          KmHelper.log("Submitted process property with name '" + property.name + "', dataType '" + property.dataType + "' and default value '" + property.value + "'");
        });

        // job.data.progress = 5;
        progressHelper.persistJobProgress(job.id, "defaultComputation", 5);
        KmHelper.log("Successfully parsed request input parameters");

        KmHelper.log("Start indicator computation to persit the results within KomMonitor data management service.");
        var resultArray = await ScriptExecutionHelper.executeDefaultComputation(job, scriptId, targetIndicatorId, targetDates, baseIndicatorIds, georesourceIds, defaultProcessProperties, useAggregationForHigherSpatialUnits);

        KmHelper.log("attaching result to job");
        job.data.result = resultArray;

        KmHelper.log("saving job, which was enriched with resulting URLs: " + job.data.result);
        // job.data.progress = 100;
        progressHelper.persistJobProgress(job.id, "defaultComputation", 100);

        KmHelper.log(`Job execution successful. DefaultIndicatorComputation job with ID ${job.id} finished`);

        resolve(resultArray);
      }
      catch(error){
        KmHelper.logError("Error while executing defaultIndicatorComputation. " + error);
        KmHelper.logError(error.stack);
        job.data.error = error.message;
        reject(error);
      }

    });

  });

  // register process function to execute customizableIndicatorComputation jobs
  // this code will be executed when such a job is started
  customizedComputationQueue.process(async (job) => {

    progressHelper.clearLogs_customComputation;

    KmHelper.log(`Processing customizedIndicatorComputation job with id ${job.id}`);

    // throw Error("Error");

    // here perform customized computation

    // example input model
    // {
    //   "targetSpatialUnitId": "targetSpatialUnitId",
    //   "scriptId": "scriptId",
    //   "customProcessProperties": [
    //     {
    //       "dataType": "string",
    //       "name": "name",
    //       "value": "{}"
    //     },
    //     {
    //       "dataType": "string",
    //       "name": "name",
    //       "value": "{}"
    //     }
    //   ],
    //   "targetDate": "2000-01-23",
    //   "georesourceIds": [
    //     "georesourceId",
    //     "georesourceId"
    //   ],
    //   "baseIndicatorIds": [
    //     "baseIndicatorIds",
    //     "baseIndicatorIds"
    //   ]
    // }



    return new Promise(async function(resolve, reject) {
      try{

        var scriptId = job.data.scriptId;
        var targetDate = job.data.targetDate;
        var baseIndicatorIds = job.data.baseIndicatorIds;
        var georesourceIds = job.data.georesourceIds;
        var targetSpatialUnitId = job.data.targetSpatialUnitId;
        var customProcessProperties = job.data.customProcessProperties;

        KmHelper.log(`Submitted job data scriptId: ` + scriptId);
        KmHelper.log(`Submitted job data targetDate: ` + targetDate);
        KmHelper.log(`Submitted job data baseIndicatorIds: ` + baseIndicatorIds);
        KmHelper.log(`Submitted job data georesourceIds: ` + georesourceIds);
        KmHelper.log(`Submitted job data targetSpatialUnitId: ` + targetSpatialUnitId);
        KmHelper.log(`Number of submitted job data customProcessProperties: ` + customProcessProperties.length);

        customProcessProperties.forEach(function(property) {
          KmHelper.log("Submitted process property with name '" + property.name + "', dataType '" + property.dataType + "' and value '" + property.value + "'");
        });

        // job.data.progress = 5;
        progressHelper.persistJobProgress(job.id, "customizedComputation", 5);
        KmHelper.log("Successfully parsed request input parameters.");
        KmHelper.log("Start indicator computation.");

        var geoJSON = await ScriptExecutionHelper.executeCustomizedComputation(job, scriptId, targetDate, baseIndicatorIds, georesourceIds, targetSpatialUnitId, customProcessProperties);

        // TODO maybe it is better to store responseGeoJson on disk and only save the path to that resource within job.data.result
        KmHelper.log("encode result as Base64 String and attach it to job");
        let buff = new Buffer(JSON.stringify(geoJSON));
        let base64data = buff.toString('base64');

        var tmpFilePath = "./tmp/tmpGeoJSON_jobid_" + job.id + ".geojson";
        KmHelper.log("save GeoJSON to tmp file for later retrieval: " + tmpFilePath);
        fs.writeFileSync(tmpFilePath, base64data);

        job.data.result = tmpFilePath;
        // job.data.result = geoJSON;
        // job.data.progress = 100;
        progressHelper.persistJobProgress(job.id, "customizedComputation", 100);

        KmHelper.log(`Job execution successful. CustomizableIndicatorComputation job with ID ` + job.id + ` finished`);
        resolve(job.data.result);
      }
      catch(error){
        KmHelper.logError("Error while executing customizedIndicatorComputation. " + error);
        KmHelper.logError(error.stack);
        job.data.error = error.message;
        reject(error);
      }

    });
  });

/**
 * retrieve status information and/or results about executing customizable indicator computation.
 * retrieve status information and/or results about executing customizable indicator computation.
 *
 * jobId String unique identifier of the job that performs indicator computation
 * returns List
 **/
exports.getCustomizableIndicatorComputation = function(jobId) {
  KmHelper.log("getCustomizableIndicatorComputation was called for jobId " + jobId);

  return new Promise(function(resolve, reject) {

    customizedComputationQueue.getJob(jobId)
      .then((job) => {
        KmHelper.log(`Job has status ${job.status}`);

        // response model
        //
        //{
        //    "jobId": "jobId",
        //    "result_geoJSON_base64": "result_geoJSON",
        //    "progress": 0.8008281904610115,
        //    "error": "error",
        //    "status": "ACCEPTED"
        //  }

        var response = {};
        response.jobId = job.id;
        response.status = job.status;
        let jobProgress = progressHelper.readJobProgress(job.id, "customizedComputation");
        response.progress = jobProgress.progress;
        response.logs = jobProgress.logs;
        var tmpFilePath = job.data.result;

        if (tmpFilePath)
          response.result_geoJSON_base64 = fs.readFileSync(tmpFilePath, 'utf8');

        response.jobData = job.data;
        response.jobData.error = undefined;
        response.jobData.result = undefined;


        KmHelper.log("returning response object for job with id " + job.id + ". It has status " + job.status + "");
        // KmHelper.log(response);

        resolve(response);
      })
      .catch((error) => {

        KmHelper.logError("Job not found. Will respond with error object");
        KmHelper.logError(error.stack);

        var response = {};
        response.jobId = jobId;
        response.status = undefined;
        response.progress = undefined;
        response.result_geoJSON_base64 = undefined;
        response.error = "Job with ID " + jobId + " was not found or an error ocurred during job status query.";
        swaggerJob.jobData = undefined;

        KmHelper.log("returning following response object for job with id " + jobId);
        KmHelper.log(response);

        reject(response);
      });
  });
};

/**
 * retrieve health information about existing customizable indicator computation jobs and their processing queue.
 * retrieve health information about existing customizable indicator computation jobs and their processing queue
 *
 * returns HealthType
 **/
 exports.getCustomizableIndicatorComputationHealth = async function() {
  console.log("Called health endpoint for custom jobs.");

  let status = customizedComputationQueue.isRunning();

  let queueJobNumbers = await customizedComputationQueue.checkHealth();

  console.log("Called health endpoint for custom job queue. Result is: \n" + JSON.stringify(queueJobNumbers));

  let health = {
    "queueStatus": status ? "READY" : "NOT READY",
    "newestJobId": queueJobNumbers.newestJob,
    "waitingJobs": queueJobNumbers.waiting,
    "activeJobs": queueJobNumbers.active,
    "delayedJobs": queueJobNumbers.delayed,
    "succeededJobs": queueJobNumbers.succeeded,
    "failedJobs": queueJobNumbers.failed
  };

  return health;
};

/**
 * retrieve status information about existing customizable indicator computation jobs.
 * retrieve status information about existing customizable indicator computation jobs.
 *
 * returns List
 **/
exports.getCustomizableIndicatorComputationJobOverview = async function() {
    var allJobs = [];

    var jobs_successful = await getCustomizedIndicatorJobs("succeeded");
    var jobs_failed = await getCustomizedIndicatorJobs("failed");
    var jobs_waiting = await getCustomizedIndicatorJobs("waiting");
    var jobs_delayed = await getCustomizedIndicatorJobs("delayed");
    var jobs_active = await getCustomizedIndicatorJobs("active");

    allJobs = allJobs.concat(jobs_successful);
    allJobs = allJobs.concat(jobs_failed);
    allJobs = allJobs.concat(jobs_waiting);
    allJobs = allJobs.concat(jobs_delayed);
    allJobs = allJobs.concat(jobs_active);

    // sort by job id
    allJobs.sort(function (jobA, jobB) {
      return jobA.id - jobB.id;
    });

    var jobOverviewArray = toSwaggerJobOverviewArray_customized(allJobs);

    return jobOverviewArray;
};

/**
 * retrieve health information about existing default indicator computation jobs and their processing queue.
 * retrieve health information about existing default indicator computation jobs and their processing queue
 *
 * returns HealthType
 **/
 exports.getDefaultIndicatorComputationHealth = async function() {
  console.log("Called health endpoint for default jobs.");

  let status = defaultComputationQueue.isRunning();

  let queueJobNumbers = await defaultComputationQueue.checkHealth();

  console.log("Called health endpoint for default job queue. Result is: \n" + JSON.stringify(queueJobNumbers));

  let health = {
    "queueStatus": status ? "READY" : "NOT READY",
    "newestJobId": queueJobNumbers.newestJob,
    "waitingJobs": queueJobNumbers.waiting,
    "activeJobs": queueJobNumbers.active,
    "delayedJobs": queueJobNumbers.delayed,
    "succeededJobs": queueJobNumbers.succeeded,
    "failedJobs": queueJobNumbers.failed
  };

  return health;
};

/**
 * see https://github.com/bee-queue/bee-queue#queuegetjobstype-page-cb 
 * @param {see } statusType 
 */
var getCustomizedIndicatorJobs = function(statusType){
  if (statusType === "succeeded" || statusType === "failed"){
    return customizedComputationQueue.getJobs(statusType, {size: 1000}).then((jobs) => {
      return jobs;
    });
  }
  else{
    return customizedComputationQueue.getJobs(statusType, {start: 0, end: 1000}).then((jobs) => {
      return jobs;
    });
  }
};

/**
 * see https://github.com/bee-queue/bee-queue#queuegetjobstype-page-cb 
 * @param {see } statusType 
 */
var getDefaultIndicatorJobs = function(statusType){
  if (statusType === "succeeded" || statusType === "failed"){
    return defaultComputationQueue.getJobs(statusType, {size: 1000}).then((jobs) => {
      return jobs;
    });
  }
  else{
    return defaultComputationQueue.getJobs(statusType, {start: 0, end: 1000}).then((jobs) => {
      return jobs;
    });
  }
};

var toSwaggerJobOverviewArray_customized  = function(beeQueueJobs){
  var swaggerJobs = beeQueueJobs.map(function(beeQueueJob) {
    var swaggerJob = {};
    swaggerJob.jobId = beeQueueJob.id;
    swaggerJob.status = beeQueueJob.status;
    try {
      let jobProgress = progressHelper.readJobProgress(beeQueueJob.id, "customizedComputation");
      swaggerJob.progress = jobProgress.progress;
      swaggerJob.logs = jobProgress.logs;
    } catch (error) {
      console.error("Error while fetching progress for customized computation job with id " + beeQueueJob.id);
      console.error("Error was: " + error);
    }
    swaggerJob.jobData = beeQueueJob.data;
    swaggerJob.jobData.error = undefined;
    swaggerJob.jobData.result = undefined;

    return swaggerJob;
  });

  return swaggerJobs;
};

var toSwaggerJobOverviewArray_default  = function(beeQueueJobs){
  var swaggerJobs = beeQueueJobs.map(function(beeQueueJob) {
    var swaggerJob = {};
    swaggerJob.jobId = beeQueueJob.id;
    swaggerJob.status = beeQueueJob.status;
    try {
      let jobProgress = progressHelper.readJobProgress(beeQueueJob.id, "defaultComputation");
      swaggerJob.progress = jobProgress.progress;
      swaggerJob.logs = jobProgress.logs;
    } catch (error) {
      KmHelper.logError("Error while fetching progress for default computation job with id " + beeQueueJob.id);
      KmHelper.logError("Error was: " + error);
    }
    swaggerJob.jobData = beeQueueJob.data;
    swaggerJob.jobData.error = undefined;
    swaggerJob.jobData.result = undefined;

    return swaggerJob;
  });

  return swaggerJobs;
};

/**
 * retrieve status information and/or results about executing default indicator computation.
 * retrieve status information and/or results about executing default indicator computation.
 *
 * jobId String unique identifier of the job that performs indicator computation
 * returns List
 **/
exports.getDefaultIndicatorComputation = function(jobId) {

  KmHelper.log("getDefaultIndicatorComputation was called for jobId " + jobId);

  return new Promise(function(resolve, reject) {

    defaultComputationQueue.getJob(jobId)
      .then((job) => {
        KmHelper.log(`Job has status ${job.status}`);

        // response model
        //
        // {
        //  "jobId": "string",
        //  "status": "ACCEPTED",
        //  "progress": 0,
        //  "result_urls": ["string", "string", "string"],
        //  "error": "string"
        // }

        var response = {};
        response.jobId = jobId;
        response.status = job.status;
        let jobProgress = progressHelper.readJobProgress(job.id, "defaultComputation");
        response.progress = jobProgress.progress;
        response.logs = jobProgress.logs;

        response.result_urls = job.data.result;
        response.jobData = job.data;
        response.jobData.error = undefined;
        response.jobData.result = undefined;

        KmHelper.log("returning following response object for job with id ${job.id}");
        KmHelper.log(response);

        resolve(response);
      })
      .catch((error) => {

        KmHelper.logError("Job not found. Will respond with error object");
        KmHelper.logError(error.stack);

        var response = {};
        response.jobId = jobId;
        response.status = undefined;
        response.progress = undefined;
        response.result_urls = undefined;
        response.error = "Job with ID " + jobId + " was not found or an error ocurred during job status query.";        

        KmHelper.log("returning following response object for job with id " + jobId);
        KmHelper.log(response);

        reject(response);
      });
  });
};

/**
 * retrieve status information about existing default indicator computation jobs.
 * retrieve status information about existing deafult indicator computation jobs.
 *
 * returns List
 **/
exports.getDefaultIndicatorComputationJobOverview = async function() {
    var allJobs = [];

    var jobs_successful = await getDefaultIndicatorJobs("succeeded");
    var jobs_failed = await getDefaultIndicatorJobs("failed");
    var jobs_waiting = await getDefaultIndicatorJobs("waiting");
    var jobs_delayed = await getDefaultIndicatorJobs("delayed");
    var jobs_active = await getDefaultIndicatorJobs("active");

    allJobs = allJobs.concat(jobs_successful);
    allJobs = allJobs.concat(jobs_failed);
    allJobs = allJobs.concat(jobs_waiting);
    allJobs = allJobs.concat(jobs_delayed);
    allJobs = allJobs.concat(jobs_active);

    // sort by job id
    allJobs.sort(function (jobA, jobB) {
      return jobA.id - jobB.id;
    });

    var jobOverviewArray = toSwaggerJobOverviewArray_default(allJobs);

    return jobOverviewArray;
};


/**
 * Initiate execution of a customizable indicator computation.
 * Initiate execution of a customizable indicator computation.
 *
 * scriptInput CustomizableIndicatorComputationInputType details necessary to trigger script execution
 * no response value expected for this operation
 **/
exports.postCustomizableIndicatorComputation = function(scriptInput) {
  KmHelper.log("postCustomizableIndicatorComputation was called");

  // use bee-queue to create a new queue and new job to execute the script
  return new Promise(function(resolve, reject) {
    const job = customizedComputationQueue.createJob(scriptInput);

    job.save()
      .then((job) => {
        KmHelper.log("Created new job to execute customizableIndicatorComputation with jobId " + job.id);
        resolve(job.id);
      })
      .catch((error) => {
        KmHelper.logError("Error while creating customizableIndicatorComputation job.");
        reject(error);
      });
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

  KmHelper.log("postDefaultIndicatorComputation was called");

  // use bee-queue to create a new queue and new job to execute the script
  return new Promise(function(resolve, reject) {
    const job = defaultComputationQueue.createJob(scriptInput);

    job.save()
      .then((job) => {
        KmHelper.log("Created new job to execute defaultIndicatorComputation with jobId " + job.id);
        resolve(job.id);
      })
      .catch((error) => {
        KmHelper.logError("Error while creating defaultIndicatorComputation job.");
        reject(error);
      });
  });
}
