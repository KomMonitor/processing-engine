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

// CUSTOM CONSTANTS
const freiflaecheTypeAttrName = "code2013";
const freiflaecheTypeAttrTargetValueArray = ["250", "320", "321", "322", "323", "324", "325", "326", "327", "328", "329",
    "330", "331", "332", "333", "334", "335", "336", "337", "338", "339", "340", "341", "342", "343", "344", "345", "346", "347", "348", "349",
    "350", "351", "352", "353", "354", "355", "356", "357", "358", "359", "360", "361", "362", "363", "364", "365", "367", "368", "369",
    "370", "371", "372", "373", "374", "375", "376", "377", "378", "379", "380", "381", "382", "383", "384", "385",
    "400", "401", "402", "403", "404", "405", "406", "407", "408", "409", "410", "411", "412", "413", "414", "415", "416", "417", "418", "419",
    "420", "421", "422", "423", "424", "425", "426", "427", "428", "429", "430", "431", "432", "433", "434", "435", "436", "437", "438", "439",
    "440", "441", "442", "443", "444", "445", "446", "447", "448", "449", "450", "451", "452", "453", "454", "455", "456", "457", "458", "459",
    "460", "461", "462", "463", "464", "465", "466", "467", "468", "469", "470", "471", "472", "473", "474", "475", "476", "477", "478", "479",
    "480", "481", "482", "483", "484", "485", "486", "487", "488", "489", "490"];



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
  // compute indicator for targetDate and targetSpatialUnitFeatures

  // retrieve required baseIndicator using its meaningful name
  var wohngeb = KmHelper.getGeoresourceByName("Wohngebäude", georesourcesMap);
  var rnk = KmHelper.getGeoresourceByName("Realnutzungskartierung", georesourcesMap);

  var radius_kleineFlaechen = KmHelper.getProcessParameterByName_asNumber("RadiusKleineFreiflaechen", processParameters);
  var radius_grosseFlaechen = KmHelper.getProcessParameterByName_asNumber("RadiusGrosseFreiflaechen", processParameters);
  var mindestgroesse = KmHelper.getProcessParameterByName_asNumber("FreiflaechenMindestgroesse", processParameters);
  var schwellwertFlaechen = KmHelper.getProcessParameterByName_asNumber("FreiflaechenSchwellwert", processParameters);

  KmHelper.log("radius small in m: " + radius_kleineFlaechen);
  KmHelper.log("radius big in m: " + radius_grosseFlaechen);
  KmHelper.log("min size in hectar: " + mindestgroesse);
  KmHelper.log("threshold for big and small areas in hectar: " + schwellwertFlaechen);


  KmHelper.log("Remove all RNK entries that are no freiraum!");
  var countRemovedRNKs = 0;
  var numberOfTotalRNKs = rnk.features.length;

  for (var index=0; index < rnk.features.length; index++){

    var rnkCandidate = rnk.features[index];

    // oneLiner to query if the candidate does NOT fulfill the freiraumfl. criteria
    // cast property value to String!!!
    if (! freiflaecheTypeAttrTargetValueArray.some(substring => String(rnkCandidate.properties[freiflaecheTypeAttrName]).includes(substring))){

      // remove feature from array and set index back!
      delete rnk.features.splice(index, 1);

      // set back index as the array contents were shifetd one to the left!
      index--;

      countRemovedRNKs++;
    }
  }

    KmHelper.log("Removed '" + countRemovedRNKs + "' from a total of '" + numberOfTotalRNKs + "' RNK features as they were no freiraumflaechen.");

  var freifl_klein = [];
var freifl_gross = [];


// skip dissolve step as turf dissolve is kinda buggy sometimes
// KmHelper.log("dissolve areas from RNK.");
//
// rnk = KmHelper.dissolve(rnk);

KmHelper.log("Calculate area in hectar for dissolved frfl and group small and big areas");

rnk.features.forEach(function(feature) {

    // area in squareMeters
    var area_squareMeters = KmHelper.area(feature);

    var area_hectar = area_squareMeters / 10000;

    // append area as new property
    KmHelper.setPropertyValue(feature, "area_hectar", area_hectar);

    // filter freiflaechen using area
    if (area_hectar > mindestgroesse && area_hectar < schwellwertFlaechen){
  	freifl_klein.push(feature);
    }
    else if (area_hectar >= schwellwertFlaechen){
  	  freifl_gross.push(feature);
    }
});


KmHelper.log("Compute area for each building as proxy for wohnfläche");
wohngeb = KmHelper.area_featureCollection_asProperty(wohngeb);

KmHelper.log("get centroids of buildings");
var wohngeb_centroids = new Array();
wohngeb.features.forEach(function(feature){
  wohngeb_centroids.push(KmHelper.center_mass(feature, feature.properties));
});

KmHelper.log("calculating intersections between wohngeb and target spatial unit.");

// initial values for later comparison
targetSpatialUnit_geoJSON.features.forEach(function(spatialUnitFeature) {
	spatialUnitFeature.properties.wohnflTotal = 0;
	spatialUnitFeature.properties.wohnflCovered = 0;
});


/*
* create a map collecting numbers of isochrone starting points and their isochrones
*/
KmHelper.log("create a map collecting numbers of isochrone starting points and their isochrones");

// await is required to resolve the returned Promise as it is an async function!
var wohngebIsochronesMap = await createWohngebIsochronesMap(wohngeb_centroids, radius_kleineFlaechen, radius_grosseFlaechen);

/*
* response map will have objects as follows:

var mapKey = "" + index;
var mapObject = {
  "wohngebFeature": tempStartPointsArray[index],
  "isochrone_small": isochrones_small.features[index],
  "isochrone_big": isochrones_big.features[index]
};
*/

