'use strict';

require('dotenv').config();

if(JSON.parse(process.env.DISABLE_LOGS)){
  console.log = function(){};
}

/*
* initialise keycloak dependant URLs to management endpoints
*/
process.env.KOMMONITOR_DATA_MANAGEMENT_URL_CRUD = process.env.KOMMONITOR_DATA_MANAGEMENT_URL;
process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET = process.env.KOMMONITOR_DATA_MANAGEMENT_URL;
// if keycloak is not enabled we must use the public endpoints of management component for GET requests.
if (! JSON.parse(process.env.KEYCLOAK_ENABLED)){
  process.env.KOMMONITOR_DATA_MANAGEMENT_URL_GET = process.env.KOMMONITOR_DATA_MANAGEMENT_URL + "/public";
}

var path = require('path');
var http = require('http');
var oas3Tools = require('oas3-tools');

var cors = require('cors');
var serveStatic = require('serve-static');

var bodyParser = require('body-parser');

var serverPort = process.env.PORT || 8086;

// swaggerRouter configuration
var options = {
  routing: {
      controllers: path.join(__dirname, './controllers')
  },
};

var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
var app = expressAppConfig.getApp();

app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({extended:true, limit:'50mb'}));

const corsOptions = {
  // exposedHeaders: 'Access-Control-Allow-Origin,Location,Connection,Content-Type,Date,Transfer-Encoding'
  exposedHeaders: ['Access-Control-Allow-Origin','Location','Connection','Content-Type','Date','Transfer-Encoding','Origin','X-Requested-With', 'Accept'],
  origin: "*"
};
app.use(cors(corsOptions));
// app.use(cors());
app.use(serveStatic("docs"));

// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
});
