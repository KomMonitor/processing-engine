# KomMonitor Script Execution REST API
This NodeJS project is part of the [KomMonitor](http://kommonitor.de) spatial data infrastructure. As a processing component it provides a job-based computation of indicators based on georesources and other indicators within custom scripts.

## Quick Links And Further Information on KomMonitor
   - [DockerHub repositories of KomMonitor Stack](https://hub.docker.com/orgs/kommonitor/repositories)
   - [Github Repositories of KomMonitor Stack](https://github.com/KomMonitor)
   - [Github Wiki for KomMonitor Guidance and central Documentation](https://github.com/KomMonitor/KomMonitor-Docs/wiki)
   - [Technical Guidance](https://github.com/KomMonitor/KomMonitor-Docs/wiki/Technische-Dokumentation) and [Deployment Information](https://github.com/KomMonitor/KomMonitor-Docs/wiki/Setup-Guide) for complete KomMonitor stack on Github Wiki
   - [KomMonitor Website](https://kommonitor.de/) 

## Overview
This **Processig Engine API** aims to provide REST API functions to trigger and query process execution via so called jobs that shall be executed asynchronously. Hereby, it consumes various data (i.e. custom scripts including process parameters, georesources, other indicators and spatial units) from the **KomMonitor Data Management** component to compute target indicators for target spatial units and target timestamps. In general, there are two types of processing operations:

1. **<u>default computation of indicators</u>**: compute a target indicator for a target timestamp on the lowest spatial unit available, automatically aggregate the results to all superior spatial units (i.e. from building blocks to quarters, to city districts, etc.) and persist the results for each spatial unit within the **KomMonitor Data Management** component. Hence this function shall be used to semi-automatically continue the timeseries for computable target indicators. This implies that all base data (base indicators and georesources used within the computation process) have available data for the target timestamp.  
2. **<u>customized indicator computation</u>**: in contrast to the **default computation of indicators** the **customized** computation only computes the result for a target indicator for a dedicated single target spatial unit and target timestamp. Furthermore, the result will not be persisted within the **KomMonitor Data Management** component, but will only be available temporarily (i.e. 2 hours). This function is meant for expert users, who want to try out a different set of process parameters to tweak the indicator computation. Indicator computation might offer certain adjustable process parameters (i.e. maximum distances for buffer/isochrone calculation, filter values, etc.) within this context. For **default computation** (continuation of timeseries) each process parameter has a *default value*. In the **customizable indicator computation** users can change the process parameters to *individual values*, compute the **customized** indicator and compare the result with the **original default computation**.

## Dependencies to other KomMonitor Components
KomMonitor Processing Engine requires 
   - a running instance of KomMonitor **Data Management** for main data retrieval and indicator data modification with results of indicator computation jobs
   - a running instance of **Open Route Service** in oder to compute on-the-fly reachability isochrones and distance matrices during indicator computaton (only relevant if associated computation methods will be really used).
   - an optional and configurable connection to a running **Keycloak** server, if role-based data access is activated via configuration of KomMonitor stack

## Exemplar docker-compose File with explanatory comments

Only contains subset of whole KomMonitor stack to focus on the config parameters of this component

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
       - KEYCLOAK_ENABLED=false                                       # enable/disable role-based data access using Keycloak
       - KEYCLOAK_REALM=kommonitor                                    # Keycloak realm name
       - KEYCLOAK_AUTH_SERVER_URL=https://keycloak.fbg-hsbo.de/auth/  # Keycloak URL ending with "/auth/"
       - KEYCLOAK_SSL_REQUIRED=external                               # Keycloak SSL setting; ["external", "none"]; default "external"
       - KEYCLOAK_RESOURCE=kommonitor-processing-engine               # Keycloak client/resource name
       - KEYCLOAK_PUBLIC_CLIENT=true                                  # Keycloak setting is public client - should be true
       - KEYCLOAK_CONFIDENTIAL_PORT=0                                 # Keycloak setting confidential port - default is 0
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


```


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
