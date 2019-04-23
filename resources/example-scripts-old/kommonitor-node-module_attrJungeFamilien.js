// require dependencies (other node modules)
//turf for geometric topologic operations
var turf = require('@turf/turf');


// CONSTANTS DEFINITION
const indicator_date_prefix = "DATE_";
const spatialUnitFeatureIdPropertyName = "spatialUnitFeatureId";



/**
This method computes the indicator for the specified point in time and target spatial unit. To do this, necessary base indicators and/or georesources as well as variable process properties are defined
as method parameters that can be used within the method body.

@targetDate string representing the target date for which the indicator shall be computed, e.g. 2018-01-01
@targetSpatialUnit_geoJSON string target spatial unit as GeoJSON string.
@baseIndicatorsMap Map map containing all indicators, wheres key='meaningful name of the indicator' and value='indicator as GeoJSON string'
@georesourcesMap Map map containing all georesources, wheres key='meaningful name of the georesource' and value='georesource as GeoJSON string' (they are used to execute geometric/toptologic computations)
@processProperties an object containing variable additional properties that are required to perform the indicator computation
*/
function computeIndicator(targetDate, targetSpatialUnit_geoJSON, baseIndicatorsMap, georesourcesMap, processProperties){
  // compute indicator for targetDate and targetSpatialUnitFeatures


  // make a map object mapping the featureName to the numbrToBeCOmputet
  // iterate one time over each subindicator
    // add number multiplied by weight to map object

  // iterate one time over targetSpatialUnit id, identify map entry for each feature and  compute and set value / (sum weights)

  var map = new Map();



  // retrieve required baseIndicator using its meaningful name
  var supermaerkte = baseIndicatorsMap.get('05ea8533-a792-401c-a79a-b3bb975047c0');
  var freiraum = baseIndicatorsMap.get('1f5906e2-60c8-4647-abef-231723e65205');
  var grundschulen = baseIndicatorsMap.get('76f9d771-7405-498b-9b39-1e2f565cce27');
  var kitas = baseIndicatorsMap.get('40d6eb29-efd5-4f7c-953d-b115e4438774');
  var spielplaetze = baseIndicatorsMap.get('a835507e-8c81-41b9-b339-0a554dca3fd3');


  // divide by 1000 for meters-->kilometers
  var gewicht_supermaerkte;
  var gewicht_freiraum;
  var gewicht_grundschulen;
  var gewicht_kitas;
  var gewicht_spielplaetze;

  targetDate = indicator_date_prefix + targetDate;
  console.log('Target Date with prefix: ' + targetDate);

  processProperties.forEach(function(property){
    if(property.name === "GewichtLebensmittelgeschaefte")
      gewicht_supermaerkte = Number(property.value);
    else if(property.name === "GewichtFreiraum")
      gewicht_freiraum = Number(property.value);
    else if(property.name === "GewichtGrundschulen")
      gewicht_grundschulen = Number(property.value);
    else if(property.name === "GewichtKitas")
      gewicht_kitas = Number(property.value);
    else if(property.name === "GewichtSpielplaetze")
      gewicht_spielplaetze = Number(property.value);
  });

  var weightSum = gewicht_supermaerkte + gewicht_freiraum + gewicht_grundschulen + gewicht_kitas + gewicht_spielplaetze;

  console.log("Sum of weights should be equal to 1. It is " + weightSum);

  console.log("fill map by iterating over each base indicator");

  supermaerkte.features.forEach(function(feature) {
    console.log("supermarkt: " + Number(feature.properties[targetDate]) * gewicht_supermaerkte);
    map.set(""+feature.properties[spatialUnitFeatureIdPropertyName], Number(feature.properties[targetDate]) * gewicht_supermaerkte);
  });

  freiraum.features.forEach(function(feature) {
    var value = map.get(""+feature.properties[spatialUnitFeatureIdPropertyName]);
    console.log("freiraum: " + value + " , ID: " + feature.properties[spatialUnitFeatureIdPropertyName]);
    map.set(""+feature.properties[spatialUnitFeatureIdPropertyName], value + Number(feature.properties[targetDate]) * gewicht_freiraum);
  });

  grundschulen.features.forEach(function(feature) {
    var value = map.get(""+feature.properties[spatialUnitFeatureIdPropertyName]);
    console.log("grundschulen: " + value + " , ID: " + feature.properties[spatialUnitFeatureIdPropertyName]);
    map.set(""+feature.properties[spatialUnitFeatureIdPropertyName], value + Number(feature.properties[targetDate]) * gewicht_grundschulen);
  });

  kitas.features.forEach(function(feature) {
    var value = map.get(""+feature.properties[spatialUnitFeatureIdPropertyName]);
    console.log("kitas: " + value + " , ID: " + feature.properties[spatialUnitFeatureIdPropertyName]);
    map.set(""+feature.properties[spatialUnitFeatureIdPropertyName], value + Number(feature.properties[targetDate]) * gewicht_kitas);
  });

  spielplaetze.features.forEach(function(feature) {
    var value = map.get(""+feature.properties[spatialUnitFeatureIdPropertyName]);
    console.log("spielplaetze: " + value + " , ID: " + feature.properties[spatialUnitFeatureIdPropertyName]);
    map.set(""+feature.properties[spatialUnitFeatureIdPropertyName], value + Number(feature.properties[targetDate]) * gewicht_spielplaetze);

    value = map.get(""+feature.properties[spatialUnitFeatureIdPropertyName]);
    console.log("spielplaetze: " + value + " , ID: " + feature.properties[spatialUnitFeatureIdPropertyName] + "----");
  });

console.log("compute targetIndicator");

var spatialUnitIndex = 0;
targetSpatialUnit_geoJSON.features.forEach(function(spatialUnitFeature) {

  console.log("map: " + map);
  var value = Number(map.get(""+spatialUnitFeature.properties[spatialUnitFeatureIdPropertyName]));
  console.log("unit: " + value + " , ID: " + spatialUnitFeature.properties[spatialUnitFeatureIdPropertyName] + "----");
  var result = Number(value / weightSum);

  console.log("Result: " + result);
	spatialUnitFeature.properties[targetDate] = result;

	spatialUnitIndex ++;
	console.log("Computed spatialUnitFeature number " + spatialUnitIndex);
});

  console.log("Computation of indicator finished");

  return targetSpatialUnit_geoJSON;
};

