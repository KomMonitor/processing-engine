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

var fs = require('fs'),
    path = require('path'),
    http = require('http');

var cors = require('cors');
var serveStatic = require('serve-static');
// var app = require('connect')();
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
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

var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var serverPort = process.env.PORT;

// swaggerRouter configuration
var options = {
  swaggerUi: path.join(__dirname, '/swagger.json'),
  controllers: path.join(__dirname, './controllers'),
  useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync(path.join(__dirname,'api/swagger.yaml'), 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // Start the server
  http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
  });

});
