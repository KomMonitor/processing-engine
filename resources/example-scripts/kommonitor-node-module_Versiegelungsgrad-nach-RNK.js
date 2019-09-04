//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NECESSARY NODE MODULE DEPENDENCIES                                                                                                                       //                                                                                                                         //
//                                                                                                                                                          //
// SEE MODULE "KmProcessingEngine" for numerous predefined helper methods                                 //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var fs = require("fs");

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

const rnkCodeMappingArray = [
  {
    "rnkCodeYear": "code",
    "targetDate": "2009-31-12"
  },
  {
    "rnkCodeYear": "code2012",
    "targetDate": "2012-31-12"
  },
  {
    "rnkCodeYear": "code2015",
    "targetDate": "2015-31-12"
  }
];
const codeMappingKeyAttr = "Code";
const codeMappingVERSAttr = "VERS";
const codeMapping_vsg_proz_Attr = "vsg_proz";
const vsgCodeMappingArray = [{"Code":10,"VERS":0.3,"vsg_proz":30},{"Code":20,"VERS":0.5,"vsg_proz":50},{"Code":30,"VERS":0.3,"vsg_proz":30},{"Code":40,"VERS":0.8,"vsg_proz":80},{"Code":51,"VERS":0.4,"vsg_proz":40},{"Code":52,"VERS":0.5,"vsg_proz":50},{"Code":53,"VERS":0,"vsg_proz":0},{"Code":54,"VERS":0.8,"vsg_proz":80},{"Code":55,"VERS":0.8,"vsg_proz":80},{"Code":56,"VERS":1,"vsg_proz":100},{"Code":57,"VERS":1,"vsg_proz":100},{"Code":58,"VERS":1,"vsg_proz":100},{"Code":61,"VERS":0.9,"vsg_proz":90},{"Code":62,"VERS":0.8,"vsg_proz":80},{"Code":63,"VERS":0.4,"vsg_proz":40},{"Code":64,"VERS":0.8,"vsg_proz":80},{"Code":65,"VERS":0.8,"vsg_proz":80},{"Code":66,"VERS":0.8,"vsg_proz":80},{"Code":71,"VERS":0.8,"vsg_proz":80},{"Code":72,"VERS":0.8,"vsg_proz":80},{"Code":73,"VERS":0.8,"vsg_proz":80},{"Code":74,"VERS":0.8,"vsg_proz":80},{"Code":75,"VERS":0.6,"vsg_proz":60},{"Code":76,"VERS":1,"vsg_proz":100},{"Code":81,"VERS":1,"vsg_proz":100},{"Code":82,"VERS":0.45,"vsg_proz":45},{"Code":83,"VERS":0.8,"vsg_proz":80},{"Code":84,"VERS":0.7,"vsg_proz":70},{"Code":85,"VERS":0.7,"vsg_proz":70},{"Code":86,"VERS":1,"vsg_proz":100},{"Code":87,"VERS":0.8,"vsg_proz":80},{"Code":88,"VERS":0.8,"vsg_proz":80},{"Code":89,"VERS":1,"vsg_proz":100},{"Code":91,"VERS":0.7,"vsg_proz":70},{"Code":92,"VERS":0.7,"vsg_proz":70},{"Code":93,"VERS":0.1,"vsg_proz":10},{"Code":101,"VERS":1,"vsg_proz":100},{"Code":102,"VERS":0,"vsg_proz":0},{"Code":103,"VERS":0.8,"vsg_proz":80},{"Code":110,"VERS":0.9,"vsg_proz":90},{"Code":140,"VERS":1,"vsg_proz":100},{"Code":151,"VERS":0.9,"vsg_proz":90},{"Code":152,"VERS":0.8,"vsg_proz":80},{"Code":160,"VERS":0.9,"vsg_proz":90},{"Code":171,"VERS":0.8,"vsg_proz":80},{"Code":172,"VERS":1,"vsg_proz":100},{"Code":173,"VERS":1,"vsg_proz":100},{"Code":174,"VERS":1,"vsg_proz":100},{"Code":181,"VERS":1,"vsg_proz":100},{"Code":182,"VERS":1,"vsg_proz":100},{"Code":183,"VERS":0.8,"vsg_proz":80},{"Code":184,"VERS":0.8,"vsg_proz":80},{"Code":191,"VERS":0.8,"vsg_proz":80},{"Code":192,"VERS":1,"vsg_proz":100},{"Code":193,"VERS":0,"vsg_proz":0},{"Code":200,"VERS":0.8,"vsg_proz":80},{"Code":211,"VERS":0.7,"vsg_proz":70},{"Code":212,"VERS":0.5,"vsg_proz":50},{"Code":213,"VERS":0.6,"vsg_proz":60},{"Code":214,"VERS":0.8,"vsg_proz":80},{"Code":215,"VERS":0,"vsg_proz":0},{"Code":221,"VERS":0.5,"vsg_proz":50},{"Code":222,"VERS":0.1,"vsg_proz":10},{"Code":223,"VERS":0,"vsg_proz":0},{"Code":231,"VERS":0.6,"vsg_proz":60},{"Code":232,"VERS":0.7,"vsg_proz":70},{"Code":233,"VERS":0.2,"vsg_proz":20},{"Code":234,"VERS":0.1,"vsg_proz":10},{"Code":241,"VERS":0.6,"vsg_proz":60},{"Code":245,"VERS":0,"vsg_proz":0},{"Code":246,"VERS":0.9,"vsg_proz":90},{"Code":247,"VERS":0.1,"vsg_proz":10},{"Code":250,"VERS":0.05,"vsg_proz":5},{"Code":264,"VERS":0.1,"vsg_proz":10},{"Code":271,"VERS":0.1,"vsg_proz":10},{"Code":272,"VERS":0.2,"vsg_proz":20},{"Code":273,"VERS":0.1,"vsg_proz":10},{"Code":281,"VERS":0.8,"vsg_proz":80},{"Code":282,"VERS":0.1,"vsg_proz":10},{"Code":283,"VERS":0,"vsg_proz":0},{"Code":284,"VERS":0.2,"vsg_proz":20},{"Code":291,"VERS":0.05,"vsg_proz":5},{"Code":292,"VERS":0.2,"vsg_proz":20},{"Code":293,"VERS":0.05,"vsg_proz":5},{"Code":301,"VERS":0.05,"vsg_proz":5},{"Code":302,"VERS":0.1,"vsg_proz":10},{"Code":303,"VERS":0.05,"vsg_proz":5},{"Code":304,"VERS":0.1,"vsg_proz":10},{"Code":305,"VERS":0.05,"vsg_proz":5},{"Code":306,"VERS":0.05,"vsg_proz":5},{"Code":307,"VERS":0.05,"vsg_proz":5},{"Code":308,"VERS":0.05,"vsg_proz":5},{"Code":309,"VERS":0.5,"vsg_proz":50},{"Code":311,"VERS":0.05,"vsg_proz":5},{"Code":313,"VERS":0.05,"vsg_proz":5},{"Code":320,"VERS":0,"vsg_proz":0},{"Code":321,"VERS":0,"vsg_proz":0},{"Code":322,"VERS":0,"vsg_proz":0},{"Code":323,"VERS":0,"vsg_proz":0},{"Code":324,"VERS":0,"vsg_proz":0},{"Code":325,"VERS":0,"vsg_proz":0},{"Code":326,"VERS":0,"vsg_proz":0},{"Code":331,"VERS":0,"vsg_proz":0},{"Code":332,"VERS":0.05,"vsg_proz":5},{"Code":341,"VERS":0.8,"vsg_proz":80},{"Code":342,"VERS":0.05,"vsg_proz":5},{"Code":343,"VERS":0.1,"vsg_proz":10},{"Code":351,"VERS":0,"vsg_proz":0},{"Code":352,"VERS":0,"vsg_proz":0},{"Code":353,"VERS":0,"vsg_proz":0},{"Code":354,"VERS":0,"vsg_proz":0},{"Code":355,"VERS":0,"vsg_proz":0},{"Code":356,"VERS":0.1,"vsg_proz":10},{"Code":357,"VERS":0,"vsg_proz":0},{"Code":361,"VERS":0,"vsg_proz":0},{"Code":362,"VERS":0,"vsg_proz":0},{"Code":363,"VERS":0,"vsg_proz":0},{"Code":370,"VERS":0,"vsg_proz":0},{"Code":381,"VERS":0.4,"vsg_proz":40},{"Code":382,"VERS":0.1,"vsg_proz":10},{"Code":383,"VERS":0,"vsg_proz":0},{"Code":400,"VERS":0,"vsg_proz":0},{"Code":410,"VERS":0,"vsg_proz":0},{"Code":420,"VERS":0,"vsg_proz":0},{"Code":431,"VERS":0,"vsg_proz":0},{"Code":432,"VERS":0,"vsg_proz":0},{"Code":441,"VERS":0,"vsg_proz":0},{"Code":442,"VERS":0,"vsg_proz":0},{"Code":451,"VERS":0,"vsg_proz":0},{"Code":452,"VERS":0.1,"vsg_proz":5},{"Code":453,"VERS":0,"vsg_proz":0},{"Code":454,"VERS":0,"vsg_proz":0},{"Code":461,"VERS":0,"vsg_proz":0},{"Code":462,"VERS":0,"vsg_proz":0},{"Code":463,"VERS":0,"vsg_proz":0},{"Code":471,"VERS":0,"vsg_proz":0},{"Code":472,"VERS":0,"vsg_proz":0},{"Code":473,"VERS":0,"vsg_proz":0},{"Code":481,"VERS":1,"vsg_proz":100},{"Code":482,"VERS":0.7,"vsg_proz":70},{"Code":483,"VERS":0.1,"vsg_proz":10},{"Code":490,"VERS":0.1,"vsg_proz":10},{"Code":491,"VERS":0.1,"vsg_proz":10},{"Code":492,"VERS":0.1,"vsg_proz":10},{"Code":493,"VERS":0.9,"vsg_proz":90},{"Code":501,"VERS":0.05,"vsg_proz":5},{"Code":502,"VERS":0.05,"vsg_proz":5},{"Code":503,"VERS":0,"vsg_proz":0}];


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
  var rnk = KmHelper.getGeoresourceById('619de1fd-c706-42d4-99db-f9b9972e110f', georesourcesMap);

  var rnkAttrNameForTargetDate = "code2015";

  if (targetDate.includes("2015")){
    rnkAttrNameForTargetDate = "code2015";
  }
  else if (targetDate.includes("2012")){
    rnkAttrNameForTargetDate = "code2012";
  }
  else{
    rnkAttrNameForTargetDate = "code";
  }

