# Nuxt Areas

> Simple and scalable folder management for large Nuxt projects

## Abstract

In general, most web application frameworks ship with a folder structure based on responsibility.

This results in related files (i.e. products) being "striped" across the application:

```
+- src
    +- components
    |   +- product-list.vue             <- stripe 1
    |   +- user-list.vue
    +- pages
    |   +- products.vue                 <- stripe 2
    |   +- users.vue
    +- store
        +- products.js                  <- stripe 3
        +- users.js
        +- user.js
```

As applications grow in size, not only do related files get further apart, but they sit in a sea of *unrelated* files, adding a cognitive overhead to working across the various subsystems of the site.

To mitigate we employ strategies such as path aliasing, naming strategies and further siloing:

```
+- src
    +- components
    |   +- products                     <- silo 1
    |   |   +- product-list.vue
    |   |   +- ...
    |   +- user                         <- silo 2
    |       +- user-list.vue
    v       +- ...
```

However, by sticking to the constraints of the original organisational strategy, the codebase can end up feeling increasingly sprawling and brittle, making it harder to add new features or update existing ones.

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

This results in related files sitting close together, making it easier to find, name and import, understand relationships, and work on related items without polution by, or to, other areas.

Nuxt's "global" folders such as `plugins`, `modules`, `static` , etc remain in the root, providing another layer of siloing between global and local concerns and making it easier to determine what the site does just by looking at the folders.

Like Nuxt, Areas automatically loads siloed components and stores, and will automatically generate routes based on the filesystem *or* can give you *per-area* configuration of routing.

## Demo

To see what a working Nuxt Areas site look like, you can download and run the following demo:

- https://github.com/davestewart/nuxt-areas-demo

If you want to check it out online, go to:

- https://codesandbox.io/s/nuxt-areas-demo-eovs8

The demo covers all the use cases listed below.

## Setup

Install via the terminal:

```
npm i nuxt-areas
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

## Usage

### Add or move content new areas subfolders

To get started, you're going to create or move content to subfolders of `areas`.

Remember, all `areas` sub folders follow the same routing and namespacing rules as the main Nuxt application.

The Areas module will:

- build prefixed routes from `pages`
- register namespaced stores from `store` or `store.js`
- register components in `components`
- read any `area.config.js` and customise routes or stores based on the exports 
- ignore other folders (but you can add them and import locally, for example `classes` or `data`)

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
        +- store.js                     <-- store can be a file or folder; namespacing will be determined automatically
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

The store will be namespaced under:

```
$store.state.products
```

You can import the Product model directly from the store:

````js
import Product from './classes/Product.js'
````

If you're:

- happy with the standard Nuxt approach, add as many folders as you need and your application should just run

- migrating an existing site, you *may* need to read on to customise routes or namespaces

### Configure custom routing using JavaScript

If you want to break out of filesystem based routing, for example, a more intuitive CRID setup, you can add an `area.config.js` (or `.ts`) file:

```
+- areas
    +- products
       +- pages
       |   +- index.vue
       |   +- edit.vue                  <-- edit can be used for edit and create
       |   +- view.vue
       +- area.config.js                <-- config file export overrides filesystem routing
```

The file should export **area-relative** routes defining `path`, `component` and optionally `children`:

````ts
export const routes = [
    { path: string, component: string, children: route[] }
]
````

Note that top level routes:

- must contain a leading slash
- must explicitly set the `path` of the route (Areas doesn't add the folder name automatically!)

```js
export const routes = [
  { path: '/products', component: 'pages/index.vue', children: [
    { path: 'create', component: 'pages/edit.vue'},
    { path: ':id/edit', component: 'pages/edit.vue'},
    { path: ':id', component: 'pages/view.vue'},
  ]}
]
```

See the [Config](#config) section for more information.

### Modify route prefixes and store namespaces

#### Routes

There may be times when you need a common route, or just want to structurally group areas without adding a route.

You can nest areas under subfolders, as long as you provide a config file which exports a `path` constant:

```
+- areas
    +- products                         <-- this is the "grouping" folder
        +- clothes                      <-- areas 1
        |   +- pages
        |   +- ...
        +- shoes                        <-- area 2
        |   +- pages
        |   +- ...
        +- area.config.js               <-- config file configures how the routes are built
