// require dependencies (other node modules)
//turf for geometric topologic operations
var turf = require('@turf/turf');

/**
This method computes the indicator for the specified point in time and target spatial unit. To do this, necessary base indicators and/or georesources as well as variable process properties are defined
as method parameters that can be used within the method body.

@targetDate string representing the target date for which the indicator shall be computed, e.g. 2018-01-01
@targetSpatialUnit_geoJSON string target spatial unit as GeoJSON string.
@baseIndicatorsMap Map map containing all indicators, wheres key='meaningful name of the indicator' and value='indicator as GeoJSON string'
@georesourcesMap Map map containing all georesources, wheres key='meaningful name of the georesource' and value='georesource as GeoJSON string' (they are used to execute geometric/toptologic computations)
@processProperties an object containing variable additional properties that are required to perform the indicator computation
*/
exports.computeIndicator = function(targetDate, targetSpatialUnit_geoJSON, baseIndicatorsMap, georesourcesMap, processProperties){
  // compute indicator for targetDate and targetSpatialUnitFeatures

};

/**
@targetSpatialUnit_geoJSON GeoJSON features of the target spatial unit, for which the indicator shall be aggregated to
@indicator_geoJSON GeoJSON features containing the indicator values for a spatial unit that can be aggregated to the features of parameter targetSpatialUnitFeatures
*/
exports.aggregateIndicator = function(targetSpatialUnit_geoJSON, indicator_geoJSON){
  // aggregate indicator

};

/**
@targetSpatialUnit_geoJSON GeoJSON features of the target spatial unit, for which the indicator shall be disaggregated to
@indicator_geoJSON GeoJSON features containing the indicator values for a spatial unit that can be disaggregated to the features of parameter targetSpatialUnitFeatures
*/
exports.disaggregateIndicator = function(targetSpatialUnit_geoJSON, indicator_geoJSON){
  // disaggregate indicator

};
