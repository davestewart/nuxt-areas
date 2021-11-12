# Nuxt Areas

> Scalable folder management for large Nuxt projects

<p align="center">
  <img src="https://raw.githubusercontent.com/davestewart/nuxt-areas/master/docs/nuxt-areas.png" alt="Nuxt Areas">
</p>


## Overview

Areas is a Nuxt module that enables you to group related files by "area":

```
+- src
    +- areas
        +- products                     <- area 1
        |   +- components
        |   |   +- product-list.vue
        |   +- pages
        |   |   +- index.vue
        |   +- store.js
        +- users                        <- area 2
            +- classes
            |   +- User.js
            +- components
            |   +- user-list.vue
            +- pages
            |   +- index.vue
            +- store
                +- users.js
                +- user.js
```

Co-locating files this way has various advantages:

- it's easier to work on a discrete unit of functionality, such as "products" or "users"
- it's easier to understand what the site does as a whole
- it's easier to see how related files work together
- it's less hopping about between multiple branches of the folder tree
- it's easier to find a home for components, classes, or data 
- naming is easier and imports are shorter

Nuxt's more "global" concerns such as `plugins`, `modules`, `static` , etc remain in the root, making the overall "shape" of the site more intuitive.

Like Nuxt, Areas builds routes from pages, and registers stores and components.