/**
@targetDate string representing the target date for which the indicator shall be computed, e.g. 2018-01-01
@targetSpatialUnit_geoJSON GeoJSON features of the target spatial unit, for which the indicator shall be aggregated to
@indicator_geoJSON GeoJSON features containing the indicator values for a spatial unit that can be aggregated to the features of parameter targetSpatialUnitFeatures
*/
function aggregateIndicator(targetDate, targetSpatialUnit_geoJSON, indicator_geoJSON){
  // aggregate indicator

  var indicatorFeatures = indicator_geoJSON.features;

  console.log("Aggregate indicator for targetDate " + targetDate + " for a total amount of " + targetSpatialUnit_geoJSON.features.length + " target features.");
  console.log("Aggregate from a total number of " + indicator_geoJSON.features.length + " baseFeatures");
  console.log("Aggregating by comparing the BBOXes of each base feature with each targetFeature. If the BBOXes overlap for > 90%, then aggregate the base feature to the target feature. (This method ensures that minor overlaps due to faulty coordinates do not break the process).");

  targetDate = indicator_date_prefix + targetDate;
  console.log('Target Date with prefix: ' + targetDate);

  var totalAggregatedIndicatorFeatures = 0;

  targetSpatialUnit_geoJSON.features.forEach(function(targetFeature){

  	targetFeature.properties[targetDate] = 0;
    var targetFeature_bboxPolygon = bbox(targetFeature);

  	var numberOfIndicatorFeaturesWithinTargetFeature = 0;

  	for (var index = 0; index < indicatorFeatures.length; index++){

  		var indicatorFeature = indicatorFeatures[index];
      var indicatorFeature_bboxPolygon = bbox(indicatorFeature);

      if(within_usingBBOX(indicatorFeature_bboxPolygon, targetFeature_bboxPolygon)){
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
@targetDate string representing the target date for which the indicator shall be computed, e.g. 2018-01-01
@targetSpatialUnit_geoJSON GeoJSON features of the target spatial unit, for which the indicator shall be disaggregated to
@indicator_geoJSON GeoJSON features containing the indicator values for a spatial unit that can be disaggregated to the features of parameter targetSpatialUnitFeatures
*/
function disaggregateIndicator(targetDate, targetSpatialUnit_geoJSON, indicator_geoJSON){
  // disaggregate indicator

};

module.exports.computeIndicator = computeIndicator;
module.exports.aggregateIndicator = aggregateIndicator;
module.exports.disaggregateIndicator = disaggregateIndicator;



// THE FOLLWING CODE LINES OFFER FUNCTIONS THAT CAN BE UTILIZED IN THE UPPER METHODS.
// E.G. SPATIAL FUNCTIONS COMMENLY REQUIRED BY GIS TASKS

var bbox = function(feature){
  var feature_bbox = turf.bbox(feature);
  return turf.bboxPolygon(feature_bbox);
};

var within_usingBBOX = function(indicatorFeature_bboxPolygon, targetFeature_bboxPolygon){
  var indicatorFeature_bboxPolygon_area = turf.area(indicatorFeature_bboxPolygon);

  var intersection = turf.intersect(targetFeature_bboxPolygon, indicatorFeature_bboxPolygon);
  // if there is no intersection (features are disjoint) then skip this loop turn for current indicatorFeature
  if (intersection == null || intersection == undefined)
    return false;

  var intersectionArea = turf.area(intersection);
  var overlapInPercent = Math.abs( intersectionArea / indicatorFeature_bboxPolygon_area) * 100;

  // if indicaturFeature overlaps for at least 90% with targetFeature, the assign it for aggregation to targetFeature
  if(overlapInPercent >= 90.0)
    return true;

  return false;
};
