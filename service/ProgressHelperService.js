'use strict';

var fs = require("fs");

exports.persistProgress = function(jobId, jobType, progress){
  fs.writeFileSync("./tmp/progress_" + jobType + "_" + jobId + ".txt", ""+progress);
  return;
}

exports.readProgress = function(jobId, jobType){
  var progress = fs.readFileSync("./tmp/progress_" + jobType + "_" + jobId + ".txt", 'utf8');
  return progress;
}
