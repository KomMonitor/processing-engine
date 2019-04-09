//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NECESSARY NODE MODULE DEPENDENCIES                                                                                                                       //
//                                                                                                                                                          //
// turf for geometric topologic operations                                                                                                                  //
// jStat for statistic operations                                                                                                                           //
//                                                                                                                                                          //
// SEE SECTION "UTILITY FUNCTIONS" for numerous predefined helper methods when writing utilizing those node dependencies                                    //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* @namespace CONSTANTS
*/

/**
* @namespace METHODS_TO_IMPLEMENT_OR_OVERWRITE
*/

/**
* @namespace API_HELPER_METHODS
*/

/**
* This constant may be used to perform spatial analysis and geometric operation tasks.
* A full-featured API documentation of Turf.js library can be found at {@link http://turfjs.org/}.
* This template offers several API methods that utilize Turf.js to implement typical geospatial operations.
* If required a user can implement custom functions, in which this constant can be called directly.
* @see {@link http://turfjs.org/}
* @see {@link https://github.com/Turfjs/turf}
* @memberof CONSTANTS
* @constant
*/
const turf = require('@turf/turf');

/**
* This constant may be used to perform statistical computations.
* A full-featured API documentation of JStat.js library can be found at {@link http://jstat.org/}.
* This template offers several API methods that utilize JStst.js to implement typical statistical operations.
* If required a user can implement custom functions, in which this constant can be called directly.
* @see {@link https://github.com/jstat/jstat}
* @see {@link https://jstat.github.io/overview.html}
* @memberof CONSTANTS
* @constant
*/
const jStat = require('jStat').jStat;





//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CONSTANTS DEFINITION                                                                                                                                     //
// here you may specify custom CONSTANTS used within the script.                                                                                            //                                            //                               //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* This constant is required to aquire the unique identifier of a certain feature of a spatial unit
* @type {string}
* @memberof CONSTANTS
* @constant
*/
const spatialUnitFeatureIdPropertyName = "spatialUnitFeatureId";
/**
* This constant is required to access indicator timeseries values correctly (i.e. DATE_2018-01-01)
* @see getTargetDateWithPropertyPrefix
* @type {string}
* @memberof CONSTANTS
* @constant
*/
const indicator_date_prefix = "DATE_";
/**
* This constant specifies allowed values to determine how the aggregation process will deal with indicator values.
* I.e. "SUM" will compute the sum of all affected features, while "AVERAGE" will compute the average of all affected features.
* Note that these values must not be changed by users!
* @type {Array.<string>}
* @memberof CONSTANTS
* @constant
*/
const aggregationTypeEnum = ["SUM", "AVERAGE"];
/**
* via the setting constant {@linkcode aggregationType} the user can decide how the aggregation process will deal with indicator values.
* Any value of {@linkcode aggregationTypeEnum} can be used. If set to an unknown type, then "AVERAGE" is taken as fallback option
* @type {string}
* @memberof CONSTANTS
* @constant
*/
const aggregationType = "AVERAGE";



/**
* This method computes the indicator for the specified point in time and target spatial unit. To do this, necessary base indicators and/or georesources as well as variable process properties are defined
* as method parameters that can be used within the method body.
*
* @param {string} targetDate - string representing the target date for which the indicator shall be computed, e.g. 2018-01-01
* @param {Object} targetSpatialUnit_geoJSON - string target spatial unit as GeoJSON object.
* @param {map.<string, Object>} baseIndicatorsMap - Map containing all indicators, wheres key='meaningful name of the indicator' and value='indicator as GeoJSON object'
* @param {map.<string, Object>} georesourcesMap - Map containing all georesources, wheres key='meaningful name of the georesource' and value='georesource as GeoJSON object' (they are used to execute geometric/toptologic computations)
* @param {Array.<Object.<string, (string|number|boolean)>>} processProperties - an array containing objects representing variable additional properties that are required to perform the indicator computation.
* Each entry has properties Object.name and Object.value for name and value of the parameter.
* @returns {Object} the computed indicator for submitted {@linkcode targetSpatialUnit_geoJSON} features as GeoJSON object
* @memberof METHODS_TO_IMPLEMENT_OR_OVERWRITE
* @function
*/
function computeIndicator(targetDate, targetSpatialUnit_geoJSON, baseIndicatorsMap, georesourcesMap, processProperties){
  // compute indicator for targetDate and targetSpatialUnitFeatures

};

