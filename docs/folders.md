# Folders

## Area root

> Set up individual folders with closely-related content 

To get started, create a new folder called `/areas` in the root of your Nuxt project, then create some initial area folders within:

```
+- areas
    +- projects
    +- users
    +- ...
```

Into these folders you will create or migrate `pages`, `stores`, `components`, etc.

## Area content

### Requrements

All area folders:

- **must** contain a `pages` folder
- **may** contain `components`,  `store` and any other folders you like

The Areas module will:

- build prefixed routes from `pages/*`
- register namespaced stores from `store/*` or `store.js`
- register components in `components/*`

*Note that page routes and store namespaces use the same rules as the main Nuxt application.*

### Creating an area from scratch

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

### Migrating an existing site

Because of the way area folders provide the default name of the `route` and the `store` namespace, you will need to adjust some filenames when you move them to area subfolders.

For example:

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

*Note that these defaults can be [customised](./customisation.md).*

## App content

> Move lingering application content to a special "app" area

Whether you are creating or converting content to areas subfolders, you may have noticed some lingering content in the root:

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

Whilst this is not a problem, it can feel a bit untidy, so Areas provides a way to move "application" level content to a special folder `areas/app`:

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

## Next

- [Customisation](./customisation.md) 


