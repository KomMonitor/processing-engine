'use strict';

var utils = require('../utils/writer.js');
var Kobotoolbox = require('../service/KobotoolboxService.js');

module.exports.getKoboData_lap_quietplaces = function getKoboData_lap_quietplaces (req, res, next, body) {
  Kobotoolbox.getKoboData_lap_quietplaces(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (error) {
      utils.writeJson(res, response);
    });
};

module.exports.getKoboData_lap_noiseplaces = function getKoboData_lap_noiseplaces (req, res, next, body) {
  Kobotoolbox.getKoboData_lap_noiseplaces(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (error) {
      utils.writeJson(res, response);
    });
};
