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
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.postDefaultIndicatorComputation = function postDefaultIndicatorComputation (req, res, next) {
  var scriptInput = req.swagger.params['script-input'].value;
  ScriptEngine.postDefaultIndicatorComputation(scriptInput)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
