'use strict';

var utils = require('../utils/writer.js');
var ScriptEngine = require('../service/ScriptEngineService');

module.exports.getCustomizableIndicatorComputation = function getCustomizableIndicatorComputation (req, res, next) {
  var jobId = req.swagger.params['jobId'].value;
  ScriptEngine.getCustomizableIndicatorComputation(jobId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getDefaultIndicatorComputation = function getDefaultIndicatorComputation (req, res, next) {
  var jobId = req.swagger.params['jobId'].value;
  ScriptEngine.getDefaultIndicatorComputation(jobId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.postCustomizableIndicatorComputation = function postCustomizableIndicatorComputation (req, res, next) {
  var scriptInput = req.swagger.params['script-input'].value;
  ScriptEngine.postCustomizableIndicatorComputation(scriptInput)
    .then(function (response) {
      // response is jobId
      // hence create ResponsePayload with HTTP status code 201 and jobId for LocationHeader and submit that

      var responseWithLocationHeader = utils.respondWithLocationHeader(201, response);

      utils.writeLocationHeader(res, responseWithLocationHeader);
    })
    .catch(function (response) {
      console.log("ERROR: response object: " + response);

      var errorResponseWithLocationHeader = utils.respondWithLocationHeader(500, response);
      utils.writeLocationHeader(res, errorResponseWithLocationHeader);
    });
};

module.exports.postDefaultIndicatorComputation = function postDefaultIndicatorComputation (req, res, next) {
  var scriptInput = req.swagger.params['script-input'].value;
  ScriptEngine.postDefaultIndicatorComputation(scriptInput)
    .then(function (response) {

      // response is jobId
      // hence create ResponsePayload with HTTP status code 201 and jobId for LocationHeader and submit that

      var responseWithLocationHeader = utils.respondWithLocationHeader(201, response);

      utils.writeLocationHeader(res, responseWithLocationHeader);
    })
    .catch(function (response) {

      console.log("ERROR: response object: " + response);

      var errorResponseWithLocationHeader = utils.respondWithLocationHeader(500, response);
      utils.writeLocationHeader(res, errorResponseWithLocationHeader);
    });
};
