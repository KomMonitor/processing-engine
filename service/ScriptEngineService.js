'use strict';

  var ScriptExecutionHelper = require('./ScriptExecutionHelperService');

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
  console.log(`Job ${job.id} succeeded with result: ${result}`);
});

customizedComputationQueue.on('retrying', (job, err) => {
  console.log(`Job ${job.id} failed with error ${err.message} but is being retried!`);
});

customizedComputationQueue.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed with error ${err.message}`);
});

  // register process function to execute defaultIndicatorComputation jobs
  // this code will be executed when such a job is started
  defaultComputationQueue.process(function (job, done) {
    console.log(`Processing defaultIndicatorComputation job with id ${job.id}`);

    // here perform default computation
    var scriptId = job.data.scriptId;
    var targetIndicatorId = job.data.targetIndicatorId;
    var targetDate = job.data.targetDate;
    var baseIndicatorIds = job.data.baseIndicatorIds;
    var georesourceIds = job.data.georesourceIds;
    var defaultProcessParameters = job.data.defaultProcessParameters;

    console.log(`Submitted job data scriptId: ` + scriptId);
    console.log(`Submitted job data targetIndicatorId: ` + targetIndicatorId);
    console.log(`Submitted job data targetDate: ` + targetDate);
    console.log(`Submitted job data baseIndicatorIds: ` + baseIndicatorIds);
    console.log(`Submitted job data georesourceIds: ` + georesourceIds);
    console.log(`Number of submitted job data defaultProcessProperties: ` + defaultProcessProperties.length);

    defaultProcessProperties.forEach(function(property) {
      console.log("Submitted process property with name '" + property.name + "', dataType '" + property.dataType + "' and default value '" + property.value + "'");
    });

    job.data.progress = 5;
    job.save();
    console.log("Successfully parsed request input parameters");

    // now fetch the resources from KomMonitor data management api
    return ScriptExecutionHelper.executeDefaultComputation(job, scriptId, targetIndicatorId, targetDate, baseIndicatorIds, georesourceIds, defaultProcessProperties)
    .then(function (urlsToCreatedResources) {

      console.log("attaching result to job");
      job.data.result = urlsToCreatedResources;

      console.log("saving job, which was enriched with result: " + job.data.result);
      job.data.progress = 100;
      job.save();

      console.log(`Job execution successful. DefaultIndicatorComputation job with ID ${job.id} finished`);
      return done();
    })
    .catch(function (response) {
      console.error("Error while executing defaultIndicatorComputation. " + response);
      job.remove()
        .then(() => console.log('Job was removed'))
        .catch((error) => console.error("job could not be removed from defaultComputationQueue"));
      throw response;
    });

  });

  // register process function to execute customizableIndicatorComputation jobs
  // this code will be executed when such a job is started
  customizedComputationQueue.process(async (job) => {
    console.log(`Processing customizedIndicatorComputation job with id ${job.id}`);

    // done(null, "simple result for testing");
    // return;

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

    var scriptId = job.data.scriptId;
    var targetDate = job.data.targetDate;
    var baseIndicatorIds = job.data.baseIndicatorIds;
    var georesourceIds = job.data.georesourceIds;
    var targetSpatialUnitId = job.data.targetSpatialUnitId;
    var customProcessProperties = job.data.customProcessProperties;

    console.log(`Submitted job data scriptId: ` + scriptId);
    console.log(`Submitted job data targetDate: ` + targetDate);
    console.log(`Submitted job data baseIndicatorIds: ` + baseIndicatorIds);
    console.log(`Submitted job data georesourceIds: ` + georesourceIds);
    console.log(`Submitted job data targetSpatialUnitId: ` + targetSpatialUnitId);
    console.log(`Number of submitted job data customProcessProperties: ` + customProcessProperties.length);

    customProcessProperties.forEach(function(property) {
      console.log("Submitted process property with name '" + property.name + "', dataType '" + property.dataType + "' and value '" + property.value + "'");
    });


    job.data.progress = 5;
    job.save();
    console.log("Successfully parsed request input parameters");

    // now fetch the resources from KomMonitor data management api
    // TODO implement fetching of resources and executing of script
    var result;
    try{
      result = await ScriptExecutionHelper.executeCustomizedComputation(job, scriptId, targetDate, baseIndicatorIds, georesourceIds, targetSpatialUnitId, customProcessProperties);
    }
    catch(error){
      console.error("Error while executing customizedIndicatorComputation. " + error);
      // job.remove()
      //   .then(() => console.log('Job was removed'))
      //   .catch((error) => console.error("job could not be removed from customizedComputationQueue"));
      // done();
      return Promise.reject(error);
    }

    // TODO maybe it is better to store responseGeoJson on disk and only save the path to that resource within job.data.result
    console.log("attaching result to job");
    job.data.result = result;

    console.log("saving job, which was enriched with result: " + job.data.result);
    job.data.progress = 100;
    job.save();

    console.log(`Job execution successful. CustomizableIndicatorComputation job with ID ${job.id} finished`);
    return Promise.resolve(result);

    // .then(function (responseGeoJson) {
    //
    //   // TODO maybe it is better to store responseGeoJson on disk and only save the path to that resource within job.data.result
    //   console.log("attaching result to job");
    //   job.data.result = responseGeoJson;
    //
    //   console.log("saving job, which was enriched with result: " + job.data.result);
    //   job.data.progress = 100;
    //   job.save();
    //
    //   console.log(`Job execution successful. CustomizableIndicatorComputation job with ID ${job.id} finished`);
    //
    //   // return done(null, responseGeoJson);
    // })
    // .catch(function (response) {
    //   console.error("Error while executing customizedIndicatorComputation. " + response);
    //   // job.remove()
    //   //   .then(() => console.log('Job was removed'))
    //   //   .catch((error) => console.error("job could not be removed from customizedComputationQueue"));
    //   // done();
    //   done(null, response);
    //   throw response;
    // });
  });

/**
 * retrieve status information and/or results about executing customizable indicator computation.
 * retrieve status information and/or results about executing customizable indicator computation.
 *
 * jobId String unique identifier of the job that performs indicator computation
 * returns List
 **/
exports.getCustomizableIndicatorComputation = function(jobId) {
  console.log("getCustomizableIndicatorComputation was called for jobId " + jobId);

  return new Promise(function(resolve, reject) {

    customizedComputationQueue.getJob(jobId)
      .then((job) => {
        console.log(`Job has status ${job.status}`);

        // response model
        //
        //{
        //    "jobId": "jobId",
        //    "result_geoJSON": "result_geoJSON",
        //    "progress": 0.8008281904610115,
        //    "error": "error",
        //    "status": "ACCEPTED"
        //  }

        var response = {};
        response.jobId = job.id;
        response.status = job.status;
        response.progress = job.data.progress;
        response.result_geoJSON = job.data.result;
        response.error = undefined;

        console.log("returning following response object for job with id ${job.id}");
        console.log(response);

        resolve(response);
      })
      .catch((error) => {

        console.error("Job not found. Will respond with error object");

        var response = {};
        response.jobId = jobId;
        response.status = undefined;
        response.progress = undefined;
        response.result_geoJSON = undefined;
        response.error = "No Job with id " + jobId + " could be found. Error message: " + error.message;

        console.log("returning following response object for job with id " + jobId);
        console.log(response);

        reject(response);
      });
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

    defaultComputationQueue.getJob(jobId)
      .then((job) => {
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
      })
      .catch((error) => {

        console.error("Job not found. Will respond with error object");

        var response = {};
        response.jobId = jobId;
        response.status = undefined;
        response.progress = undefined;
        response.result_url = undefined;
        response.error = "No Job with id " + jobId + " could be found. Error message: " + error.message;

        console.log("returning following response object for job with id " + jobId);
        console.log(response);

        reject(response);
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
  console.log("postCustomizableIndicatorComputation was called");

  // use bee-queue to create a new queue and new job to execute the script
  return new Promise(function(resolve, reject) {
    const job = customizedComputationQueue.createJob(scriptInput);

    job.save()
      .then((job) => {
        console.log("Created new job to execute customizableIndicatorComputation with jobId " + job.id);
        resolve(job.id);
      })
      .catch((error) => {
        console.error("Error while creating customizableIndicatorComputation job.");
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

  console.log("postDefaultIndicatorComputation was called");

  // use bee-queue to create a new queue and new job to execute the script
  return new Promise(function(resolve, reject) {
    const job = defaultComputationQueue.createJob(scriptInput);

    job.save()
      .then((job) => {
        console.log("Created new job to execute defaultIndicatorComputation with jobId " + job.id);
        resolve(job.id);
      })
      .catch((error) => {
        console.error("Error while creating defaultIndicatorComputation job.");
        reject(error);
      });
  });
}
