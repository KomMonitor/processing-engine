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
* @namespace API_HELPER_METHODS_UTILITY
*/

/**
* @namespace API_HELPER_METHODS_GEOMETRIC_OPERATIONS
*/

/**
* @namespace API_HELPER_METHODS_STATISTICAL_OPERATIONS
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
* This constant contains the target URL for queries against openrouteservice (ORS) instance (version 4.7.2).
* Per default, it takes the value from the environment variable {@linkcode OPEN_ROUTE_SERVICE_URL}, which should
* be already configured by system administrator. Otherwise users may overwrite it and set an individual target URL.
* Note, that the methods that internally make use of this constant to perform ORS queries, expect version 4.7.2 without API-Key Authorization.
* @type {string}
* @memberof CONSTANTS
* @constant
*/
const openrouteservice_url = process.env.OPEN_ROUTE_SERVICE_URL;

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
* Checks whether the submitted object is a valid GeoJSON feature.
* The feature must contain a property {@linkcode "type"="Feature"} and a property named {@linkcode geometry}, which must have a {@linkcode coordinates} array and {@linkcode type} property.
* The method does not check, if the feature contains a {@linkcode properties} attribute.
* @param {Object} feature - a candidate for a GeoJSON feature.
* @return returns {@linkcode true} if the object is a valid GeoJSON feature; {@linkcode false} otherwise
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
function isGeoJSONFeature(feature){
  if (feature.type === "Feature" && feature.geometry && feature.geometry.coordinates && feature.geometry.type){
    return true;
  }
  else{
    return false;
  }
};

