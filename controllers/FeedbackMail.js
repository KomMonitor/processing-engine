'use strict';

var utils = require('../utils/writer.js');
var FeedbackMail = require('../service/FeedbackMailService');

module.exports.postFeedbackMail = function postFeedbackMail (req, res, next, body) {
  FeedbackMail.postFeedbackMail(body)
    .then(function (response) {
      var responseWithLocationHeader = utils.respondWithLocationHeader(200, response);

      utils.writeLocationHeader(res, responseWithLocationHeader);
    })
    .catch(function (error) {
      var responseWithLocationHeader = utils.respondWithLocationHeader(500, error);

      utils.writeLocationHeader(res, responseWithLocationHeader);
    });
};
