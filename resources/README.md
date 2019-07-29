# How to write an Indicator Computation Script for KomMonitor

This guide contains helpful information on how to write and manage custom indicator computation scripts for the **KomMonitor Processing Engine**.

## Overview
The **KomMonitor** data infrastructure is designed to consume custom Node module scripts written in JavaScript programming language that follow a dedicated **Script TEMPLATE**. The **TEMPLATE** hereby defines special methods that need to be implemented/adjusted for each indicator. Such custom indicator computation script code can then be persisted within the **KomMonitor Data Management** component together with metadata about the associated target indicator, required base indicators, georesources and (variable) process parameters. Then, the NodeJS **KomMonitor Processing Engine** is able to integrate the script on-the-fly and call and execute the predefined methods.

To simplify matters, a **KmHelper** module is maintained and integrated into the **Script TEMPLATE**, that offers various geospatial and statistical as well as generic helper methods. So, as a script writer, you may intensively use this **KmHelper** module. Most operations (especially the geospatial operations) hereby work on *GeoJSON objects*, either by processing whole *GeoJSON FeatureCollections* or arrays of *GeoJSON Features* or by producing GeoJSON output (again either as whole *FeatureCollection* or as single *Feature* or an array of *Features*).

The following sections give details and hints on how to write custom **KomMonitor indicator computation scripts** based on the **TEMPLATE** and making use of the **KmHelper** module. First the **KmHelpere** module will be introduced in detail. Then the actual implementation of new computation scripts is focused by explaining the **TEMPLATE** structure and pointing out how to process base indicators, georesources and process parameters in order to compute the target indicator. Finally some exemplar scripts are presented that may serve as reference scripts (e.g. to apply code parts to new indicator scripts)  

## Writing a custom KomMonitor Script  
The description is split in two parts. First the *Processing Engine Helper API Node Module* **KmHelper** module is described shortly. The actual guide then contains a detailed description of the [Template script](#the-template-script), its structure, methods to implement or overwrite and everything else required to write a script.

### The Processing Engine Helper API Node Module
This section describes the **KmHelper** module offering several geospatial and statistical as well as generic helper methods. As the **KomMonitor Processing Engine** is built as NodeJS server app, the **KmHelper** module is also written as a NodeJS module. It is not available publicly but is an implicit part of the **Processing Engine** project. Hence, the JavaScript code of the **KmHelper** module is located at [/KmHelper](./KmHelper/). The following sub sections aim to give a short overview of **KmHelper** and how to use it.

#### Goals and Benefits
The **KmHelper** module is intended to simplify the process of writing an indicator computation script. It is based on working with *GeoJSON objects* and offers several geospatial und statistical methods to process *GeoJSON Features* and, eventually compute an indicator through systematical usage of the helper methods. While it is not required to rely on **KmHelper** it is strongly recommended to make use of its predefined methods. It maximizes productivity, minifies the effort to write a new script and harmonizes the whole collection of indicator computation scripts. Moreover, improvements/adjustments to helper methods within the **KmHelper** module can thus be automatically applied to each script that utilizes the relevant methods.

#### Encapsulated Libraries / Dependencies
To perform the geospatial and statistical operations the **KmHelper** module encapsulates dedicated JavaScript libraries. As a script writing user you do not have to know anything about those internally used libraries/components as **KmHelper** encapsulates the access to those libraries/components completely within dedicated *API methods*. Nonetheless, it might be interesting to know what libraries are used under the hood.

|  Library Name  |  Description  |  Library / Component Version     |  Library Link   |
| :-------------:|:-----------: | :------------------: | :-------------: |
|  turf.js    |  mighty JavaScript library for geospatial analysis    |  5.1.6   | [https://turfjs.org/](https://turfjs.org/) <br/> [https://github.com/Turfjs/turf](https://github.com/Turfjs/turf) |
|  jStat    |   mighty JavaScript library for statistical analysis   |  1.7.1   |   [https://github.com/jstat/jstat](https://github.com/jstat/jstat)   |
|   axios   |   Promise based HTTP client for NodeJS (required to perform HTTP requests against external services like Open Route Service or Data Management API)   |  0.18.0   |  [https://github.com/axios/axios](https://github.com/axios/axios)   |
|   reference to running instance of **Open Route Service**   |   With regard to routing, isochrone or distance matrix computations, the **KmHelper** module builds and executes HTTP requests against Open Route Service   |  4.7.2   |  [https://github.com/GIScience/openrouteservice](https://github.com/GIScience/openrouteservice)   |

#### Documented API Overview
To inspect the **KmHelper API** and available operations please 
use most recent version,
DL git project with version control.
name some tools (TurtoiseGit, SourceTree, git CLI, ...)
keep it up to date

navigate to docs/index.html --> open it in a browser --> There you go.

if docs are missing --> hints on how to generate docs from sources.

### The TEMPLATE Script
The **Script TEMPLATE** defines predefined methods (i.e. `computeIndicator()`, `aggregateIndicator()`) as well as  that users must implement in order to automize

#### Structure and Content

#### Encapsulated Libraries / Dependencies
turf.js, jstat, Open Route Service (v. 4.7.2)

can more libraries be integrated if desired ? -> NOT DIRECTLY (must be registered within enveloping Processing Engine target environment)

#### Implementing the `computeIndicator()` Method

##### Using Base Indicators, Georesources and Process Parameters

##### Using the `KmHelper` Module for various geoprocessing and statistical Operations

##### Compute and set Indicator Values for `targetSpatialUnit_geoJSON` features

##### Log, log, log
Log often and meaningful
important for failure detection to understand where and why the computation was aborted.

Required as there is currently no dedicated test environment for new scripts...

#### Automated Aggregation - Adjust Aggregation Type or overwrite Aggregation Method

### Example Scripts

## Register Script within **KomMonitor Data Management** Component
REST call, Script registration, Parameter definition and naming etc.

## Running Scripts
REST call, Script registration, Parameter definition and naming etc. to Processing Engine
distinguish between defaultCOmputation and CustomizableComputation and how there output will be used within data infrastructure