/**
* Checks whether the submitted object is a valid GeoJSON feature with geometryType {@linkcode Point}.
* The feature must contain a property {@linkcode "type"="Feature"} and a property named {@linkcode geometry}, which must have a {@linkcode coordinates} array and {@linkcode type=Point} property.
* The method does not check, if the feature contains a {@linkcode properties} attribute.
* @param {Object} feature - a candidate for a GeoJSON point feature.
* @return returns {@linkcode true} if the object is a valid GeoJSON point feature; {@linkcode false} otherwise
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
function isGeoJSONPointFeature(feature){
  if (feature.type === "Feature" && feature.geometry && feature.geometry.coordinates && feature.geometry.type === 'Point'){
    return true;
  }
  else{
    return false;
  }
};

/**
* Checks whether the submitted object is a valid GeoJSON FeatureCollection.
* The featureCollection must contain a property {@linkcode "type"="FeatureCollection"} and a property named {@linkcode features}, which must have an array of valid feature objects.
* @param {Object} featureCollection - a candidate for a GeoJSON FeatureCollection.
* @return returns {@linkcode true} if the object is a valid GeoJSON feature; {@linkcode false} otherwise
* @see {@link isGeoJSONFeature}
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
function isGeoJSONFeatureCollection(featureCollection){

  if(featureCollection.type === "FeatureCollection" && featureCollection.features){
    // check all child features
    var isValid = true;

    for (var featureCandidate of featureCollection.features){
      if (!isGeoJSONFeature(featureCandidate)){
        isValid = false;
        break;
      }
    }

    if (isValid){
      return true;
    }
    else{
      return false;
    }
  }
  else{
    return false;
  }
};

/**
* Utility method to throw an {@linkcode Error} object with custom message.
* @param {string} message - the message that the {@linkcode Error} object should contain
* @throws {Error} throws an {@linkcode Error} object with custom error message
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
function throwError(message){
  throw Error(message);
};

/**
* Concatenates indicator date property prefix and submitted targetDate.
* I.e, for exemplar targetDate="2018-01-01" it produces targetDateWithPrefix="DATE_2018-01-01".
* This is necessary in order to query timeseries property values from an indicator feature.
*
* indicatorFeature.properties[targetDate] --> null
* indicatorFeature.properties[targetDateWithPrefix] --> indicator value, (if timestamp is present)
* @param {string} targetDate - string representing the target date for which the indicator shall be computed, e.g. 2018-01-01
* @returns {string} the targetDate string with additional prefix from constant {@linkcode indicator_date_prefix} --> i.e. DATE_2018-01-01
* @memberof API_HELPER_METHODS_UTILITY
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
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#feature} to create a GeoJSON feature from a GeoJSON geometry.
* @param {Object} geometry - a GeoJSON Geometry (consisting of attributes {@linkcode type} and {@linkcode coordinates}).
* @returns {number} a GeoJSON feature wrapping the submitted GeoJSON geometry.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#feature}
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
function asFeature(geometry){
  return turf.area(geoJSON);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#featureCollection} to create a GeoJSON featureCollection from an array of GeoJSON features.
* @param {Array<Object>} features - an array of GeoJSON features.
* @returns {number} a GeoJSON FeatureCollection containing all the submitted features.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#featureCollection}
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
function asFeatureCollection(features){
  return turf.area(geoJSON);
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
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
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
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
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
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#area} to compute the area of the submitted features in square meters (m²).
* @param {Object} geoJSON - any form of valid GeoJSON object (e.g. a single feature, or a FeatureCollection) with polygonal geometries.
* @returns {number} the area of the submitted features in square meters (m²)
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#area}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function area(geoJSON){
  return turf.area(geoJSON);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#area} to compute the area of the submitted feature in square meters (m²) and append it as new property {@linkcode area_squareMeters}.
* @param {Object} feature - A single GeoJSON feature with polygonal geometry.
* @returns {Object} the GeoJSON feature containing its computed area in square meters (m²) within new property {@linkcode area_squareMeters}.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#area}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function area_feature_asProperty(feature){
  var isFeature = isGeoJSONFeature(feature);

  if(! isFeature){
    throwError("The submitted object is not a valid GeoJSON feature");
  }
  feature.properties.area_squareMeters = turf.area(feature);
  return feature;
};

/**
* Computes the area in square meters (m²) of each feature of the submitted {@linkcode featureCollection_geoJSON} as new property {@linkcode area_squareMeters}.
* @param {Object} featureCollection_geoJSON - A GeoJSON FeatureCollection with polygonal geometries.
* @returns {Object} the GeoJSON FeatureCollection containing the computed area of each feature in square meters (m²) within new property {@linkcode area_squareMeters} of each feature.
* @see turf CONSTANT
* @see {@link area_feature_asProperty}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function area_featureCollection_asProperty(featureCollection_geoJSON){

  // replace all feature geometries with their bbox using turf.
  for(var index=0; index < featureCollection_geoJSON.features.length; index++){
    featureCollection_geoJSON.features[index] = area_feature_asProperty(featureCollection_geoJSON.features[index]);
  };

  return featureCollection_geoJSON;
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#bbox} and {@linkcode https://turfjs.org/docs/#bboxPolygon} to compute the bounding box of a single feature.
* @param {Object} feature - a single GeoJSON feature consisting of geometry and properties, for whom the bounding box shall be computed
* @returns {Object} the GeoJSON feature whose geometry has been replaced by the bounding box geometry of type {@linkcode Polygon}.
* The resulting feature contains all properties of the original feature
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#bbox}
* @see {@link https://turfjs.org/docs/#bboxPolygon}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function bbox_feature(feature){
  var feature_bbox = turf.bbox(feature);
  // make sure, that properties array will remain
  feature_bbox.properties = feature.properties;
  return turf.bboxPolygon(feature_bbox);
};

/**
* Computes the bounding boxes of all features of the submitted {@linkcode featureCollection_geoJSON}.
* @param {Object} featureCollection_geoJSON - a GeoJSON FeatureCollection consisting of multiple features, for whom the bounding box shall be computed
* @returns {Object} the GeoJSON features whose geometry has been replaced by the bounding box geometry of type {@linkcode Polygon} as GeoJSON FeatureCollection.
* The resulting features contain all properties of the original features.
* @see turf CONSTANT
* @see {@link bbox_feature}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
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
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#buffer} to compute the buffered geometry a single feature.
* @param {Object} feature - a single GeoJSON feature consisting of geometry and properties, for whom the buffer shall be computed
* @param {number} radiusInMeters - the buffer radius in meters
* @returns {Object} the GeoJSON feature whose geometry has been replaced by the buffered geometry of type {@linkcode Polygon}.
* The resulting feature contains all properties of the original feature
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#buffer}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function buffer_feature(feature, radiusInMeters){
  // turf.bbox uses kilometers as default radius unit
  var feature_buffered = turf.buffer(feature, radiusInMeters/1000);
  // make sure, that properties array will remain
  feature_buffered.properties = feature.properties;
  return feature_buffered;
};

/**
* Computes the buffered geometries of all features of the submitted {@linkcode featureCollection_geoJSON}.
* @param {Object} featureCollection_geoJSON - a GeoJSON FeatureCollection consisting of multiple features, for whom the buffers shall be computed
* @param {number} radiusInMeters - the buffer radius in meters
* @returns {Object} the GeoJSON features whose geometry has been replaced by the buffered geometry of type {@linkcode Polygon} as GeoJSON FeatureCollection.
* The resulting features contain all properties of the original features.
* @see turf CONSTANT
* @see {@link buffer_feature}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function buffer_featureCollection(featureCollection_geoJSON, radiusInMeters){

  // replace all feature geometries with their bbox using turf.
  for(var index=0; index < featureCollection_geoJSON.features.length; index++){
    featureCollection_geoJSON.features[index] = bbox_feature(featureCollection_geoJSON.features[index]);
  };
  return featureCollection_geoJSON;
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#center} to compute the geometric center point the submitted features.
* @param {Object} geoJSON - any form of valid GeoJSON object (e.g. a single feature, or a FeatureCollection).
* @returns {Object} the GeoJSON point feature representing the absolute geometric center of the submitted features.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#center}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function center_geometric(geoJSON){
  return turf.center(geoJSON);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#centerOfMass} to compute the center of mass of the submitted features.
* @param {Object} geoJSON - any form of valid GeoJSON object (e.g. a single feature, or a FeatureCollection).
* @returns {Object} the GeoJSON point feature representing the center of mass of the submitted features (using the mean of all vertices).
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#centerOfMass}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function center_mass(geoJSON){
  return turf.center(geoJSON);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#booleanContains} to check if the submitted GeoJSON feature {@linkcode feature_A} contains {@linkcode feature_B}.
* @param {Object} feature_A - a GeoJSON feature of any type
* @param {Object} feature_B - a GeoJSON feature of any type
* @returns {boolean} returns {@linkcode true}, if {@linkcode feature_A} contains {@linkcode feature_B}.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#booleanContains}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function contains(feature_A, feature_B){

  return turf.booleanContains(feature_A, feature_B);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#difference} to compute the {@linkcode difference} between two polygonal GeoJSON features.
* @param {Object} polygonFeature_A - a GeoJSON feature of type {@linkcode Polygon}
* @param {Object} polygonFeature_B - a GeoJSON feature of type {@linkcode Polygon} to difference from {@linkcode polygonFeature_A}
* @returns {Object|null} the GeoJSON feature of type {@linkcode Polygon|MultiPolygon} showing the area of {@linkcode polygonFeature_A}
* excluding the area of {@linkcode polygonFeature_B} (if empty returns {@linkcode null}).
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#difference}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function difference(polygonFeature_A, polygonFeature_B){

  return turf.difference(polygonFeature_A, polygonFeature_B);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#dissolve} to dissolve polygonal features.
* @param {Object} featureCollection_geoJSON - valid GeoJSON FeatureCollection with polygonal geometries (MultiPolygons will be transformed to multiple polygons before dissolving).
* @param {string} propertyName - OPTIONAL parameter that points to an existing attribute used by the features. If set, only features with the same attribute value will be dissolved.
* @returns {Object} the GeoJSON FeatureCollection containing the dissolved features (Note that attributes are not merged/aggregated).
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#dissolve}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function dissolve(featureCollection_geoJSON, propertyName){

  featureCollection_geoJSON = transformMultiPolygonsToPolygons(featureCollection_geoJSON);

  if (propertyName){
      return turf.dissolve(featureCollection_geoJSON, {propertyName: propertyName});
  }
  else{
      return turf.dissolve(featureCollection_geoJSON);
  }
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#booleanDisjoint} to check if the submitted GeoJSON features are {@linkcode disjoint}.
* @param {Object} feature_A - a GeoJSON feature of any type
* @param {Object} feature_B - a GeoJSON feature of any type
* @returns {boolean} returns {@linkcode true}, if both features are disjoint and thus do not intersect.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#booleanDisjoint}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function disjoint(feature_A, feature_B){

  return turf.booleanDisjoint(feature_A, feature_B);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#distance} to compute the direct (aerial) distance between the submitted points.
* @param {Object} point_A - valid GeoJSON Feature with geometry type {@linkcode Point}
* @param {Object} point_B - valid GeoJSON Feature with geometry type {@linkcode Point}
* @returns {Object} the direct distance between the submitted points in kilometers.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#distance}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function distance_direct_kilometers(point_A, point_B){
  return turf.distance(point_A, point_B, {unit: 'kilometers'});
};

/**
* Performs a GET request against {@linkcode /routes} endpoint of the openrouteservice instance
* specified via the CONSTANT {@link openrouteservice_url} (version 4.7.2) to aquire the distance
* between the submitted points based on waypath routing.
* @param {Object} point_A - valid GeoJSON Feature with geometry type {@linkcode Point} - the coordinates are expected to follow the order {@linkcode longitude, latitude}
* @param {Object} point_B - valid GeoJSON Feature with geometry type {@linkcode Point} - the coordinates are expected to follow the order {@linkcode longitude, latitude}
* @param {Object} vehicleType - the type of vehicle to use for routing analysis;
* allowed values are {@linkcode PEDESTRIAN},{@linkcode BIKE}, {@linkcode CAR}. If parameter has in invalid value, {@linkcode PEDESTRIAN} is used per default.
* @returns {Object} the distance between the submitted points in kilometers based on waypath routing
* (thus, the distance is likely to be greater then the direct distance computed by {@link distance_direct_kilometers}).
* @see openrouteservice_url CONSTANT
* @see {@link distance_direct_kilometers}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
async function distance_waypath_kilometers(point_A, point_B, vehicleType){
  // call openroute service 4.7.2 API to query routing from A to B

  // coordinate string must be "lon,lat|lon,lat"

  var isPointFeature_A = isGeoJSONPointFeature(point_A);
  var isPointFeature_B = isGeoJSONPointFeature(point_B);

  if(! isPointFeature_A){
    throwError("The submitted object point_A is not a valid GeoJSON point feature. It was: " + point_A);
  }
  if(! isPointFeature_B){
    throwError("The submitted object point_B is not a valid GeoJSON point feature. It was: " + point_B);
  }

  var coordinates_A = point_A.geometry.coordinates;
  var coordinates_B = point_B.geometry.coordinates;

  var coordinatesString = coordinates_A[0] + "," + coordinates_A[1] + "|" + coordinates_B[0] + "," + coordinates_B[1];

  var vehicleString;

  switch (vehicleType) {
    case "PEDESTRIAN":
      vehicleString = "foot-walking";
      break;
    case "BIKE":
      vehicleString = "cycling-regular";
      break;
    case "CAR":
      vehicleString = "driving-car";
      break;
    default:
      vehicleString = "foot-walking";
  }

  var constantParameterString = "&preference=shortest&units=km&language=en&geometry=false&instructions=false";

  var ors_route_GET_request = openrouteservice_url + "/routes?" + "profile=" + vehicleString + "&coordinates=" + coordinatesString + constantParameterString;

  console.log("Query OpenRouteService with following routing request: " + ors_route_GET_request);

  var routingResult = await executeOrsQuery(ors_route_GET_request);

  /*
  * exemplar response
  * {
    "routes": [
        {
            "summary": {
                "distance": 3.563,
                "duration": 2565.3
            },
            "bbox": [
                7.00902,
                51.469817,
                7.018066,
                51.498569
            ]
        }
    ],
    ...
  }
  */

  return routingResult.routes[0].summary.distance;
};

