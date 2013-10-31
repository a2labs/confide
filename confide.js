'use strict';

var path = require('path'),
  fs = require('fs'),
  _ = require('underscore'),
  async = require('async');

/**
 * Default module configuration
 * @type {{configDir: string, defaultEnv: string}}
 */
var DEFAULT_CONFIG = {
  configDir: '',
  defaultEnv: 'default',
  cache: true
};

/**
 * Module configuration
 * @type {{}}
 */
var moduleConfig = {};

/**
 * Config file pattern (.json files)
 * @type {string}
 */
var CONFIG_FILE_PATTERN = '\\.json$';

/**
 * Lists the configuration files located in the config directory
 * @param {Function} cb
 */
function listConfigFiles(cb) {
  return fs.readdir(moduleConfig.configDir, function (err, files) {
    if (err) { return cb(err); }
    var configFiles = files.filter(function (value/*, index, array*/) {
      var fileRegex = new RegExp(CONFIG_FILE_PATTERN);
      return fileRegex.test(value);
    }) || [];
    cb(null, configFiles);
  });
}

/**
 * Asynchronously parses JSON in all configuration files
 * @param {Array} configFiles
 * @param {Function} cb
 */
function parseConfigFiles(configFiles, cb) {
  function configToJSON(file, cb) {
    var filePath = path.join(moduleConfig.configDir, file);
    var readErr = 'could not read `' + filePath + '`: ';
    fs.readFile(filePath, function (err, content) {
      if (err) { return cb(readErr + err); }
      var config = {};
      try {
        config = JSON.parse(content);
      } catch (e) {
        return cb(readErr + e.message || '');
      }
      cb(null, config);
    });
  }
  async.map(configFiles, configToJSON, function (err, results) {
    if (err) { return cb(err); }
    var keys = configFiles.map(function (value/*, index, array*/) {
      var fileRegex = new RegExp(CONFIG_FILE_PATTERN);
      return value.replace(fileRegex, '');
    });
    var configHash = _.object(keys, results);
    cb(null, configHash);
  });
}

/**
 * Merges the specified configuration with the default configuration
 * @param {String} env
 * @param {Object} configHash - key/value pairs in the form: `[env]:[configValues]`
 * @param {Function} cb
 */
function mergeConfigs(env, configHash, cb) {
  var defaultConfig = configHash[moduleConfig.defaultEnv] || {};
  if (!_.has(configHash, env)) {
    return cb('`' + env + '` configuration not present');
  }
  var envConfig = configHash[env];
  var mergedConfig = _.defaults(envConfig, defaultConfig);
  cb(null, mergedConfig);
}

module.exports = function (config) {
  config = config || {};
  if (!_.has(config, 'configDir')) {
    throw new Error('must specify a config directory');
  }
  moduleConfig = _.defaults(config, DEFAULT_CONFIG);
  var cache = {};

  return {
    /**
     * Asynchronously loads configuration for a specified environment
     * @param {String} env
     * @param {Function} cb
     */
    load: function (env, cb) {
      if (arguments.length === 1) {
        cb = env;
        env = null;
      }
      env = env || moduleConfig.defaultEnv;
      if (!env) {
        return cb('environment not specified and no default configured');
      }
      if (cache.hasOwnProperty(env)) {
        return cb(null, cache[env]);
      }
      async.waterfall([
        listConfigFiles,
        parseConfigFiles,
        mergeConfigs.bind(this, env)
      ], function (err, mergedConfig) {
        if (err) { return cb(err); }
        if (moduleConfig.cache) {
          cache[env] = mergedConfig;
        }
        cb(null, mergedConfig);
      });
    },
    /**
     * Invalidates cached configuration for a specified environment and
     * reloads its configuration
     * @param {String} env
     * @param {Function} cb
     */
    reload: function (env, cb) {
      if (arguments.length === 1) {
        cb = env;
        env = null;
      }
      cache = {};
      this.load(env, cb);
    }
  };
};