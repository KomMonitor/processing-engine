//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NECESSARY NODE MODULE DEPENDENCIES                                                                                                                       //                                                                                                                         //
//                                                                                                                                                          //
// SEE MODULE "KmProcessingEngine" for numerous predefined helper methods                                 //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* Module that contains various helper methods (spatial GIS functions and statistical functions)
* to simplify script writing
*/
const KmHelper = require("kmhelper");


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CONSTANTS DEFINITION                                                                                                                                     //
// here you may specify custom CONSTANTS used within the script.                                                                                            //                                            //                               //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
* NOTE: The function is async, so users may make use of keyword "await" to wait for results of other async helper API methods.
* (This is necessary when users want to wait for asynchronous method execution such as external API calls in a synchronous program)
*
* @param {string} targetDate - string representing the target date for which the indicator shall be computed, following the pattern {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01}
* @param {FeatureCollection<Polygon>} targetSpatialUnit_geoJSON - string target spatial unit as GeoJSON FeatureCollection object.
* @param {map.<string, FeatureCollection<Polygon>>} baseIndicatorsMap - Map containing all indicators, wheres key='meaningful name or id of the indicator' and value='indicator as GeoJSON object' (it contains duplicate entries, one for the indicator name and one for the indicator id)
* @param {map.<string, FeatureCollection<Polygon|LineString|Point>>} georesourcesMap - Map containing all georesources, wheres key='meaningful name or id of the georesource' and value='georesource as GeoJSON object' (they are used to execute geometric/toptologic computations) (it contains duplicate entries, one for the georesource name and one for the georesource id)
* @param {Array.<Object.<string, (string|number|boolean)>>} processParameters - an array containing objects representing variable additional process parameters that are required to perform the indicator computation.
* Each entry has properties Object.name and Object.value for name and value of the parameter.
* @returns {FeatureCollection<Polygon>} the computed indicator for submitted {@linkcode targetSpatialUnit_geoJSON} features as GeoJSON FeatureCollection
* @memberof METHODS_TO_IMPLEMENT_OR_OVERWRITE
* @function
*/
async function computeIndicator(targetDate, targetSpatialUnit_geoJSON, baseIndicatorsMap, georesourcesMap, processParameters){
  // compute indicator for targetDate and targetSpatialUnitFeatures

  // retrieve required baseIndicator using its meaningful name
  var grundschulenGeoJSON = KmHelper.getGeoresourceByName('Grundschulen', georesourcesMap);

  KmHelper.log("Retrieved required georesources successfully");

  var numFeatures = targetSpatialUnit_geoJSON.features.length;

  // now we compute the new indicator
  KmHelper.log("replace feature geometries of targetSpatialUnit with their center point of mass.");

  // now we compute the new indicator
  KmHelper.log("Compute indicator for a total amount of " + numFeatures + " features by calculating the nearest school using footway paths.");


  // iterate once over target spatial unit features and compute indicator utilizing map entries
  var spatialUnitIndex = 0;
  // create progress log after each 10th percent of features
  var logProgressIndexSeparator = Math.round(numFeatures / 100 * 10);
  for (var index=0; index < targetSpatialUnit_geoJSON.features.length; index++){

    KmHelper.log("INdex: " + index);

    var spatialUnitFeature = targetSpatialUnit_geoJSON.features[index];
    var centroid = KmHelper.center_mass(spatialUnitFeature, spatialUnitFeature.properties);

    //targetPoint, pointCollection, vehicleType
    var nearestElementarySchool = await KmHelper.nearestPoint_waypathDistance(centroid, grundschulenGeoJSON, "PEDESTRIAN");

    // footpath distance on km
    var distance_waypath = await KmHelper.distance_waypath_kilometers(centroid, nearestElementarySchool, "PEDESTRIAN");

    // set indicator value for spatialUnitFeature
    spatialUnitFeature = KmHelper.setIndicatorValue(spatialUnitFeature, targetDate, distance_waypath);

  	spatialUnitIndex ++;

    // only log after certain progress
    if(spatialUnitIndex % logProgressIndexSeparator === 0){
        KmHelper.log("PROGRESS: Computed '" + spatialUnitIndex + "' of total '" + numFeatures + "' features.");
    }
  }
  // targetSpatialUnit_geoJSON.features.forEach(function(spatialUnitFeature) {
  //
  //   var centroid = center_mass(spatialUnitFeature, spatialUnitFeature.properties);
  //
  //   //targetPoint, pointCollection, vehicleType
  //   var nearestElementarySchool = await nearestPoint_waypathDistance(centroid, grundschulenGeoJSON, "PEDESTRIAN");
  //
  //   // footpath distance on km
  //   var distance_waypath = await distance_waypath_kilometers(centroid, nearestElementarySchool, "PEDESTRIAN");
  //
  //   // set indicator value for spatialUnitFeature
  //   spatialUnitFeature = setIndicatorValue(spatialUnitFeature, targetDate, distance_waypath);
  //
  // 	spatialUnitIndex ++;
  //
  //   // only log after certain progress
  //   if(spatialUnitIndex % logProgressIndexSeparator === 0){
  //       KmHelper.log("PROGRESS: Computed '" + spatialUnitIndex + "' of total '" + numFeatures + "' features.");
  //   }
  // });

  KmHelper.log("Computation of indicator finished");

  return targetSpatialUnit_geoJSON;

};

