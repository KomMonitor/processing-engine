// require dependencies (other node modules)
//turf for geometric topologic operations
var turf = require('@turf/turf');


// CONSTANTS DEFINITION
const indicator_date_prefix = "DATE_";
const spatialUnitFeatureIdPropertyName = "spatialUnitFeatureId";
const wohnflaecheAttributeName = "GF";



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

  // retrieve required baseIndicator using its meaningful name
  var wohngeb = georesourcesMap.get('Wohngebäude');
  var kitas = georesourcesMap.get('Kindertagesstätten');

  // divide by 1000 for meters-->kilometers
  var maxDistance;

  targetDate = indicator_date_prefix + targetDate;
  console.log('Target Date with prefix: ' + targetDate);

  processProperties.forEach(function(property){
    if(property.name === "MaxDistance")
      maxDistance = Number(property.value / 1000);
  });

  console.log("max distance parameter in km: " + maxDistance);

console.log("create buffers");

// create buffers around freifl
var buffer_kitas = turf.buffer(kitas, maxDistance);

var buffer_kitas_featuresArray = buffer_kitas.features;
console.log(buffer_kitas_featuresArray.length);

var buffers_kitas_featureCollection = turf.featureCollection(buffer_kitas_featuresArray);

var centroidsArray = new Array();
wohngeb.features.forEach(function(feature){
  centroidsArray.push(turf.centerOfMass(feature, feature.properties));
});
var wohngeb_centroids = turf.featureCollection(centroidsArray).features;

console.log("calculating intersections between wohngeb and target spatial unit.");

targetSpatialUnit_geoJSON.features.forEach(function(spatialUnitFeature) {
	spatialUnitFeature.properties.wohnflTotal = 0;
	spatialUnitFeature.properties.wohnflCovered = 0;
});


var wohngebLength = wohngeb_centroids.length;
	for (var pointIndex=0; pointIndex < wohngebLength; pointIndex++){

    console.log("Processing: " + pointIndex + " / " + wohngebLength);

		wohngebFeature = wohngeb_centroids[pointIndex];

    for (var featureIndex=0; featureIndex < targetSpatialUnit_geoJSON.features.length; featureIndex++){
      var spatialUnitFeat = targetSpatialUnit_geoJSON.features[featureIndex];

      if (turf.booleanWithin(wohngebFeature, spatialUnitFeat)){
  			// wohngeb_centroids.splice(pointIndex, 1);
        // pointIndex--;
  			spatialUnitFeat.properties.wohnflTotal += Number(wohngebFeature.properties[wohnflaecheAttributeName]);

  			// for each buffer_frfl feature check if wohngebFeature lies within it
  			for (var bufferIndex = 0; bufferIndex < buffers_kitas_featureCollection.features.length; bufferIndex++){

  				var buffer_kita_feature = buffers_kitas_featureCollection.features[bufferIndex];

  				if(turf.booleanWithin(wohngebFeature, buffer_kita_feature)){
  					// add wohnflaeche to wohnflCovered
  					spatialUnitFeat.properties.wohnflCovered += Number(wohngebFeature.properties[wohnflaecheAttributeName]);

  					break;
  				}
  			}

        break;
  		}
    }
	}

  targetSpatialUnit_geoJSON.features.forEach(function(spatialUnitFeature) {
    spatialUnitFeature.properties[targetDate] = spatialUnitFeature.properties.wohnflCovered / spatialUnitFeature.properties.wohnflTotal || 0;

    delete spatialUnitFeature.properties.wohnflCovered;
    delete spatialUnitFeature.properties.wohnflTotal;
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
