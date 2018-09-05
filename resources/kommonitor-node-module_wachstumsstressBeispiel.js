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
function computeIndicator(targetDate, targetSpatialUnit_geoJSON, baseIndicatorsMap, georesourcesMap, processProperties){
  // compute indicator for targetDate and targetSpatialUnitFeatures

  // retrieve required baseIndicator using its meaningful name
  var ewzGeoJSON = baseIndicatorsMap.get('Einwohnerzahl');

  // parse targetYear from input parameter
  var targetDateArray = targetDate.split('-');
  var specifiedYear = targetDateArray[0];

  // if (! Number.isSafeInteger(specifiedYear)){
  //   console.log('failed at parsing year from targetDate. targetDate is: ' + targetDate);
  //   throw new Error('failed at parsing year from targetDate. targetDate is: ' + targetDate);
  // }

  var year_fiveBefore = specifiedYear - 5;
  var date_fiveBefore = year_fiveBefore + '-' + targetDateArray[1] + '-' + targetDateArray[2];

  console.log('Target Date: ' + targetDate);
  console.log('Required Date before 5 years: ' + date_fiveBefore);

  // now we compute the new indicator 'wachstumsstress'
  console.log("Compute indicator for a total amount of " + targetSpatialUnit_geoJSON.features.length + " features");

  targetSpatialUnit_geoJSON.features.forEach(function(targetSpatialUnitFeature){
    ewzGeoJSON.features.forEach(function(ewzFeature){

      if (String(targetSpatialUnitFeature.properties.spatialUnitFeatureId) === String(ewzFeature.properties.spatialUnitFeatureId)){

        // console.log("properties of ewz: " + ewzFeature.properties);
        // console.log(JSON.stringify(ewzFeature.properties));
        // console.log("ewz[targetDate]: " + ewzFeature.properties[targetDate] + "; ewz[targetDate-5years]: " + ewzFeature.properties[date_fiveBefore]);

        targetSpatialUnitFeature.properties[targetDate] = Math.abs(( ewzFeature.properties[targetDate] - ewzFeature.properties[date_fiveBefore] ) / ewzFeature.properties[date_fiveBefore]);
        // console.log("computed indicator value: " + targetSpatialUnitFeature.properties[targetDate]);
      }
    });
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

  console.log("Aggregate indicator for targetDate " + targetDate + " for a total amount of " + targetSpatialUnit_geoJSON.features.length + " target features");
  console.log("Aggregating by checking spatial WITHIN for " + indicatorFeatures.length + " base features against the target features");

  targetSpatialUnit_geoJSON.features.forEach(function(targetFeature){

  	targetFeature.properties[targetDate] = 0;

  	var numberOfIndicatorFeaturesWithinTargetFeature = 0;

  	for (var index = 0; index < indicatorFeatures.length; index++){
  		var indicatorFeature = indicatorFeatures[index];

  		if(turf.booleanWithin(indicatorFeature, targetFeature)){
  			// remove from array
  			indicatorFeatures.splice(index, 1);

  			numberOfIndicatorFeaturesWithinTargetFeature++;

  			// calculate percentage of covered inhabitants
        // console.log("add " + indicatorFeature.properties[targetDate] + " to " + targetFeature.properties[targetDate]);
  			targetFeature.properties[targetDate] += indicatorFeature.properties[targetDate];
  		}
  	}

    // console.log("total accumulated value is " + targetFeature.properties[targetDate] + ". It will be divided by " + numberOfIndicatorFeaturesWithinTargetFeature);
  	// compute average for share
  	targetFeature.properties[targetDate] = (targetFeature.properties[targetDate] / numberOfIndicatorFeaturesWithinTargetFeature);
    // console.log("resulting average value is " + targetFeature.properties[targetDate]);
  });

  console.log("Aggregation finished");

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
