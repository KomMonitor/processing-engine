# KomMonitor Script Execution REST API
This NodeJS project is part of the [KomMonitor](http://kommonitor.de) spatial data infrastructure. As a processing component it provides a job-based computation of indicators based on georesources and other indicators within custom scripts.

**Table of Content**
<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:0 orderedList:0 -->

- [KomMonitor Script Execution REST API](#kommonitor-script-execution-rest-api)
	- [Quick Links And Further Information on KomMonitor](#quick-links-and-further-information-on-kommonitor)
	- [Overview](#overview)
	- [Dependencies to other KomMonitor Components](#dependencies-to-other-kommonitor-components)
	- [Installation / Building Information](#installation-building-information)
		- [Configuration](#configuration)
			- [.env - Configure Deployment Details of other Services](#env-configure-deployment-details-of-other-services)
		- [Running the NodeJS KomMonitor Processing Engine](#running-the-nodejs-kommonitor-processing-engine)
			- [Local Manual Startup and Shutdown](#local-manual-startup-and-shutdown)
			- [Production Startup and Shutdown](#production-startup-and-shutdown)
		- [Docker](#docker)
	- [User Guide](#user-guide)
		- [Indicator Script Development](#indicator-script-development)
	- [Contribution - Developer Information](#contribution-developer-information)
		- [How to Contribute](#how-to-contribute)
		- [Branching](#branching)
	- [Third Party Dependencies](#third-party-dependencies)
	- [Contact](#contact)
	- [Credits and Contributing Organizations](#credits-and-contributing-organizations)

<!-- /TOC -->    

## Quick Links And Further Information on KomMonitor
   - [DockerHub repositories of KomMonitor Stack](https://hub.docker.com/orgs/kommonitor/repositories)
   - [KomMonitor Docker Repository including default docker-compose templates and default resource files for keycloak and KomMonitor stack](https://github.com/KomMonitor/docker)
   - [Github Repositories of KomMonitor Stack](https://github.com/KomMonitor)
   - [Github Wiki for KomMonitor Guidance and central Documentation](https://github.com/KomMonitor/KomMonitor-Docs/wiki)
   - [Technical Guidance](https://github.com/KomMonitor/KomMonitor-Docs/wiki/Technische-Dokumentation) and [Deployment Information](https://github.com/KomMonitor/KomMonitor-Docs/wiki/Setup-Guide) for complete KomMonitor stack on Github Wiki
   - [KomMonitor Website](https://kommonitor.de/) 

## Overview
This **Processig Engine API** aims to provide REST API functions to trigger and query process execution via so called jobs that shall be executed asynchronously. Hereby, it consumes various data (i.e. custom scripts including process parameters, georesources, other indicators and spatial units) from the **KomMonitor Data Management** component to compute target indicators for target spatial units and target timestamps. In general, there are two types of processing operations:

1. **<u>default computation of indicators</u>**: compute a target indicator for a target timestamp on the lowest spatial unit available, automatically aggregate the results to all superior spatial units (i.e. from building blocks to quarters, to city districts, etc.) and persist the results for each spatial unit within the **KomMonitor Data Management** component. Hence this function shall be used to semi-automatically continue the timeseries for computable target indicators. This implies that all base data (base indicators and georesources used within the computation process) have available data for the target timestamp.  
2. **<u>customized indicator computation</u>**: in contrast to the **default computation of indicators** the **customized** computation only computes the result for a target indicator for a dedicated single target spatial unit and target timestamp. Furthermore, the result will not be persisted within the **KomMonitor Data Management** component, but will only be available temporarily (i.e. 2 hours). This function is meant for expert users, who want to try out a different set of process parameters to tweak the indicator computation. Indicator computation might offer certain adjustable process parameters (i.e. maximum distances for buffer/isochrone calculation, filter values, etc.) within this context. For **default computation** (continuation of timeseries) each process parameter has a *default value*. In the **customizable indicator computation** users can change the process parameters to *individual values*, compute the **customized** indicator and compare the result with the **original default computation**.

The described REST operations are specified using [Swagger/OpenAPI v3](https://swagger.io). The corresponding ```openapi.yaml``` containing the REST API specification is located at ```api/openapi.yaml```. To inspect the REST API you may use the online [Swagger Editor](https://editor.swagger.io/) or, having access to a running instance of the **KomMonitor Processing Engine REST API** simply navigate to ```<pathToDeyployedInstance>/docs```, e.g. ```localhost:8086/docs```.

The service is implemented as a NodeJS server application. The custom scripts to compute indicators have to be implemented in JavaScript. Please read the section [Indicator Script Development](#indicator-script-development) to get an idea on how to write such indicator computation scripts based on a *script template* and a Node *helper module* offering several helper methods.

## Dependencies to other KomMonitor Components
KomMonitor Processing Engine requires 
   - a running instance of KomMonitor **Data Management** for main data retrieval and indicator data modification with results of indicator computation jobs
   - a running instance of **Open Route Service** in oder to compute on-the-fly reachability isochrones and distance matrices during indicator computaton (only relevant if associated computation methods will be really used).
   - Since version 2.0.0 KomMonitor Client Config service requires **Keycloak** for authenticated access to POST requests. Only KomMonitor administrators   shall be allowed to call the POST endpoints of this service. Within the Keycloak realm the **client-config** component must be integrated as a realm client with access type ***confidential*** so that a keycloak secret can be retrieved and configured.

## Installation / Building Information
Being a NodeJS server project, installation and building of the service is as simple as calling ```npm install``` to get all the node module dependencies, then configure the service by adjusting the variables in ``` env.js ``` and eventually run `npm start`. This will start the service per default on `localhost:8086`. Even Docker images can be acquired with ease, as described below. However, depending on your environment configuration aspects have to be adjusted first.

### Configuration
Similar to other **KomMonitor** components, some settings are required, especially to adjust connection details to other linked services to your local environment. This NodeJS app makes use of `dotenv` module, which parses a file called `.env` located at project root when starting the app to populate its properties to app components.

#### .env - Configure Deployment Details of other Services
The central configuration file is located at [.env](./.env). Several important aspects must match your target environment when deploying the service. These are:

```yml

# server port
PORT=8086
# redis connection details
REDIS_HOST=localhost
REDIS_PORT=6379

# KomMonitor Data Management API connection details
KOMMONITOR_DATA_MANAGEMENT_URL=http://localhost:8085/management
# optional geometry simplification (a feature of Data Management API)
GEOMETRY_SIMPLIFICATION_PARAMETER_NAME=simplifyGeometries
# allowed values and meaning:
# ["original" --> no simplification; "weak" --> weak simplification,
# "medium" --> medium simplification; "strong" --> string simplification]
GEOMETRY_SIMPLIFICATION_PARAMETER_VALUE=original
# connection details to Open Route Service instance (required for routing and
# isochrone as well as distance matrix computation)

OPEN_ROUTE_SERVICE_URL=https://ors5.fbg-hsbo.de

# necessary property names internally specified by KomMonitor data structure
# DO NOT CHANGE THEM AS THIS WILL BREAK PROGRAM
FEATURE_ID_PROPERTY_NAME=ID
FEATURE_NAME_PROPERTY_NAME=NAME
DISABLE_LOGS=false

# maximum number of target dates wihtin a single PUT request to KomMonitor data management component
# a larger number increases request payload and request processing time (default is 45) 
MAX_NUMBER_OF_TARGET_DATES_PER_PUT_REQUEST=45
# encryption information that - if activated - must be set equally within all relevant components (data-management, processing engine, scheduler, web-client)

ENCRYPTION_ENABLED=false       # enable/disable encrypted data retrieval from Data Management service
ENCRYPTION_PASSWORD=password   # shared secret for data encryption must be set equally within all supporting components
ENCRYPTION_IV_LENGTH_BYTE=16   # length of random initialization vector for encryption algorithm - must be set equally within all supporting components

# keycloak information
KEYCLOAK_ENABLED=true # enable/disable keycloak 
KEYCLOAK_REALM=kommonitor # keycloak realm name
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8080/auth/ # keycloak target URL inlcuding /auth/
KEYCLOAK_RESOURCE=kommonitor-processing-engine # keycloak client name
KEYCLOAK_CLIENT_SECRET=keycloak-secret # keycloak client secret using access type confidential
KOMMONITOR_ADMIN_ROLENAME=kommonitor-creator # name of kommonitor admin role within keycloak - default is 'kommonitor-creator'
KEYCLOAK_ADMIN_RIGHTS_USER_NAME=processor # name of a keycloak/kommonitor user that has the kommonitor admin role
KEYCLOAK_ADMIN_RIGHTS_USER_PASSWORD=processor # password of a keycloak/kommonitor user that has the kommonitor admin role

```

After adjusting the configuration to your target environment, you may continue to build and run the service as described next.

### Running the NodeJS KomMonitor Processing Engine
#### Local Manual Startup and Shutdown
Make sure you have installed all node dependencies by calling `npm install`. The to locally start the server enter command `npm start` from the project root, which will launch the app and serve it according to port setting at `localhost:<PORT>` (per default `localhost:8086`). In a browser call ``localhost:<PORT>/docs`` to inspect the REST API.
To shutdown simply hit `CTRL+c` in the terminal.

#### Production Startup and Shutdown
To launch and monitor any NodeJS app in production environment, we recommend the Node Process Manager [PM2](http://pm2.keymetrics.io/). It is a node module itself and is able to manage and monitor NodeJS application by executing simple command like `pm2 start app.js`, `pm2 restart app.js`, `pm2 stop app.js`, `pm2 delete app.js`. Via ``pm2 list`` a status monitor for running applications can be displayed. See [PM2 Quickstart Guide](http://pm2.keymetrics.io/docs/usage/quick-start/) for further information and way more details.

PM2 can even be registered as system service, so it can be automatically restarted on server restart, thus ensuring that the registered applications will be relaunched also. Depending on your host environment (e.g. ubuntu, windows, mac), the process differs. Please follow [PM2 Startup hints](http://pm2.keymetrics.io/docs/usage/startup/) for detailed information.

When installed and configured PM2, the **KomMonitor Processing Engine** can be started and monitored via `pm2 start index.js --name <app_name>` (while `<app_name>` is optional, it should be set individually, e.g. `km-processing-engine`, otherwise the application will be called `index`), executed from project root. To check application status just hit `pm2 list` and inspect the resulting dashboard for the entry with the specified `<app_name>`.

To shutdown call `pm2 stop <app_name>` in the terminal. This will stop the service. To completely remove it from PM2, call `pm2 delete <app_name>`.

### Docker
The **KomMonitor Processing Engine** can also be build and deployed as Docker image (i.e. `docker build -t kommonitor/processing-engine:latest .`). The project contains the associated `Dockerfile` and an exemplar `docker-compose.yml` on project root level. The Dockerfile contains a `RUN npm install --production` command, so necessary node dependencies will be fetched on build time.

The exemplar [docker-compose.yml](./docker-compose.yml) file specifies only a subset of the KomMonitor stack, i.e. `redis` as required redis database container, the actual `kommonitor-processing-engine` container and dependecy container `kommonitor-data-management`, which requires a database `kommonitor-db`. The `kommonitor-processing-engine` container depends on the `redis` database container and contains an `environment` section to define the required settings (connection details to other services etc. according to the [Configuration section](#configuration) mentioned above).

### Exemplar docker-compose File with explanatory comments

Only contains subset of whole KomMonitor stack to focus on the config parameters of this component. Only contains subset of whole KomMonitor stack to focus on the config parameters of this component. See separate [KomMonitor docker repository](https://github.com/KomMonitor/docker) for full information on launching all KomMonitor components via docker.

```yml

version: '2.1'

networks:
  kommonitor:
      name: kommonitor

services:
  # redis databse required for processing engine to store indicator computation job status
    redis:
      image: redis:alpine
      container_name: redis
      #restart: unless-stopped
      networks:
      - kommonitor

    # for special scenarios multiple processing engines could be deployed - i.e. in combination with individual processing schedulers
    kommonitor-processing-engine:         # perfoms script-based computation of indicators based on other (base-)indicators and/or georesources for target spatial units
      image: 'kommonitor/processing-engine'
      container_name: kommonitor-processing-engine
      #restart: unless-stopped
      ports:
       - "8086:8086"
      networks:
       - kommonitor
      volumes:
       - processing_jobstatus:/code/tmp    # persist tmp computation status files on disk
      depends_on:
       - redis
      environment:
       - REDIS_HOST=redis    # use docker name if possible; else IP 
       - REDIS_PORT=6379     # running redis port
       - KOMMONITOR_DATA_MANAGEMENT_URL=http://kommonitor-data-management:8085/management    # URL to Data Management service; use docker name and port if possible
       - GEOMETRY_SIMPLIFICATION_PARAMETER_NAME=simplifyGeometries   # paramter to query geometries from Data Management component 
       - GEOMETRY_SIMPLIFICATION_PARAMETER_VALUE=original            # values are ["original", "weak", "medium", "strong"] from weak to strong the geometries are more simplified (reducing size)
       - FEATURE_ID_PROPERTY_NAME=ID       # KomMonitor wide setting, which property contains feature ID values - best not be changed
       - FEATURE_NAME_PROPERTY_NAME=NAME   # KomMonitor wide setting, which property contains feature NAME values - best not be changed
       - OPEN_ROUTE_SERVICE_URL=https://ors5.fbg-hsbo.de    # URL to Open Route Service instance (currently version 5 is supported)
       - DISABLE_LOGS=false          # optionally diable any console log
       - MAX_NUMBER_OF_TARGET_DATES_PER_PUT_REQUEST=45   # setting to split up computed indicator results import/update requests; each request has the specified maximum number of indicator timestamps 
       - ENCRYPTION_ENABLED=false       # enable/disable encrypted data retrieval from Data Management service
       - ENCRYPTION_PASSWORD=password   # shared secret for data encryption - must be set equally within all supporting components
       - ENCRYPTION_IV_LENGTH_BYTE=16   # length of random initialization vector for encryption algorithm - must be set equally within all supporting components
       - KEYCLOAK_ENABLED=true                                       # enable/disable role-based data access using Keycloak
       - KEYCLOAK_REALM=kommonitor                                    # Keycloak realm name
       - KEYCLOAK_AUTH_SERVER_URL=https://keycloak.fbg-hsbo.de/auth/  # Keycloak URL ending with "/auth/"
       - KEYCLOAK_RESOURCE=kommonitor-processing-engine               # Keycloak client/resource name
       - KEYCLOAK_CLIENT_SECRET=keycloak-secret                       # keycloak client secret using access type confidential
       - KOMMONITOR_ADMIN_ROLENAME=kommonitor-creator                 # name of kommonitor admin role within keycloak - default is 'kommonitor-creator'
       - KEYCLOAK_ADMIN_RIGHTS_USER_NAME=processor                    # Keycloak internal user name within kommonitor-realm that has administrator role associated in order to grant rigths to fetch all data 
       - KEYCLOAK_ADMIN_RIGHTS_USER_PASSWORD=processor                # Keycloak internal user password within kommonitor-realm that has administrator role associated in order to grant rigths to fetch all data


    # database container; must use PostGIS database
    # database is not required to run in docker - will be configured in Data Management component
    kommonitor-db:
      image: mdillon/postgis
      container_name: kommonitor-db
      #restart: unless-stopped
      ports:
        - 5432:5432
      environment:
        - POSTGRES_USER=kommonitor      # database user (will be created on startup if not exists) - same settings in data management service
        - POSTGRES_PASSWORD=kommonitor  # database password (will be created on startup if not exists) - same settings in data management service 
        - POSTGRES_DB=kommonitor_data   # database name (will be created on startup if not exists) - same settings in data management service
      volumes:
        - postgres_data:/var/lib/postgresql/data   # persist database data on disk (crucial for compose down calls to let data survive)
      networks:
        - kommonitor

    # Data Management component encapsulating the database access and management as REST service
    kommonitor-data-management:
      image: kommonitor/data-management
      container_name: kommonitor-data-management
      #restart: unless-stopped
      depends_on:
        - kommonitor-db    # only if database runs as docker container as well
      ports:
        - "8085:8085"
      networks:
        - kommonitor
      links:
        - kommonitor-db
      environment:
       # omitted here for brevity

volumes:
 processing_jobstatus:
 postgres_data:


```


## User Guide
TODO

### Indicator Script Development
Complex indicators can be automatically computed by the use of custom Javascipt scripts. New scripts are based on a TEMPLATE script file. For more information about the template and the process to add/write new scripts please visit the respective documentation at [resources/README.md](/resources/README.md).

## Contribution - Developer Information
This section contains information for developers.

Find the up-to-date API method descriptions - important to develop custom scripts in order to let Processing Engine compute new indicators - as `jsdoc` at [https://kommonitor.github.io/processing-engine/](https://kommonitor.github.io/processing-engine/).

### How to Contribute
The technical lead of the whole [KomMonitor](http://kommonitor.de) spatial data infrastructure currently lies at the Bochum University of Applied Sciences, Department of Geodesy. We invite you to participate in the project and in the software development process. If you are interested, please contact any of the persons listed in the [Contact section](#contact):

### Branching
The `master` branch contains latest stable releases. The `develop` branch is the main development branch that will be merged into the `master` branch from time to time. Any other branch focuses certain bug fixes or feature requests.

## Third Party Dependencies
We use [license-checker](https://www.npmjs.com/package/license-checker) to gain insight about used third party libs. I.e. install globally via ```npm install -g license-checker```, navigate to root of the project and then perform ```license-checker --json --out ThirdParty.json``` to create/overwrite the respective file in JSON format.

## Contact
|    Name   |   Organization    |    Mail    |
| :-------------: |:-------------:| :-----:|
| Christian Danowski-Buhren | Bochum University of Applied Sciences | christian.danowski-buhren@hs-bochum.de |
| Andreas Wytzisk  | Bochum University of Applied Sciences | Andreas-Wytzisk@hs-bochum.de |

## Credits and Contributing Organizations
- Department of Geodesy, Bochum University of Applied Sciences
- Department for Cadastre and Geoinformation, Essen
- Department for Geodata Management, Surveying, Cadastre and Housing Promotion, Mülheim an der Ruhr
- Department of Geography, Ruhr University of Bochum
- 52°North GmbH, Münster
- Kreis Recklinghausen