/**
* This method is used to aggregate indicators of a certain spatial unit to the features of a more high-level spatial unit (i.e. aggregate from building blocks to city districts).
* The template contains predefined aggregation logic that makes use of constant {@linkcode aggregationType} to decide how indicator values shall be aggregated.
* The aggrgation internally aggregates features of {@linkcode indicator_geoJSON} to features of {@linkcode targetSpatialUnit_geoJSON} by comparing their geometries.
* Each {@linkcode indicator_geoJSON} feature whose geometry lies within a certain geometry of a {@linkcode targetSpatialUnit_geoJSON} feature will be used to compute the aggregated indicator values.
* The within comparison is executed by method {@linkcode within_usingBBOX}.
* @param {string} targetDate - string representing the target date for which the indicator shall be computed, e.g. 2018-01-01
* @param {Object} targetSpatialUnit_geoJSON - string target spatial unit features of the target spatial unit, for which the indicator shall be aggregated to as GeoJSON object
* @param {Object} indicator_geoJSON - GeoJSON features containing the indicator values for a spatial unit that can be aggregated to the features of parameter targetSpatialUnit_geoJSON
* @see aggregationType
* @see within_usingBBOX
* @returns {Object} the features of {@linkcode targetSpatialUnit_geoJSON} which contain the aggregated indicator values as GeoJSON object.
* @memberof METHODS_TO_IMPLEMENT_OR_OVERWRITE
* @function
*/
function aggregateIndicator(targetDate, targetSpatialUnit_geoJSON, indicator_geoJSON){
  // aggregate indicator
  if (!aggregationTypeEnum.includes(aggregationType)){
    console.log("Unknown parameter value for 'aggregationType' was specified for aggregation logic. Parameter value was '" + aggregationType +
      "'. Allowed values are: " + aggregationTypeEnum);
    console.log("Will fallback to using AVERAGE aggregation logic.");
    return aggregate_average(targetDate, targetSpatialUnit_geoJSON, indicator_geoJSON);
  }
  else if(aggregationType === "SUM"){
    return aggregate_sum(targetDate, targetSpatialUnit_geoJSON, indicator_geoJSON);
  }
  else {
    return aggregate_average(targetDate, targetSpatialUnit_geoJSON, indicator_geoJSON);
  }
};

/**
* This method is used to disaggregate indicators of a certain spatial unit to the features of a more low-level spatial unit (i.e. disaggregate from city districts to building blocks).
* @todo CURRENTLY THIS METHOD IS NOT USED WITHIN KOMMONITOR PROJECT: THUS IT CONTAINS NO IMPLEMENTATION YET!
* @param {string} targetDate - string representing the target date for which the indicator shall be computed, e.g. 2018-01-01
* @param {Object} targetSpatialUnit_geoJSON - string target spatial unit features of the target spatial unit, for which the indicator shall be disaggregated to as GeoJSON object
* @param {Object} indicator_geoJSON - GeoJSON features containing the indicator values for a spatial unit that can be disaggregated to the features of parameter targetSpatialUnit_geoJSON
* @returns {Object} the features of {@linkcode targetSpatialUnit_geoJSON} which contain the disaggregated indicator values as GeoJSON object.
* @memberof METHODS_TO_IMPLEMENT_OR_OVERWRITE
* @function
*/
function disaggregateIndicator(targetDate, targetSpatialUnit_geoJSON, indicator_geoJSON){
  // disaggregate indicator

};

module.exports.computeIndicator = computeIndicator;
module.exports.aggregateIndicator = aggregateIndicator;
module.exports.disaggregateIndicator = disaggregateIndicator;







