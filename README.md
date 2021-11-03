# Nuxt Areas

> Simple and scalable folder management for large Nuxt projects

> **Note:** Areas is currently [pre-release](https://github.com/davestewart/nuxt-areas/issues/1); these docs *will* be incomplete, inaccurate or ahead!

## TL;DR

A more sensible way to structure medium to large Nuxt apps:

- installs as a Nuxt module
- layouts, pages, stores, components are grouped by purpose 
- the end result is a much simpler, flexible, and more more intuitive Nuxt setup  

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

Areas is a Nuxt module which transposes the "responsibility" contraint to organise your files by "area":

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

Like Nuxt, Areas automatically loads siloed components and stores, and by default will automatically generate routes based on the filesystem *or* can give you *per-area* configuration of routing.

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

## Next steps

You can...

- [Implement](docs/implementation.md)<br>
  Create a new site from scratch

- [Migrate](docs/migration.md)<br>
  Migrate an existing site to Areas

- [Configure](docs/configuration.md)<br>
  See the configuration options available

