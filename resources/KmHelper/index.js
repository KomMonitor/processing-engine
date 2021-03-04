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

const axios = require("axios");



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
const spatialUnitFeatureIdPropertyName = "ID";
/**
* This constant is required to aquire the unique name of a certain feature of a spatial unit
* @type {string}
* @memberof CONSTANTS
* @constant
*/
const spatialUnitFeatureNamePropertyName = "NAME";
/**
* This constant is required to access indicator timeseries values correctly (i.e. DATE_2018-01-01)
* @see getTargetDateWithPropertyPrefix
* @type {string}
* @memberof CONSTANTS
* @constant
*/
const indicator_date_prefix = "DATE_";

/**
* This constant limits the number of allowed locations for requests against Open Route Service
* This is necessary especially for GET requests, to keep the GET request length within handable sizes
* @see isochrones_byTime
* @see isochrones_byDistance
* @see distance_matrix_kilometers
* @see duration_matrix_seconds
* @type {number}
* @memberof CONSTANTS
* @constant
*/
const maxLocationsForORSRequest = 200;



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PREDEFINED API HELPER METHODS                                                                                                                            //
// here you find helpful methods that can be used to perform certain spatio-temporal or statistical computation. These methods make internal use of Turf.js //
// and JStat.js to offer the specified functionalitites. It is recommended to use these methods when writing code to compute an indicator                   //
// from other baseIndicators or georesources in method "computeIndicator" or when writing your own aggregation/disaggregation logic.                        //
// However, you are free to implement your own methods and logic, especially when the desired operation is not covered by the API methods offered here.     //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* Acquires the base indicator with the name {@linkcode indicatorName} from the submitted {@linkcode baseIndicatorsMap}.
* @param {string} indicatorName - the name of the base indicator
* @param {map.<string, FeatureCollection<Polygon>>} baseIndicatorsMap - Map containing all indicators, whereas key='meaningful name or id of the indicator' and value='indicator as GeoJSON object' (it contains duplicate entries, one for the indicator name and one for the indicator id)
* @return {FeatureCollection<Polygon>} returns the base indicator as {@linkcode FeatureCollection<Polygon>} or throws an error if the {@linkcode baseIndicatorsMap} does not contain an entry with {@linkcode key=indicatorName}
* @throws {Error} if the {@linkcode baseIndicatorsMap} does not contain an entry with {@linkcode key=indicatorName}
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getBaseIndicatorByName = function (indicatorName, baseIndicatorsMap){
  var baseIndicatorCandidate = baseIndicatorsMap.get(indicatorName);
  if(baseIndicatorCandidate === null || baseIndicatorCandidate === undefined){
    console.log("Tried to aquire a baseIndicator with name '" + indicatorName + "', but the baseIndicatorsMap does not contain such an entry");
    exports.throwError("Tried to aquire a baseIndicator with name '" + indicatorName + "', but the baseIndicatorsMap does not contain such an entry");
  }
  return baseIndicatorCandidate;
};

/**
* Acquires the base indicator with the id {@linkcode indicatorId} from the submitted {@linkcode baseIndicatorsMap}.
* @param {string} indicatorId - the name of the base indicator
* @param {map.<string, FeatureCollection<Polygon>>} baseIndicatorsMap - Map containing all indicators, whereas key='meaningful name or id of the indicator' and value='indicator as GeoJSON object' (it contains duplicate entries, one for the indicator name and one for the indicator id)
* @return {FeatureCollection<Polygon>} returns the base indicator as {@linkcode FeatureCollection<Polygon>} or throws an error if the {@linkcode baseIndicatorsMap} does not contain an entry with {@linkcode key=indicatorId}
* @throws {Error} if the {@linkcode baseIndicatorsMap} does not contain an entry with {@linkcode key=indicatorId}
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getBaseIndicatorById = function (indicatorId, baseIndicatorsMap){
  var baseIndicatorCandidate = baseIndicatorsMap.get(indicatorId);
  if(baseIndicatorCandidate === null || baseIndicatorCandidate === undefined){
    console.log("Tried to aquire a baseIndicator with name '" + indicatorId + "', but the baseIndicatorsMap does not contain such an entry");
    exports.throwError("Tried to aquire a baseIndicator with name '" + indicatorId + "', but the baseIndicatorsMap does not contain such an entry");
  }
  return baseIndicatorCandidate;
};

/**
* Acquires the georesource with the name {@linkcode georesourceName} from the submitted {@linkcode georesourcesMap}.
* @param {string} georesourceName - the name of the georesources
* @param {map.<string, FeatureCollection<Polygon|LineString|Point>>} georesourcesMap - Map containing all georesources, whereas key='meaningful name or id of the georesource' and value='georesourc as GeoJSON object' (it contains duplicate entries, one for the georesource's name and one for the georesource's id)
* @return {FeatureCollection<Polygon|LineString|Point>} returns the georesource as {@linkcode FeatureCollection<Polygon|LineString|Point>} or throws an error if the {@linkcode georesourcesMap} does not contain an entry with {@linkcode key=georesourceName}
* @throws {Error} if the {@linkcode georesourcesMap} does not contain an entry with {@linkcode key=georesourceName}
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getGeoresourceByName = function (georesourceName, georesourcesMap){
  var georesourceCandidate = georesourcesMap.get(georesourceName);
  if(georesourceCandidate === null || georesourceCandidate === undefined){
    console.log("Tried to aquire a georesource with name '" + georesourceName + "', but the georesourcesMap does not contain such an entry");
    exports.throwError("Tried to aquire a georesource with name '" + georesourceName + "', but the georesourcesMap does not contain such an entry");
  }
  return georesourceCandidate;
};

/**
* Acquires the georesource with the id {@linkcode georesourceId} from the submitted {@linkcode georesourcesMap}.
* @param {string} georesourceId - the id of the georesources
* @param {map.<string, FeatureCollection<Polygon|LineString|Point>>} georesourcesMap - Map containing all georesources, whereas key='meaningful name or id of the georesource' and value='georesourc as GeoJSON object' (it contains duplicate entries, one for the georesource's name and one for the georesource's id)
* @return {FeatureCollection<Polygon|LineString|Point>} returns the georesource as {@linkcode FeatureCollection<Polygon|LineString|Point>} or throws an error if the {@linkcode georesourcesMap} does not contain an entry with {@linkcode key=georesourceId}
* @throws {Error} if the {@linkcode georesourcesMap} does not contain an entry with {@linkcode key=georesourceId}
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getGeoresourceById = function (georesourceId, georesourcesMap){
  var georesourceCandidate = georesourcesMap.get(georesourceId);
  if(georesourceCandidate === null || georesourceCandidate === undefined){
    console.log("Tried to aquire a georesource with id '" + georesourceId + "', but the georesourcesMap does not contain such an entry");
    exports.throwError("Tried to aquire a georesource with id '" + georesourceId + "', but the georesourcesMap does not contain such an entry");
  }
  return georesourceCandidate;
};

/**
* Acquires the process parameter with the name {@linkcode parameterName} from the submitted {@linkcode processParametersObject}.
* @param {string} parameterName - the name of the process parameter
* @param {Array.<Object.<string, (string|number|boolean)>>} processParameters - an array containing objects representing variable additional process parameters that are required to perform the indicator computation.
* Each entry has properties Object.name and Object.value for name and value of the parameter.
* @return {Object<String>} returns the {@linkcode value} of the requested process parameter as {@linkcode String}. Users should know the real type (i.e. {@linkcode boolean, number}).
* Throws an error if the {@linkcode processParameters} array does not contain an entry with {@linkcode Object.name=parameterName}
* @throws {Error} if the {@linkcode processParameters} array does not contain an entry with {@linkcode Object.name=parameterName}
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getProcessParameterByName_asString = function (parameterName, processParameters){
  var parameter = undefined;

  processParameters.forEach(function(property){
    if(property.name === parameterName){
      parameter = property.value;
    }
  });

  if(parameter === undefined){
    exports.throwError("Tried to aquire a process parameter with Object.name '" + parameterName + "', but the array of processParameters does not contain such an entry");
  }
  else{
    return parameter;
  }
};

/**
* Acquires the process parameter with the name {@linkcode parameterName} from the submitted {@linkcode processParametersObject}.
* @param {string} parameterName - the name of the process parameter
* @param {Array.<Object.<string, (string|number|boolean)>>} processParameters - an array containing objects representing variable additional process parameters that are required to perform the indicator computation.
* Each entry has properties Object.name and Object.value for name and value of the parameter.
* @return {Object<Number>} returns the {@linkcode value} of the requested process parameter as {@linkcode String}. The {@linkcode value} is parsed as {@linkcode Number} and returned.
* Throws an error if the {@linkcode processParameters} array does not contain an entry with {@linkcode Object.name=parameterName} or if the parsing of the value from {@linkcode String --> Number} throws an error.
* @throws {Error} if the {@linkcode processParameters} array does not contain an entry with {@linkcode Object.name=parameterName} or if the parsing of the value from {@linkcode String --> Number} throws an error.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getProcessParameterByName_asNumber = function (parameterName, processParameters){
  var parameter = undefined;

  processParameters.forEach(function(property){
    if(property.name === parameterName){
      parameter = property.value;
    }
  });

  if(parameter === undefined){
    exports.throwError("Tried to aquire a process parameter with Object.name '" + parameterName + "', but the array of processParameters does not contain such an entry");
  }
  else{

    try{
      parameter = Number(parameter);
    }
    catch(error){
        exports.throwError("Error while parsing parameter value '" + parameter + "' from parameter with name '" + parameterName + "' as Number.");
    }

    return parameter;
  }
};

/**
* Acquires the process parameter with the name {@linkcode parameterName} from the submitted {@linkcode processParametersObject}.
* @param {string} parameterName - the name of the process parameter
* @param {Array.<Object.<string, (string|number|boolean)>>} processParameters - an array containing objects representing variable additional process parameters that are required to perform the indicator computation.
* Each entry has properties Object.name and Object.value for name and value of the parameter.
* @return {Object<true|false>} returns the {@linkcode value} of the requested process parameter as {@linkcode String}. The {@linkcode value} is parsed as {@linkcode Boolean (true|false)} and returned.
* Throws an error if the {@linkcode processParameters} array does not contain an entry with {@linkcode Object.name=parameterName} or if the parsing of the value from {@linkcode String --> Number} throws an error.
* @throws {Error} if the {@linkcode processParameters} array does not contain an entry with {@linkcode Object.name=parameterName} or if the parsing of the value from {@linkcode String --> Number} throws an error.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getProcessParameterByName_asBoolean = function (parameterName, processParameters){
  var parameter = undefined;

  processParameters.forEach(function(property){
    if(property.name === parameterName){
      parameter = property.value;
    }
  });

  if(parameter === undefined){
    exports.throwError("Tried to aquire a process parameter with Object.name '" + parameterName + "', but the array of processParameters does not contain such an entry");
  }
  else{

    try{
      // try to convert into boolean true or false!
      parameter = JSON.parse(parameter);
    }
    catch(error){
        exports.throwError("Error while parsing parameter value '" + parameter + "' from parameter with name '" + parameterName + "' as Number.");
    }

    return parameter;
  }
};

/**
* Acquires the unique {@linkcode feature id} of the submitted GeoJSON {@linkcode feature} representing a spatial unit (i.e. city districts, building blocks, etc).
* @param {GeoJSONFeature<Polygon>} feature - the GeoJSON feature representing a spatial unit (i.e. city districts, building blocks, etc), which must accord to the KomMonitor specific data model. It then has a property named {@linkcode feature.properties.ID} that holds the value of the unique feature id.
* @return {string} returns the unique {@linkcode feature id} of the submitted GeoJSON {@linkcode feature}.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getSpatialUnitFeatureIdValue = function (feature){
  return String(feature.properties[spatialUnitFeatureIdPropertyName]);
};

/**
* Acquires the unique {@linkcode feature name} of the submitted GeoJSON {@linkcode feature} representing a spatial unit (i.e. city districts, building blocks, etc).
* @param {GeoJSONFeature<Polygon>} feature - the GeoJSON feature representing a spatial unit (i.e. city districts, building blocks, etc), which must accord to the KomMonitor specific data model. It then has a property named {@linkcode feature.properties.NAME} that holds the value of the unique feature name.
* @return {string} returns the unique {@linkcode feature name} of the submitted GeoJSON {@linkcode feature}.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getSpatialUnitFeatureNameValue = function (feature){
  return String(feature.properties[spatialUnitFeatureNamePropertyName]);
};

/**
* Logs a custom message (i.e. to console).
* @param {string} logMessage - message that shall be logged.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.log = function (logMessage){
  console.log(logMessage);
};

/**
* Checks whether the submitted object is a valid GeoJSON feature.
* The feature must contain a property {@linkcode "type"="Feature"} and a property named {@linkcode geometry}, which must have a {@linkcode coordinates} array and {@linkcode type} property.
* The method does not check, if the feature contains a {@linkcode properties} attribute.
* @param {Object} feature - a candidate for a GeoJSON feature.
* @return returns {@linkcode true} if the object is a valid GeoJSON feature; {@linkcode false} otherwise
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.isGeoJSONFeature = function (feature){
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
exports.isGeoJSONPointFeature = function (feature){
  if (feature.type === "Feature" && feature.geometry && feature.geometry.coordinates && feature.geometry.type === 'Point'){
    return true;
  }
  else{
    return false;
  }
};

/**
* Checks whether the submitted object is a valid GeoJSON feature with geometryType {@linkcode LineString} or {@linkcode MultiLineString}.
* The feature must contain a property {@linkcode "type"="Feature"} and a property named {@linkcode geometry}, which must have a {@linkcode coordinates} array and {@linkcode type=LineString|MultiLineString} property.
* The method does not check, if the feature contains a {@linkcode properties} attribute.
* @param {Object} feature - a candidate for a GeoJSON LineString|MultiLineString feature.
* @return returns {@linkcode true} if the object is a valid GeoJSON LineString|MultiLineString feature; {@linkcode false} otherwise
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.isGeoJSONLineStringFeature = function (feature){
  if (feature.type === "Feature" && feature.geometry && feature.geometry.coordinates && (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString')){
    return true;
  }
  else{
    return false;
  }
};

/**
* Checks whether the submitted object is a valid GeoJSON feature with geometryType {@linkcode Polygon} or {@linkcode MultiPolygon}.
* The feature must contain a property {@linkcode "type"="Feature"} and a property named {@linkcode geometry}, which must have a {@linkcode coordinates} array and {@linkcode type=Polygon|MultiPolygon} property.
* The method does not check, if the feature contains a {@linkcode properties} attribute.
* @param {Object} feature - a candidate for a GeoJSON Polygon|MultiPolygon feature.
* @return returns {@linkcode true} if the object is a valid GeoJSON Polygon|MultiPolygon feature; {@linkcode false} otherwise
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.isGeoJSONPolygonFeature = function (feature){
  if (feature.type === "Feature" && feature.geometry && feature.geometry.coordinates && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')){
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
exports.isGeoJSONFeatureCollection = function (featureCollection){

  if(featureCollection.type === "FeatureCollection" && featureCollection.features){
    // check all child features
    var isValid = true;

    for (var featureCandidate of featureCollection.features){
      if (!exports.isGeoJSONFeature(featureCandidate)){
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
exports.throwError = function (message){
  throw Error(message);
};

/**
* Aquire the {@linkcode feature}'s property value for the specified {@linkcode propertyName}.
* @param {Feature} feature - a valid GeoJSON Feature, which must contain a {@linkcode properties} attribute storing certain property values
* @param {string} propertyName - string representing the name of the queried property
* @returns {number|null} returns the property value for the specified {@linkcode propertyName} or {@linkcode null} if the feature does not contain the relevant property.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getPropertyValue = function (feature, propertyName){

  var value = feature.properties[propertyName];

  if(value){
    return value;
  }
  else{
    return null;
  }
};

/**
* Add a new property to the {@linkcode feature}
* @param {Feature} feature - a valid GeoJSON Feature, which must contain a {@linkcode properties} attribute storing certain property values
* @param {string} propertyName - string representing the name of the property
* @param {object} propertyValue - the value of the property
* @returns {Feature} returns the submitted feature which was enriched with the submitted property (the property is available via {@linkcode feature.properties[propertyName]})
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.setPropertyValue = function (feature, propertyName, propertyValue){

  feature.properties[propertyName] = propertyValue;

  return feature;
};

/**
* Add a new weight-specific property ('aggregationWeight') to the {@linkcode feature}. It can be utilized when aggregating lower spatial units to higher spatial units,
* where relevant features might be weighted differently in an average-based aggretation process
* @param {Feature} feature - a valid GeoJSON Feature, which must contain a {@linkcode properties} attribute storing certain property values
* @param {object} weightValue - the value of the aggregation weight - if submitted value is {@linkcode null|NAN} then default value of {@linkcode 1} will be set
* @returns {Feature} returns the submitted feature which was enriched with the submitted weight property (the property is available via {@linkcode feature.properties['aggregationWeight']}
* or via {@linkcode getAggregationWeight(feature) )
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.setAggregationWeight = function (feature, weightValue){

  if(weightValue){
      feature.properties['aggregationWeight'] = weightValue;
  }
  else{
    feature.properties['aggregationWeight'] = 1;
  }

  return feature;
};

/**
* Add a new weight-specific property ('aggregationWeight') to the {@linkcode feature}. It can be utilized when aggregating lower spatial units to higher spatial units,
* where relevant features might be weighted differently in an average-based aggretation process.
* @param {Feature} feature - a valid GeoJSON Feature, which must contain a {@linkcode properties} attribute storing certain property values
* @param {object} weightValue - the value of the aggregation weight
* @returns {Feature} returns the submitted feature which was enriched with the submitted weight property (the property is available via {@linkcode feature.properties['aggregationWeight']}
* or via {@linkcode getAggregationWeight(feature) )
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getAggregationWeight = function (feature){

  var value = feature.properties['aggregationWeight'];

  if(value){
    return value;
  }
  else{
    return 1;
  }
};

/**
* Aquire the {@linkcode feature}'s indicator value for the specified {@linkcode targetDate}.
* @param {Feature} feature - a valid GeoJSON Feature, which must contain a {@linkcode properties} attribute storing the indicator time series according to KomMonitor's data model
* @param {string} targetDate - string representing the target date for which the indicator value shall be extracted, following the pattern {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01}
* @returns {number|null} returns the indicator value for the specified {@linkcode targetDate} or {@linkcode null} if the feature does not contain an indicator value for the specified date.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getIndicatorValue = function (feature, targetDate){
  var targetDateWithPrefix;
  if(targetDate.includes(indicator_date_prefix)){
      targetDateWithPrefix = targetDate;
  }
  else{
      targetDateWithPrefix = exports.getTargetDateWithPropertyPrefix(targetDate);
  }

  var indicatorValue = feature.properties[targetDateWithPrefix];

  if(indicatorValue != null && indicatorValue != undefined){
    return indicatorValue;
  }
  else{
    return null;
  }
};

/**
* Aquire the array of indicator values for the specified {@linkcode targetDate}.
* @param {FeatureCollection} featureCollection - a valid GeoJSON FeatureCollection, whose features must contain a {@linkcode properties} attribute storing the indicator time series according to KomMonitor's data model
* @param {string} targetDate - string representing the target date for which the indicator value array shall be extracted, following the pattern {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01}
* @returns {Array<number>|null} returns the indicator values of all features of the {@linkcode featureCollection} for the specified {@linkcode targetDate} or {@linkcode null} if the features do not contain an indicator value for the specified date.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getIndicatorValueArray = function (featureCollection, targetDate){
  var targetDateWithPrefix;
  if(targetDate.includes(indicator_date_prefix)){
      targetDateWithPrefix = targetDate;
  }
  else{
      targetDateWithPrefix = exports.getTargetDateWithPropertyPrefix(targetDate);
  }

  var resultArray = [];

  for (var feature of featureCollection.features){
    var indicatorValue = feature.properties[targetDateWithPrefix];

    if(indicatorValue){
      resultArray.push(indicatorValue);
    }
    else{
      console.log("A feature did not contain an indicator value for the targetDate " + targetDate + ". Feature was: " + feature);
    }
  }

  if(! (resultArray.length > 0)){
    console.log("No feature of the featureCollection contains an indicator value for the specified targetDate " + targetDate + ". Thus return null.");
    return null;
  }

  return resultArray;
};

/**
* Aquire a map of all indicator id and value pairs for the specified {@linkcode targetDate}, where key=id and value=indicatorValue.
* @param {FeatureCollection} featureCollection - a valid GeoJSON FeatureCollection, whose features must contain a {@linkcode properties} attribute storing the indicator time series according to KomMonitor's data model
* @param {string} targetDate - string representing the target date for which the indicator id value map shall be extracted, following the pattern {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01}
* @returns {Map.<string, number>|null} returns map of all indicator id and value pairs for the specified {@linkcode targetDate}, where key=id and value=indicatorValue; or {@linkcode null} if the features do not contain an indicator value for the specified date.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getIndicatorIdValueMap = function (featureCollection, targetDate){
  var targetDateWithPrefix;
  if(targetDate.includes(indicator_date_prefix)){
      targetDateWithPrefix = targetDate;
  }
  else{
      targetDateWithPrefix = exports.getTargetDateWithPropertyPrefix(targetDate);
  }

  var resultMap = new Map();

  for (var feature of featureCollection.features){
    var indicatorValue = feature.properties[targetDateWithPrefix];
    var featureId = exports.getSpatialUnitFeatureIdValue(feature);

    if(indicatorValue){      
      resultMap.set(featureId, indicatorValue);
    }
    else{
      console.log("A feature did not contain an indicator value for the targetDate " + targetDate + ". Feature was: " + feature);
    }
  }

  if(! (resultMap.size > 0)){
    console.log("No feature of the featureCollection contains an indicator value for the specified targetDate " + targetDate + ". Thus return null.");
    return null;
  }

  return resultMap;
};

/**
* Aquire the array of indicator values for the specified {@linkcode targetDate}.
* @param {Map.<string, number>} indicatorIdValueMap - map of all indicator id and value pairs where key=id and value=indicatorValue
* @returns {Array<number>} returns all numeric indicator values of all features of the {@linkcode indicatorIdValueMap}.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getIndicatorValueArray_fromIdValueMap = function (indicatorIdValueMap){

  var resultArray = [];

  indicatorIdValueMap.forEach(function(value, key, map){
    if(value){
      resultArray.push(value);
    }
    else{
      console.log("A feature from indicator id value map did not contain an indicator value. Feature has ID: " + key);
    }    
  });

  return resultArray;
};

/**
* Aquire the array of property values for the specified {@linkcode propertyName}.
* @param {FeatureCollection} featureCollection - a valid GeoJSON FeatureCollection, whose features must contain a {@linkcode properties} attribute storing at least one property with the submitted {@linkcode propertyName}
* @param {string} propertyName - string representing the propertyName for which the value array shall be extracted
* @returns {Array<Object>|null} returns the property values of all features of the {@linkcode featureCollection} for the specified {@linkcode propertyName} or {@linkcode null} if the features do not contain the propertyName.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getPropertyValueArray = function (featureCollection, propertyName){

  var resultArray = [];

  for (var feature of featureCollection.features){
    var propertyValue = feature.properties[propertyName];

    if(propertyValue){
      resultArray.push(propertyValue);
    }
    else{
      console.log("A feature did not contain a property value for the propertyName " + propertyName + ". Feature was: " + feature);
    }
  }

  if(! (resultArray.length > 0)){
    console.log("No feature of the featureCollection contains a property value for the specified propertyName " + propertyName + ". Thus return null.");
    return null;
  }

  return resultArray;
};

/**
* Set the {@linkcode feature}'s indicator value for the specified {@linkcode targetDate} with the specified {@linkcode value}.
* @param {Feature} feature - a valid GeoJSON Feature
* @param {string} targetDate - string representing the target date for which the indicator value shall be set, following the pattern {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01}
* @param {number} value - a numeric value which shall be set as the {@linkcode feature}'s indicator value for the specified {@linkcode targetDate}
* @returns {Feature} returns the GeoJSON Feature
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.setIndicatorValue = function (feature, targetDate, value){

  if (typeof value != 'number'){
    console.log("The submitted value is not a valid number. Indicator values must be numeric though. The submitted value was: " + value);
    exports.throwError("The submitted value is not a valid number. Indicator values must be numeric though. The submitted value was: " + value);
  }

  var targetDateWithPrefix;
  if(targetDate.includes(indicator_date_prefix)){
      targetDateWithPrefix = targetDate;
  }
  else{
      targetDateWithPrefix = exports.getTargetDateWithPropertyPrefix(targetDate);
  }

  feature.properties[targetDateWithPrefix] = value;

  return feature;
};

/**
* Set the {@linkcode feature}'s indicator value for the specified {@linkcode targetDate} s so-called {@linkcode NO DATA value}, i.e. as {@linkcode null}. I.e. if there are data protection mechanisms
* that mark a certain feature's indicator value as too low, then the value must be set as NoData. Or another reason could be, that when performing spatial analysis, certain Features
* simply do not contain the queried elements. To distuinguish between features whose indicator value is actually {@linkode 0}, one might set the value as {@linkode NoData}. Which can be very important when average-aggregating
* indicaors from lower spatial units to upper spatial units, as {@linkode NoData} means somenhing different than {@linkode 0}.
* @param {Feature} feature - a valid GeoJSON Feature
* @param {string} targetDate - string representing the target date for which the indicator value shall be set, following the pattern {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01}
* @returns {Feature} returns the GeoJSON Feature
* @memberof API_HELPER_METHODS_UTILITY
* @see {@link indicatorValueIsNoDataValue}
* @function
*/
exports.setIndicatorValue_asNoData = function (feature, targetDate){

  var targetDateWithPrefix;
  if(targetDate.includes(indicator_date_prefix)){
      targetDateWithPrefix = targetDate;
  }
  else{
      targetDateWithPrefix = exports.getTargetDateWithPropertyPrefix(targetDate);
  }

  // set null as NoData value
  feature.properties[targetDateWithPrefix] = null;

  return feature;
};