//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PREDEFINED API HELPER METHODS                                                                                                                            //
// here you find helpful methods that can be used to perform certain spatio-temporal or statistical computation. These methods make internal use of Turf.js //
// and JStat.js to offer the specified functionalitites. It is recommended to use these methods when writing code to compute an indicator                   //
// from other baseIndicators or georesources in method "computeIndicator" or when writing your own aggregation/disaggregation logic.                        //
// However, you are free to implement your own methods and logic, especially when the desired operation is not covered by the API methods offered here.     //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* Concatenates indicator date property prefix and submitted targetDate.
* I.e, for exemplar targetDate="2018-01-01" it produces targetDateWithPrefix="DATE_2018-01-01".
* This is necessary in order to query timeseries property values from an indicator feature.
*
* indicatorFeature.properties[targetDate] --> null
* indicatorFeature.properties[targetDateWithPrefix] --> indicator value, (if timestamp is present)
* @param {string} targetDate - string representing the target date for which the indicator shall be computed, e.g. 2018-01-01
* @returns {string} the targetDate string with additional prefix from constant {@linkcode indicator_date_prefix} --> i.e. DATE_2018-01-01
* @memberof API_HELPER_METHODS
* @function
*/
function getTargetDateWithPropertyPrefix(targetDate){

  if(targetDate.includes(indicator_date_prefix)){
      return targetDate;
  }
  else{
      return indicator_date_prefix + targetDate;
  }
};

/**
* Aggregate features from {@linkcode indicator_geoJSON} to target features of {@linkcode targetSpatialUnit_geoJSON}
* by computing the AVERAGE indicator value of all affected features. Internally this uses the function {@linkcode within_usingBBOX}
* to determine which features of {@linkcode indicator_geoJSON} can be aggregated to which features of {@linkcode targetSpatialUnit_geoJSON}.
* @param {string} targetDate - string representing the target date for which the indicator shall be computed, e.g. 2018-01-01
* @param {Object} targetSpatialUnit_geoJSON - GeoJSON features of the target spatial unit, for which the indicator shall be aggregated to
* @param {Object} indicator_geoJSON - GeoJSON features containing the indicator values for a spatial unit that can be aggregated to the features of parameter {@linkcode targetSpatialUnitFeatures}
* @returns {Object} a GeoJSON FeatureCollection of all features of the submitted {@linkcode targetSpatialUnit_geoJSON}
* containing the resulting aggregated indicator values as new property according to the submitted {@linkcode targetDate}
* @see {@link within_usingBBOX}
* @memberof API_HELPER_METHODS
* @function
*/
function aggregate_average(targetDate, targetSpatialUnit_geoJSON, indicator_geoJSON){
  // aggregate indicator

  var indicatorFeatures = indicator_geoJSON.features;

  console.log("Aggregate indicator for targetDate " + targetDate + " for a total amount of " + targetSpatialUnit_geoJSON.features.length + " target features. Computing AVERAGE values.");
  console.log("Aggregate from a total number of " + indicator_geoJSON.features.length + " baseFeatures");
  console.log("Aggregating by comparing the BBOXes of each base feature with each targetFeature. If the BBOXes overlap for > 90%, then aggregate the base feature to the target feature. (This method ensures that minor overlaps due to faulty coordinates do not break the process).");

  targetDate = getTargetDateWithPropertyPrefix(targetDate);
  console.log('Target Date with prefix: ' + targetDate);

  var totalAggregatedIndicatorFeatures = 0;

  targetSpatialUnit_geoJSON.features.forEach(function(targetFeature){

  	targetFeature.properties[targetDate] = 0;
  	var numberOfIndicatorFeaturesWithinTargetFeature = 0;

  	for (var index = 0; index < indicatorFeatures.length; index++){
  		var indicatorFeature = indicatorFeatures[index];
      if(within_usingBBOX(indicatorFeature, targetFeature)){
  			// remove from array and decrement index
  			indicatorFeatures.splice(index, 1);
        index--;
  			numberOfIndicatorFeaturesWithinTargetFeature++;
  			targetFeature.properties[targetDate] += Number(indicatorFeature.properties[targetDate]);
  		}
  	}

    // console.log("total accumulated value is " + targetFeature.properties[targetDate] + " for targetFeature with id " + targetFeature.properties.spatialUnitFeatureId + ". It will be divided by " + numberOfIndicatorFeaturesWithinTargetFeature);
  	// compute average for share
  	targetFeature.properties[targetDate] = (targetFeature.properties[targetDate] / numberOfIndicatorFeaturesWithinTargetFeature);
    totalAggregatedIndicatorFeatures += numberOfIndicatorFeaturesWithinTargetFeature;
    // console.log("resulting average value is " + targetFeature.properties[targetDate]);
  });

  console.log("Aggregation finished");
  console.log(totalAggregatedIndicatorFeatures + " features were aggregated to " + targetSpatialUnit_geoJSON.features.length + " targetFeatures");

  if(indicatorFeatures.length > 0){
    console.error("Spatial Aggregation failed for a total number of " + indicatorFeatures.length);
    throw Error("Spatial Aggregation operation failed for a total number of " + indicatorFeatures.length);
  }

  return targetSpatialUnit_geoJSON;
};

