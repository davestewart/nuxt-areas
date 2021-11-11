# Nuxt Areas

> How Nuxt Areas works

## Overview

Nuxt Areas is a Nuxt module, which means it can hook into the Nuxt API as the site builds, and update Nuxt's config and options in a way that either isn't possible, or isn't practical with just editing `nuxt.config.js`.

The module has several main parts:

- **module**: the entry point for the module which runs all the tasks 
- **plugin**: a template file which is added to the final site build
- **services**: the heavy lifting for the tasks run by the module 

A rough overview to the build process:

- the [module](#the-module) is called with options from `nuxt.conf.js`
- the module's calls various [services](#the-services) and updates Nuxt's configuration
- the [plugin](#the-plugin) is generated and copied into the build

When the site runs, the individual routes, stores and components found in the discovered areas will be included in the site as if it was built using standard folders.

## The module

### What it is

The [module](./module.js) part of Nuxt Areas is a Nuxt [Module](https://nuxtjs.org/docs/directory-structure/modules) which provides a way to run code which can modify how Nuxt builds the final JavaScript application.

### What it does

The module code is run whenever Nuxt rebuilds the site, which could be as part of a build command, or when a watched file is updated. A set of sequentially tasks are called which are grouped and ordered as follows:

Preparation:

- **Options**:<br>
  Compiles options and paths needed for the upcoming tasks
- **Areas**:<br>
  Calls the [Areas Service](#areas-service) to build a tree of information about all the areas

Configuration:

- **Watch**:<br>
  Updates Nuxt's `options.watch` config with the paths of area config files, to trigger a rebuild when they change
- **Folders**:<br>
  If any of the root level `components`, `layouts`, `pages` or `stores` folders have been moved to `areas/app` it updates Nuxt's `options.dir` and `options.alias` config
- **Webpack**:<br>
  If any aliases were modified, Webpack is also updated using `extendBuild()`
- **Components**:<br>
  Updates Nuxt's `options.components` array with the path of `components` folders from all areas, so that components will be auto-imported.

Generation:

- **Routes**:<br>
  Calls the [Routes Service](#routes-service) to build the routes for all areas and adds them to the app using `extendRoutes()` 
- **Stores**:<br>
  Calls the [Store Service](#store-service) to get the stores for all areas, and adds them to the [plugin](#the-plugin) using `addPlugin()`

Information:

- **Debug**:<br>
  Optionally calls the [Debug Service](#debug-service) to dump generated options and config to file to help with debugging


## The plugin

### What it is

The [plugin](./plugin.js) part of Nuxt Areas is a so-called Nuxt [Template Plugin](https://nuxtjs.org/docs/directory-structure/modules#template-plugins).

Where a regular Nuxt plugin is compiled as run as straight JavaScript, Template Plugins are supplied as a mixture of JavaScript and Lodash template syntax.

This template is compiled with options supplied at build time and is saved (by Nuxt) as a vanilla JavaScript file which is included in the final application.

### What is does

The plugin makes any Vuex stores located in areas available to the application.

### How it works

At build-time the [module](#the-module) generates and passes information about all areas' stores to the plugin using `addPlugin()`.

The template loops over the entries to generate `import` and `registerStore()` statements.

The compiled output is copied by Nuxt to the the `.nuxt` folder and is imported as and run as part of the generated application.

In the final project, see `.nuxt/areas.js` to see the final output.

## The services

### Areas service

The [areas service](./services/areas.js) traverses the folders and subfolders of `areas/*` as well as externally-supplied `packages` and returns a nested array of information about each of the areas:

- path information about the folder location
- route and namespace values which are built-up during the traversal (as `areas.js` files can export modifications)
- config file information so these files can be watched for changes

### Routes service

The [routes service](./services/routes.js) walks the structure provided by the areas service and:

- for areas without `routes.js` config files, uses Nuxt's own algorithm to generate routes
- for areas with a config file, uses exported  `routes` information
- checks and cleans all routes with new `names` and `chunkNames`

The final route config is passed to Nuxt, which becomes part of the final router configuration.

In the final project, see `.nuxt/router.js`

### Store service

The [store service](./services/store.js) walks the structure provided by the areas service and:

- builds an array of store information (import ref, namespace and path) to be passed to the plugin

The final config is passed to the [plugin](#the-plugin) which in turn generates a file which is loaded by the app.

In the final project, see `.nuxt/areas.js`

### Debug service

The [debug service](./services/debug.js) takes the options gathered during the module's execution, and outputs each one to a file.

This makes it easy to see what is going on inside the module, without needing to add breakpoints or logs.

In the final project, see `~/areas/.debug/*`