// now iterate over each map object and compare to spatialUnit features and freiflaechen


var wohngebLength = wohngebIsochronesMap.size;
// create progress log after each 10th percent of features
var logProgressIndexSeparator = Math.round(wohngebLength / 100 * 10);
var counter = 0;
	for (var [mapKey, mapObject] of wohngebIsochronesMap){

		wohngebFeature = mapObject["wohngebFeature"];

    // isochrones by distance of smaller and bigger radius using foot-walking as GeoJSON feature collection
    var isochrone_wohngeb_smallRadius = mapObject["isochrone_small"];
    var isochrone_wohngeb_bigRadius = mapObject["isochrone_big"];

    for (var featureIndex=0; featureIndex < targetSpatialUnit_geoJSON.features.length; featureIndex++){
      var spatialUnitFeat = targetSpatialUnit_geoJSON.features[featureIndex];

      if (KmHelper.within(wohngebFeature, spatialUnitFeat)){
  			// wohngeb_centroids.splice(pointIndex, 1);
        // pointIndex--;
  			spatialUnitFeat.properties.wohnflTotal += wohngebFeature.properties.area_squareMeters;

  			// for each small and big freiflaechen feature check if intersects with corresponding wohngeb_isochrone
        var boolean_wohngebIsochrone_intersects = false;

  			for (var frflSmallIndex = 0; frflSmallIndex < freifl_klein.length; frflSmallIndex++){

  				var freiflaeche_small_feature = freifl_klein[frflSmallIndex];

  				if(KmHelper.intersects(isochrone_wohngeb_smallRadius, freiflaeche_small_feature)){
            boolean_wohngebIsochrone_intersects = true;
  					break;
  				}
  			}

        // only check big frfl. if wohngeb does not reach a small frfl
        if (! boolean_wohngebIsochrone_intersects){
          for (var frflBigIndex = 0; frflBigIndex < freifl_gross.length; frflBigIndex++){

    				var freiflaeche_big_feature = freifl_gross[frflBigIndex];

    				if(KmHelper.intersects(isochrone_wohngeb_bigRadius, freiflaeche_big_feature)){
              boolean_wohngebIsochrone_intersects = true;
    					break;
    				}
    			}
        }

        if (boolean_wohngebIsochrone_intersects){
          // wohngeb reaches any freifl.
          // add wohnflaeche to wohnflCovered
          spatialUnitFeat.properties.wohnflCovered += wohngebFeature.properties.area_squareMeters;
        }


        break;
  		}
    }

    counter++;
    if(counter % logProgressIndexSeparator === 0){
        KmHelper.log("PROGRESS: Compared '" + counter + "' of total '" + wohngebLength + "' building isochrones to small and big freiflaechen.");
    }
	}

  targetSpatialUnit_geoJSON.features.forEach(function(spatialUnitFeature) {
    if(spatialUnitFeature.properties.wohnflTotal === 0){
      // no living building in this feature --> thus set value to NoData as it cannot be compared to features that have living buildings, which are not covered!
        spatialUnitFeature = KmHelper.setIndicatorValue_asNoData(spatialUnitFeature, targetDate);
    }
    else{
      var indicatorValue = spatialUnitFeature.properties.wohnflCovered / spatialUnitFeature.properties.wohnflTotal;
      spatialUnitFeature = KmHelper.setIndicatorValue(spatialUnitFeature, targetDate, indicatorValue);
    }

    // set Wohnfläche as aggregation weight
    spatialUnitFeature = KmHelper.setAggregationWeight(spatialUnitFeature, spatialUnitFeature.properties.wohnflTotal);

    // delete temporary helper properties
    delete spatialUnitFeature.properties.wohnflCovered;
    delete spatialUnitFeature.properties.wohnflTotal;
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

async function createWohngebIsochronesMap (wohngeb_centroids, radius_kleineFlaechen, radius_grosseFlaechen){
  var map = new Map();
  var maxLocationsForORSRequest = 200;

  var featureIndex = 0;
  // log progress for each 10% of features
  var logProgressIndexSeparator = Math.round(wohngeb_centroids.length / 100 * 10);

  var countFeatures = 0;
  var tempStartPointsArray = [];
  for (var pointIndex=0; pointIndex < wohngeb_centroids.length; pointIndex++){
    tempStartPointsArray.push(wohngeb_centroids[pointIndex]);
    countFeatures++;

    if(countFeatures === maxLocationsForORSRequest){
      // make request, collect results and fill map

      // responses will be GeoJSON FeatureCollections
      // do NOT dissolve isochrones
      var isochrones_small = await KmHelper.isochrones_byDistance(tempStartPointsArray, "PEDESTRIAN", radius_kleineFlaechen, false, true);
      var isochrones_big = await KmHelper.isochrones_byDistance(tempStartPointsArray, "PEDESTRIAN", radius_grosseFlaechen, false, true);

      for (var index=0; index < tempStartPointsArray.length; index++){
        // make sure that key is always treated as string
        var mapKey = "" + featureIndex;
        var mapObject = {
          "wohngebFeature": tempStartPointsArray[index],
          "isochrone_small": isochrones_small.features[index],
          "isochrone_big": isochrones_big.features[index]
        };

        map.set(mapKey, mapObject);

        // increment featureIndex
        featureIndex++;
        if(featureIndex % logProgressIndexSeparator === 0){
            KmHelper.log("PROGRESS: Computed isochrones for '" + featureIndex + "' of total '" + wohngeb_centroids.length + "' building centroids.");
        }
      }

      // reset temp vars
      tempStartPointsArray = [];
      countFeatures = 0;

    } // end if
  }

  return map;
}
