// require dependencies (other node modules)
//turf for geometric topologic operations
var turf = require('@turf/turf');


// CONSTANTS DEFINITION
const indicator_date_prefix = "DATE_";
const spatialUnitFeatureIdPropertyName = "ID";
const wohnflaecheAttributeName = "Geschossflaeche";
const freiflaechenAttributeName = "FreiSV2015";
const freiflaechenAttributeValue = "Frei";



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
  var rvrFlaechen = georesourcesMap.get('Realnutzungskartierung');

  // divide by 1000 for meters-->kilometers
  var radius_kleineFlaechen;
  var radius_grosseFlaechen;
  var mindestgroesse;
  var schwellwertFlaechen;

  targetDate = indicator_date_prefix + targetDate;
  console.log('Target Date with prefix: ' + targetDate);

  processProperties.forEach(function(property){
    if(property.name === "RadiusKleineFreiflaechen")
      radius_kleineFlaechen = Number(property.value / 1000);
    else if(property.name === "RadiusGrosseFreiflaechen")
      radius_grosseFlaechen = Number(property.value / 1000);
    else if(property.name === "FreiflaechenMindestgroesse")
      mindestgroesse = property.value;
    else if(property.name === "FreiflaechenSchwellwert")
      schwellwertFlaechen = property.value;
  });

  console.log("radius small in km: " + radius_kleineFlaechen);
  console.log("radius big in km: " + radius_grosseFlaechen);

  var freifl_klein = [];
var freifl_gross = [];

console.log("Calculate area in hectar for dissolved frfl");

rvrFlaechen.features.forEach(function(feature) {

  if(feature.properties[freiflaechenAttributeName] === freiflaechenAttributeValue){
    // area in squareMeters
    var area_squareMeters = turf.area(feature);

    var area_hectar = area_squareMeters / 10000;

    // append area as new property
    feature.properties.area_hectar = area_hectar;

    // filter freiflaechen using area
    if (area_hectar > mindestgroesse && area_hectar < schwellwertFlaechen){
  	freifl_klein.push(feature);
    }
    else if (area_hectar >= schwellwertFlaechen){
  	  freifl_gross.push(feature);
    }
  }

});

freifl_klein = turf.featureCollection(freifl_klein);
freifl_gross = turf.featureCollection(freifl_gross);

console.log("create buffers and filter freiflaechen");

// create buffers around freifl
var buffer_kleineFreifl = turf.buffer(freifl_klein, radius_kleineFlaechen);
var buffer_grosseFreifl = turf.buffer(freifl_gross, radius_grosseFlaechen);

var freifl_allBuffers_featuresArray = buffer_grosseFreifl.features;
console.log(freifl_allBuffers_featuresArray.length);
freifl_allBuffers_featuresArray = freifl_allBuffers_featuresArray.concat(buffer_kleineFreifl.features);
console.log(freifl_allBuffers_featuresArray.length);

var buffers_freifl_featureCollection = turf.featureCollection(freifl_allBuffers_featuresArray);

// for (var index=0; index < buffers_freifl_featureCollection.features.length; index++){
//
// 	var feat = buffers_freifl_featureCollection.features[index];
//
// 	var type = feat.type;
//    var geom=feat.geometry;
//    var props=feat.properties;
//
//    if(geom != undefined){
// 	   if (geom.type === 'MultiPolygon'){
//
// 		   numberOfReplacements++;
//
// 		  // console.log(feat);
//
// 		   //remove multipolygon feature
// 	//	   console.log("Length before removal: " + rvrFlaechen.features.length);
// 		   buffers_freifl_featureCollection.features.splice(index, 1);
// 	//	   console.log("Length after removal: " + rvrFlaechen.features.length);
//
// 		  for (var i=0; i < geom.coordinates.length; i++){
// 			  var polygon = {
// 					'type':'Feature',
// 					'geometry':{
// 					   'type':'Polygon',
// 					   'coordinates':geom.coordinates[i]
// 						},
// 				    'properties': props};
//
//
// 			 // console.log("----------------------------------");
//
// 			//  console.log(polygon);
//
// 			  // append polygon to features
// 			  buffers_freifl_featureCollection.features.push(polygon);
// 		  }
// 		}
//    }
//    else{
// 		 console.log("WEIRD FEATURE !!!");
// 		 console.log(feat);
// 		buffers_freifl_featureCollection.features.splice(index, 1);
//    }
//  };

 // buffers_freifl_featureCollection.features.forEach(function(feature){
 // 	feature.properties.geomType = feature.geometry.type;
 // });

 // fs.writeFileSync('./buffers_freifl_featureCollection.json', JSON.stringify(buffers_freifl_featureCollection));


// now iterate over all baubloecke
// find alls wohngeb_centroids within the spatialUnitFeature and // remove them from features array
// summarize the total wohngeb_flaeche within spatialUnitFeature
// for each wohngeb_centroid within spatialUnitFeature check if it intersects with frfl_buffers
// if true then summarize to wohnflaeche_covered
// compute the indicator values
var centroidsArray = new Array();
wohngeb.features.forEach(function(feature){
  centroidsArray.push(turf.centerOfMass(feature, feature.properties));
});
var wohngeb_centroids = turf.featureCollection(centroidsArray).features;

console.log("calculating intersections between wohngeb and target spatial unit.");

var spatialUnitIndex = 0;
targetSpatialUnit_geoJSON.features.forEach(function(spatialUnitFeature) {
	wohngebWithinspatialUnitFeature = [];
	spatialUnitFeature.properties.wohnflTotal = 0;
	spatialUnitFeature.properties.wohnflCovered = 0;

	for (var pointIndex=0; pointIndex < wohngeb_centroids.length; pointIndex++){

		wohngebFeature = wohngeb_centroids[pointIndex];
		if (turf.booleanWithin(wohngebFeature, spatialUnitFeature)){
			wohngeb_centroids.splice(pointIndex, 1);
      pointIndex--;
			spatialUnitFeature.properties.wohnflTotal += Number(wohngebFeature.properties[wohnflaecheAttributeName]);

			// for each buffer_frfl feature check if wohngebFeature lies within it
			for (var bufferIndex = 0; bufferIndex < buffers_freifl_featureCollection.features.length; bufferIndex++){

				var buffer_frfl_feature = buffers_freifl_featureCollection.features[bufferIndex];

				if(turf.booleanWithin(wohngebFeature, buffer_frfl_feature)){
					// add wohnflaeche to wohnflCovered
					spatialUnitFeature.properties.wohnflCovered += Number(wohngebFeature.properties[wohnflaecheAttributeName]);

					break;
				}
			};

		}
	}

	// calculate percentage of covered inhabitants

	spatialUnitFeature.properties[targetDate] = spatialUnitFeature.properties.wohnflCovered / spatialUnitFeature.properties.wohnflTotal || 0;

  delete spatialUnitFeature.properties.wohnflCovered;
  delete spatialUnitFeature.properties.wohnflTotal;
	// spatialUnitFeature.properties.inhabitantsCovered_absolute = Math.round(spatialUnitFeature.properties["2016_ins"] * spatialUnitFeature.properties.inhabitantsCovered_share);

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

    // console.log("total accumulated value is " + targetFeature.properties[targetDate] + " for targetFeature with id " + targetFeature.properties.ID + ". It will be divided by " + numberOfIndicatorFeaturesWithinTargetFeature);
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
