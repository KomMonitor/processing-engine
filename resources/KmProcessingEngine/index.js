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
const spatialUnitFeatureIdPropertyName = "spatialUnitFeatureId";
/**
* This constant is required to access indicator timeseries values correctly (i.e. DATE_2018-01-01)
* @see getTargetDateWithPropertyPrefix
* @type {string}
* @memberof CONSTANTS
* @constant
*/
const indicator_date_prefix = "DATE_";





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
    throwError("Tried to aquire a baseIndicator with name '" + indicatorName + "', but the baseIndicatorsMap does not contain such an entry");
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
    throwError("Tried to aquire a baseIndicator with name '" + indicatorId + "', but the baseIndicatorsMap does not contain such an entry");
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
    throwError("Tried to aquire a georesource with name '" + georesourceName + "', but the georesourcesMap does not contain such an entry");
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
    throwError("Tried to aquire a georesource with id '" + georesourceId + "', but the georesourcesMap does not contain such an entry");
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
    throwError("Tried to aquire a process parameter with Object.name '" + parameterName + "', but the array of processParameters does not contain such an entry");
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
    throwError("Tried to aquire a process parameter with Object.name '" + parameterName + "', but the array of processParameters does not contain such an entry");
  }
  else{

    try{
      parameter = Number(parameter);
    }
    catch(error){
        throwError("Error while parsing parameter value '" + parameter + "' from parameter with name '" + parameterName + "' as Number.");
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
    throwError("Tried to aquire a process parameter with Object.name '" + parameterName + "', but the array of processParameters does not contain such an entry");
  }
  else{

    try{
      // try to convert into boolean true or false!
      parameter = JSON.parse(parameter);
    }
    catch(error){
        throwError("Error while parsing parameter value '" + parameter + "' from parameter with name '" + parameterName + "' as Number.");
    }

    return parameter;
  }
};