function executeOrsQuery(ors_route_GET_request){
  axios.get(ors_route_GET_request)
    .then(response => {
      // response.data should be the query response
      return response.data;
    })
    .catch(error => {
      console.log("Error while executing OpenRouteService GET request. Error was: " + error);
      throw error;
    });
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#booleanDisjoint} and negates the result to check if the submitted GeoJSON features {@linkcode intersect} each other.
* @param {Object} feature_A - a GeoJSON feature of any type
* @param {Object} feature_B - a GeoJSON feature of any type
* @returns {boolean} returns {@linkcode true}, if both features intersect each other.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#booleanDisjoint}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function intersects(feature_A, feature_B){

  return ! turf.booleanDisjoint(feature_A, feature_B);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#intersect} to compute the {@linkcode intersection} between two polygonal GeoJSON features.
* @param {Object} polygonFeature_A - a GeoJSON feature of type {@linkcode Polygon}
* @param {Object} polygonFeature_B - a GeoJSON feature of type {@linkcode Polygon}
* @returns {Object|null} returns a GeoJSON feature representing the point(s) they share (in case of a {@linkcode Point} or {@linkcode MultiPoint} ),
* the borders they share (in case of a {@linkcode LineString} or a {@linkcode MultiLineString} ), the area they share (in case of {@linkcode Polygon} or {@linkcode MultiPolygon} ).
* If they do not share any point, returns {@linkcode null}
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#intersect}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function intersection(polygonFeature_A, polygonFeature_B){

  return turf.intersect(polygonFeature_A, polygonFeature_B);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#booleanOverlap} to check if the submitted GeoJSON features overlaop each other.
* @param {Object} feature_A - a GeoJSON feature of any type
* @param {Object} feature_B - a GeoJSON feature of any type
* @returns {boolean} returns {@linkcode true}, if {@linkcode feature_A} overlaps partially with {@linkcode feature_B}.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#booleanOverlap}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function overlap(feature_A, feature_B){
  return turf.booleanOverlap(feature_A, feature_B);
};

