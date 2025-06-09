'use strict';

// axios os used to execute HTTP requests in a Promise-based manner
const axios = require("axios");
const targetURLToKobotoolbox = "https://kobo.hs-gesundheit.de";

exports.getToken = async function(){
  let user = "username";
  let pw = "password"
  let auth = Buffer.from(user + ":" + pw, 'binary').toString('base64')

  const config = {
    headers: {
      'Authorization': 'Basic ' + auth
    }
  }
  return await axios.get(targetURLToKobotoolbox + "/token/?format=json", config)
      .then(response => {
        // response.data should be the script as byte[]        
        return response.data.token;
      })
      .catch(error => {
        throw error;
      });
        
}

exports.getKoboData_lap_noiseplaces = async function(body) {
    var token = await exports.getToken();
  
    const config = {
      headers: {
        'Authorization': 'Token ' + token
      }
    }

    return await axios.get(targetURLToKobotoolbox + "/api/v2/assets/aBo7Uqw3auUF5UDufbVYrg/data?format=geojson&geo_question_name=noiseplace", config)
      .then(response => {
        return response.data;
      })
      .catch(error => {
        throw error;
      });
}

exports.getKoboData_lap_quietplaces = async function(body) {
   var token = await exports.getToken();
  
    const config = {
      headers: {
        'Authorization': 'Token ' + token
      }
    }

    return await axios.get(targetURLToKobotoolbox + "/api/v2/assets/aBo7Uqw3auUF5UDufbVYrg/data?format=geojson&geo_question_name=quietplace", config)
      .then(response => {
        return response.data;
      })
      .catch(error => {
        throw error;
      });
}