You can even [add areas](#external-areas) from external sources, providing a no-code way to share or modularise parts of your application.

## Demo

To see what a working Nuxt Areas site look like, you can check out the demo:

- https://github.com/davestewart/nuxt-areas-demo

The demo covers all the features listed below.

## Setup

Install via the terminal:

```
npm i nuxt-areas --save-dev
```

In your `nuxt.config.js` set Areas as a build module:

```js
export default {
  buildModules: [
    'nuxt-areas'
  ]
}
```

Next, add a new root-level folder named `areas`:

```
+- src
    +- areas
```

Continue reading to learn how to start from scratch, or migrate an existing site.

## Usage

### Add or move content to new areas subfolders

#### Getting started

To get started, you're going to create or migrate content to named subfolders of `areas`.

To start with:

- create a folder under `areas`
- the folder **must** contain at least a `pages` folder
- the folder **may** contain `components`,  `store` and any other folders you like

Note that folders follow the same routing and namespacing rules as the main Nuxt application.

The Areas module will:

- build prefixed routes from `pages/*`
- register namespaced stores from `store/*` or `store.js`
- register components in `components/*`

Let's pretend we're adding a products area:

```
+- areas
    +- products
        +- classes
        |   +- Product.js
        +- components
        |   +- ProductCard.vue
        +- pages
        |   +- index.vue
        |   +- _id.vue
        +- store.js              <-- store can be a file or folder; namespacing will be determined automatically
```

The following components will be automatically registered:

```
ProductCard.vue
```

The following routes will be generated:

```
/products
/products/:id
```

The store state will be accessible at:

```
$store.state.products
```

You can import the Product model directly from the store:

````js
import Product from './classes/Product.js'
````

#### Migrating an existing site

If you're migrating an existing site, ensure you rename pages and stores so routes and namespaces work correctly:

```bash
# from
/pages/users.vue

# to
/areas/users/pages/index.vue
```

 ```bash
 # from
 /store/users.js
 
 # to
 /areas/users/store.js
 /areas/users/store/index.js # alternative
 ```

If unsure, move one file at a time and test the routes, then move on to the next one.

### Configure custom routing using JavaScript

Areas allows you to break out of filesystem based routing by adding a `routes.js` (or `.ts`) file.

For example, let's say we want to create a more intuitive CRUD setup:

```
+- areas
    +- products
       +- pages
       |   +- index.vue
       |   +- edit.vue           <-- edit can be used for edit and create
       |   +- view.vue
       +- routes.js              <-- routes export overrides filesystem routing
```

The file should export export a single `routes` const:

```js
export const routes = [
  { path: '', component: 'pages/index.vue', children: [
    { path: 'create', component: 'pages/edit.vue'},
    { path: ':id/edit', component: 'pages/edit.vue'},
    { path: ':id', component: 'pages/view.vue'},
  ]}
]
```

Note that:

- `route` must be an array of routes
- each route should define `path`, `component` and optionally `children`
- component properties should be relative to the routes file

If you want to simplify the setup, you can import and use the Areas [helpers](https://github.com/davestewart/nuxt-areas/blob/main/src/utils/client.js):

```js
import { page } from 'nuxt-areas'

// generates the same output as above
export const routes = [
  page('', 'index', [
    page('create', 'edit'),
    page(':id/edit', 'edit'),
    page(':id', 'view'),
  ]),
]
```

### Group routes and namespaces under subfolders

#### Add a subfolder

Areas lets you use subfolders to group routes or namespaces.

Simply add a named subfolder with individual area folders (those containing `pages` folders) beneath:

```
+- areas
    +- products                         <-- this is the "grouping" folder
        +- clothes                      <-- area 1
        |   +- pages
        |   +- ...
        +- shoes                        <-- area 2
            +- pages
            +- ...
```

Note that:

- route paths and store namespaces will come under `products`
- subfolders with a `pages` folder are counted as areas
- you can add as many subfolders as you like

#### Configure routes for subfolder content

After adding an areas subfolder, you can reconfigure the routes or store namespaces for all content beneath.

An an `areas.js` config file to the subfolder like so:

```
+- areas
    +- products
        +- clothes
        |   +- ...
        +- shoes
        |   +- ...
        +- areas.js                      <-- config file
```

From the config file, export alternative names as required:

```ts
export const route = 'foo'              // rename route segment to "foo"
export const namespace = 'bar'          // rename store namespace to "foo"
```

Areas uses Node's `Path.resolve()` to determine routes and namespaces as it traverses the folder structure, so you have quite a bit of power.

Take the doubly-grouped area `/areas/products/shoes` with an area `trainers` 

```ts
// skip naming this group
export const route = ''                 // /products/trainers

// go back to the root
export const route = '/'                // /trainers

// areas/products/shoes
export const route = '../foo'           // /foo/trainers
```

Note:

- you can configure store namespaces the same way
- don't overcomplicate things – simpler is better!

### Move Nuxt application content to areas

Whether you are creating or migrating content to areas subfolders, you may have noticed some lingering content in the root:

```
+- src
    +- areas
    |   +- ...
    +- assets
    +- ** components **
    +- ** layouts **
    +- ** pages **
    +- ** store **
    +- static
```

Whilst this is not a problem, it can feel a bit untidy, so Areas provides a way to move "app" level content to a special folder `areas/app`: 

```
+- src
    +- areas
    |   +- app                  <-- consider this area your core application
    |   |   +- components
    |   |   +- layouts
    |   |   +- pages
    |   |   +- store
    |   +- ...
    +- assets                   <-- global nuxt folders remain in the root
    +- static
```

Once moved, Areas will detect and:

- reconfigure your [options.dir](https://nuxtjs.org/docs/configuration-glossary/configuration-dir) configuration
- update [Webpack alias](https://nuxtjs.org/docs/configuration-glossary/configuration-alias/) configuration

To test this out, simply move these folders and restart the server; everything should continue working as before.

## External areas

Areas makes it possible to add area folders from *external* locations, such as folders, GitHub repos or NPM packages.

This might be useful if you want to share common functionality across Nuxt apps, or make third-party functionality available to others.

### Loading external areas

External folders are configured in `nuxt.config.js`:

```js
export default {
  areas: {
    external: [
      // folder
      { src: './external/admin', route: '/admin' },
      
      // npm package
      { src: 'user-admin', route: '/admin/users', namespace: '/admin/users' }
    ]
  }
}
```

In addition to the `src`, the `route` must be specified and the `namespace` (if a store is provided) may be specified.

### Authoring external areas

#### As a folder

Like local areas, simply create a folder with `pages`, `store`, etc:

```
+- some-folder
    +- pages
    |   +- ...
    +- store
        +- ...
```

Load the area by passing a relative or absolute path in config.

#### As a package

If you want to create an area to share via GitHub or NPM, create a package structure as normal, with the area as `src`:

```
+- some-package
    +- src
    |   +- components
    |   |   +- ...
    |   +- pages
    |       +- ...
    +- package.json
```

In your `package.json` set the `main` key to point towards `src/index.js` (this file does not need to exist!):

```json
{
  "name": "some-package",
  "main": "src/index.js"
}
```

This key will be read by Areas, the containing folder resolved, and the `pages`, `store` etc will be loaded as you would expect.

Note that you **do not need to publish to NPM to load an area**, you can install directly from GitHub:

```
npm i username/repo
```

See the [Area 51](https://github.com/davestewart/area-51) demo module and the [Nuxt Areas Demo](https://github.com/davestewart/nuxt-areas-demo) for a working example.

## Configuration

### Nuxt config

Nuxt has various configuration options that you can set in your `nuxt.config.js` file:

```js
export default {
  areas: {
    // the base folder areas will look for folders
    base: 'areas',
    
    // the special "app" folder you want to reconfigure root-level content to load from
    app: 'app',
    
    // update webpack aliases if areas/app folder is used 
    aliases: true,
    
    // optionally save debug output to ./areas/.debug
    debug: false,
    
    // external areas
    external: [
      // local folder
      { src: '~/external/auth' },      

      // local folder + override route
      { src: '~/external/auth': route: 'auth' },
      

      // npm package + override route and store namespace
      { src: 'nuxt-areas-module-admin', route: 'admin/users', namespace: 'admin/users' }
    }
  }
}
```

### Alias config

If you move your application folders to `areas/app` you will need to tweak TypeScript (and optionally Webpack) path aliases.

Areas's aliases should be positioned so they are read by the system **before** the existing aliases; this is because with aliases, the first matching path wins, so placing them after `~/` would mean the paths would not be found.

For TypeScript, edit `tsconfig.json` and make sure aliases are positioned first:

```json
{
  "compilerOptions": {
    "paths": {
      "~/components/*": [ "./areas/app/components/*" ],
      "~/layouts/*": [ "./areas/app/layouts/*" ],
      "~/store/*": [ "./areas/app/store/*" ],
      "~/*": [ "./*" ],
    }
  }
}
```

Note that Webpack aliases are rewritten automatically by Areas. 

If you disable this option (for whatever reason) edit `nuxt.config.js` and assign the aliases yourself.

You can use a package like [Alias HQ](https://www.npmjs.com/package/alias-hq) to piggyback your TypeScript config to keep your alias configuration in one place only.

```js
import hq from 'alias-hq'

const config = {
  build: {
    extend (config) {
      const alias = {
        areas: __dirname + "/areas",
          ...hq.get('webpack'),
      }
      config.resolve.alias = Object.assign(alias, config.resolve.alias)
    }
  },
}
```

## Debugging

If things at any point don't work, for example you're experimenting with areas subfolders configuration, you can dump every setting, option and configuration that Areas uses or generates, to disk so you can get an idea of what is going on beneath the hood.

Set the `debug` option to `true` and check `areas/.debug/` for a folder of files which Areas will output each time there's the server is rebuilt:

```
+- areas
    +- .debug
        +- .gitignore
        +- alias.js
        +- areas.js
        +- nuxt.js
        +- options.js
        +- routes.js
        +- stores.js
        +- watch.js            
```

For example, the `areas.js` file shows how the areas are processed prior to building routes and registering stores:

```js
// Areas generates this configuration to extend routes and register stores
export const areas = [
  {
    name: 'bar',
    route: '/bar',
    namespace: '/bar',
    path: '/Volumes/Data/Work/OpenSource/JavaScript/NuxtAreas/nuxt-areas-demo/areas/bar'
  },
  {
    name: 'baz',
    route: '/baz',
    namespace: '/baz',
    path: '/Volumes/Data/Work/OpenSource/JavaScript/NuxtAreas/nuxt-areas-demo/areas/baz',
    configFile: 'routes.js'
  },
```

You can make changes and watch files for updates, and determine how the final files are being built.

If you want to know what Nuxt Areas is doing and how it is doing it, take a look at [src/README.md](./src/README.md).

## Issues

Nuxt Areas is still prerelease, so I'm looking to get feedback and squish any bugs before final release.

Please do jump in and test, and let me know what doesn't work in the [issues](https://github.com/davestewart/nuxt-areas/issues).

Thanks!

## Logo

If you're wondering what the logo is all about, it is the [Eye of Providence](https://en.wikipedia.org/wiki/Eye_of_Providence), or "all-seeing eye".

When I was experimenting with designs, I tested ideas with folders, network icons, the share icon, triangles, the letter A, but nothing seemed to resonate.

Someone on Twitter mentioned "Area 51" which I thought was amusing but didn't take it seriously as a logo idea, but later the Eye of Providence popped into my head. Crazily, it seemed like it might work; Areas gives you a better overview of your application (the eye), it keeps files in self-contained areas (the triangle) and it's a pretty radical approach (the rays & stars). Plus, it's a little bit whacky and goes with the slightly esoteric title!

So there you have it :)     
