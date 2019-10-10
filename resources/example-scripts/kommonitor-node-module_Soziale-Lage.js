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

  // retrieve required baseIndicator
  var ewzGeoJSON = KmHelper.getBaseIndicatorById('d6f447c1-5432-4405-9041-7d5b05fd9ece', baseIndicatorsMap);
  var anteilArbeitsloserGeoJSON = KmHelper.getBaseIndicatorById('7a9ba917-530d-4fc0-b2fa-397d63c56309', baseIndicatorsMap);
  var anteilWahlberechtigterGeoJSON = KmHelper.getBaseIndicatorById('e1118b54-9eee-4775-9cd5-cc20685d6ae9', baseIndicatorsMap);
  var sterberisikoGeoJSON = KmHelper.getBaseIndicatorById('168d926a-97be-424a-9a83-d559db87ef41', baseIndicatorsMap);
  var wohnflProPersonGeoJSON = KmHelper.getBaseIndicatorById('8e5587ae-27a1-41e5-9459-663cda0dff4a', baseIndicatorsMap);

  KmHelper.log("Retrieved required baseIndicators successfully");

  // now we compute the new indicator
  KmHelper.log("Iterate over base indicators and save intermediate values within a map object");

  /**
  * create a map to store indicator values for each feature of the target spatial unit
  * by using such a map object, we can ensure, that we only iterate ONCE over each bease indicator
  * and also can only iterate ONCE over each target spatial unit feature at the end to compute the indicator
  */
  var map = new Map();

  KmHelper.log("Process base indicator 'Gesamteinwohnerzahl'");

  /**
  * iterate over each feature of the baseIndicator and use its indicator value to modify map object
  * NOTE use spatialUnitFeatureId as key to be able to identify entries by their unique feature id!
  */
  ewzGeoJSON.features.forEach(function(feature) {
    // get the unique featureID of the spatial unit feature as String
    var featureId = KmHelper.getSpatialUnitFeatureIdValue(feature);
    // get the time series value of the base indicator feature for the requested target date (with its required prefix!)
    var einwohnerzahl = KmHelper.getIndicatorValue(feature, targetDate);

    if(einwohnerzahl === undefined || einwohnerzahl === null){
      KmHelper.log("WARNING: the feature with featureID '" + featureId + "' does not contain a time series value for targetDate '" + targetDate + "'");
      KmHelper.log("WARNING: the feature value will thus be set to '0' and computation will continue");
      einwohnerzahl = 0;
    }

    var mapObject = {
      featureId: featureId,
      indicatorValue: undefined,
      anteilArbeitsloser: undefined,
      anteilWahlberechtigter: undefined,
      sterberisiko: undefined,
      wohnflProPerson: undefined,
      ewz: einwohnerzahl
    };

    // modify map object (i.e. set value initially, or perform calculations and store modified value)
    // key should be unique featureId of the spatial unit feature
    map.set(featureId, mapObject);
  });

  var populationArray_arbeitslose = [];
  var populationArray_wahlberechtigte = [];
  var populationArray_wohnflProPerson = [];
  var populationArray_sterberisiko = [];

  KmHelper.log("Process base indicator 'anteilArbeitsloser'");

  /**
  * iterate over each feature of the baseIndicator and use its indicator value to modify map object
  * NOTE use spatialUnitFeatureId as key to be able to identify entries by their unique feature id!
  */
  anteilArbeitsloserGeoJSON.features.forEach(function(feature) {

    var anteilArbeitsloser = KmHelper.getIndicatorValue(feature, targetDate);
    populationArray_arbeitslose.push(-1*anteilArbeitsloser);
  });

  anteilArbeitsloserGeoJSON.features.forEach(function(feature) {
    // get the unique featureID of the spatial unit feature as String
    var featureId = KmHelper.getSpatialUnitFeatureIdValue(feature);
    // get the time series value of the base indicator feature for the requested target date (with its required prefix!)
    var anteilArbeitsloser = KmHelper.getIndicatorValue(feature, targetDate);

    if(anteilArbeitsloser === undefined || anteilArbeitsloser === null){
      KmHelper.log("WARNING: the feature with featureID '" + featureId + "' does not contain a time series value for targetDate '" + targetDate + "'");
      KmHelper.log("WARNING: the feature value will thus be set to '0' and computation will continue");
      anteilArbeitsloser = 0;
    }

    // modify map object (i.e. set value initially, or perform calculations and store modified value)
    // key should be unique featureId of the spatial unit feature
    var mapEntry = map.get(featureId);

    mapEntry.anteilArbeitsloser = KmHelper.zScore_byPopulationArray(-1*anteilArbeitsloser, populationArray_arbeitslose, false);
    map.set(featureId, mapEntry);
  });

  KmHelper.log("Process base indicator 'anteilWahlberechtigter'");

  /**
  * iterate over each feature of the baseIndicator and use its indicator value to modify map object
  * NOTE use spatialUnitFeatureId as key to be able to identify entries by their unique feature id!
  */
  anteilWahlberechtigterGeoJSON.features.forEach(function(feature) {

    var anteilWahlberechtigter = KmHelper.getIndicatorValue(feature, targetDate);
    populationArray_wahlberechtigte.push(anteilWahlberechtigter);
  });

  anteilWahlberechtigterGeoJSON.features.forEach(function(feature) {
    // get the unique featureID of the spatial unit feature as String
    var featureId = KmHelper.getSpatialUnitFeatureIdValue(feature);
    // get the time series value of the base indicator feature for the requested target date (with its required prefix!)
    var anteilWahlberechtigter = KmHelper.getIndicatorValue(feature, targetDate);

    if(anteilWahlberechtigter === undefined || anteilWahlberechtigter === null){
      KmHelper.log("WARNING: the feature with featureID '" + featureId + "' does not contain a time series value for targetDate '" + targetDate + "'");
      KmHelper.log("WARNING: the feature value will thus be set to '0' and computation will continue");
      anteilWahlberechtigter = 0;
    }

    // modify map object (i.e. set value initially, or perform calculations and store modified value)
    // key should be unique featureId of the spatial unit feature
    var mapEntry = map.get(featureId);

    mapEntry.anteilWahlberechtigter = KmHelper.zScore_byPopulationArray(anteilWahlberechtigter, populationArray_wahlberechtigte, false);;

    map.set(featureId, mapEntry);
  });

  KmHelper.log("Process base indicator 'wohnflProPerson'");
  wohnflProPersonGeoJSON.features.forEach(function(feature) {

    var wohnflProPerson = KmHelper.getIndicatorValue(feature, targetDate);
    populationArray_wohnflProPerson.push(wohnflProPerson);
  });

  wohnflProPersonGeoJSON.features.forEach(function(feature) {
    // get the unique featureID of the spatial unit feature as String
    var featureId = KmHelper.getSpatialUnitFeatureIdValue(feature);
    // get the time series value of the base indicator feature for the requested target date (with its required prefix!)
    var wohnflProPerson = KmHelper.getIndicatorValue(feature, targetDate);

    if(wohnflProPerson === undefined || wohnflProPerson === null){
      KmHelper.log("WARNING: the feature with featureID '" + featureId + "' does not contain a time series value for targetDate '" + targetDate + "'");
      KmHelper.log("WARNING: the feature value will thus be set to '0' and computation will continue");
      wohnflProPerson = 0;
    }

    // modify map object (i.e. set value initially, or perform calculations and store modified value)
    // key should be unique featureId of the spatial unit feature
    var mapEntry = map.get(featureId);

    mapEntry.wohnflProPerson = KmHelper.zScore_byPopulationArray(wohnflProPerson, populationArray_wohnflProPerson, false);;

    map.set(featureId, mapEntry);
  });

  KmHelper.log("Process base indicator 'sterberisiko'");
  sterberisikoGeoJSON.features.forEach(function(feature) {

    var sterberisiko = KmHelper.getIndicatorValue(feature, targetDate);
    populationArray_sterberisiko.push(sterberisiko);
  });

  sterberisikoGeoJSON.features.forEach(function(feature) {
    // get the unique featureID of the spatial unit feature as String
    var featureId = KmHelper.getSpatialUnitFeatureIdValue(feature);
    // get the time series value of the base indicator feature for the requested target date (with its required prefix!)
    var sterberisiko = KmHelper.getIndicatorValue(feature, targetDate);

    if(sterberisiko === undefined || sterberisiko === null){
      KmHelper.log("WARNING: the feature with featureID '" + featureId + "' does not contain a time series value for targetDate '" + targetDate + "'");
      KmHelper.log("WARNING: the feature value will thus be set to '0' and computation will continue");
      sterberisiko = 0;
    }

    // modify map object (i.e. set value initially, or perform calculations and store modified value)
    // key should be unique featureId of the spatial unit feature
    var mapEntry = map.get(featureId);

    mapEntry.sterberisiko = KmHelper.zScore_byPopulationArray(sterberisiko, populationArray_sterberisiko, false);

    // arithemtic mean of all zScores
    mapEntry.indicatorValue = (mapEntry.sterberisiko + mapEntry.wohnflProPerson + mapEntry.anteilArbeitsloser + mapEntry.anteilWahlberechtigter) / 4;

    map.set(featureId, mapEntry);
  });

  var numFeatures = targetSpatialUnit_geoJSON.features.length;

  // now we compute the new indicator
  KmHelper.log("Compute indicator for a total amount of " + numFeatures + " features");

  // iterate once over target spatial unit features and compute indicator utilizing map entries
  var spatialUnitIndex = 0;
  // create progress log after each 10th percent of features
  var logProgressIndexSeparator = Math.round(numFeatures / 100 * 10);
  targetSpatialUnit_geoJSON.features.forEach(function(spatialUnitFeature) {

    // get spatialUnit feature id as string --> use it to get associated map entry
    var spatialUnitFeatureId = KmHelper.getSpatialUnitFeatureIdValue(spatialUnitFeature);

    var mapEntry = map.get(spatialUnitFeatureId);

    var ewz = mapEntry.ewz;
    var indicatorValue = mapEntry.indicatorValue;

    // set aggregationWeight as number of citizens
    KmHelper.setAggregationWeight(spatialUnitFeature, ewz);

    // set indicator value for spatialUnitFeature
    spatialUnitFeature = KmHelper.setIndicatorValue(spatialUnitFeature, targetDate, indicatorValue);

  	spatialUnitIndex ++;

    // only log after certain progress
    if(spatialUnitIndex % logProgressIndexSeparator === 0){
        KmHelper.log("PROGRESS: Computed '" + spatialUnitIndex + "' of total '" + numFeatures + "' features.");
    }
  });

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

  // first replace indicatorFeature geoimetry by their pointOnSurface
  for (var index = 0; index < indicatorFeatures.length; index++){
    var indicatorFeature = indicatorFeatures[index];
    var centerPoint = KmHelper.pointOnFeature(indicatorFeature);

    indicatorFeature.geometry = centerPoint.geometry;
  }

  // spatial within check to aggregate
  targetSpatialUnit_geoJSON.features.forEach(function(targetFeature){

  	targetFeature.properties[targetDate] = 0;
  	var baseIndicatorTotalWeight = 0;
    var featureCounter = 0;

  	for (var index = 0; index < indicatorFeatures.length; index++){
  		var indicatorFeature = indicatorFeatures[index];
      if(KmHelper.within(indicatorFeature, targetFeature)){
  			// remove from array and decrement index
  			indicatorFeatures.splice(index, 1);
        index--;
        featureCounter++;

        // only use in aggregation, if the indicator value is not NaN, null or undefined but a "real" numeric number
          if(! Number.isNaN(indicatorFeature.properties[targetDate]) && indicatorFeature.properties[targetDate] !== null && indicatorFeature.properties[targetDate] !== undefined){
            // aggregationWeight is either 1 or a custom user-set weight value set within computeIndicator()-method
            // it "survives" until this aggregation logic within processing engine
            var weight = KmHelper.getAggregationWeight(indicatorFeature);

            // use weight as weight for indicator value
            baseIndicatorTotalWeight += weight;
            targetFeature.properties[targetDate] += Number(indicatorFeature.properties[targetDate]) * weight;
          }
  		}
  	}

  	// compute average for share
    if(baseIndicatorTotalWeight === 0){
      targetFeature.properties[targetDate] = Number.NaN;
    }
    else {
        targetFeature.properties[targetDate] = (targetFeature.properties[targetDate] / baseIndicatorTotalWeight);
    }
    // KmHelper.log("resulting average value is " + targetFeature.properties[targetDate]);
  });

  KmHelper.log("Aggregation finished");

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
  KmHelper.log("Aggregating by comparing the centroids of each indicator feature to target spatial unit features.");

  targetDate = KmHelper.getTargetDateWithPropertyPrefix(targetDate);
  KmHelper.log('Target Date with prefix: ' + targetDate);

  var totalAggregatedIndicatorFeatures = 0;

  // first replace indicatorFeature geoimetry by their pointOnSurface
  for (var index = 0; index < indicatorFeatures.length; index++){
    var indicatorFeature = indicatorFeatures[index];
    var centerPoint = KmHelper.pointOnFeature(indicatorFeature);

    indicatorFeature.geometry = centerPoint.geometry;
  }

  // spatial within check for aggregation
  targetSpatialUnit_geoJSON.features.forEach(function(targetFeature){

  	targetFeature.properties[targetDate] = 0;
  	var numberOfIndicatorFeaturesWithinTargetFeature = 0;

  	for (var index = 0; index < indicatorFeatures.length; index++){
  		var indicatorFeature = indicatorFeatures[index];
      if(KmHelper.within(indicatorFeature, targetFeature)){
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