var codesMap = new Map();

vsgCodeMappingArray.forEach(function(codeMapping) {
  codesMap.set(codeMapping[codeMappingKeyAttr], codeMapping[codeMapping_vsg_proz_Attr]);
});

// spatial comparison of RNK features and spatialUnit features

  var spatialUnitMap = new Map();
  var exampleMapObj = {
    "ID" : "id",
    "vsg_proz_sum" : 2,
    "vsg_weight_sum": 40
  };

  // iterate once over target spatial unit features and compute indicator utilizing map entries
  var rnkIndex = 0;
  // create progress log after each 5th percent of features
  var logProgressIndexSeparator = Math.round(rnk.features.length / 100 * 5);

  KmHelper.log("Begin intersection");

  rnk.features.forEach(function(rnkFeature) {
    // for each RNK feature check which spatial unit features intersect it and process it area-weighted

    targetSpatialUnit_geoJSON.features.forEach(function(spatialUnitFeature) {

      if(KmHelper.overlap(rnkFeature, spatialUnitFeature)){
        var intersectionFeature = KmHelper.intersection(rnkFeature, spatialUnitFeature);

          if (intersectionFeature === null || intersectionFeature === undefined){

          }
          else{
            var rnkCode = rnkFeature.properties[rnkAttrNameForTargetDate];
            var vsg_proz = codesMap.get(rnkCode);
            var intersectionArea = KmHelper.area(intersectionFeature);
            var spatialUnitFeatureTotalArea = KmHelper.area(spatialUnitFeature);
            var spatialUnitFeatureId = KmHelper.getSpatialUnitFeatureIdValue(spatialUnitFeature);

            var weight = intersectionArea / spatialUnitFeatureTotalArea;
            var vsg_proz_weighted = weight * vsg_proz;

            if (spatialUnitMap.get(spatialUnitFeatureId)){
              //edit eisting map entry
              var entry = spatialUnitMap.get(""+spatialUnitFeatureId);
              entry["vsg_proz_sum"] += vsg_proz_weighted;
              entry["vsg_weight_sum"] += weight;

              spatialUnitMap.set(""+spatialUnitFeatureId, entry);
            }
            else{
              // create new map object
              var entry = {
                "ID" : spatialUnitFeatureId,
                "vsg_proz_sum" : vsg_proz_weighted,
                "vsg_weight_sum": weight,
              };
              spatialUnitMap.set(""+spatialUnitFeatureId, entry);
            }
          }
      }

    });

    rnkIndex ++;

    KmHelper.log("PROGRESS: Processed " + rnkIndex + " of total total '" + rnk.features.length + "' features.");

    // only log after certain progress
    if(rnkIndex % logProgressIndexSeparator === 0){
        KmHelper.log("PROGRESS: Computed '" + rnkIndex + "' of total '" + rnk.features.length + "' features.");
    }
  });

  var numFeatures = targetSpatialUnit_geoJSON.features.length;

  // now we compute the new indicator
  KmHelper.log("Compute indicator for a total amount of " + numFeatures + " features");

  // iterate once over target spatial unit features and compute indicator utilizing map entries
  var spatialUnitIndex = 0;
  // create progress log after each 10th percent of features
  var logProgressIndexSeparator = Math.round(numFeatures / 100 * 10);
  targetSpatialUnit_geoJSON.features.forEach(function(spatialUnitFeature) {

    // set aggregationWeight as feature's area
    KmHelper.setAggregationWeight(spatialUnitFeature, KmHelper.area(spatialUnitFeature));

    // get spatialUnit feature id as string --> use it to get associated map entry
    var spatialUnitFeatureId = KmHelper.getSpatialUnitFeatureIdValue(spatialUnitFeature);

    var mapEntry = spatialUnitMap.get(spatialUnitFeatureId);

    var vsg_proz_sum = mapEntry["vsg_proz_sum"];
    var weight_sum = mapEntry["vsg_weight_sum"];

    var indicatorValue = vsg_proz_sum / weight_sum;

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

  targetSpatialUnit_geoJSON.features.forEach(function(targetFeature){

  	targetFeature.properties[targetDate] = 0;
  	var baseIndicatorTotalWeight = 0;
    var featureCounter = 0;

  	for (var index = 0; index < indicatorFeatures.length; index++){
  		var indicatorFeature = indicatorFeatures[index];
      var centerPoint = KmHelper.pointOnFeature(indicatorFeature);
      if(KmHelper.within(centerPoint, targetFeature)){
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
  KmHelper.log("Aggregating by comparing the centroids of each indicator feature to target spatial unit features. Each indicator feature will be weighted by its size (area in squareMeters).");

  targetDate = KmHelper.getTargetDateWithPropertyPrefix(targetDate);
  KmHelper.log('Target Date with prefix: ' + targetDate);

  var totalAggregatedIndicatorFeatures = 0;

  targetSpatialUnit_geoJSON.features.forEach(function(targetFeature){

  	targetFeature.properties[targetDate] = 0;
  	var numberOfIndicatorFeaturesWithinTargetFeature = 0;

  	for (var index = 0; index < indicatorFeatures.length; index++){
  		var indicatorFeature = indicatorFeatures[index];
      var centerPoint = KmHelper.pointOnFeature(indicatorFeature);
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
