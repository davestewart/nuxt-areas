# Advanced

## Config

> Full list of Areas' configuration options

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

> Help debugging Areas when things don't work

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

If you want to know what Nuxt Areas is doing and how it is doing it, take a look at [src/README.md](../src/README.md).

## Logo

> What's with the eye!?

If you're wondering what the logo is all about, it is the [Eye of Providence](https://en.wikipedia.org/wiki/Eye_of_Providence), or "all-seeing eye".

When I was experimenting with designs, I tested ideas with folders, network icons, the share icon, triangles, the letter A, but nothing seemed to resonate.

Someone on Twitter mentioned "Area 51" which I thought was amusing but didn't take it seriously as a logo idea, but later the Eye of Providence popped into my head. Crazily, it seemed like it might work; Areas gives you a better overview of your application (the eye), it keeps files in self-contained areas (the triangle) and it's a pretty radical approach (the rays & stars). Plus, it's a little bit whacky and goes with the slightly esoteric title!

So there you have it :)     