/**
* Aggregate features from {@linkcode indicator_geoJSON} to target features of {@linkcode targetSpatialUnit_geoJSON}
* by computing the SUM indicator value of all affected features. Internally this uses the function {@linkcode within_usingBBOX}
* to determine which features of {@linkcode indicator_geoJSON} can be aggregated to which features of {@linkcode targetSpatialUnit_geoJSON}.
* @param {string} targetDate - string representing the target date for which the indicator shall be computed, e.g. 2018-01-01
* @param {Object} targetSpatialUnit_geoJSON - GeoJSON features of the target spatial unit, for which the indicator shall be aggregated to
* @param {Object} indicator_geoJSON - GeoJSON features containing the indicator values for a spatial unit that can be aggregated to the features of parameter {@linkcode targetSpatialUnitFeatures}
* @returns {Object} a GeoJSON FeatureCollection of all features of the submitted {@linkcode targetSpatialUnit_geoJSON}
* containing the resulting aggregated indicator values as new property according to the submitted {@linkcode targetDate}
* @see {@link within_usingBBOX}
* @memberof API_HELPER_METHODS
* @function
*/
function aggregate_sum(targetDate, targetSpatialUnit_geoJSON, indicator_geoJSON){
  // aggregate indicator

  var indicatorFeatures = indicator_geoJSON.features;

  console.log("Aggregate indicator for targetDate " + targetDate + " for a total amount of " + targetSpatialUnit_geoJSON.features.length + " target features. Computing SUM values.");
  console.log("Aggregate from a total number of " + indicator_geoJSON.features.length + " baseFeatures");
  console.log("Aggregating by comparing the BBOXes of each base feature with each targetFeature. If the BBOXes overlap for > 90%, then aggregate the base feature to the target feature. (This method ensures that minor overlaps due to faulty coordinates do not break the process).");

  targetDate = getTargetDateWithPropertyPrefix(targetDate);
  console.log('Target Date with prefix: ' + targetDate);

  var totalAggregatedIndicatorFeatures = 0;

  targetSpatialUnit_geoJSON.features.forEach(function(targetFeature){

  	targetFeature.properties[targetDate] = 0;
  	var numberOfIndicatorFeaturesWithinTargetFeature = 0;

  	for (var index = 0; index < indicatorFeatures.length; index++){
  		var indicatorFeature = indicatorFeatures[index];
      if(within_usingBBOX(indicatorFeature, targetFeature)){
  			// remove from array and decrement index
  			indicatorFeatures.splice(index, 1);
        index--;
  			numberOfIndicatorFeaturesWithinTargetFeature++;
  			targetFeature.properties[targetDate] += Number(indicatorFeature.properties[targetDate]);
  		}
  	}
    totalAggregatedIndicatorFeatures += numberOfIndicatorFeaturesWithinTargetFeature;
  });

  console.log("Aggregation finished");
  console.log(totalAggregatedIndicatorFeatures + " features were aggregated to " + targetSpatialUnit_geoJSON.features.length + " targetFeatures");

  if(indicatorFeatures.length > 0){
    console.error("Spatial Aggregation failed for a total number of " + indicatorFeatures.length);
    throw Error("Spatial Aggregation operation failed for a total number of " + indicatorFeatures.length);
  }

  return targetSpatialUnit_geoJSON;
};