/**
* Inspects the submitted GeoJSON FeatureCollection for any features of type {@linkcode MultiPolygon}.
* @param {Object} featureCollection_geoJSON - valid GeoJSON FeatureCollection with polygonal geometries
* @returns {boolean} returns {@linkcode true}, if the featureCollection contains any features of type {@linkcode MultiPolygon}; {@linkcode false} otherwise
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
function hasMultiPolygon(featureCollection_geoJSON){
  for (var feature of featureCollection_geoJSON){
    if (feature.geometry.type === "MultiPolygon"){
      return true;
    }
  }

  return false;
};

/**
* Inspects the submitted GeoJSON FeatureCollection for any features of type {@linkcode MultiPolygon} and replaces them by the individual features of type {@linkcode Polygon}.
* @param {Object} featureCollection_geoJSON - valid GeoJSON FeatureCollection with polygonal geometries (MultiPolygons will be transformed to multiple polygons).
* @returns {Object} the GeoJSON FeatureCollection without any features of type {@linkcode MultiPolygon}. It may have an increased number of total features,
* if any {@linkcode MultiPolygon} was replaced by its individual features of type {@linkcode Polygon}.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
function transformMultiPolygonsToPolygons(featureCollection_geoJSON){

  while(hasMultiPolygon(featureCollection_geoJSON)){
    console.log("Replace MultiPolygon features by Polygons");
    featureCollection_geoJSON = replaceMultiPolygonsByPolygons(featureCollection_geoJSON);
  }

  return featureCollection_geoJSON;
};

/**
* Replces any feature of type {@linkcode MultiPolygon} of the submitted featureCollection by the individual features of type {@linkcode Polygon}.
* @param {Object} featureCollection_geoJSON - valid GeoJSON FeatureCollection with polygonal geometries (MultiPolygons will be replaced by multiple polygons).
* @returns {Object} the GeoJSON FeatureCollection where features of type {@linkcode MultiPolygon} have been replaced by multiple features of type {@linkcode Polygon}.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
function replaceMultiPolygonsByPolygons(featureCollection_geoJSON){
  for (var index=0; index < featureCollection_geoJSON.features.length; index++){
  	var feature = featureCollection_geoJSON.features[index];
    var geom=feature.geometry;
    var props=feature.properties;

     if(geom != undefined){
  	   if (geom.type === 'MultiPolygon'){
  		   featureCollection_geoJSON.features.splice(index, 1);

         // iterate over each Polygon wihin MultiPolygon
  		  for (var i=0; i < geom.coordinates.length; i++){
  			  var polygon = {
  					'type':'Feature',
  					'geometry':{
  					   'type':'Polygon',
  					   'coordinates':geom.coordinates[i]
  						},
  				    'properties': props}; // set properties from MultiPolygon as we do not know better

  			  // append polygon to features
  			  featureCollection_geoJSON.features.push(polygon);
  		  }

        // as we removed a feature, we must set the index back by 1
        index --;
  		}
     }
     else{
       // simply remove the strange feature which contains no geometry
  		featureCollection_geoJSON.features.splice(index, 1);
      // as we removed a feature, we must set the index back by 1
      index --;
     }
   };

   return featureCollection_geoJSON;
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#union} to compute the {@linkcode union} of two or more polygonal GeoJSON features.
* @param {Object} polygonFeature_A - a GeoJSON feature of type {@linkcode Polygon}
* @param {Object} polygonFeature_B - a GeoJSON feature of type {@linkcode Polygon}
* @returns {Object|null} the GeoJSON feature of type {@linkcode Polygon|MultiPolygon} representing the {@linkcode union} of the submitted features or {@linkcode null}.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#union}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function union(polygonFeature_A, polygonFeature_B){
  return turf.union(polygonFeature_A, polygonFeature_B);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#booleanWithin} to check if the submitted GeoJSON feature {@linkcode feature_A} lies within {@linkcode feature_B}.
* @param {Object} feature_A - a GeoJSON feature of any type
* @param {Object} feature_B - a GeoJSON feature of any type
* @returns {boolean} returns {@linkcode true}, if {@linkcode feature_A} lies within {@linkcode feature_B}.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#booleanWithin}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function within(feature_A, feature_B){

  return turf.booleanWithin(feature_A, feature_B);
};

/**
* This method is an alternative implementation of a spatial {@linkcode within} function for spatial features.
* First of all, it computes bounding boxes of the relevant features to speed up the spatial comparison.
* Furthermore, instead of checking whether {@linkcode feature_A} lies completely within {@linkcode feature_B},
* it inspects whether the bounding boxes overlap for more than 90.0%. If the features's geometries might contain faulty coordinates for whatever reason that would
* cause a strict spatial {@linkcode within} comparison to output {@linkcode false}, this alternative approach ensures that such small coordinate failures will still
* result in a positive {@linkcode within} check.
* @param {Object} feature_A - a base indicator (input) feature as GeoJSON feature
* @param {Object} feature_B - a target feature as GeoJSON feature (for which indicator results shall be computed)
* @returns {boolean} returns {@linkcode true} if the {@linkcode feature_A} lies within {@linkcode feature_B}
* (precisely, if their bounding boxes overlap for more than 90.0%); {@linkcode false} otherwise
* @see {@link bbox_feature}
* @see {@link area}
* @see {@link https://turfjs.org/docs/#intersect}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
function within_usingBBOX(feature_A, feature_B){
  var feature_A_bboxPolygon = bbox_feature(feature_A);
  var feature_B_bboxPolygon = bbox_feature(feature_B);
  var feature_A_bboxPolygon_area = area(feature_A_bboxPolygon);

  var intersection = turf.intersect(feature_B_bboxPolygon, feature_A_bboxPolygon);
  // if there is no intersection (features are disjoint) then skip this
  if (intersection == null || intersection == undefined)
    return false;

  var intersectionArea = area(intersection);
  var overlapInPercent = Math.abs( intersectionArea / feature_A_bboxPolygon_area) * 100;

  // if indicaturFeature overlaps for at least 90% with feature_B, the assign it for aggregation to feature_B
  if(overlapInPercent >= 90.0)
    return true;

  return false;
};
