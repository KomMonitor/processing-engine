'use strict';

var utils = require('../utils/writer.js');
var ScriptEngine = require('../service/ScriptEngineService');

module.exports.getCustomizableIndicatorComputation = function getCustomizableIndicatorComputation (req, res, next, jobId) {
  ScriptEngine.getCustomizableIndicatorComputation(jobId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getCustomizableIndicatorComputationJobOverview = function getCustomizableIndicatorComputationJobOverview (req, res, next) {
  ScriptEngine.getCustomizableIndicatorComputationJobOverview()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getDefaultIndicatorComputation = function getDefaultIndicatorComputation (req, res, next, jobId) {
  ScriptEngine.getDefaultIndicatorComputation(jobId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getDefaultIndicatorComputationJobOverview = function getDefaultIndicatorComputationJobOverview (req, res, next) {
  ScriptEngine.getDefaultIndicatorComputationJobOverview()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.postCustomizableIndicatorComputation = function postCustomizableIndicatorComputation (req, res, next, body) {
  ScriptEngine.postCustomizableIndicatorComputation(body)
    .then(function (response) {
      var responseWithLocationHeader = utils.respondWithLocationHeader(201, response);

      utils.writeLocationHeader(res, responseWithLocationHeader);
    })
    .catch(function (response) {
      console.error("ERROR: response object: " + response);

      var errorResponseWithLocationHeader = utils.respondWithLocationHeader(500, response);
      utils.writeLocationHeader(res, errorResponseWithLocationHeader);
    });
};

module.exports.postDefaultIndicatorComputation = function postDefaultIndicatorComputation (req, res, next, body) {
  ScriptEngine.postDefaultIndicatorComputation(body)
    .then(function (response) {
      // response is jobId
      // hence create ResponsePayload with HTTP status code 201 and jobId for LocationHeader and submit that

      var responseWithLocationHeader = utils.respondWithLocationHeader(201, response);

      utils.writeLocationHeader(res, responseWithLocationHeader);
    })
    .catch(function (response) {
      console.error("ERROR: response object: " + response);

      var errorResponseWithLocationHeader = utils.respondWithLocationHeader(500, response);
      utils.writeLocationHeader(res, errorResponseWithLocationHeader);
    });
};