```

The config file should look like this:

```ts
export const path = 'products'
```

The final routes will be:

```
/products/clothes/*
/products/shoes/*
```

You can also prevent Areas from generating a route:

```ts
export const path = ''
```

The final routes will be:

```
/clothes/*
/shoes/*
```

#### Stores

To change the namespacing of stores, export a `namespace` constant from the store itself:

```js
// /areas/products/clothes/store.js

export const namespace = 'clothes'
```

The store will be accessible at:

```
$store.state.clothes
```

### Move all application content to areas

By design, Areas namespaces all areas folders with a prefixed route and store.

However, it reserves a special folder `app` where you can move root-level `layouts`, `pages`, and `store` folders to simplify your main Nuxt app: 

```
+- src
    +- areas
    |   +- app                  <-- move nuxt-specific content to special "app" folder
    |   |   +- components
    |   |   +- layouts
    |   |   +- pages
    |   |   +- store
    |   +- ...
    +- assets                   <-- global nuxt folders remain in the root
    +- services
    +- static
```

If Areas detects `components` , `layouts`, `pages`, or `store`  folders within `app` it will reconfigure Nuxt using the [options.dir](https://nuxtjs.org/docs/configuration-glossary/configuration-dir) configuration.

To test this out, move these folders under `areas/app`, restart the server, and observe everything working as it was before.

## Configuration

### Nuxt config

Nuxt has two configuration options that you can set in your `nuxt.config.js` file:

```js
export default {
  areas: {
    // the base folder areas will look for folders
    base: 'areas',
    
    // the special "app" folder you want to reconfigure root-level content to load from
    app: 'app'
  }
}
```

### Areas config

Areas enables you to configure individual areas on a per-folder basis.

#### Location

Add a new file to any area you want to configure:

```
+- src
    +- areas
        +- foo
            +- pages
            |   +- index.vue
            |   +- view.vue
            +- area.config.js (or .ts)
```

From the `area.config.js` file, you will export constants that Areas will read.

#### Routes

Configuring routes is mainly useful when you want to break out of Nuxt's filesystem routing. 

You should export a single `routes` constant:

```js
export const routes = [
  // parent page with <nuxt-child>
  { path: '/foo', component: 'pages/index.vue', children: [
    
    // nested page
    { path: '', component: 'pages/all.vue'},
    
    // single route
    { path: ':id',  component: 'pages/view.vue'},
  ]}
  
]
```

This works exactly the same way Vue Router, so:

- `routes` must be array of `route`s
- each `route` should contain `path`, `component`, and optionally `children` properties
- root-level `path`s must **must** start with a leading slash
- `component` **must** be an **area-relative** string path
- Areas will **not** prefix the route with the area (so include or omit, as appropriate)

If you want to simplify the setup, you can import and use the Areas `page()` or `route()` helper:

```js
import { page, route } from 'nuxt-areas'

export const routes = [
  // adds `.vue` suffix
  route('/foo/:id', 'pages/view'),
  
  // adds `page/` prefix and `.vue` suffix
  page('/foo/:id', 'index'),
]
```

#### Path

If you want to group folders, you will need to tell Areas that the folder is a group, and what the path should be:

```
+- src
    +- areas
        +- products
            +- foo
            |   +- pages
            |       +- index.vue
            |       +- view.vue
            +- area.config.js (or .ts)
```

You can export a path matching the folder, or modify it as required:

```js
// prefix child pages with the folder name
export const path = '/products'

// prefix child pages with different route
export const path = '/products/en'

// remove the path segment; use the folder for grouping only
export const path = ''
```

### Directory config

If you move any of the following root-level folders to `areas/app`  then Areas will reconfigure Nuxt using [options.dir](https://nuxtjs.org/docs/configuration-glossary/configuration-dir/):

- `components`
- `layouts`
- `pages`
- `store`

You may need to restart the server, but your app will run as usual.