/**
* This method is used to aggregate indicators of a certain spatial unit to the features of a more high-level spatial unit (i.e. aggregate from building blocks to city districts).
* The template contains predefined aggregation logic that makes use of constant {@linkcode aggregationType} to decide how indicator values shall be aggregated.
* The aggrgation internally aggregates features of {@linkcode indicator_geoJSON} to features of {@linkcode targetSpatialUnit_geoJSON} by comparing their geometries.
* Each {@linkcode indicator_geoJSON} feature whose geometry lies within a certain geometry of a {@linkcode targetSpatialUnit_geoJSON} feature will be used to compute the aggregated indicator values.
* The within comparison is executed by method {@linkcode within_usingBBOX}.
* @param {string} targetDate - string representing the target date for which the indicator shall be computed, following the pattern {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01}
* @param {FeatureCollection<Polygon>} targetSpatialUnit_geoJSON - string target spatial unit features of the target spatial unit, for which the indicator shall be aggregated to as GeoJSON FeatureCollection
* @param {FeatureCollection<Polygon>} indicator_geoJSON - GeoJSON features containing the indicator values for a spatial unit that can be aggregated to the features of parameter targetSpatialUnit_geoJSON
* @see aggregationType
* @see within_usingBBOX
* @returns {FeatureCollection<Polygon>} the features of {@linkcode targetSpatialUnit_geoJSON} which contain the aggregated indicator values as GeoJSON FeatureCollection.
* @memberof METHODS_TO_IMPLEMENT_OR_OVERWRITE
* @function
*/
function aggregateIndicator(targetDate, targetSpatialUnit_geoJSON, indicator_geoJSON){
  // aggregate indicator
  if (!aggregationTypeEnum.includes(aggregationType)){
    KmHelper.log("Unknown parameter value for 'aggregationType' was specified for aggregation logic. Parameter value was '" + aggregationType +
      "'. Allowed values are: " + aggregationTypeEnum);
    KmHelper.log("Will fallback to using AVERAGE aggregation logic.");
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
* @param {string} targetDate - string representing the target date for which the indicator shall be computed, following the pattern {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01}
* @param {FeatureCollection<Polygon>} targetSpatialUnit_geoJSON - string target spatial unit features of the target spatial unit, for which the indicator shall be disaggregated to as GeoJSON FeatureCollection
* @param {FeatureCollection<Polygon>} indicator_geoJSON - GeoJSON features containing the indicator values for a spatial unit that can be disaggregated to the features of parameter targetSpatialUnit_geoJSON
* @returns {FeatureCollection<Polygon>} the features of {@linkcode targetSpatialUnit_geoJSON} which contain the disaggregated indicator values as GeoJSON FeatureCollection.
* @memberof METHODS_TO_IMPLEMENT_OR_OVERWRITE
* @function
*/
function disaggregateIndicator(targetDate, targetSpatialUnit_geoJSON, indicator_geoJSON){
  // disaggregate indicator

};


/**
* Aggregate features from {@linkcode indicator_geoJSON} to target features of {@linkcode targetSpatialUnit_geoJSON}
* by computing the AVERAGE indicator value of all affected features. Internally this compares the centroids of each indicator feature to target spatial unit features.
* Also it uses the {@linkcode KmHelper.getAggregationWeight(feature)} method as weight during aggregtion.
* @param {string} targetDate - string representing the target date for which the indicator shall be computed, following the pattern {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01}
* @param {FeatureCollection<Polygon>} targetSpatialUnit_geoJSON - GeoJSON features of the target spatial unit, for which the indicator shall be aggregated to
* @param {FeatureCollection<Polygon>} indicator_geoJSON - GeoJSON features containing the indicator values for a spatial unit that can be aggregated to the features of parameter {@linkcode targetSpatialUnitFeatures}
* @returns {FeatureCollection<Polygon>} a GeoJSON FeatureCollection of all features of the submitted {@linkcode targetSpatialUnit_geoJSON}
* containing the resulting aggregated indicator values as new property according to the submitted {@linkcode targetDate}
* @see {@link within_usingBBOX}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function aggregate_average(targetDate, targetSpatialUnit_geoJSON, indicator_geoJSON){
  // aggregate indicator

  var indicatorFeatures = indicator_geoJSON.features;

  KmHelper.log("Aggregate indicator for targetDate " + targetDate + " for a total amount of " + targetSpatialUnit_geoJSON.features.length + " target features. Computing AVERAGE values.");
  KmHelper.log("Aggregate from a total number of " + indicator_geoJSON.features.length + " baseFeatures");
  KmHelper.log("Aggregating by comparing the centroids of each indicator feature to target spatial unit features. Each indicator feature will be weighted by its size (area in squareMeters).");

  targetDate = KmHelper.getTargetDateWithPropertyPrefix(targetDate);
  KmHelper.log('Target Date with prefix: ' + targetDate);

  var totalAggregatedIndicatorFeatures = 0;

  targetSpatialUnit_geoJSON.features.forEach(function(targetFeature){

  	targetFeature.properties[targetDate] = 0;
  	var baseIndicatorTotalWeight = 0;

  	for (var index = 0; index < indicatorFeatures.length; index++){
  		var indicatorFeature = indicatorFeatures[index];
      var centerPoint = KmHelper.centroid(indicatorFeature);
      if(KmHelper.within(centerPoint, targetFeature)){
  			// remove from array and decrement index
  			indicatorFeatures.splice(index, 1);
        index--;
          // aggregationWeight is either 1 or a custom user-set weight value set within computeIndicator()-method
          // it "survives" until this aggregation logic within processing engine
          var weight = KmHelper.getAggregationWeight(indicatorFeature);

          // use weight as weight for indicator value
          baseIndicatorTotalWeight += weight;
          targetFeature.properties[targetDate] += Number(indicatorFeature.properties[targetDate]) * weight;
  		}
  	}

    // KmHelper.log("total accumulated value is " + targetFeature.properties[targetDate] + " for targetFeature with id " + targetFeature.properties.spatialUnitFeatureId + ". It will be divided by " + baseIndicatorTotalWeight);
  	// compute average for share
  	targetFeature.properties[targetDate] = (targetFeature.properties[targetDate] / baseIndicatorTotalWeight);
    totalAggregatedIndicatorFeatures += baseIndicatorTotalWeight;
    // KmHelper.log("resulting average value is " + targetFeature.properties[targetDate]);
  });

  KmHelper.log("Aggregation finished");
  KmHelper.log(totalAggregatedIndicatorFeatures + " features were aggregated to " + targetSpatialUnit_geoJSON.features.length + " targetFeatures");

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
* @param {string} targetDate - string representing the target date for which the indicator shall be computed, following the pattern {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01}
* @param {FeatureCollection<Polygon>} targetSpatialUnit_geoJSON - GeoJSON features of the target spatial unit, for which the indicator shall be aggregated to
* @param {FeatureCollection<Polygon>} indicator_geoJSON - GeoJSON features containing the indicator values for a spatial unit that can be aggregated to the features of parameter {@linkcode targetSpatialUnitFeatures}
* @returns {FeatureCollection<Polygon>} a GeoJSON FeatureCollection of all features of the submitted {@linkcode targetSpatialUnit_geoJSON}
* containing the resulting aggregated indicator values as new property according to the submitted {@linkcode targetDate}
* @see {@link within_usingBBOX}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function aggregate_sum(targetDate, targetSpatialUnit_geoJSON, indicator_geoJSON){
  // aggregate indicator

  var indicatorFeatures = indicator_geoJSON.features;

  KmHelper.log("Aggregate indicator for targetDate " + targetDate + " for a total amount of " + targetSpatialUnit_geoJSON.features.length + " target features. Computing SUM values.");
  KmHelper.log("Aggregate from a total number of " + indicator_geoJSON.features.length + " baseFeatures");
  KmHelper.log("Aggregating by comparing the centroids of each indicator feature to target spatial unit features. Each indicator feature will be weighted by its size (area in squareMeters).");

  targetDate = KmHelper.getTargetDateWithPropertyPrefix(targetDate);
  KmHelper.log('Target Date with prefix: ' + targetDate);

  var totalAggregatedIndicatorFeatures = 0;

  targetSpatialUnit_geoJSON.features.forEach(function(targetFeature){

  	targetFeature.properties[targetDate] = 0;
  	var numberOfIndicatorFeaturesWithinTargetFeature = 0;

  	for (var index = 0; index < indicatorFeatures.length; index++){
  		var indicatorFeature = indicatorFeatures[index];
      var centerPoint = KmHelper.centroid(indicatorFeature);
      if(KmHelper.within(centerPoint, targetFeature)){
  			// remove from array and decrement index
  			indicatorFeatures.splice(index, 1);
        index--;
  			numberOfIndicatorFeaturesWithinTargetFeature++;
  			targetFeature.properties[targetDate] += Number(indicatorFeature.properties[targetDate]);
  		}
  	}
    totalAggregatedIndicatorFeatures += numberOfIndicatorFeaturesWithinTargetFeature;
  });

  KmHelper.log("Aggregation finished");
  KmHelper.log(totalAggregatedIndicatorFeatures + " features were aggregated to " + targetSpatialUnit_geoJSON.features.length + " targetFeatures");

  if(indicatorFeatures.length > 0){
    console.error("Spatial Aggregation failed for a total number of " + indicatorFeatures.length);
    throw Error("Spatial Aggregation operation failed for a total number of " + indicatorFeatures.length);
  }

  return targetSpatialUnit_geoJSON;
};

module.exports.computeIndicator = computeIndicator;
module.exports.aggregateIndicator = aggregateIndicator;
module.exports.disaggregateIndicator = disaggregateIndicator;
