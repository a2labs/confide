# confide

Confide is a simple configuration module for node.js. It will merge an environment-specific configuration file with a default configuration file and return the merged values.

Assume the directory structure:

```
|- config
|  |- default.json
|  |- production.json
|- node_modules
|  |- confide
|- myscript.js
```

Any property declared in a default config file may be overridden by an environment-specific config file.

```javascript
// in default.json
{
  "showLogMsgs": true // will be overridden below
  "dateFormat": "MM/DD/YYYY" // will not be overridden below
}

// in production.json
{
  "showLogMsgs": false
  // inherit dateFormat
}
```

In myscript.js, we can read our configuration by invoking confide's `load()` method:

```javascript
var path = require('path'),
  CONFIG_DIR = path.join(__dirname, 'config'),
  confide = require('confide');

confide({configDir: CONFIG_DIR}).load('production', function (err, mergedConfig) {
  mergedConfig.showLogMsgs; // false
});
```

The `confide` function takes a number of parameters:

- `configDir` (required) - directory where configuration files are located
- `defaultEnv` (optional, defaults to `default`) - name of the default env (default json file)
- `cache` (optional, defaults to `true`) - whether to cache config values for future calls to `load()`

If you don't need environment-specific configuration, you can just create default.json in your config directory, and leave out the environment parameter when calling `load()`:

```javascript
confide({configDir: CONFIG_DIR}).load(function (err, defaultConfig) {
  defaultConfig.showLogMsgs; // true
});
```

If cache is enabled (it is by default) and you wish to focibly reload your configuration, just call the `reload()` method with the same parameters as `load()`:

```javascript
var conf = confide({configDir: CONFIG_DIR});
conf.load('production', function (err, mergedConfig) {
  mergedConfig.showLogMsgs; // false

  // production.json updated on the file system...
  conf.reload('production', function (err, mergedConfig) {
    mergedConfig.showLogMsgs; // true
  });
});
```