/**
* Set the {@linkcode feature}'s indicator value for all features of the {@linkcode targetFeatureCollection} for the specified {@linkcode targetDate} with the respective indicator value from the input {@linkcode indicatorIdValueMap}.
* @param {Feature} targetFeatureCollection - a valid GeoJSON FeatureCollection containing all target features
* @param {string} targetDate - string representing the target date for which the indicator value shall be set, following the pattern {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01}
* @param {number} indicatorIdValueMap - a map of indicator features (key=featureId, value=indicatorValue) whose values shall be set as the respective target features indicator value for the specified {@linkcode targetDate}
* @returns {Feature} returns the GeoJSON FeatureCollection
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.setIndicatorValues_fromIdValueMap = function (targetFeatureCollection, targetDate, indicatorIdValueMap){

  for (var feature of targetFeatureCollection.features) {
    var featureId = exports.getSpatialUnitFeatureIdValue(feature);

    if(indicatorIdValueMap.has(featureId)){
      feature = exports.setIndicatorValue(feature, targetDate, indicatorIdValueMap.get(featureId));
    }
    else{
      feature = exports.setIndicatorValue_asNoData(feature, targetDate);
    }
  } 

  return targetFeatureCollection;
};

/**
* Checks if the features indicator value for the specified {@linkcode targetDate} is a NoData value.
* @param {Feature} feature - a valid GeoJSON Feature
* @param {string} targetDate - string representing the target date, following the pattern {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01}
* @returns {boolean} returns {@linkcode true} if indicator value is NoData value (i.e. null, null or undefined)
* @memberof API_HELPER_METHODS_UTILITY
* @see {@link isNoDataValue}
* @function
*/
exports.indicatorValueIsNoDataValue = function (feature, targetDate){
  var targetDateWithPrefix;
  if(targetDate.includes(indicator_date_prefix)){
      targetDateWithPrefix = targetDate;
  }
  else{
      targetDateWithPrefix = exports.getTargetDateWithPropertyPrefix(targetDate);
  }

  // set null as NoData value
  var value = feature.properties[targetDateWithPrefix];

  return exports.isNoDataValue(value);
};

