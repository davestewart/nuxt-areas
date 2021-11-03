# Migration

> Work through the steps needed to successfully convert an existing site to use Areas

## Getting started

> Note that a migration tool is coming, that will automate some or all of the following process

Note that Areas reconfigures how Nuxt builds routes, loads stores and locates components, so your application will stop working from the moment you configure the module until the moment you finish migrating files to the new folder structure.

Make sure to familiarise yourself with the [Migration](#migration) section before attempting to migrate an existing application. Whilst the process is straightforward, there are a few details which may trip you up, so don't skip!

## Overview of the process

Migrating your site to work with Areas requires you to physically move files:

- from Nuxt's **responsibility-based** folder structure
- to Areas's **area-based** folder structure

Briefly, the process is:

- replicate your pages structure
- move global files
- move local files
- test and debug

The aim is for related `components`, `layouts`, `pages` and `store` files to end up being grouped under named child folders of `areas`; for example, all files relating to **users** would end up in `areas/users`:

```
components/users/user-list.vue    ->   areas/users/components/user-list.vue
pages/users/index.vue             ->   areas/users/pages/index.vue
store/users.js                    ->   areas/users/store.js
```

Once you've migrated one area, you'll understand the process; think of it as a codeless refactor.

## Steps

### Replicate your pages structure

Areas lets you use filesystem routing or per-folder JavaScript [configured](#configuration) routing.

If all goes correctly, the generated routes will be exactly the same as before the migration.

#### Root-level pages

Because of Areas' flat folder hierarchy, your root-level pages are located sightly differently.

As such, identify **root-level** pages *without* related folders, for example:

```
+- pages
    +- users
    |   +- _id.vue
    |   +- index.vue
    +- products
    |   +- index.vue
    +- about.vue                  <-   root-level
    +- index.vue                  <-   root-level
    +- users.vue                  <-   NOT root level, as it has a related folder
```

Now, move these files to `areas/app/pages/`:

```
+- areas
    +- app
        +- pages
            +- about.vue          ->   /about
            +- index.vue          ->   /
```

This special `app` folder allows Areas to build the routes and load the stores without the folder scanning logic getting confused by other folders which otherwise would have to be placed in `areas` directly.

#### Nested pages

Now it's the turn of **nested items**. 

Determine the folder names of your own files and move into named `areas` subfolders accordingly:

```
+- areas
    +- app
    |   +- ...
    +- products
    |   +- pages
    |       +- index.vue          ->   /products
    +- users
        +- pages
            +- _id.vue            ->   /users/123
            +- index.vue          ->   /users
```

Once you are done, this should be pretty close to the final structure of your app.

### Move global items

The next thing to do is to move **all** global items to `app/`:

```
components/*                      ->   areas/app/components/
layouts/*                         ->   areas/app/layouts/
store/*                           ->   areas/app/store/
```

Note that the root level store should be accessible at:

```
areas/app/store.js
areas/app/store/index.js
```

 This is also where you will add `nuxtServerInit()`, set up plugins, etc.

### Move local items

Finally, you can decide if you want to further silo what are now `app` items even further.

For example, let's say that `users` have both components and stores; we can move them to `users`:  

```
areas/app/components/users/*      ->   areas/users/components
areas/app/store/users/*           ->   areas/users/store
```

Note that:

- components will be discovered and registered
- stores will be discovered, registered and namespaced

### Test and debug

By this point, everything should have a home, and your app should – at least in part – be running.

Continue to test all routes, and make tweaks as required until the application runs properly:

- you may need to restart the server after correcting fatal errors
- you may like to rename files to adjust namespaces or routes
- remember, can also configure routes using JavaScript if you want a more flexible setup (see below)