/**
* encapsulates {@linkcode turf} functon {@linkcode https://turfjs.org/docs/#bbox} and {@linkcode https://turfjs.org/docs/#bboxPolygon} to compute the bounding box of a single feature.
* @param {Object} feature - a single GeoJSON feature consisting of geometry and properties, for whom the bounding box shall be computed
* @returns {Object} the GeoJSON feature whose geometry has been replaced by the bounding box geometry of type {@linkcode Polygon}.
* The resulting feature contains all properties of the original feature
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#bbox}
* @see {@link https://turfjs.org/docs/#bboxPolygon}
* @memberof API_HELPER_METHODS
* @function
*/
function bbox_feature(feature){
  var feature_bbox = turf.bbox(feature);
  return turf.bboxPolygon(feature_bbox);
};

/**
* Computes the bounding boxes of all feature of the submitted {@linkcode featureCollection_geoJSON}.
* @param {Object} featureCollection_geoJSON - a GeoJSON FeatureCollection consisting of multiple features, for whom the bounding box shall be computed
* @returns {Object} the GeoJSON features whose geometry has been replaced by the bounding box geometry of type {@linkcode Polygon} as GeoJSON FeatureCollection.
* The resulting features contain all properties of the original feature.
* @see turf CONSTANT
* @see {@link bbox_feature}
* @memberof API_HELPER_METHODS
* @function
*/
function bbox_featureCollection(featureCollection_geoJSON){

  // replace all feature geometries with their bbox using turf.
  for(var index=0; index < featureCollection_geoJSON.features.length; index++){
    featureCollection_geoJSON.features[index] = bbox_feature(featureCollection_geoJSON.features[index]);
  };
  return featureCollection_geoJSON;
};

/**
* This method is an alternative implementation of a spatial {@linkcode within} function for spatial features.
* First of all, it computes bounding boxes of the relevant features to speed up the spatial comparison.
* Furthermore, instead of checking whether {@linkcode indicatorFeature} lies completely within {@linkcode targetFeature},
* it inspects whether the bounding boxes overlap for more than 90.0%. If the features's geometries might contain faulty coordinates for whatever reason that would
* cause a strict spatial {@linkcode within} comparison to output {@linkcode false}, this alternative approach ensures that such small coordinate failures will still
* result in a positive {@linkcode within} check.
* @param {Object} indicatorFeature - a base indicator (input) feature as GeoJSON feature
* @param {Object} targetFeature - a target feature as GeoJSON feature (for which indicator results shall be computed)
* @returns {boolean} returns {@linkcode true} if the {@linkcode indicatorFeature} lies within {@linkcode targetFeature}
* (precisely, if their bounding boxes overlap for more than 90.0%); {@linkcode false} otherwise
* @see {@link bbox_feature}
* @see {@link https://turfjs.org/docs/#area}
* @see {@link https://turfjs.org/docs/#intersect}
* @memberof API_HELPER_METHODS
* @function
*/
function within_usingBBOX(indicatorFeature, targetFeature){
  var indicatorFeature_bboxPolygon = bbox_feature(indicatorFeature);
  var targetFeature_bboxPolygon = bbox_feature(targetFeature);
  var indicatorFeature_bboxPolygon_area = turf.area(indicatorFeature_bboxPolygon);

  var intersection = turf.intersect(targetFeature_bboxPolygon, indicatorFeature_bboxPolygon);
  // if there is no intersection (features are disjoint) then skip this
  if (intersection == null || intersection == undefined)
    return false;

  var intersectionArea = turf.area(intersection);
  var overlapInPercent = Math.abs( intersectionArea / indicatorFeature_bboxPolygon_area) * 100;

  // if indicaturFeature overlaps for at least 90% with targetFeature, the assign it for aggregation to targetFeature
  if(overlapInPercent >= 90.0)
    return true;

  return false;
};
