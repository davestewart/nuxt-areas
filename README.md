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

You can even [add areas](./docs/customisation.md#external-areas) from external sources, providing a no-code way to share or modularise parts of your application.

## Next steps

Docs:

- [Nuxt Areas docs](https://github.com/davestewart/nuxt-areas/tree/main/docs)

Demo:
 
- [Interactive demo on StackBlitz](https://stackblitz.com/github/davestewart/nuxt-areas-demo-vue2?file=areas%2Fapp%2Fpages%2Findex.vue)
- [Source code on GitHub](https://github.com/davestewart/nuxt-areas-demo-vue2)