/**
* Checks if the value is a NoData value.
* @param {object} value - the value object to be inspected
* @returns {boolean} returns {@linkcode true} if value is NoData value (i.e. null, null or undefined)
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.isNoDataValue = function (value){

  if (Number.isNaN(value) || value === null || value === undefined){
    return true;
  }
  return false;
};

/**
* Concatenates indicator date property prefix and submitted targetDate.
* I.e, for exemplar targetDate="2018-01-01" it produces targetDateWithPrefix="DATE_2018-01-01".
* This is necessary in order to query timeseries property values from an indicator feature.
*
* indicatorFeature.properties[targetDate] --> null
* indicatorFeature.properties[targetDateWithPrefix] --> indicator value, (if timestamp is present)
* @param {string} targetDate - string representing the target date for which the indicator shall be computed, following the pattern {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01}
* @returns {string} the targetDate string with additional prefix from constant {@linkcode indicator_date_prefix} --> i.e. DATE_2018-01-01
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getTargetDateWithPropertyPrefix = function (targetDate){

  if(targetDate.includes(indicator_date_prefix)){
      return targetDate;
  }
  else{
      return indicator_date_prefix + targetDate;
  }
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#feature} to create a GeoJSON feature from a GeoJSON geometry.
* @param {Geometry} geometry - a GeoJSON Geometry (consisting of attributes {@linkcode type} and {@linkcode coordinates}).
* @returns {number} a GeoJSON feature wrapping the submitted GeoJSON geometry.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#feature}
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.asFeature = function (geometry){
  return turf.feature(geometry);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#featureCollection} to create a GeoJSON featureCollection from an array of GeoJSON features.
* @param {Array<Feature>} features - an array of GeoJSON features.
* @returns {number} a GeoJSON FeatureCollection containing all the submitted features.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#featureCollection}
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.asFeatureCollection = function (features){
  return turf.featureCollection(features);
};


/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#area} to compute the area of the submitted features in square meters (m²).
* @param {GeoJSON} geoJSON - any form of valid GeoJSON object (e.g. a single feature, or a FeatureCollection) with polygonal geometries.
* @returns {number} the area of the submitted features in square meters (m²)
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#area}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.area = function (geoJSON){
  return turf.area(geoJSON);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#area} to compute the area of the submitted feature in square meters (m²) and append it as new property {@linkcode area_squareMeters}.
* @param {Feature<Polygon>} feature - A single GeoJSON feature with polygonal geometry.
* @returns {Feature<Polygon>} the GeoJSON feature containing its computed area in square meters (m²) within new property {@linkcode area_squareMeters}.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#area}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.area_feature_asProperty = function (feature){
  var isFeature = exports.isGeoJSONFeature(feature);

  if(! isFeature){
    exports.throwError("The submitted object is not a valid GeoJSON feature");
  }
  feature.properties.area_squareMeters = turf.area(feature);
  return feature;
};

/**
* Computes the area in square meters (m²) of each feature of the submitted {@linkcode featureCollection_geoJSON} as new property {@linkcode area_squareMeters}.
* @param {FeatureCollection<Polygon>} featureCollection_geoJSON - A GeoJSON FeatureCollection with polygonal geometries.
* @returns {FeatureCollection<Polygon>} the GeoJSON FeatureCollection containing the computed area of each feature in square meters (m²) within new property {@linkcode area_squareMeters} of each feature.
* @see turf CONSTANT
* @see {@link area_feature_asProperty}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.area_featureCollection_asProperty = function (featureCollection_geoJSON){

  // replace all feature geometries with their bbox using turf.
  for(var index=0; index < featureCollection_geoJSON.features.length; index++){
    featureCollection_geoJSON.features[index] = exports.area_feature_asProperty(featureCollection_geoJSON.features[index]);
  };

  return featureCollection_geoJSON;
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#bbox} and {@linkcode https://turfjs.org/docs/#bboxPolygon} to compute the bounding box of a single feature.
* @param {Feature} feature - a single GeoJSON feature consisting of geometry and properties, for whom the bounding box shall be computed
* @returns {Feature} the GeoJSON feature whose geometry has been replaced by the bounding box geometry of type {@linkcode Polygon}.
* The resulting feature contains all properties of the original feature
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#bbox}
* @see {@link https://turfjs.org/docs/#bboxPolygon}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.bbox_feature = function (feature){
  var feature_bbox = turf.bbox(feature);
  // make sure, that properties array will remain
  feature_bbox.properties = feature.properties;
  return turf.bboxPolygon(feature_bbox);
};

/**
* Computes the bounding boxes of all features of the submitted {@linkcode featureCollection_geoJSON}.
* @param {FeatureCollection<Polygon>} featureCollection_geoJSON - a GeoJSON FeatureCollection consisting of multiple features, for whom the bounding box shall be computed
* @returns {FeatureCollection<Polygon>} the GeoJSON features whose geometry has been replaced by the bounding box geometry of type {@linkcode Polygon} as GeoJSON FeatureCollection.
* The resulting features contain all properties of the original features.
* @see turf CONSTANT
* @see {@link bbox_feature}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.bbox_featureCollection = function (featureCollection_geoJSON){

  // replace all feature geometries with their bbox using turf.
  for(var index=0; index < featureCollection_geoJSON.features.length; index++){
    featureCollection_geoJSON.features[index] = exports.bbox_feature(featureCollection_geoJSON.features[index]);
  };
  return featureCollection_geoJSON;
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#buffer} to compute the buffered geometry a single feature.
* @param {Feature} feature - a single GeoJSON feature consisting of geometry and properties, for whom the buffer shall be computed
* @param {number} radiusInMeters - the buffer radius in meters
* @returns {Feature<Polygon>} the GeoJSON feature whose geometry has been replaced by the buffered geometry of type {@linkcode Polygon}.
* The resulting feature contains all properties of the original feature
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#buffer}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.buffer_feature = function (feature, radiusInMeters){
  // turf.bbox uses kilometers as default radius unit
  var feature_buffered = turf.buffer(feature, radiusInMeters/1000);
  // make sure, that properties array will remain
  feature_buffered.properties = feature.properties;
  return feature_buffered;
};

/**
* Computes the buffered geometries of all features of the submitted {@linkcode featureCollection_geoJSON}.
* @param {FeatureCollection} featureCollection_geoJSON - a GeoJSON FeatureCollection consisting of multiple features, for whom the buffers shall be computed
* @param {number} radiusInMeters - the buffer radius in meters
* @returns {FeatureCollection<Polygon>} the GeoJSON features whose geometry has been replaced by the buffered geometry of type {@linkcode Polygon} as GeoJSON FeatureCollection.
* The resulting features contain all properties of the original features.
* @see turf CONSTANT
* @see {@link buffer_feature}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.buffer_featureCollection = function (featureCollection_geoJSON, radiusInMeters){

  // replace all feature geometries with their bbox using turf.
  for(var index=0; index < featureCollection_geoJSON.features.length; index++){
    featureCollection_geoJSON.features[index] = exports.bbox_feature(featureCollection_geoJSON.features[index]);
  };
  return featureCollection_geoJSON;
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#center} to compute the geometric center point the submitted features.
* @param {GeoJSON} geoJSON - any form of valid GeoJSON object (e.g. a single feature, or a FeatureCollection).
* @returns {Feature<Point>} the GeoJSON point feature representing the absolute geometric center of the submitted features.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#center}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.center_geometric = function (geoJSON){
  return turf.center(geoJSON);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#centerOfMass} to compute the center of mass of the submitted features.
* @param {GeoJSON} geoJSON - any form of valid GeoJSON object (e.g. a single feature, or a FeatureCollection).
* @param {Object} properties - the properties object that shall be used to set the point feature's properties.
* @returns {Feature<Point>} the GeoJSON point feature representing the center of mass of the submitted features (using the mean of all vertices).
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#centerOfMass}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.center_mass = function (geoJSON, properties){
  return turf.centerOfMass(geoJSON, properties);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#center} to compute the centroid the submitted features.
* @param {GeoJSON} geoJSON - any form of valid GeoJSON object (e.g. a single feature, or a FeatureCollection).
* @returns {Feature<Point>} the GeoJSON point feature representing the centroid of the submitted features.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#centroid}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.centroid = function (geoJSON){
  return turf.centroid(geoJSON);
};

// /**
// * Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#pointOnFeature} to compute the a point guaranteed to be on the surface of submitted features.
// * @param {GeoJSON} geoJSON - any form of valid GeoJSON object (e.g. a single feature, or a FeatureCollection).
// * @returns {Feature<Point>} the GeoJSON point feature on the surface of the submitted features.
// * @see turf CONSTANT
// * @see {@link https://turfjs.org/docs/#pointOnFeature}
// * @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
// * @function
// */
// exports.pointOnFeature = function (geoJSON){
//   return turf.pointOnFeature(geoJSON);
// };

