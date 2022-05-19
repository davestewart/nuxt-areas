# Customisation

## Routes

> Break out of Nuxt's file-based routing

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

## Nested areas

> Group multiple areas within a parent area

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

## External areas

> Include 3rd-party areas from folders or packages

Areas makes it possible to add area folders from *external* locations, such as folders, GitHub repos or NPM packages.

This might be useful if you want to share common functionality across Nuxt apps, or make third-party functionality available to others.

### Configuration

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

### Authoring

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

## Next

- [Advanced](./advanced.md)