/**
* Acquires the unique {@linkcode feature id} of the submitted GeoJSON {@linkcode feature} representing a spatial unit (i.e. city districts, building blocks, etc).
* @param {GeoJSONFeature<Polygon>} feature - the GeoJSON feature representing a spatial unit (i.e. city districts, building blocks, etc), which must accord to the KomMonitor specific data model. It then has a property named {@linkcode feature.properties.spatialUnitFeatureId} that holds the value of the unique feature id.
* @return {string} returns the unique {@linkcode feature id} of the submitted GeoJSON {@linkcode feature}.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getSpatialUnitFeatureIdValue = function (feature){
  return String(feature.properties.spatialUnitFeatureId);
};

/**
* Acquires the unique {@linkcode feature name} of the submitted GeoJSON {@linkcode feature} representing a spatial unit (i.e. city districts, building blocks, etc).
* @param {GeoJSONFeature<Polygon>} feature - the GeoJSON feature representing a spatial unit (i.e. city districts, building blocks, etc), which must accord to the KomMonitor specific data model. It then has a property named {@linkcode feature.properties.spatialUnitFeatureName} that holds the value of the unique feature name.
* @return {string} returns the unique {@linkcode feature name} of the submitted GeoJSON {@linkcode feature}.
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.getSpatialUnitFeatureNameValue = function (feature){
  return String(feature.properties.spatialUnitFeatureName);
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

  var value = feature.properties[propertyName];

  if(value){
    return value;
  }
  else{
    return null;
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
      targetDateWithPrefix = getTargetDateWithPropertyPrefix(targetDate);
  }

  var indicatorValue = feature.properties[targetDateWithPrefix];

  if(indicatorValue){
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
      targetDateWithPrefix = getTargetDateWithPropertyPrefix(targetDate);
  }

  var resultArray = [];

  for (feature of featureCollection.features){
    var indicatorValue = feature.properties[targetDateWithPrefix];

    if(indicatorValue){
      resultArray.push(indicatorValue);
    }
    else{
      console.log("A feature did not contain an indicator value for the targetDate " + targetDate + ". Feature was: " + feature);
    }
  }

  if(! resultArray.length > 0){
    console.log("No feature of the featureCollection contains an indicator value for the specified targetDate " + targetDate + ". Thus return null.");
    return null;
  }

  return resultArray;
};

/**
* Set the {@linkcode feature}'s indicator value for the specified {@linkcode targetDate} with the specified {@linkcode value}.
* @param {Feature} feature - a valid GeoJSON Feature
* @param {string} targetDate - string representing the target date for which the indicator shall be computed, following the pattern {@linkcode YYYY-MM-DD}, e.g. {@linkcode 2018-01-01}
* @param {number} value - a numeric value which shall be set as the {@linkcode feature}'s indicator value for the specified {@linkcode targetDate}
* @returns {Feature} returns the GeoJSON Feature
* @memberof API_HELPER_METHODS_UTILITY
* @function
*/
exports.setIndicatorValue = function (feature, targetDate, value){

  if (typeof value != 'number'){
    console.log("The submitted value is not a valid number. Indicator values must be numeric though. The submitted value was: " + value);
    throwError("The submitted value is not a valid number. Indicator values must be numeric though. The submitted value was: " + value);
  }

  var targetDateWithPrefix;
  if(targetDate.includes(indicator_date_prefix)){
      targetDateWithPrefix = targetDate;
  }
  else{
      targetDateWithPrefix = getTargetDateWithPropertyPrefix(targetDate);
  }

  feature.properties[targetDateWithPrefix] = value;

  return feature;
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
  var isFeature = isGeoJSONFeature(feature);

  if(! isFeature){
    throwError("The submitted object is not a valid GeoJSON feature");
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
    featureCollection_geoJSON.features[index] = area_feature_asProperty(featureCollection_geoJSON.features[index]);
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
    featureCollection_geoJSON.features[index] = bbox_feature(featureCollection_geoJSON.features[index]);
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
    featureCollection_geoJSON.features[index] = bbox_feature(featureCollection_geoJSON.features[index]);
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
* @param {FeatureCollection<Polygon>} featureCollection_geoJSON - valid GeoJSON FeatureCollection with polygonal geometries (MultiPolygons will be transformed to multiple polygons before dissolving).
* @param {string} propertyName - OPTIONAL parameter that points to an existing attribute used by the features. If set, only features with the same attribute value will be dissolved.
* @returns {FeatureCollection<Polygon>} the GeoJSON FeatureCollection containing the dissolved features (Note that attributes are not merged/aggregated).
* @see turf CONSTANT
* @see {@link https://turfjs.org/docs/#dissolve}
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.dissolve = function (featureCollection_geoJSON, propertyName){

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
* @function
*/
exports.distance_waypath_kilometers = async function (point_A, point_B, vehicleType){
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
* @function
*/
exports.distance_matrix_kilometers = async function (locations, sourceIndices, destinationIndices, vehicleType){
  // call openroute service 4.7.2 API to query matrix


  for (var location of locations){
    if(! isGeoJSONPointFeature(location)){
      throwError("The submitted locations array contains objects that are not valid GeoJSON point features. It was: " + location);
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
* @function
*/
exports.duration_matrix_seconds = async function (locations, sourceIndices, destinationIndices, vehicleType){
  // call openroute service 4.7.2 API to query matrix


  for (var location of locations){
    if(! isGeoJSONPointFeature(location)){
      throwError("The submitted locations array contains objects that are not valid GeoJSON point features. It was: " + location);
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
* @param {Array.<Feature<Point>>} startingPoints - array of valid GeoJSON Features with geometry type {@linkcode Point} - the coordinates are expected to follow the order {@linkcode longitude, latitude}
* @param {string} vehicleType - the type of vehicle to use for routing analysis;
* allowed values are {@linkcode PEDESTRIAN},{@linkcode BIKE}, {@linkcode CAR}. If parameter has in invalid value, {@linkcode PEDESTRIAN} is used per default.
* @param {number} travelTimeInSeconds - the travel time to compute the isochrones in seconds
* @param {number|null} customMaxSpeedInKilometersPerHour - a custom maximum speed to use for isochrone computation or {@linkcode null} to use defaults from OpenRouteService
* @returns {FeatureCollection<Polygon>} the reachability isochrones as GeoJSON FeatureCollection; if multiple starting points were specified the resulting isochrones for each point are dissolved as far as possible.
* @see openrouteservice_url CONSTANT
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.isochrones_byTime = async function (startingPoints, vehicleType, travelTimeInSeconds, customMaxSpeedInKilometersPerHour){
  // call openroute service 4.7.2 API to query routing from A to B

  for (pointCandidate of startingPoints){
    var isPoint = isGeoJSONPointFeature(pointCandidate);

    if(! isPoint){
      throwError("The submitted object is not a valid GeoJSON point feature. It was: " + pointCandidate);
    }
  }

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

            var optionsString = '{"maximum_speed":' + speedInKilometersPerHour + '}';


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
            var constantParameters = "&units=m&location_type=start&range_type=time";

            var ors_isochrones_GET_request = openrouteservice_url + "/isochrones?profile=" + vehicleString + "&locations=" + locationsString + "&range=" + travelTimeInSeconds + constantParameters + "&options=" + encodeURIComponent(optionsString);

  console.log("Query OpenRouteService with following isochrones request: " + ors_isochrones_GET_request);

  var isochronesResult = await executeOrsQuery(ors_isochrones_GET_request);

  // dissolve isochrones if multiple starting points were used
  if (startingPoints.length > 1){
    isochronesResult = dissolve(isochronesResult);
  }

  return isochronesResult;
};

/**
* Performs a GET request against {@linkcode /isochrones} endpoint of the openrouteservice instance
* specified via the CONSTANT {@link openrouteservice_url} (version 4.7.2) to aquire the reachability isochrones by distance (equidistance)
* starting from the submitted points based on waypath routing.
* @param {Array.<Feature<Point>>} startingPoints - array of valid GeoJSON Features with geometry type {@linkcode Point} - the coordinates are expected to follow the order {@linkcode longitude, latitude}
* @param {string} vehicleType - the type of vehicle to use for routing analysis;
* allowed values are {@linkcode PEDESTRIAN},{@linkcode BIKE}, {@linkcode CAR}. If parameter has in invalid value, {@linkcode PEDESTRIAN} is used per default.
* @param {number} travelDistanceInMeters - the travel distance to compute the isochrones (equidistance) in meters
* @returns {FeatureCollection<Polygon>} the reachability isochrones as GeoJSON FeatureCollection; if multiple starting points were specified the resulting isochrones for each point are dissolved as far as possible.
* @see openrouteservice_url CONSTANT
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.isochrones_byDistance = async function (startingPoints, vehicleType, travelDistanceInMeters){
  // call openroute service 4.7.2 API to query routing from A to B

  for (pointCandidate of startingPoints){
    var isPoint = isGeoJSONPointFeature(pointCandidate);

    if(! isPoint){
      throwError("The submitted object is not a valid GeoJSON point feature. It was: " + pointCandidate);
    }
  }

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

            // var constantParameters = "&units=m&location_type=start&range_type=time";
            // encode pipe symbol manually via %7C
            var constantParameters = "&units=m&location_type=start&range_type=distance";

            var ors_isochrones_GET_request = openrouteservice_url + "/isochrones?profile=" + vehicleString + "&locations=" + locationsString + "&range=" + travelDistanceInMeters + constantParameters;

  console.log("Query OpenRouteService with following isochrones request: " + ors_isochrones_GET_request);

  var isochronesResult = await executeOrsQuery(ors_isochrones_GET_request);

  // dissolve isochrones if multiple starting points were used
  if (startingPoints.length > 1){
    isochronesResult = dissolve(isochronesResult);
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

  if(! isGeoJSONPointFeature(targetPoint)){
    throwError("The submitted object targetPoint is not a valid GeoJSON point feature. It was: " + targetPoint);
  }

  for (var pointCandidate of pointCollection.features){
    if(! isGeoJSONPointFeature(pointCandidate)){
      throwError("The submitted pointCollection contains features that are no valid GeoJSON point features. PointCandidate was: " + pointCandidate);
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
* @memberof API_HELPER_METHODS_GEOMETRIC_OPERATIONS
* @function
*/
exports.nearestPoint_waypathDistance = async function (targetPoint, pointCollection, vehicleType){
  if(! isGeoJSONPointFeature(targetPoint)){
    throwError("The submitted object targetPoint is not a valid GeoJSON point feature. It was: " + targetPoint);
  }

  for (var pointCandidate of pointCollection.features){
    if(! isGeoJSONPointFeature(pointCandidate)){
      throwError("The submitted pointCollection contains features that are no valid GeoJSON point features. PointCandidate was: " + pointCandidate);
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

  var distanceMatrix = await distance_matrix_kilometers(locations, sourceIndices, destinationIndices, vehicleType);

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

  if(! isGeoJSONPointFeature(targetPoint)){
    throwError("The submitted object targetPoint is not a valid GeoJSON point feature. It was: " + targetPoint);
  }
  if(! isGeoJSONLineStringFeature(lineString)){
    throwError("The submitted lineStringCandidate is not a valid GeoJSON LineString|MultiLineString feature. Candidate was: " + lineString);
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

  if(! isGeoJSONPointFeature(targetPoint)){
    throwError("The submitted object targetPoint is not a valid GeoJSON point feature. It was: " + targetPoint);
  }

  for (var lineStringCandidate of lineStringCollection.features){
    if(! isGeoJSONLineStringFeature(lineStringCandidate)){
      throwError("The submitted lineStringCollection contains features that are no valid GeoJSON LineString features. lineStringCandidate was: " + lineStringCandidate);
    }
  }

  var shortestDistance = undefined;
  var nearestPoint = undefined;

  for (var candidate of lineStringCollection.features){
     var pointCandidate = nearestPointOnLine_directDistance(targetPoint, candidate)

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

  if(! isGeoJSONPointFeature(targetPoint)){
    throwError("The submitted object targetPoint is not a valid GeoJSON point feature. It was: " + targetPoint);
  }
  if(! isGeoJSONPolygonFeature(polygon)){
    throwError("The submitted polygonCandidate is not a valid GeoJSON Polygon|MultiPolygon feature. Candidate was: " + polygon);
  }

  // split polygon into lines
  // can be either Feature<LineString|MultiLineString> or FeatureCollection<LineString>
  var lines = turf.polygonToLine(polygon);

  if (lines.type === "Feature"){
    // single feature (Multi)LineString
    return nearestPointOnLine_directDistance(targetPoint, lines);
  }
  else{
    // FeatureCollection of (Multi)LineString
    return nearestPointOnLines_directDistance(targetPoint, lines);
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

  if(! isGeoJSONPointFeature(targetPoint)){
    throwError("The submitted object targetPoint is not a valid GeoJSON point feature. It was: " + targetPoint);
  }
  for (var polygonCandidate of polygonCollection.features){
    if(! isGeoJSONPolygonFeature(polygonCandidate)){
      throwError("The submitted polygonCollection contains features that are no valid GeoJSON Polygon features. polygonCandidate was: " + polygonCandidate);
    }
  }

  var shortestDistance = undefined;
  var nearestPoint = undefined;

  for (var candidate of polygonCollection.features){
     var pointCandidate = nearestPointOnPolygon_directDistance(targetPoint, candidate)

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

  while(hasMultiPolygon(featureCollection_geoJSON)){
    console.log("Replace MultiPolygon features by Polygons");
    featureCollection_geoJSON = replaceMultiPolygonsByPolygons(featureCollection_geoJSON);
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// JSTAT statistical methods                                                                                                                                         //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#covariance} to compute the covariance value of the submitted value arrays
* @param {Array.<number>} populationArray_A - first data array of numeric values
* @param {Array.<number>} populationArray_B - second data array of numeric values
* @returns {number} returns the covariance value of the submitted data arrays
* @see {@link https://jstat.github.io/all.html#covariance}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.covariance = function  (populationArray_A, populationArray_B){
  return jStat.covariance(populationArray_A, populationArray_B);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#max} to compute the max value of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the max value shall be computed
* @returns {number} returns the max value of the submitted array of numeric values
* @see {@link https://jstat.github.io/all.html#max}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
expots.max = function (populationArray){
  return jStat.max(populationArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#mean} to compute the mean value of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the mean shall be computed
* @returns {number} returns the mean value of the submitted array of numeric values
* @see {@link https://jstat.github.io/all.html#mean}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.mean = function (populationArray){
  return jStat.mean(populationArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#meansqerr} to compute the mean square error value of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the mean square error value shall be computed
* @returns {number} returns the mean square error value value of the submitted array of numeric values
* @see {@link https://jstat.github.io/all.html#meansqerr}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.meanSquareError = function (populationArray){
  return jStat.meansqerr(populationArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#median} to compute the median value of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the median shall be computed
* @returns {number} returns the median value of the submitted array of numeric values
* @see {@link https://jstat.github.io/all.html#median}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.median = function (populationArray){
  return jStat.median(populationArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#min} to compute the min value of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the min value shall be computed
* @returns {number} returns the min value of the submitted array of numeric values
* @see {@link https://jstat.github.io/all.html#min}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.min = function (populationArray){
  return jStat.min(populationArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#percentile} to compute the percentile of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the percentile shall be computed
* @param {number} k - value between {@linkcode 0 - 1, exclusive} to specify the k-th percentile to be computed
* @returns {number} returns the k-th percentile of the submitted array of numeric values
* @see {@link https://jstat.github.io/all.html#percentile}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.percentile = function (populationArray, k){
  return jStat.percentile(populationArray, k);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#quantiles} to compute the quantiles of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the quantiles shall be computed
* @param {Array.<number>} quantilesArray - an array of quantile values (i.e. {@linkcode 0.25, 0.5, 0.75})
* @returns {Array.<number>} returns the quantiles of {@linkcode populationArray} according to the {@linkcode quantilesArray}
* @see {@link https://jstat.github.io/all.html#quantiles}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.quantiles = function (populationArray, quantilesArray){
  return jStat.quantiles(populationArray, quantilesArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#quartiles} to compute the quartiles of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the quartiles shall be computed
* @returns {Array.<number>} returns the quartiles of the submitted array of numeric values
* @see {@link https://jstat.github.io/all.html#quartiles}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.quartiles = function (populationArray){
  return jStat.quartiles(populationArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#range} to compute the range value of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the range value shall be computed
* @returns {number} returns the range value of the submitted array of numeric values {@linkcode max - min}
* @see {@link https://jstat.github.io/all.html#range}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.range = function (populationArray){
  return jStat.range(populationArray);
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#stdev} to compute the standard deviation for an array of values. By defaut, the population standard deviation is returned.
* Passing {@linkcode true} for the flag parameter returns the sample standard deviation.
* @param {Array.<number>} values - an array of numeric values for which the standard deviation shall be computed
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
  if (computeSampledStandardDeviation){
    return jStat.stdev(values, computeSampledStandardDeviation);
  }
  else{
    return jStat.stdev(values);
  }
};

/**
* Encapsulates jStat's function {@link https://jstat.github.io/all.html#variance} to compute the variance value of the submitted value array
* @param {Array.<number>} populationArray - an array of numeric values for which the variance value shall be computed
* @param {boolean|null} computeSampledVariance - OPTIONAL flag.
* If set to {@linkcode true} then 'sample' variance is computed.
* If set to {@linkcode false} or {@linkcode null|undefined} then the population variance is computed
* @returns {number} returns the variance value of the submitted array of numeric values {@linkcode max - min}
* @see {@link https://jstat.github.io/all.html#variance}
* @memberof API_HELPER_METHODS_STATISTICAL_OPERATIONS
* @function
*/
exports.variance = function (populationArray, computeSampledVariance){
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
* @param {Array.<number>} populationArray - an array of numeric values for which the standard deviation shall be computed
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
  if (computeSampledStandardDeviation){
    return jStat.zscore(value, populationArray, computeSampledStandardDeviation);
  }
  else{
    return jStat.zscore(value, populationArray);
  }
};