/**
* Encapsulates {@linkcode turf} functions {@linkcode https://turfjs.org/docs/#buffer} {@linkcode https://turfjs.org/docs/#pointOnFeature} to compute the a point guaranteed to be on the surface of submitted feature.
* It buffers the feature with negative radius and then performs pointOnfeature method to ensure that the computet point is definitly within feature. Only pointOnFeature sometimes places point on border and - due to coordinate rounding etc. - point might be within other feature...
* @param {GeoJSON} geoJSON - valid GeoJSON object.
* @returns {Feature<Point>} the GeoJSON point feature on the surface of the submitted features.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#buffer}
* @see {@link https://turfjs.org/docs/#pointOnFeature}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.pointOnFeature = function (geoJSON){
  // var triangles = turf.tesselate(polygonFeature);

  var buffered = turf.buffer(geoJSON, -0.03, {units: 'kilometers'});

  return turf.pointOnFeature(buffered);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#booleanContains} to check if the submitted GeoJSON feature {@linkcode feature_A} contains {@linkcode feature_B}.
* @param {Feature} feature_A - a GeoJSON feature of any type
* @param {Feature} feature_B - a GeoJSON feature of any type
* @returns {boolean} returns {@linkcode true}, if {@linkcode feature_A} contains {@linkcode feature_B}.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#booleanContains}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.contains = function (feature_A, feature_B){

  return turf.booleanContains(feature_A, feature_B);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#difference} to compute the {@linkcode difference} between two polygonal GeoJSON features.
* @param {Feature<Polygon>} polygonFeature_A - a GeoJSON feature of type {@linkcode Polygon}
* @param {Feature<Polygon>} polygonFeature_B - a GeoJSON feature of type {@linkcode Polygon} to difference from {@linkcode polygonFeature_A}
* @returns {Feature<Polygon|MultiPolygon>|null} the GeoJSON feature of type {@linkcode Polygon|MultiPolygon} showing the area of {@linkcode polygonFeature_A}
* excluding the area of {@linkcode polygonFeature_B} (if empty returns {@linkcode null}).
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#difference}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.difference = function (polygonFeature_A, polygonFeature_B){

  return turf.difference(polygonFeature_A, polygonFeature_B);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#dissolve} to dissolve polygonal features.
* NOTE: TURF DISSOLVE IS KNOWN TO BE BUGGY: IT MIGHT FAIL WITH ERROR ALTHOUGH IT SHOULD WORK. AS AN ALTERNATIVE, YOU SHOULD CONSIDER TO USE {@linkcode union} METHOD.
* @param {FeatureCollection<Polygon>} featureCollection_geoJSON - valid GeoJSON FeatureCollection with polygonal geometries (MultiPolygons will be transformed to multiple polygons before dissolving).
* @param {string} propertyName - OPTIONAL parameter that points to an existing attribute used by the features. If set, only features with the same attribute value will be dissolved.
* @returns {FeatureCollection<Polygon>} the GeoJSON FeatureCollection containing the dissolved features (Note that attributes are not merged/aggregated).
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#dissolve}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.dissolve = function (featureCollection_geoJSON, propertyName){

  featureCollection_geoJSON = exports.transformMultiPolygonsToPolygons(featureCollection_geoJSON);

  var geomTypeSample = featureCollection_geoJSON.features[0].geometry.type;

  featureCollection_geoJSON.features.forEach(function(feature){
    var geomType = feature.geometry.type;

    if (geomType !== geomTypeSample){
      KmHelper.throwError("Dissolve cannot be executed as the feature collection contains features with different geometry types. The conflicting types are " + geomType + " and " + geomTypeSample);
    }
  });

  if (propertyName){
      return turf.dissolve(featureCollection_geoJSON, {propertyName: propertyName});
  }
  else{
      return turf.dissolve(featureCollection_geoJSON);
  }
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#booleanDisjoint} to check if the submitted GeoJSON features are {@linkcode disjoint}.
* @param {Feature} feature_A - a GeoJSON feature of any type
* @param {Feature} feature_B - a GeoJSON feature of any type
* @returns {boolean} returns {@linkcode true}, if both features are disjoint and thus do not intersect.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#booleanDisjoint}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.disjoint = function (feature_A, feature_B){

  return turf.booleanDisjoint(feature_A, feature_B);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#distance} to compute the direct (aerial) distance between the submitted points.
* @param {Feature<Point>} point_A - valid GeoJSON Feature with geometry type {@linkcode Point}
* @param {Feature<Point>} point_B - valid GeoJSON Feature with geometry type {@linkcode Point}
* @returns {number} the direct distance between the submitted points in kilometers.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#distance}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.distance_direct_kilometers = function (point_A, point_B){
  return turf.distance(point_A, point_B, {unit: 'kilometers'});
};

/**
* Performs a GET request against {@linkcode /routes} endpoint of the openrouteservice instance
* specified via the CONSTANT {@link openrouteservice_url} (version 4.7.2) to aquire the distance
* between the submitted points based on waypath routing.
* @param {Feature<Point>} point_A - valid GeoJSON Feature with geometry type {@linkcode Point} - the coordinates are expected to follow the order {@linkcode longitude, latitude}
* @param {Feature<Point>} point_B - valid GeoJSON Feature with geometry type {@linkcode Point} - the coordinates are expected to follow the order {@linkcode longitude, latitude}
* @param {string} vehicleType - the type of vehicle to use for routing analysis;
* allowed values are {@linkcode PEDESTRIAN},{@linkcode BIKE}, {@linkcode CAR}. If parameter has in invalid value, {@linkcode PEDESTRIAN} is used per default.
* @returns {number} the distance between the submitted points in kilometers based on waypath routing
* (thus, the distance is likely to be greater then the direct distance computed by {@link distance_direct_kilometers}).
* @see openrouteservice_url CONSTANT
* @see {@link distance_direct_kilometers}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @async
* @function
*/
exports.distance_waypath_kilometers = async function (point_A, point_B, vehicleType){
  // call openroute service 4.7.2 API to query routing from A to B

  // coordinate string must be "lon,lat|lon,lat"

  var isPointFeature_A = exports.isGeoJSONPointFeature(point_A);
  var isPointFeature_B = exports.isGeoJSONPointFeature(point_B);

  if(! isPointFeature_A){
    exports.throwError("The submitted object point_A is not a valid GeoJSON point feature. It was: " + point_A);
  }
  if(! isPointFeature_B){
    exports.throwError("The submitted object point_B is not a valid GeoJSON point feature. It was: " + point_B);
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

/**
* Performs a POST request against {@linkcode /matrix} endpoint of the openrouteservice instance
* specified via the CONSTANT {@link openrouteservice_url} (version 4.7.2) to aquire the distance matrix
* for the submitted source and destinations points based on waypath routing.
* @param {Array.Feature<Point>} locations - array of valid GeoJSON Features with geometry type {@linkcode Point} - the coordinates are expected to follow the order {@linkcode longitude, latitude}.
* WARNING: it might be possible, that the queried instance of OpenRouteService has a configuration for maximum number of allowed locations per request (i.e. 200 is default configuration),
* causing the request to fail.
* @param {String} sourceIndices - the indices pointing to such points within submitted {@linkcode locations}, that shall be used as source points for matrix analysis,
* as comma-separated string of indices. Required format: 'index1,index2,index3,...'. A check, whether the index string contains indices that do not match the {@linkcode locations} array, is not performed.
* @param {String} destinationIndices - the indices pointing to such points within submitted {@linkcode locations}, that shall be used as destination points for matrix analysis,
* as comma-separated string of indices. Required format: 'index4,index5,index6,...'. A check, whether the index string contains indices that do not match the {@linkcode locations} array, is not performed.
* @param {string} vehicleType - the type of vehicle to use for routing analysis;
* allowed values are {@linkcode PEDESTRIAN},{@linkcode BIKE}, {@linkcode CAR}. If parameter has in invalid value, {@linkcode PEDESTRIAN} is used per default.
* @example
* // examplar response to show how distance matrix is structured
* {
    "distances": [
        [
            2.59,
            4.55
        ],
        [
            2.05,
            2.6
        ]
    ]
    "destinations": [
        {
            "location": [
                7.019859,
                51.458106
            ],
            "name": "Severinstraße",
            "snapped_distance": 24.9
        },
        {
            "location": [
                7.032748,
                51.445316
            ],
            "name": "",
            "snapped_distance": 12.44
        }
    ],
    "sources": [
        {
            "location": [
                7.007574,
                51.475965
            ],
            "name": "Gladbecker Straße, B 224",
            "snapped_distance": 0.35
        },
        {
            "location": [
                7.001853,
                51.449557
            ],
            "name": "",
            "snapped_distance": 1.98
        }
    ],
    "info": {
        "service": "matrix",
        "engine": {
            "version": "4.7.2",
            "build_date": "2019-03-29T11:38:45Z"
        },
        "attribution": "openrouteservice.org, OpenStreetMap contributors",
        "timestamp": 1560748456760,
        "query": {
            "profile": "foot-walking",
            "units": "km"
        }
    }
}
* @returns {object} the distance matrix between the submitted source and destination points based on waypath routing.
* @see openrouteservice_url CONSTANT
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @async
* @function
*/
exports.distance_matrix_kilometers = async function (locations, sourceIndices, destinationIndices, vehicleType){
  // call openroute service 4.7.2 API to query matrix


  for (var location of locations){
    if(! exports.isGeoJSONPointFeature(location)){
      exports.throwError("The submitted locations array contains objects that are not valid GeoJSON point features. It was: " + location);
    }
  }

// coordinate string must be "lon,lat|lon,lat"
  var coordinatesArray = [];

  for (var loc of locations){
    // expected to have order longitude, latitude!
    coordinatesArray.push(loc.geometry.coordinates);
  }

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

  var matrixPostBody = {
    "profile": vehicleString,
    "locations": coordinatesArray,
    "sources": sourceIndices,
    "destinations": destinationIndices,
    "metrics": "distance",
    "resolve_locations": true,
    "units": "km",
    "optimized": true
  };

  console.log("Query OpenRouteService matix endpoint ('" + openrouteservice_url + "/matrix" + "') with following matrix POST request: " + matrixPostBody);

  var matrix = await axios.post(openrouteservice_url + "/matrix", matrixPostBody)
    .then(response => {
      // response.data should be the query response
      return response.data;
    })
    .catch(error => {
      console.log("Error while executing OpenRouteService POST request. Error was: " + error);
      throw error;
    });

  return matrix;
};

/**
* Performs a POST request against {@linkcode /matrix} endpoint of the openrouteservice instance
* specified via the CONSTANT {@link openrouteservice_url} (version 4.7.2) to aquire the duration matrix
* for the submitted source and destinations points based on waypath routing.
* @param {Array.Feature<Point>} locations - array of valid GeoJSON Features with geometry type {@linkcode Point} - the coordinates are expected to follow the order {@linkcode longitude, latitude}.
* WARNING: it might be possible, that the queried instance of OpenRouteService has a configuration for maximum number of allowed locations per request (i.e. 200 is default configuration),
* causing the request to fail.
* @param {String} sourceIndices - the indices pointing to such points within submitted {@linkcode locations}, that shall be used as source points for matrix analysis,
* as comma-separated string of indices. Required format: 'index1,index2,index3,...'. A check, whether the index string contains indices that do not match the {@linkcode locations} array, is not performed.
* @param {String} destinationIndices - the indices pointing to such points within submitted {@linkcode locations}, that shall be used as destination points for matrix analysis,
* as comma-separated string of indices. Required format: 'index4,index5,index6,...'. A check, whether the index string contains indices that do not match the {@linkcode locations} array, is not performed.
* @param {string} vehicleType - the type of vehicle to use for routing analysis;
* allowed values are {@linkcode PEDESTRIAN},{@linkcode BIKE}, {@linkcode CAR}. If parameter has in invalid value, {@linkcode PEDESTRIAN} is used per default.
* @example
* // examplar response to show how distance matrix is structured
* {
    "durations": [
        [
            259,
            455
        ],
        [
            205,
            26
        ]
    ]
    "destinations": [
        {
            "location": [
                7.019859,
                51.458106
            ],
            "name": "Severinstraße",
            "snapped_distance": 24.9
        },
        {
            "location": [
                7.032748,
                51.445316
            ],
            "name": "",
            "snapped_distance": 12.44
        }
    ],
    "sources": [
        {
            "location": [
                7.007574,
                51.475965
            ],
            "name": "Gladbecker Straße, B 224",
            "snapped_distance": 0.35
        },
        {
            "location": [
                7.001853,
                51.449557
            ],
            "name": "",
            "snapped_distance": 1.98
        }
    ],
    "info": {
        "service": "matrix",
        "engine": {
            "version": "4.7.2",
            "build_date": "2019-03-29T11:38:45Z"
        },
        "attribution": "openrouteservice.org, OpenStreetMap contributors",
        "timestamp": 1560748456760,
        "query": {
            "profile": "foot-walking",
            "units": "seconds"
        }
    }
}
* @returns {object} the duration matrix between the submitted source and destination points based on waypath routing.
* @see openrouteservice_url CONSTANT
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @async
* @function
*/
exports.duration_matrix_seconds = async function (locations, sourceIndices, destinationIndices, vehicleType){
  // call openroute service 4.7.2 API to query matrix


  for (var location of locations){
    if(! exports.isGeoJSONPointFeature(location)){
      exports.throwError("The submitted locations array contains objects that are not valid GeoJSON point features. It was: " + location);
    }
  }

// coordinate string must be "lon,lat|lon,lat"
  var coordinatesArray = [];

  for (var loc of locations){
    // expected to have order longitude, latitude!
    coordinatesArray.push(loc.geometry.coordinates);
  }

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

  var matrixPostBody = {
    "profile": vehicleString,
    "locations": coordinatesArray,
    "sources": sourceIndices,
    "destinations": destinationIndices,
    "metrics": "duration",
    "resolve_locations": true,
    "optimized": true
  };

  console.log("Query OpenRouteService matix endpoint ('" + openrouteservice_url + "/matrix" + "') with following matrix POST request: " + matrixPostBody);

  var matrix = await axios.post(openrouteservice_url + "/matrix", matrixPostBody)
    .then(response => {
      // response.data should be the query response
      return response.data;
    })
    .catch(error => {
      console.log("Error while executing OpenRouteService POST request. Error was: " + error);
      throw error;
    });

  return matrix;
};

/**
* Performs a GET request against {@linkcode /isochrones} endpoint of the openrouteservice instance
* specified via the CONSTANT {@link openrouteservice_url} (version 4.7.2) to aquire the reachability isochrones by time
* starting from the submitted points based on waypath routing.
* If the number of {@linkcode startingPoints} is greater than allowed number of max locations ({@see maxLocationsForORSRequest}), {@linkcode startingPoints} will be plit up and multiple requests will be made. Results will be combined to a single FeatureCollection.
* @param {Array.<Feature<Point>>} startingPoints - array of valid GeoJSON Features with geometry type {@linkcode Point} - the coordinates are expected to follow the order {@linkcode longitude, latitude}
* @param {string} vehicleType - the type of vehicle to use for routing analysis;
* allowed values are {@linkcode PEDESTRIAN},{@linkcode BIKE}, {@linkcode CAR}. If parameter has in invalid value, {@linkcode PEDESTRIAN} is used per default.
* @param {number} travelTimeInSeconds - the travel time to compute the isochrones in seconds
* @param {number|null} customMaxSpeedInKilometersPerHour - a custom maximum speed to use for isochrone computation or {@linkcode null} to use defaults from OpenRouteService
* @param {boolean} dissolve - if multiple starting points were specified this optional parameter controls whether the returned isochrones shall be dissolved or not - default value is false
* @param {boolean} deactivateLog - set to true to deactivate log statements (i.e. when calling the method for thousands of starting points separately) - default value is false
* @param {string|null} avoid_features - may specify a featureType of routing network that shall be avoided. possible values are {@linkcode highways, tollways, ferries, tunnels, pavedroads, unpavedroads, tracks, fords, steps, hills}
* @returns {FeatureCollection<Polygon>} the reachability isochrones as GeoJSON FeatureCollection; if multiple starting points were specified the resulting isochrones for each point are dissolved as far as possible.
* @see openrouteservice_url CONSTANT
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @async
* @function
*/
exports.isochrones_byTime = async function (startingPoints, vehicleType, travelTimeInSeconds, customMaxSpeedInKilometersPerHour, dissolve, deactivateLog, avoid_features){
  // call openroute service 4.7.2 API to query routing from A to B

  for (pointCandidate of startingPoints){
    var isPoint = exports.isGeoJSONPointFeature(pointCandidate);

    if(! isPoint){
      exports.throwError("The submitted object is not a valid GeoJSON point feature. It was: " + pointCandidate);
    }
  }

  if (startingPoints.length <= maxLocationsForORSRequest){
    return await computeIsochrones_byTime(startingPoints, vehicleType, travelTimeInSeconds, customMaxSpeedInKilometersPerHour, dissolve, deactivateLog, avoid_features);
  }
  else{
    exports.log("Number of Isochrone starting points is greater than the maximum number of locations (" + maxLocationsForORSRequest + "). Must split up starting points to make multiple requests. Result will contain all isochrones though.");
    var resultIsochrones;

    var featureIndex = 0;
    // log progress for each 10% of features
    var logProgressIndexSeparator = Math.round(startingPoints.length / 100 * 10);

    var countFeatures = 0;
    var tempStartPointsArray = [];
    for (var pointIndex=0; pointIndex < startingPoints.length; pointIndex++){
      tempStartPointsArray.push(startingPoints[pointIndex]);
      countFeatures++;

      // if maxNumber of locations is reached or the last starting point is reached
      if(countFeatures === maxLocationsForORSRequest || pointIndex === startingPoints.length -1){
        // make request, collect results

        // responses will be GeoJSON FeatureCollections
        var tempIsochrones = await computeIsochrones_byTime(tempStartPointsArray, vehicleType, travelTimeInSeconds, customMaxSpeedInKilometersPerHour, dissolve, deactivateLog, avoid_features);

        if (! resultIsochrones){
          resultIsochrones = tempIsochrones;
        }
        else{
          // apend results of tempIsochrones to resultIsochrones
          resultIsochrones.features = resultIsochrones.features.concat(tempIsochrones.features);
        }
          // increment featureIndex
          featureIndex++;
          if(featureIndex % logProgressIndexSeparator === 0){
              KmHelper.log("PROGRESS: Computed isochrones for '" + featureIndex + "' of total '" + startingPoints.length + "' starting points.");
          }

        // reset temp vars
        tempStartPointsArray = [];
        countFeatures = 0;

      } // end if
    }

    // if dissolve is true then dissolve results
    if (dissolve){
      return exports.dissolve(resultIsochrones, "value");
    }
    else{
      return resultIsochrones;
    }
  } // end else
};

var computeIsochrones_byTime = async function (startingPoints, vehicleType, travelTimeInSeconds, customMaxSpeedInKilometersPerHour, dissolve, deactivateLog, avoid_features){

  exports.log("Compute Time Isochrones for a total of " + startingPoints.length + " starting points.");

  // coordinate string must be "lon,lat|lon,lat"
  var locationsString = "";
  for (var index=0; index<startingPoints.length; index++){
    //element is valid GeoJSON Point Feature with coordinates like [longitude,latitude]
    locationsString += startingPoints[index].geometry.coordinates[0] + "," + startingPoints[index].geometry.coordinates[1];
    if(index != startingPoints.length - 1){
      // encode pipe symbol "|" manually
      locationsString += "%7C";
    }
  };

  var optionsString = undefined;
  if (customMaxSpeedInKilometersPerHour || avoid_features){
      optionsString = '{';
      if(customMaxSpeedInKilometersPerHour){
        optionsString += '"maximum_speed":' + customMaxSpeedInKilometersPerHour;
      }
      if(avoid_features){
        if(customMaxSpeedInKilometersPerHour){
            optionsString += ',';
        }
        optionsString += '"avoid_features":"' + avoid_features + '"';
      }
      optionsString += '}';
  }

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

  // var constantParameters = "&units=m&location_type=start&range_type=time";
  // encode pipe symbol manually via %7C
  var constantParameters = "&smoothing=0&units=m&location_type=start&range_type=time";

  var ors_isochrones_GET_request = openrouteservice_url + "/isochrones?profile=" + vehicleString + "&locations=" + locationsString + "&range=" + travelTimeInSeconds + constantParameters;

  if (optionsString){
    ors_isochrones_GET_request += "&options=" + encodeURIComponent(optionsString);
  }

  if (! deactivateLog){
      console.log("Query OpenRouteService with following isochrones request: " + ors_isochrones_GET_request);
  }

  var isochronesResult = await executeOrsQuery(ors_isochrones_GET_request);

  // dissolve isochrones if multiple starting points were used
  if (startingPoints.length > 1 && dissolve){
  if(! deactivateLog){
  console.log("Dissolving isochrones from multiple starting points. Set property 'value' to group equal isochrones.");
  }
  isochronesResult = exports.dissolve(isochronesResult, "value");
  }

  return isochronesResult;
};

/**
* Performs a GET request against {@linkcode /isochrones} endpoint of the openrouteservice instance
* specified via the CONSTANT {@link openrouteservice_url} (version 4.7.2) to aquire the reachability isochrones by distance (equidistance)
* starting from the submitted points based on waypath routing.
* If the number of {@linkcode startingPoints} is greater than allowed number of max locations ({@see maxLocationsForORSRequest}), {@linkcode startingPoints} will be plit up and multiple requests will be made. Results will be combined to a single FeatureCollection.
* @param {Array.<Feature<Point>>} startingPoints - array of valid GeoJSON Features with geometry type {@linkcode Point} - the coordinates are expected to follow the order {@linkcode longitude, latitude}
* @param {string} vehicleType - the type of vehicle to use for routing analysis;
* allowed values are {@linkcode PEDESTRIAN},{@linkcode BIKE}, {@linkcode CAR}. If parameter has in invalid value, {@linkcode PEDESTRIAN} is used per default.
* @param {number} travelDistanceInMeters - the travel distance to compute the isochrones (equidistance) in meters
* @param {boolean} dissolve - if multiple starting points were specified this optional parameter controls whether the returned isochrones shall be dissolved or not - default value is false
* @param {boolean} deactivateLog - set to true to deactivate log statements (i.e. when calling the method for thousands of starting points separately) - default value is false
* @param {string|null} avoid_features - may specify a featureType of routing network that shall be avoided. possible values are {@linkcode highways, tollways, ferries, tunnels, pavedroads, unpavedroads, tracks, fords, steps, hills}
* @returns {FeatureCollection<Polygon>} the reachability isochrones as GeoJSON FeatureCollection; if multiple starting points were specified the resulting isochrones for each point are dissolved as far as possible.
* @see openrouteservice_url CONSTANT
* @async
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.isochrones_byDistance = async function (startingPoints, vehicleType, travelDistanceInMeters, dissolve, deactivateLog, avoid_features){
  // call openroute service 4.7.2 API to query routing from A to B

  for (pointCandidate of startingPoints){
    var isPoint = exports.isGeoJSONPointFeature(pointCandidate);

    if(! isPoint){
      exports.throwError("The submitted object is not a valid GeoJSON point feature. It was: " + pointCandidate);
    }
  }

  if (startingPoints.length <= maxLocationsForORSRequest){
    return await computeIsochrones_byDistance(startingPoints, vehicleType, travelDistanceInMeters, dissolve, deactivateLog, avoid_features);
  }
  else{
    exports.log("Number of Isochrone starting points is greater than the maximum number of locations (" + maxLocationsForORSRequest + "). Must split up starting points to make multiple requests. Result will contain all isochrones though.");
    var resultIsochrones;

    var featureIndex = 0;
    // log progress for each 10% of features
    var logProgressIndexSeparator = Math.round(startingPoints.length / 100 * 10);

    var countFeatures = 0;
    var tempStartPointsArray = [];
    for (var pointIndex=0; pointIndex < startingPoints.length; pointIndex++){
      tempStartPointsArray.push(startingPoints[pointIndex]);
      countFeatures++;

      // if maxNumber of locations is reached or the last starting point is reached
      if(countFeatures === maxLocationsForORSRequest || pointIndex === startingPoints.length -1){
        // make request, collect results

        // responses will be GeoJSON FeatureCollections
        var tempIsochrones = await computeIsochrones_byDistance(tempStartPointsArray, vehicleType, travelDistanceInMeters, dissolve, deactivateLog, avoid_features);

        if (! resultIsochrones){
          resultIsochrones = tempIsochrones;
        }
        else{
          // apend results of tempIsochrones to resultIsochrones
          resultIsochrones.features = resultIsochrones.features.concat(tempIsochrones.features);
        }
          // increment featureIndex
          featureIndex++;
          if(featureIndex % logProgressIndexSeparator === 0){
              KmHelper.log("PROGRESS: Computed isochrones for '" + featureIndex + "' of total '" + startingPoints.length + "' starting points.");
          }

        // reset temp vars
        tempStartPointsArray = [];
        countFeatures = 0;

      } // end if
    }

    // if dissolve is true then dissolve results
    if (dissolve){
      return exports.dissolve(resultIsochrones, "value");
    }
    else{
      return resultIsochrones;
    }
  } // end else

};

var computeIsochrones_byDistance = async function (startingPoints, vehicleType, travelDistanceInMeters, dissolve, deactivateLog, avoid_features){
  // call openroute service 4.7.2 API to query routing from A to B

  exports.log("Compute Distance Isochrones for a total of " + startingPoints.length + " starting points.");

            // coordinate string must be "lon,lat|lon,lat"
            var locationsString = "";
            for (var index=0; index<startingPoints.length; index++){
              //element is valid GeoJSON Point Feature with coordinates like [longitude,latitude]
              locationsString += startingPoints[index].geometry.coordinates[0] + "," + startingPoints[index].geometry.coordinates[1];
              if(index != startingPoints.length - 1){
                // encode pipe symbol "|" manually
                locationsString += "%7C";
              }
            };

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

            var optionsString = undefined;
            if(avoid_features){
                optionsString = '{"avoid_features":"' + avoid_features + '"}';
            }

            // var constantParameters = "&units=m&location_type=start&range_type=time";
            // encode pipe symbol manually via %7C
            var constantParameters = "&smoothing=0&units=m&location_type=start&range_type=distance";

            var ors_isochrones_GET_request = openrouteservice_url + "/isochrones?profile=" + vehicleString + "&locations=" + locationsString + "&range=" + travelDistanceInMeters + constantParameters;
            if(optionsString){
              ors_isochrones_GET_request += "&options=" + encodeURIComponent(optionsString);
            }

  if (! deactivateLog){
      console.log("Query OpenRouteService with following isochrones request: " + ors_isochrones_GET_request);
  }

  var isochronesResult = await executeOrsQuery(ors_isochrones_GET_request);

  // dissolve isochrones if multiple starting points were used
  if (startingPoints.length > 1  && dissolve){
    if (! deactivateLog){
        console.log("Dissolving isochrones from multiple starting points. Set property 'value' to group equal isochrones.");
    }

    isochronesResult = exports.dissolve(isochronesResult, "value");
  }

  return isochronesResult;
};

function executeOrsQuery(ors_route_GET_request){
  return axios.get(ors_route_GET_request)
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
* @param {Feature} feature_A - a GeoJSON feature of any type
* @param {Feature} feature_B - a GeoJSON feature of any type
* @returns {boolean} returns {@linkcode true}, if both features intersect each other.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#booleanDisjoint}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.intersects = function (feature_A, feature_B){

  return ! turf.booleanDisjoint(feature_A, feature_B);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#intersect} to compute the {@linkcode intersection} between two polygonal GeoJSON features.
* @param {Feature<Polygon>} polygonFeature_A - a GeoJSON feature of type {@linkcode Polygon}
* @param {Feature<Polygon>} polygonFeature_B - a GeoJSON feature of type {@linkcode Polygon}
* @returns {Feature|null} returns a GeoJSON feature representing the point(s) they share (in case of a {@linkcode Point} or {@linkcode MultiPoint} ),
* the borders they share (in case of a {@linkcode LineString} or a {@linkcode MultiLineString} ), the area they share (in case of {@linkcode Polygon} or {@linkcode MultiPolygon} ).
* If they do not share any point, returns {@linkcode null}
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#intersect}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.intersection = function (polygonFeature_A, polygonFeature_B){

  return turf.intersect(polygonFeature_A, polygonFeature_B);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#nearestPoint} to identify the nearest point of a point collection.
* @param {Feature<Point>} targetPoint - a GeoJSON feature with geometry type {@linkcode Point}, for which the nearest point will be searched
* @param {FeatureCollection<Point>} pointCollection - a GeoJSON FeatureCollection of features with geometry type {@linkcode Point}
* @returns {Feature<Point>} returns the nearest GeoJSON Point Feature with the shortest direct distance to {@linkcode targetPoint}.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#nearestPoint}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.nearestPoint_directDistance = function (targetPoint, pointCollection){

  if(! exports.isGeoJSONPointFeature(targetPoint)){
    exports.throwError("The submitted object targetPoint is not a valid GeoJSON point feature. It was: " + targetPoint);
  }

  for (var pointCandidate of pointCollection.features){
    if(! exports.isGeoJSONPointFeature(pointCandidate)){
      exports.throwError("The submitted pointCollection contains features that are no valid GeoJSON point features. PointCandidate was: " + pointCandidate);
    }
  }

  return turf.nearestPoint(targetPoint, pointCollection);
};

/**
* Identifies the nearest point of a {@linkcode pointCollection} which has the shortest waypath distance to {@linkcode targetPoint}. In contrast to method {@link nearestPoint_directDistance},
* this method computes the distance based on waypaths of the corresponding {@linkcode vehicleType}. It makes use of method {@linkcode distance_waypath_kilometers}, which queries
* Open Route Service for waypath routing between two points.
* @param {Feature<Point>} targetPoint - a GeoJSON feature with geometry type {@linkcode Point}, for which the nearest point will be searched
* @param {FeatureCollection<Point>} pointCollection - a GeoJSON FeatureCollection of features with geometry type {@linkcode Point}
* @param {string} vehicleType - the type of vehicle to use for routing analysis;
* allowed values are {@linkcode PEDESTRIAN},{@linkcode BIKE}, {@linkcode CAR}. If parameter has in invalid value, {@linkcode PEDESTRIAN} is used per default.
* @returns {Feature<Point>} returns the nearest GeoJSON Point Feature with the shortest waypath distance to {@linkcode targetPoint}.
* @see {@link https://turfjs.org/docs/#nearestPoint_directDistance}
* @see {@link https://turfjs.org/docs/#distance_waypath_kilometers}
* @async
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.nearestPoint_waypathDistance = async function (targetPoint, pointCollection, vehicleType){
  if(! exports.isGeoJSONPointFeature(targetPoint)){
    exports.throwError("The submitted object targetPoint is not a valid GeoJSON point feature. It was: " + targetPoint);
  }

  for (var pointCandidate of pointCollection.features){
    if(! exports.isGeoJSONPointFeature(pointCandidate)){
      exports.throwError("The submitted pointCollection contains features that are no valid GeoJSON point features. PointCandidate was: " + pointCandidate);
    }
  }

  // compute distance matrix for all points and then find closest point
  var locations = [];
  var sourceIndices = "";
  var destinationIndices = "";
  // targte point is our source point
  locations.push(targetPoint);
  sourceIndices = "0";
  // all points from pointCollection are our destination points
  for (var index=0; index < pointCollection.features.length; index++){
    var pointCandidate = pointCollection.features[index];
    locations.push(pointCandidate);

    // plus one as first index is the source point in locations array
    var indexForDestinations = index + 1;
    destinationIndices += "" + indexForDestinations + ",";
  }

  var distanceMatrix = await exports.distance_matrix_kilometers(locations, sourceIndices, destinationIndices, vehicleType);

  // distances array contains distances sub-array for each source point
  var distancesForSingleSourcePoint = distanceMatrix.distances[0];

  // get index of shortest distance, that index points to the closest point within pointCollection
  var shortestDistance = undefined;
  var nearestPoint = undefined;

  for (var index=0; index < distancesForSingleSourcePoint.length; index++){
    distanceCandidate = distancesForSingleSourcePoint[index];
    // set variables if a nearer point is found or set with initial values
    if(shortestDistance === undefined || distanceCandidate < shortestDistance){
      shortestDistance = distanceCandidate;
      // this index corresponds to the index of the point feature within pointCollection
      nearestPoint = pointCollection.features[index];
    }
  }

  return nearestPoint;

};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#nearestPointOnLine} to identify the nearest point on the submitted line.
* @param {Feature<Point>} targetPoint - a GeoJSON feature with geometry type {@linkcode Point}, for which the nearest point will be searched
* @param {Feature<LineString|MultiLineString>} lineString - a GeoJSON feature  with geometry type {@linkcode LineString} or {@linkcode MultiLineString}
* @returns {Feature<Point>} returns the nearest GeoJSON Point Feature with the shortest direct distance to {@linkcode targetPoint}. Furthermore it contains the property {@linkcode dist}, which
* contains the direct distance to {@linkcode targetPoint} in kilometers.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#nearestPointOnLine}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.nearestPointOnLine_directDistance = function (targetPoint, lineString){

  if(! exports.isGeoJSONPointFeature(targetPoint)){
    exports.throwError("The submitted object targetPoint is not a valid GeoJSON point feature. It was: " + targetPoint);
  }
  if(! exports.isGeoJSONLineStringFeature(lineString)){
    exports.throwError("The submitted lineStringCandidate is not a valid GeoJSON LineString|MultiLineString feature. Candidate was: " + lineString);
  }

  return turf.nearestPointOnLine(targetPoint, lineString, {units: 'kilometers'});
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#nearestPointOnLine} to identify the nearest point for the nearest line of the submitted lines.
* @param {Feature<Point>} targetPoint - a GeoJSON feature with geometry type {@linkcode Point}, for which the nearest point will be searched
* @param {FeatureCollection<LineString|MultiLineString>} lineStringCollection - a GeoJSON FeatureCollection of features with geometry type {@linkcode LineString} or {@linkcode MultiLineString}
* @returns {Feature<Point>} returns the nearest GeoJSON Point Feature with the shortest direct distance to {@linkcode targetPoint}. Furthermore it contains the property {@linkcode dist}, which
* contains the direct distance to {@linkcode targetPoint} in kilometers.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#nearestPointOnLine}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.nearestPointOnLines_directDistance = function (targetPoint, lineStringCollection){

  if(! exports.isGeoJSONPointFeature(targetPoint)){
    exports.throwError("The submitted object targetPoint is not a valid GeoJSON point feature. It was: " + targetPoint);
  }

  for (var lineStringCandidate of lineStringCollection.features){
    if(! exports.isGeoJSONLineStringFeature(lineStringCandidate)){
      exports.throwError("The submitted lineStringCollection contains features that are no valid GeoJSON LineString features. lineStringCandidate was: " + lineStringCandidate);
    }
  }

  var shortestDistance = undefined;
  var nearestPoint = undefined;

  for (var candidate of lineStringCollection.features){
     var pointCandidate = exports.nearestPointOnLine_directDistance(targetPoint, candidate)

    // set variables if a nearer point is found or set with initial values
    if(shortestDistance === undefined || pointCandidate.dist < shortestDistance){
      shortestDistance = pointCandidate.dist;
      nearestPoint = pointCandidate;
    }
  }

  return nearestPoint;
};

/**
* Utilizes {@linkcode turf} functions {@linkcode https://turfjs.org/docs/#polygonToLine} to split up the Polygon|Multipolygon to LineStrings and
* {@linkcode https://turfjs.org/docs/#nearestPointOnLine} to identify the nearest point on the lines of the polygon.
* @param {Feature<Point>} targetPoint - a GeoJSON feature with geometry type {@linkcode Point}, for which the nearest point will be searched
* @param {Feature<Polygon|MultiPolygon>} polygon - a GeoJSON feature with geometry type {@linkcode Polygon} or {@linkcode MultiPolygon}
* @returns {Feature<Point>} returns the nearest GeoJSON Point Feature with the shortest direct distance to {@linkcode targetPoint}. Furthermore it contains the property {@linkcode dist}, which
* contains the direct distance to {@linkcode targetPoint} in kilometers.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#nearestPointOnLine}
* @see {@link https://turfjs.org/docs/#polygonToLine}
* @see {@link nearestPointOnLine_directDistance}
* @see {@link nearestPointOnLines_directDistance}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.nearestPointOnPolygon_directDistance = function (targetPoint, polygon){

  if(! exports.isGeoJSONPointFeature(targetPoint)){
    exports.throwError("The submitted object targetPoint is not a valid GeoJSON point feature. It was: " + targetPoint);
  }
  if(! exports.isGeoJSONPolygonFeature(polygon)){
    exports.throwError("The submitted polygonCandidate is not a valid GeoJSON Polygon|MultiPolygon feature. Candidate was: " + polygon);
  }

  // split polygon into lines
  // can be either Feature<LineString|MultiLineString> or FeatureCollection<LineString>
  var lines = turf.polygonToLine(polygon);

  if (lines.type === "Feature"){
    // single feature (Multi)LineString
    return exports.nearestPointOnLine_directDistance(targetPoint, lines);
  }
  else{
    // FeatureCollection of (Multi)LineString
    return exports.nearestPointOnLines_directDistance(targetPoint, lines);
  }
};

/**
* Utilizes {@linkcode turf} functions {@linkcode https://turfjs.org/docs/#polygonToLine} to split up the input Polygons|Multipolygons to LineStrings and
* {@linkcode https://turfjs.org/docs/#nearestPointOnLine} to identify the nearest point on the lines of the polygons.
* @param {Feature<Point>} targetPoint - a GeoJSON feature with geometry type {@linkcode Point}, for which the nearest point will be searched
* @param {Feature<Polygon|MultiPolygon>} polygonCollection - a GeoJSON FeatureCollection of features with geometry type {@linkcode Polygon} or {@linkcode MultiPolygon}
* @returns {Feature<Point>} returns the nearest GeoJSON Point Feature with the shortest direct distance to {@linkcode targetPoint}. Furthermore it contains the property {@linkcode dist}, which
* contains the direct distance to {@linkcode targetPoint} in kilometers.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#nearestPointOnLine}
* @see {@link https://turfjs.org/docs/#polygonToLine}
* @see {@link nearestPointOnLine_directDistance}
* @see {@link nearestPointOnLines_directDistance}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.nearestPointOnPolygons_directDistance = function (targetPoint, polygonCollection){

  if(! exports.isGeoJSONPointFeature(targetPoint)){
    exports.throwError("The submitted object targetPoint is not a valid GeoJSON point feature. It was: " + targetPoint);
  }
  for (var polygonCandidate of polygonCollection.features){
    if(! exports.isGeoJSONPolygonFeature(polygonCandidate)){
      exports.throwError("The submitted polygonCollection contains features that are no valid GeoJSON Polygon features. polygonCandidate was: " + polygonCandidate);
    }
  }

  var shortestDistance = undefined;
  var nearestPoint = undefined;

  for (var candidate of polygonCollection.features){
     var pointCandidate = exports.nearestPointOnPolygon_directDistance(targetPoint, candidate)

    // set variables if a nearer point is found or set with initial values
    if(shortestDistance === undefined || pointCandidate.dist < shortestDistance){
      shortestDistance = pointCandidate.dist;
      nearestPoint = pointCandidate;
    }
  }

  return nearestPoint;
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#booleanOverlap} to check if the submitted GeoJSON features overlaop each other.
* @param {Feature} feature_A - a GeoJSON feature of any type
* @param {Feature} feature_B - a GeoJSON feature of any type
* @returns {boolean} returns {@linkcode true}, if {@linkcode feature_A} overlaps partially with {@linkcode feature_B}.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#booleanOverlap}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.overlap = function (feature_A, feature_B){
  return turf.booleanOverlap(feature_A, feature_B);
};

/**
* Inspects the submitted GeoJSON FeatureCollection for any features of type {@linkcode MultiPolygon}.
* @param {FeatureCollection<Polygon|MultiPolygon>} featureCollection_geoJSON - valid GeoJSON FeatureCollection with polygonal geometries
* @returns {boolean} returns {@linkcode true}, if the featureCollection contains any features of type {@linkcode MultiPolygon}; {@linkcode false} otherwise
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.hasMultiPolygon = function (featureCollection_geoJSON){
  for (var feature of featureCollection_geoJSON.features){
    if (feature.geometry.type === "MultiPolygon"){
      return true;
    }
  }

  return false;
};

/**
* Inspects the submitted GeoJSON FeatureCollection for any features of type {@linkcode MultiPolygon} and replaces them by the individual features of type {@linkcode Polygon}.
* @param {FeatureCollection<Polygon|MultiPolygon>} featureCollection_geoJSON - valid GeoJSON FeatureCollection with polygonal geometries (MultiPolygons will be transformed to multiple polygons).
* @returns {Object} the GeoJSON FeatureCollection without any features of type {@linkcode MultiPolygon}. It may have an increased number of total features,
* if any {@linkcode MultiPolygon} was replaced by its individual features of type {@linkcode Polygon}.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.transformMultiPolygonsToPolygons = function (featureCollection_geoJSON){

  while(exports.hasMultiPolygon(featureCollection_geoJSON)){
    console.log("Replace MultiPolygon features by Polygons");
    featureCollection_geoJSON = exports.replaceMultiPolygonsByPolygons(featureCollection_geoJSON);
  }

  return featureCollection_geoJSON;
};

/**
* Replces any feature of type {@linkcode MultiPolygon} of the submitted featureCollection by the individual features of type {@linkcode Polygon}.
* @param {FeatureCollection<Polygon|MultiPolygon>} featureCollection_geoJSON - valid GeoJSON FeatureCollection with polygonal geometries (MultiPolygons will be replaced by multiple polygons).
* @returns {FeatureCollection<Polygon>} the GeoJSON FeatureCollection where features of type {@linkcode MultiPolygon} have been replaced by multiple features of type {@linkcode Polygon}.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.replaceMultiPolygonsByPolygons = function (featureCollection_geoJSON){
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
* @param {Feature<Polygon|MultiPolygon>} polygonFeature_A - a GeoJSON feature of type {@linkcode Polygon}
* @param {Feature<Polygon|MultiPolygon>} polygonFeature_B - a GeoJSON feature of type {@linkcode Polygon}
* @returns {Feature<Polygon|MultiPolygon>|null} the GeoJSON feature of type {@linkcode Polygon|MultiPolygon} representing the {@linkcode union} of the submitted features or {@linkcode null}.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#union}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.union = function (polygonFeature_A, polygonFeature_B){
  return turf.union(polygonFeature_A, polygonFeature_B);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#booleanWithin} to check if the submitted GeoJSON feature {@linkcode feature_A} lies within {@linkcode feature_B}.
* @param {Feature} feature_A - a GeoJSON feature of any type
* @param {Feature} feature_B - a GeoJSON feature of any type
* @returns {boolean} returns {@linkcode true}, if {@linkcode feature_A} lies within {@linkcode feature_B}.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#booleanWithin}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.within = function (feature_A, feature_B){

  return turf.booleanWithin(feature_A, feature_B);
};

/**
* Encapsulates {@linkcode turf} function {@linkcode https://turfjs.org/docs/#pointsWithinPolygon} to find all {@linkcode points} that lie within {@linkcode polygons}.
* @param {Feauture|FeatureCollection} points - a GeoJSON point features
* @param {FeatureCollection|Geometry|Feature} polygons - a GeoJSON polygon|multipolygon features
* @returns {FeatureCollection} returns all points that lie within at least one polygon of submitted polygons as {@linkcode FeatureCollection <Point>}.
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#pointsWithinPolygon}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.pointsWithinPolygon = function (points, polygons){

  return turf.pointsWithinPolygon(points, polygons);
};

/**
* This method is an alternative implementation of a spatial {@linkcode within} function for spatial features.
* First of all, it computes bounding boxes of the relevant features to speed up the spatial comparison.
* Furthermore, instead of checking whether {@linkcode feature_A} lies completely within {@linkcode feature_B},
* it inspects whether the bounding boxes overlap for more than 90.0%. If the features's geometries might contain faulty coordinates for whatever reason that would
* cause a strict spatial {@linkcode within} comparison to output {@linkcode false}, this alternative approach ensures that such small coordinate failures will still
* result in a positive {@linkcode within} check.
* @param {Feature<Polygon>} feature_A - a base indicator (input) feature as GeoJSON feature
* @param {Feature<Polygon>} feature_B - a target feature as GeoJSON feature (for which indicator results shall be computed)
* @returns {boolean} returns {@linkcode true} if the {@linkcode feature_A} lies within {@linkcode feature_B}
* (precisely, if their bounding boxes overlap for more than 90.0%); {@linkcode false} otherwise
* @see {@link bbox_feature}
* @see {@link area}
* @see {@link https://turfjs.org/docs/#intersect}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.within_usingBBOX = function (feature_A, feature_B){
  var feature_A_bboxPolygon = exports.bbox_feature(feature_A);
  var feature_B_bboxPolygon = exports.bbox_feature(feature_B);
  var feature_A_bboxPolygon_area = exports.area(feature_A_bboxPolygon);

  var intersection = turf.intersect(feature_B_bboxPolygon, feature_A_bboxPolygon);
  // if there is no intersection (features are disjoint) then skip this
  if (intersection == null || intersection == undefined)
    return false;

  var intersectionArea = exports.area(intersection);
  var overlapInPercent = Math.abs( intersectionArea / feature_A_bboxPolygon_area) * 100;

  // if indicaturFeature overlaps for at least 90% with feature_B, the assign it for aggregation to feature_B
  if(overlapInPercent >= 90.0)
    return true;

  return false;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// JSTAT statistical methods                                                                                                                                         //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* Takes a property array of arbitrary input objects and returns a valueArray of numeric values which have been converted to a number by {@linkcode Number(value)}. 
* Any property value of the input array, whose conversion results in Number.NaN using the check {@linkcode Number.isNan(Number(value))} or is boolean will be completely removed from the array
* Thus the resulting array may have fewer entries than the original array.
* @param {Array.<Object>} propertyArray - an array of arbitrary values (can be String, number, boolean, object)
* @returns {Array.<number>} returns the array of all values that were successfully converted to a number. responseArray.length may be smaller than inputArray.length, if inputArray contains boolean items or items whose Number-conversion result in Number.NaN
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.convertPropertyArrayToNumberArray = function(propertyArray){
  var numericArray = [];

  for (const value of propertyArray) {
    if (value === true | value === false){
    }
    else if (Number.isNaN(Number(value))){
    }
    else{
      numericArray.push(Number(value));
    }
  }

  return numericArray;
};

/**
* Takes a map of indicator feature id and value pairs and returns a map containing only entries with numeric indicator values which have been converted to a number by {@linkcode Number(value)}. 
* Any property value of the input map entries, whose conversion results in Number.NaN using the check {@linkcode Number.isNan(Number(value))} or is boolean will be completely removed from the map
* Thus the resulting may may have fewer entries than the original map.
* @param {Map.<string, Object>} indicatorIdValueMap - a map of indicator ID and value pairs, where key=ID and value=indicatorValue 
* @returns {Map.<string, number>} returns the map of all input map entries whose values were successfully converted to a number. responseMap.size may be smaller than inputMap.size, if inputMap contains boolean value items or items whose Number-conversion result in Number.NaN
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.convertPropertyMapToNumberMap_fromIdValueMap = function(indicatorIdValueMap){
  var resultMap = new Map();

  // assume that rankedIndicatorValues.length == indicatorIdValueMap.size
  indicatorIdValueMap.forEach(function(value, key, map){
    if (value === true | value === false){
    }
    else if (Number.isNaN(Number(value))){
    }
    else{
      resultMap.set(key, Number(value));
    }
  });

  return resultMap;
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#sum} to compute the sum value of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the sum value shall be computed (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @returns {number} returns the sum value of the submitted array of numeric values
* @see {@link https://jstat.github.io/all.html#sum}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.sum = function (populationArray){
  populationArray = exports.convertPropertyArrayToNumberArray(populationArray);

  return jStat.sum(populationArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#covariance} to compute the covariance value of the submitted value arrays
* @param {Array.<number>} populationArray_A - first data array of numeric values (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @param {Array.<number>} populationArray_B - second data array of numeric values (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @returns {number} returns the covariance value of the submitted data arrays
* @see {@link https://jstat.github.io/all.html#covariance}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.covariance = function  (populationArray_A, populationArray_B){
  populationArray_A = exports.convertPropertyArrayToNumberArray(populationArray_A);
  populationArray_B = exports.convertPropertyArrayToNumberArray(populationArray_B);

  return jStat.covariance(populationArray_A, populationArray_B);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#max} to compute the max value of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the max value shall be computed (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @returns {number} returns the max value of the submitted array of numeric values
* @see {@link https://jstat.github.io/all.html#max}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.max = function (populationArray){
  populationArray = exports.convertPropertyArrayToNumberArray(populationArray);

  return jStat.max(populationArray);
};

/**
* Implements a min max normalization value of the submitted value using the formula {@linkcode (value - min) / (max - min); }
* @param {Number} min - the min value used in upper normalization formula
* @param {Number} max - the max value used in upper normalization formula
* @param {Number} value - the value to be normalized
* @returns {number} returns the normalized value
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.minMaxNormalization_singleValue = function (min, max, value){
 
  var normalizedValue = (Number(value) - Number(min)) / (Number(max) - Number(min));
  return normalizedValue;
};

/**
* Implements a min max normalization value array of the submitted value array using the formula {@linkcode (value - min) / (max - min); }
* @param {Array.<number>} populationArray - an array of numeric values for which the min max normalized value array shall be computed (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @returns {number} returns the normalized value array of the submitted value array
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.minMaxNormalization_wholeValueArray = function (populationArray){
  populationArray = exports.convertPropertyArrayToNumberArray(populationArray);

  var min = exports.min(populationArray);
  var max = exports.max(populationArray);

  var normalizedArray = [];

  for (const value of populationArray) {
    normalizedArray.push(exports.minMaxNormalization_singleValue(min, max, value));
  }

  return normalizedArray;
};

/**
* Implements an inverted min max normalization value of the submitted value using the formula {@linkcode 1 - ((value - min) / (max - min)); }
* @param {Number} min - the min value used in upper normalization formula
* @param {Number} max - the max value used in upper normalization formula
* @param {Number} value - the value to be normalized
* @returns {number} returns the inverted normalized value
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.minMaxNormalization_inverted_singleValue = function (min, max, value){
 
  var normalizedValue = 1 - ((Number(value) - Number(min)) / (Number(max) - Number(min)));
  return normalizedValue;
};

/**
* Implements an inverted min max normalization value array of the submitted value array using the formula {@linkcode 1 - ((value - min) / (max - min)); }
* @param {Array.<number>} populationArray - an array of numeric values for which the min max normalized value array shall be computed (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @returns {number} returns the inverted normalized value array of the submitted value array
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.minMaxNormalization_inverted_wholeValueArray = function (populationArray){
  populationArray = exports.convertPropertyArrayToNumberArray(populationArray);

  var min = exports.min(populationArray);
  var max = exports.max(populationArray);

  var normalizedArray = [];

  for (const value of populationArray) {
    normalizedArray.push(exports.minMaxNormalization_inverted_singleValue(min, max, value));
  }

  return normalizedArray;
};

/**
* Implements a min max normalization algorithm using the formula {@linkcode (value - min) / (max - min); } for an indicator id value map.
* @param {Map.<string, number>} indicatorIdValueMap - map of all indicator id and value pairs where key=id and value=indicatorValue
* @returns {Map.<string, number>} returns the same map object, but instead of the original indicator value the respective normalized value is set as map value for each id value map entry.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.minMaxNormalization_fromIdValueMap = function (indicatorIdValueMap){

  var resultMap = new Map();

  var numericEntriesMap = exports.convertPropertyMapToNumberMap_fromIdValueMap(indicatorIdValueMap);

  var indicatorValues = exports.getIndicatorValueArray_fromIdValueMap(numericEntriesMap);

  indicatorValues = exports.convertPropertyArrayToNumberArray(indicatorValues);

  var min = exports.min(indicatorValues);
  var max = exports.max(indicatorValues);

  var normalizedArray = [];

  for (const value of indicatorValues) {
    normalizedArray.push(exports.minMaxNormalization_singleValue(min, max, value));
  }

  if(normalizedArray.length != numericEntriesMap.size){
    exports.log("Error deteced during 'minMaxNormalization_fromIdValueMap'. The size of input id value map is not equal to the size of the computed normalization array. Hence cannot continue compute normalization values for whole map. Some values may not be numeric, and thus get lost in between?");
  }

  var index=0;

  // assume that rankedIndicatorValues.length == numericEntriesMap.size
  numericEntriesMap.forEach(function(value, key, map){
    resultMap.set(key, normalizedArray[index]);
    index++; 
  });

  return resultMap;
};

/**
* Implements an inverted min max normalization algorithm using the formula {@linkcode 1 - ((value - min) / (max - min)); } for an indicator id value map.
* @param {Map.<string, number>} indicatorIdValueMap - map of all indicator id and value pairs where key=id and value=indicatorValue
* @returns {Map.<string, number>} returns the same map object, but instead of the original indicator value the respective normalized value is set as map value for each id value map entry.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.minMaxNormalization_inverted_fromIdValueMap = function (indicatorIdValueMap){

  var resultMap = new Map();

  var numericEntriesMap = exports.convertPropertyMapToNumberMap_fromIdValueMap(indicatorIdValueMap);

  var indicatorValues = exports.getIndicatorValueArray_fromIdValueMap(numericEntriesMap);

  indicatorValues = exports.convertPropertyArrayToNumberArray(indicatorValues);

  var min = exports.min(indicatorValues);
  var max = exports.max(indicatorValues);

  var normalizedArray = [];

  for (const value of indicatorValues) {
    normalizedArray.push(exports.minMaxNormalization_inverted_singleValue(min, max, value));
  }

  if(normalizedArray.length != numericEntriesMap.size){
    exports.log("Error deteced during 'minMaxNormalization_inverted_fromIdValueMap'. The size of input id value map is not equal to the size of the computed normalization array. Hence cannot continue compute normalization values for whole map. Some values may not be numeric, and thus get lost in between?");
  }

  var index=0;

  // assume that rankedIndicatorValues.length == numericEntriesMap.size
  numericEntriesMap.forEach(function(value, key, map){
    resultMap.set(key, normalizedArray[index]);
    index++; 
  });

  return resultMap;
};


/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#rank} to compute the rank array of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the mean shall be computed (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @returns {Array.<number>} returns the ranks of the submitted array of numeric values
* @see {@link https://jstat.github.io/all.html#rank}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.rank = function (populationArray){
  populationArray = exports.convertPropertyArrayToNumberArray(populationArray);

  return jStat.rank(populationArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#rank} to compute the corresponding ranks of the submitted indicator values for an indicator id value map.
* @param {Map.<string, number>} indicatorIdValueMap - map of all indicator id and value pairs where key=id and value=indicatorValue
* @returns {Map.<string, number>} returns the same map object, but instead of the original indicator value the respective rank is set as map value for each id value map entry.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.rank_fromIdValueMap = function (indicatorIdValueMap){

  var resultMap = new Map();

  var numericEntriesMap = exports.convertPropertyMapToNumberMap_fromIdValueMap(indicatorIdValueMap);

  var indicatorValues = exports.getIndicatorValueArray_fromIdValueMap(numericEntriesMap);

  indicatorValues = exports.convertPropertyArrayToNumberArray(indicatorValues);

  var rankedIndicatorValues = jStat.rank(indicatorValues);

  if(rankedIndicatorValues.length != numericEntriesMap.size){
    exports.log("Error deteced during 'rank_fromIdValueMap'. The size of input id value map is not equal to the size of the computed ranked array. Hence cannot continue compute rank values for whole map. Some values may not be numeric, and thus get lost in between?");
  }

  var index=0;

  // assume that rankedIndicatorValues.length == numericEntriesMap.size
  numericEntriesMap.forEach(function(value, key, map){
    resultMap.set(key, rankedIndicatorValues[index]);
    index++; 
  });

  return resultMap;
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#geomean} to compute the geometric mean value of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the mean shall be computed (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @returns {number} returns the geometric mean value of the submitted array of numeric values
* @see {@link https://jstat.github.io/all.html#geomean}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.geomean = function (populationArray){
  populationArray = exports.convertPropertyArrayToNumberArray(populationArray);

  return jStat.geomean(populationArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#geomean} to compute the geometric mean value of the submitted array of indicator id and value map objects. Only values for those features will be computed, that have an input value for all entries of the input {@link indicatorIdValueMapArray}.
* @param {Array.<Map.<string, number>>} indicatorIdValueMapArray - an array of map objects containing indicator feature ID and numeric value pairs (will be piped through function {@linkcode convertPropertyMapToNumberMap_fromIdValueMap} to ensure that only numeric values are submitted)
* @returns {Map.<string, number>} returns a map containing the indicator feature id and computed geometric mean value of the submitted array of indicator id and value map objects. Only values for those features will be computed, that have an input value for all entries of the input {@link indicatorIdValueMapArray}.
* @see {@link https://jstat.github.io/all.html#geomean}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.geomean_fromIdValueMap = function (indicatorIdValueMapArray){
  var resultMap = new Map();

  numericMapArray = [];
  for (const map of indicatorIdValueMapArray) {
    numericMapArray.push(exports.convertPropertyMapToNumberMap_fromIdValueMap(map)); 
  }

  var refSize = numericMapArray[0].size;
  for (const map of numericMapArray) {
    if (map.size != refSize){
      exports.log("Problem detected while computing geomean from indicatorIdValueMapArray. The sizes of the input base indicator map entries are not equal. Results might not be correct. Will continue computation.");
    }
  }

  // iterate over the first map entries; collect all values of all baseIndicators for each feature
  // compute mean and set it in result map
  var refMap = numericMapArray[0]; 
  refMap.forEach(function(value, key, map){

    var baseIndicatorValues = [];

    for (const numericMap of numericMapArray) {
      // collect sub indicator values
      if(numericMap.has(key)){
        baseIndicatorValues.push(numericMap.get(key));
      } 
    }

    /*
    If not all baseIndicator have the required value, then DO NOT SET the value at all!
    It seems to be the most transparent solution
    */
    if(baseIndicatorValues.length === numericMapArray.length){
      resultMap.set(key, jStat.geomean(baseIndicatorValues));
    }    
  });

  return resultMap;
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#mean} to compute the mean value of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the mean shall be computed (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @returns {number} returns the mean value of the submitted array of numeric values
* @see {@link https://jstat.github.io/all.html#mean}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.mean = function (populationArray){
  populationArray = exports.convertPropertyArrayToNumberArray(populationArray);

  return jStat.mean(populationArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#mean} to compute the mean value of the submitted array of indicator id and value map objects. Only values for those features will be computed, that have an input value for all entries of the input {@link indicatorIdValueMapArray}.
* @param {Array.<Map.<string, number>>} indicatorIdValueMapArray - an array of map objects containing indicator feature ID and numeric value pairs (will be piped through function {@linkcode convertPropertyMapToNumberMap_fromIdValueMap} to ensure that only numeric values are submitted)
* @returns {Map.<string, number>} returns a map containing the indicator feature id and computed mean value of the submitted array of indicator id and value map objects. Only values for those features will be computed, that have an input value for all entries of the input {@link indicatorIdValueMapArray}.
* @see {@link https://jstat.github.io/all.html#mean}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.mean_fromIdValueMap = function (indicatorIdValueMapArray){
  var resultMap = new Map();

  numericMapArray = [];
  for (const map of indicatorIdValueMapArray) {
    numericMapArray.push(exports.convertPropertyMapToNumberMap_fromIdValueMap(map)); 
  }

  var refSize = numericMapArray[0].size;
  for (const map of numericMapArray) {
    if (map.size != refSize){
      exports.log("Problem detected while computing geomean from indicatorIdValueMapArray. The sizes of the input base indicator map entries are not equal. Results might not be correct. Will continue computation.");
    }
  }

  // iterate over the first map entries; collect all values of all baseIndicators for each feature
  // compute mean and set it in result map
  var refMap = numericMapArray[0]; 
  refMap.forEach(function(value, key, map){

    var baseIndicatorValues = [];

    for (const numericMap of numericMapArray) {
      // collect sub indicator values
      if(numericMap.has(key)){
        baseIndicatorValues.push(numericMap.get(key));
      } 
    }

    /*
    If not all baseIndicator have the required value, then DO NOT SET the value at all!
    It seems to be the most transparent solution
    */
   if(baseIndicatorValues.length === numericMapArray.length){
    resultMap.set(key, jStat.mean(baseIndicatorValues));
  } 
  });

  return resultMap;
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#meansqerr} to compute the mean square error value of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the mean square error value shall be computed (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @returns {number} returns the mean square error value value of the submitted array of numeric values
* @see {@link https://jstat.github.io/all.html#meansqerr}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.meanSquareError = function (populationArray){
  populationArray = exports.convertPropertyArrayToNumberArray(populationArray);

  return jStat.meansqerr(populationArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#median} to compute the median value of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the median shall be computed (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @returns {number} returns the median value of the submitted array of numeric values
* @see {@link https://jstat.github.io/all.html#median}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.median = function (populationArray){
  populationArray = exports.convertPropertyArrayToNumberArray(populationArray);

  return jStat.median(populationArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#min} to compute the min value of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the min value shall be computed (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @returns {number} returns the min value of the submitted array of numeric values
* @see {@link https://jstat.github.io/all.html#min}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.min = function (populationArray){
  populationArray = exports.convertPropertyArrayToNumberArray(populationArray);

  return jStat.min(populationArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#min} to compute the min value of the submitted array of indicator id and value map objects. Only values for those features will be computed, that have an input value for all entries of the input {@link indicatorIdValueMapArray}.
* @param {Array.<Map.<string, number>>} indicatorIdValueMapArray - an array of map objects containing indicator feature ID and numeric value pairs (will be piped through function {@linkcode convertPropertyMapToNumberMap_fromIdValueMap} to ensure that only numeric values are submitted)
* @returns {Map.<string, number>} returns a map containing the indicator feature id and computed min value of the submitted array of indicator id and value map objects. Only values for those features will be computed, that have an input value for all entries of the input {@link indicatorIdValueMapArray}.
* @see {@link https://jstat.github.io/all.html#min}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.min_fromIdValueMap = function (indicatorIdValueMapArray){
  var resultMap = new Map();

  numericMapArray = [];
  for (const map of indicatorIdValueMapArray) {
    numericMapArray.push(exports.convertPropertyMapToNumberMap_fromIdValueMap(map)); 
  }

  var refSize = numericMapArray[0].size;
  for (const map of numericMapArray) {
    if (map.size != refSize){
      exports.log("Problem detected while computing geomean from indicatorIdValueMapArray. The sizes of the input base indicator map entries are not equal. Results might not be correct. Will continue computation.");
    }
  }

  // iterate over the first map entries; collect all values of all baseIndicators for each feature
  // compute mean and set it in result map
  var refMap = numericMapArray[0]; 
  refMap.forEach(function(value, key, map){

    var baseIndicatorValues = [];

    for (const numericMap of numericMapArray) {
      // collect sub indicator values
      if(numericMap.has(key)){
        baseIndicatorValues.push(numericMap.get(key));
      } 
    }

    /*
    If not all baseIndicator have the required value, then DO NOT SET the value at all!
    It seems to be the most transparent solution
    */
   if(baseIndicatorValues.length === numericMapArray.length){
    resultMap.set(key, jStat.min(baseIndicatorValues));
    } 
  });

  return resultMap;
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#percentile} to compute the percentile of the submitted value array
* @param {Array.<number>} populationArray - a(will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)n array of numeric values for which the percentile shall be computed 
* @param {number} k - value between {@linkcode 0 - 1, exclusive} to specify the k-th percentile to be computed
* @returns {number} returns the k-th percentile of the submitted array of numeric values
* @see {@link https://jstat.github.io/all.html#percentile}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.percentile = function (populationArray, k){
  populationArray = exports.convertPropertyArrayToNumberArray(populationArray);

  return jStat.percentile(populationArray, k);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#quantiles} to compute the quantiles of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the quantiles shall be computed (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @param {Array.<number>} quantilesArray - an array of quantile values (i.e. {@linkcode 0.25, 0.5, 0.75})
* @returns {Array.<number>} returns the quantiles of {@linkcode populationArray} according to the {@linkcode quantilesArray}
* @see {@link https://jstat.github.io/all.html#quantiles}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.quantiles = function (populationArray, quantilesArray){
  populationArray = exports.convertPropertyArrayToNumberArray(populationArray);

  return jStat.quantiles(populationArray, quantilesArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#quartiles} to compute the quartiles of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the quartiles shall be computed (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @returns {Array.<number>} returns the quartiles of the submitted array of numeric values
* @see {@link https://jstat.github.io/all.html#quartiles}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.quartiles = function (populationArray){
  populationArray = exports.convertPropertyArrayToNumberArray(populationArray);

  return jStat.quartiles(populationArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#range} to compute the range value of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the range value shall be computed (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @returns {number} returns the range value of the submitted array of numeric values {@linkcode max - min}
* @see {@link https://jstat.github.io/all.html#range}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.range = function (populationArray){
  populationArray = exports.convertPropertyArrayToNumberArray(populationArray);

  return jStat.range(populationArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#stdev} to compute the standard deviation for an array of values. By defaut, the population standard deviation is returned.
* Passing {@linkcode true} for the flag parameter returns the sample standard deviation.
* @param {Array.<number>} values - an array of numeric values for which the standard deviation shall be computed (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @param {boolean|null} computeSampledStandardDeviation - OPTIONAL flag.
* If set to {@linkcode true} then 'sample' standard deviation is computed, which is also called the 'corrected standard deviation', and is an unbiased estimator of the population standard deviation.
* If set to {@linkcode false} or {@linkcode null|undefined} then the population standard deviation is computed, which is also the 'uncorrected standard deviation',
* and is a biased but minimum-mean-squared-error estimator
* @returns {number} returns the standard deviation
* @see {@link https://jstat.github.io/all.html#stdev}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.standardDeviation = function (values, computeSampledStandardDeviation){
  values = exports.convertPropertyArrayToNumberArray(values);

  if (computeSampledStandardDeviation){
    return jStat.stdev(values, computeSampledStandardDeviation);
  }
  else{
    return jStat.stdev(values);
  }
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#variance} to compute the variance value of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the variance value shall be computed (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @param {boolean|null} computeSampledVariance - OPTIONAL flag.
* If set to {@linkcode true} then 'sample' variance is computed.
* If set to {@linkcode false} or {@linkcode null|undefined} then the population variance is computed
* @returns {number} returns the variance value of the submitted array of numeric values {@linkcode max - min}
* @see {@link https://jstat.github.io/all.html#variance}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.variance = function (populationArray, computeSampledVariance){
  populationArray = exports.convertPropertyArrayToNumberArray(populationArray);

  if (computeSampledVariance){
    return jStat.variance(populationArray, computeSampledVariance);
  }
  else{
    return jStat.variance(populationArray);
  }
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#jStat.zscore} to compute the zScore of the submitted value given the mean and standard deviation of the associated population.
* @param {number} value - the numeric value for which  the zScore shall be computed
* @param {number} mean - the  numeric mean value of the associated population
* @param {number} stdev - the  numeric standard deviation of the associated population
* @returns {number} returns the zScore of the submitted value
* @see {@link https://jstat.github.io/all.html#jStat.zscore}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.zScore_byMeanAndStdev = function (value, mean, stdev){
  return jStat.zscore(value, mean, stdev);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#jStat.zscore} to compute the zScore of the submitted value given the mean and standard deviation of the associated population.
* @param {number} value - the numeric value for which  the zScore shall be computed
* @param {Array.<number>} populationArray - an array of numeric values for which the standard deviation shall be computed (will be piped through function {@linkcode convertPropertyArrayToNumberArray()} to ensure that only numeric values are submitted)
* @param {boolean|null} computeSampledStandardDeviation - OPTIONAL flag.
* If set to {@linkcode true} then 'sample' standard deviation is computed, which is also called the 'corrected standard deviation', and is an unbiased estimator of the population standard deviation.
* If set to {@linkcode false} or {@linkcode null|undefined} then the population standard deviation is computed, which is also the 'uncorrected standard deviation',
* and is a biased but minimum-mean-squared-error estimator
* @returns {number} returns the zScore of the submitted value
* @see {@link https://jstat.github.io/all.html#jStat.zscore}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.zScore_byPopulationArray = function (value, populationArray, computeSampledStandardDeviation){
  populationArray = exports.convertPropertyArrayToNumberArray(populationArray);
  
  if (computeSampledStandardDeviation){
    return jStat.zscore(value, populationArray, computeSampledStandardDeviation);
  }
  else{
    return jStat.zscore(value, populationArray);
  }
};

/**
 * Converts a Javascript Date object into string of pattern 'YYYY-MM-DD'
 * @param {*} date  a Javascript Date object (e.g. initialized by new Date())
* @returns {string} the date in the format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2017-01-01}
 * @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
 * @function
 */
exports.formatDateAsString = function(date){
  var dateString = "";
  dateString += date.getFullYear() + "-";

  var month = date.getMonth() + 1;
  if(month < 10){
      month = "0" + month;
  }

  var day = date.getDate();
  if(day < 10){
      day = "0" + day;
  }

  dateString += month + "-" + day;

  return dateString;
}

/**
 * Subtracts n months from the reference date
 * @param {string} referenceDateString the reference date in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01} 
 * @param {number} numberOfMonths the number of months to subtract from the submitted reference date
 * @returns {string} the new date (referenceDate minus numberOfMonths) in the format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2017-12-01}
 * @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
 * @function
 */
exports.getSubstractNMonthsDate_asString = function(referenceDateString, numberOfMonths){

  var refDate = new Date(referenceDateString);

  var newDate = refDate.setMonth(refDate.getMonth - Number(numberOfMonths));

  return exports.formatDateAsString(newDate);
};

/**
 * Subtracts n days from the reference date
 * @param {string} referenceDateString the reference date in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01} 
 * @param {number} numberOfDays the number of days to subtract from the submitted reference date
 * @returns {string} the new date (referenceDate minus numberOfDays) in the format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2017-12-15}
 * @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
 * @function
 */
exports.getSubstractNDaysDate_asString = function(referenceDateString, numberOfDays){

  var refDate = new Date(referenceDateString);

  var newDate = refDate.setDate(refDate.getDate - Number(numberOfDays));

  return exports.formatDateAsString(newDate);
};

/**
 * Subtracts n years from the reference date
 * @param {string} referenceDateString the reference date in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01} 
 * @param {number} numberOfYears the number of years to subtract from the submitted reference date
 * @returns {string} the new date (referenceDate minus numberOfYears) in the format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2017-01-01}
 * @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
 * @function
 */
exports.getSubstractNYearsDate_asString = function(referenceDateString, numberOfYears){

  var refDate = new Date(referenceDateString);

  var newDate = refDate.setFullYear(refDate.getFullYear() - Number(numberOfYears));

  return exports.formatDateAsString(newDate);
};

/**
 * Computes the absolute difference/change of indicator values between the submitted dates (if both are present in the dataset) using 
 * the formula {@linkcode value[targetDate] - value[compareDate]} 
 * @param {FeatureCollection} featureCollection - a valid GeoJSON FeatureCollection, whose features must contain a {@linkcode properties} attribute storing the indicator time series according to KomMonitor's data model
 * @param {string} targetDate the reference/target date in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01} 
 * @param {string} compareDate the compare date in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2015-01-01} to who the indicator value difference/change shall be computed 
 * @returns {Map.<string, number>} returns the map of all input features that have both timestamps and whose changeValues were successfully converted to a number. responseMap.size may be smaller than featureCollection.features.size, if featureCollection contains boolean value items or items whose Number-conversion result in Number.NaN
 * @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
 * @function
 */
exports.getChange_absolute = function(featureCollection, targetDate, compareDate){
  // get a map object with id-value pairs for the featureCollection 
  var indicator_idValueMap_targetDate = KmHelper.getIndicatorIdValueMap(featureCollection, targetDate);

  // map for compareDate can be null 
  var indicator_idValueMap_compareDate = KmHelper.getIndicatorIdValueMap(featureCollection, compareDate);

  // return empty map, if no value exists for the compare date
  if(indicator_idValueMap_compareDate == null || indicator_idValueMap_compareDate.size() == 0){
    return new Map();
  }

  var resultMap = new Map();

  // assume that rankedIndicatorValues.length == numericEntriesMap.size
  indicator_idValueMap_targetDate.forEach(function(value, key, map){
    var compareValue = indicator_idValueMap_compareDate.get(key);

    if(! exports.isNoDataValue(compareValue) && ! exports.isNoDataValue(value)){
      var resultValue = Number(value) - Number(compareValue);
      resultMap.set(key, resultValue);
    }
  });

  return resultMap;
}

/**
 * Computes the relative difference/change in percent of indicator values between the submitted dates (if both are present in the dataset) using 
 * the formula {@linkcode 100 * ((  value[targetDate] -  value[compareDate] ) /  value[compareDate])}  
 * @param {FeatureCollection} featureCollection - a valid GeoJSON FeatureCollection, whose features must contain a {@linkcode properties} attribute storing the indicator time series according to KomMonitor's data model
 * @param {string} targetDate the reference/target date in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01} 
 * @param {string} compareDate the compare date in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2015-01-01} to who the indicator value difference/change shall be computed 
 * @returns {Map.<string, number>} returns the map of all input features that have both timestamps and whose changeValues in percent were successfully converted to a number. responseMap.size may be smaller than featureCollection.features.size, if featureCollection contains boolean value items or items whose Number-conversion result in Number.NaN
 * @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
 * @function
 */
exports.getChange_relative_percent = function(featureCollection, targetDate, compareDate){
  // get a map object with id-value pairs for the featureCollection 
  var indicator_idValueMap_targetDate = KmHelper.getIndicatorIdValueMap(featureCollection, targetDate);

  // map for compareDate can be null 
  var indicator_idValueMap_compareDate = KmHelper.getIndicatorIdValueMap(featureCollection, compareDate);

  // return empty map, if no value exists for the compare date
  if(indicator_idValueMap_compareDate == null || indicator_idValueMap_compareDate.size() == 0){
    return new Map();
  }

  var resultMap = new Map();

  // assume that rankedIndicatorValues.length == numericEntriesMap.size
  indicator_idValueMap_targetDate.forEach(function(value, key, map){
    var compareValue = indicator_idValueMap_compareDate.get(key);

    if(! exports.isNoDataValue(compareValue) && ! exports.isNoDataValue(value)){
      if(Number(compareValue) == 0){
        resultMap.set(key, null);
      }
      var resultValue = 100 * ((Number(value) - Number(compareValue)) / Number(compareValue));
      resultMap.set(key, resultValue);
    }
  });

  return resultMap;
}


/**
* computes the new indicator for an absolute change compared to number of previous years
* internally tests are run, e.g. if a previous year is available or not 
* @param {FeatureCollection} featureCollection - a valid GeoJSON FeatureCollection, whose features must contain a {@linkcode properties} attribute storing the indicator time series according to KomMonitor's data model
* @param {string} targetDate the reference/target date in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01} 
* @param {number} numberOfYears the number of years to subtract from the submitted reference date
* @returns {Map.<string, number>} returns the map of all input features that have both timestamps and whose absolute changeValues were successfully converted to a number. responseMap.size may be smaller than featureCollection.features.size, if featureCollection contains boolean value items or items whose Number-conversion result in Number.NaN
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.changeAbsolute_n_years = function(featureCollection, targetDate, numberOfYears){
  var compareDate = exports.getSubstractNYearsDate_asString(targetDate, numberOfYears);

  return exports.getChange_absolute(featureCollection, targetDate, compareDate);
};


/**
* computes the new indicator for an absolute change compared to number of previous months
* internally tests are run, e.g. if a previous month is available or not 
* @param {FeatureCollection} featureCollection - a valid GeoJSON FeatureCollection, whose features must contain a {@linkcode properties} attribute storing the indicator time series according to KomMonitor's data model
* @param {string} targetDate the reference/target date in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01} 
* @param {number} numberOfMonths the number of months to subtract from the submitted reference date
* @returns {Map.<string, number>} returns the map of all input features that have both timestamps and whose absolute changeValues were successfully converted to a number. responseMap.size may be smaller than featureCollection.features.size, if featureCollection contains boolean value items or items whose Number-conversion result in Number.NaN
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.changeAbsolute_n_months = function(featureCollection, targetDate, numberOfMonths){
  var compareDate = exports.getSubstractNMonthsDate_asString(targetDate, numberOfMonths);

  return exports.getChange_absolute(featureCollection, targetDate, compareDate);
};

/**
* computes the new indicator for an absolute change compared to number of previous days
* internally tests are run, e.g. if a previous day is available or not 
* @param {FeatureCollection} featureCollection - a valid GeoJSON FeatureCollection, whose features must contain a {@linkcode properties} attribute storing the indicator time series according to KomMonitor's data model
* @param {string} targetDate the reference/target date in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01} 
* @param {number} numberOfDays the number of days to subtract from the submitted reference date
* @returns {Map.<string, number>} returns the map of all input features that have both timestamps and whose absolute changeValues were successfully converted to a number. responseMap.size may be smaller than featureCollection.features.size, if featureCollection contains boolean value items or items whose Number-conversion result in Number.NaN
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.changeAbsolute_n_days = function(featureCollection, targetDate, numberOfDays){
  var compareDate = exports.getSubstractNDaysDate_asString(targetDate, numberOfDays);

  return exports.getChange_absolute(featureCollection, targetDate, compareDate);
};

/**
* computes the new indicator for a relative change in percent compared to number of previous years
* internally tests are run, e.g. if a previous year is available or not 
* {@linkcode NOTE: if the indicator value for compareDate is '0' then the resulting value will be st as NoData value ('null')}
* @param {FeatureCollection} featureCollection - a valid GeoJSON FeatureCollection, whose features must contain a {@linkcode properties} attribute storing the indicator time series according to KomMonitor's data model
* @param {string} targetDate the reference/target date in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01} 
* @param {number} numberOfYears the number of years to subtract from the submitted reference date
* @returns {Map.<string, number>} returns the map of all input features that have both timestamps and whose relative changeValues were successfully converted to a number. responseMap.size may be smaller than featureCollection.features.size, if featureCollection contains boolean value items or items whose Number-conversion result in Number.NaN
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.changeRelative_n_years_percent = function(featureCollection, targetDate, numberOfYears){
  var compareDate = exports.getSubstractNYearsDate_asString(targetDate, numberOfYears);

  return exports.getChange_relative_percent(featureCollection, targetDate, compareDate);
};

/**
* computes the new indicator for a relative change in percent compared to number of previous months
* internally tests are run, e.g. if a previous month is available or not 
* {@linkcode NOTE: if the indicator value for compareDate is '0' then the resulting value will be st as NoData value ('null')}
* @param {FeatureCollection} featureCollection - a valid GeoJSON FeatureCollection, whose features must contain a {@linkcode properties} attribute storing the indicator time series according to KomMonitor's data model
* @param {string} targetDate the reference/target date in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01} 
* @param {number} numberOfMonth the number of months to subtract from the submitted reference date
* @returns {Map.<string, number>} returns the map of all input features that have both timestamps and whose relative changeValues were successfully converted to a number. responseMap.size may be smaller than featureCollection.features.size, if featureCollection contains boolean value items or items whose Number-conversion result in Number.NaN
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.changeRelative_n_months_percent = function(featureCollection, targetDate, numberOfMonth){
  var compareDate = exports.getSubstractNMonthsDate_asString(targetDate, numberOfMonth);

  return exports.getChange_relative_percent(featureCollection, targetDate, compareDate);
};

/**
* computes the new indicator for a relative change in percent compared to number of previous days
* internally tests are run, e.g. if a previous day is available or not 
* {@linkcode NOTE: if the indicator value for compareDate is '0' then the resulting value will be st as NoData value ('null')}
* @param {FeatureCollection} featureCollection - a valid GeoJSON FeatureCollection, whose features must contain a {@linkcode properties} attribute storing the indicator time series according to KomMonitor's data model
* @param {string} targetDate the reference/target date in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01} 
* @param {number} numberOfDay the number of days to subtract from the submitted reference date
* @returns {Map.<string, number>} returns the map of all input features that have both timestamps and whose relative changeValues were successfully converted to a number. responseMap.size may be smaller than featureCollection.features.size, if featureCollection contains boolean value items or items whose Number-conversion result in Number.NaN
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.changeRelative_n_days_percent = function(featureCollection, targetDate, numberOfDay){
  var compareDate = exports.getSubstractNDaysDate_asString(targetDate, numberOfDay);

  return exports.getChange_relative_percent(featureCollection, targetDate, compareDate);
};


/**
* computes the new indicator for an absolute change compared to a previous reference date (e.g. prior year or month or day)
* internally tests are run, e.g. if a previous reference date is available or not 
* @param {FeatureCollection} featureCollection - a valid GeoJSON FeatureCollection, whose features must contain a {@linkcode properties} attribute storing the indicator time series according to KomMonitor's data model
* @param {string} targetDate the target date in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01} 
* @param {string} referenceDate the reference date in the past in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2016-01-01} for two years past or {@linkcode 2017-12-01} for one month past
* @returns {Map.<string, number>} returns the map of all input features that have both timestamps and whose absolute changeValues were successfully converted to a number. responseMap.size may be smaller than featureCollection.features.size, if featureCollection contains boolean value items or items whose Number-conversion result in Number.NaN
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.changeAbsolute_referenceDate = function(featureCollection, targetDate, referenceDate){
  return exports.getChange_absolute(featureCollection, targetDate, referenceDate);
};

/**
* computes the new indicator for a relative change in percent compared to a previous reference date (e.g. prior year or month or day)
* internally tests are run, e.g. if a previous reference date is available or not 
* @param {FeatureCollection} featureCollection - a valid GeoJSON FeatureCollection, whose features must contain a {@linkcode properties} attribute storing the indicator time series according to KomMonitor's data model
* @param {string} targetDate the target date in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01} 
* @param {string} referenceDate the reference date in the past in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2016-01-01} for two years past or {@linkcode 2017-12-01} for one month past
* @returns {Map.<string, number>} returns the map of all input features that have both timestamps and whose relative changeValues in percent were successfully converted to a number. responseMap.size may be smaller than featureCollection.features.size, if featureCollection contains boolean value items or items whose Number-conversion result in Number.NaN
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.changeRelative_referenceDate_percent = function(featureCollection, targetDate, referenceDate){
  return exports.getChange_relative_percent(featureCollection, targetDate, referenceDate);
};

/**
* computes the new indicator as trend for five prior consecutive years;
* internally tests are run, e.g. if a previous year is available or not 
* @param {FeatureCollection} featureCollection - a valid GeoJSON FeatureCollection, whose features must contain a {@linkcode properties} attribute storing the indicator time series according to KomMonitor's data model
* @param {string} targetDate the reference/target date in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01} 
* @param {number} numberOfYears the number of prior consecutive years for which the trend shall be computed
* @returns {Map.<string, number>} returns the map of all input features whose trend value were successfully computed. responseMap.size may be smaller than featureCollection.features.size, if featureCollection contains boolean value items or items whose Number-conversion result in Number.NaN
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.trend_consecutive_nYears = function(featureCollection, targetDate, numberOfYears){
  
};


/**
* computes the new indicator as continuity for five prior consecutive years (Pearson correlation);
* internally tests are run, e.g. if a previous year is available or not 
* @param {FeatureCollection} featureCollection - a valid GeoJSON FeatureCollection, whose features must contain a {@linkcode properties} attribute storing the indicator time series according to KomMonitor's data model
* @param {string} targetDate the reference/target date in the string format {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01} 
* @param {number} numberOfYears the number of prior consecutive years for which the continuity shall be computed
* @returns {Map.<string, number>} returns the map of all input features whose continuity value were successfully computed. responseMap.size may be smaller than featureCollection.features.size, if featureCollection contains boolean value items or items whose Number-conversion result in Number.NaN
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.continuity_consecutive_nYears = function(featureCollection, targetDate, numberOfYears){
  var dates = [];

  for(var index=numberOfYears - 1; index >= 1; index++){
    dates.push(exports.getSubstractNYearsDate_asString(targetDate, index));
  }
  dates.push(targetDate);

  var resultMap = new Map();

  for (const feature of featureCollection) {
    resultMap.set(exports.getSpatialUnitFeatureIdValue(feature), exports.computeContinuity(feature, dates));
  }

  return resultMap;
};

/**
 * Computes the continuity value for the feature considering the submitted array of consecutive dates
 * @param {*} feature - a valid GeoJSON Feature, that must contain a {@linkcode properties} attribute storing the indicator time series according to KomMonitor's data model
 * @param {*} dates array of dates for which the continuity value shall be computed as string of format {@linkcode YYYY-MM-DD}
 * @returns {number} returns the continuity value of the feature considering the concrete consecutive years of dates array. or {@linkcode null} if any date of dates array is not included within feature
  * @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
  * @function
 */
exports.computeContinuity = function(feature, dates){
  // make sure that feature has relevant date properties

  var indicatorValueArray = [];

  // build array of indicator values corresponding to dates array
  for (const date of dates) {
    var indicatorValue = exports.getIndicatorValue(feature, date);
    if (indicatorValue && ! exports.isNoDataValue && ! Number.isNaN(indicatorValue)){
      indicatorValueArray.push(indicatorValue);
    }
  }

  // make sure that feature has relevant date properties
  if (dates.length != indicatorValueArray.length){
    return null;
  }

  var yearsArray = [];

  for (const date of dates) {
    yearsArray.push((new Date(date)).getFullYear());
  }

  // compute pearson correlation
  return exports.computePearsonCorrelation(indicatorValueArray, yearsArray);
};

/**
 * Computes the pearson correlation from two numeric input arrays that must have the same element length
 * @param {*} valueArray_A numeric value array
 * @param {*} valueArray_B numeric value array
 * @returns {number} returns the pearson correlation of the two input arrays or {@linkcode null} if the input arrays do not have the same length or contain non-numeric values
 * @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
 * @function
 */
exports.computePearsonCorrelation = function(valueArray_A, valueArray_B){
  if(valueArray_A.length != valueArray_B.length){
    exports.log("Error during Pearson Correlation. Lenghts of input arrays is not equal.");
    return null;
  }

  valueArray_A = exports.convertPropertyArrayToNumberArray(valueArray_A);
  valueArray_B = exports.convertPropertyArrayToNumberArray(valueArray_B);

  if(valueArray_A.length != valueArray_B.length){
    exports.log("Error during Pearson Correlation. input array(s) contain non-numeric values.");
    return null;
  }

  var A_mean = exports.mean(valueArray_A);
  var B_mean = exports.mean(valueArray_B);
  var sumAB = 0;
  var sumA2 = 0;
  var sumB2 = 0;

  for(var i=0; i<valueArray_A; i++) {

    if(valueArray_A[i] && valueArray_B[i]){
      var a_NextValue = valueArray_A[i] - A_mean;
      var b_NextValue = valueArray_B[i] - B_mean;

      sumAB += Number(a_NextValue * b_NextValue);
      sumA2 += Number(a_NextValue * a_NextValue);
      sumB2 += Number(b_NextValue * b_NextValue);

    }
  }

  var square = Math.sqrt(sumA2 * sumB2);
  var answer = sumAB / square;

  return answer;

};
