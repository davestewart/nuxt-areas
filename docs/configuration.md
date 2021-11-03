# Configuration

> Understand the various configuration options available via Nuxt config or Areas config

## Custom routes

Areas allows you to customise the routes for each individual area.

Simply add a `routes.js` file to each `areas` folder:

```
+- areas
    +- users
        +- pages
        |   +- create             ->   /users/create
        |   +- edit.vue           ->   /users/123/edit
        |   +- index.vue          ->   /users
        |   +- view.vue           ->   /users/123
        +- routes.js
```

The routes file should export an array of paths and components:

```js
export default [
  { path: '/users', component: 'pages/index.vue', children: [
    { path: 'create', component: 'pages/create.vue'},
    { path: ':id/edit', component: 'pages/edit.vue'},
    { path: ':id', component: 'pages/view.vue'},
  ]}
]
```

Areas ships with a helper which adds the `pages/` and `.vue` parts of the path:

```js
import { route } from 'nuxt-areas'

export default [
  route('/users', 'index', children: [
    route('create', 'create'},
    route(':id/edit', 'edit'},
    route(':id', 'view'},
  ]}
]
```



## Nuxt config

### Folders

Configure which folder should hold `areas` and `app`.

### Components

Enable or disable auto-loading of Areas components

### Dirs

Override which folders Nuxt looks for `components`,  `layouts` and  `stores`.

Also cover `alias` configuration:

- in `tsconfig.json` 
- in WebPack via `build.extend` > `config.resolve.alias`

