/*global suite, test, setup, teardown*/
'use strict';
var assert = require('chai').assert,
  confy = require('../confy'),
  path = require('path'),
  fs = require('fs');

var CONFIG_DIR = path.join(__dirname, 'config');

suite('#load', function () {

  test('should load default config with no env parameter', function (done) {
    var config = confy({configDir: CONFIG_DIR});
    config.load(function (err, mergedConfig) {
      var expected = 'default';
      assert.isNull(err);
      assert.property(mergedConfig, 'configName');
      assert.equal(mergedConfig.configName, expected);
      done();
    });
  });

  test('should load default config with env parameter', function (done) {
    var config = confy({configDir: CONFIG_DIR});
    config.load('default', function (err, mergedConfig) {
      var expected = 'default';
      assert.isNull(err);
      assert.property(mergedConfig, 'configName');
      assert.equal(mergedConfig.configName, expected);
      done();
    });
  });

  test('should load environment config with env parameter', function (done) {
    var config = confy({configDir: CONFIG_DIR});
    config.load('development', function (err, mergedConfig) {
      var expected = 'development';
      assert.isNull(err);
      assert.property(mergedConfig, 'configName');
      assert.equal(mergedConfig.configName, expected);
      done();
    });
  });

  test('should load merged environment config with env parameter', function (done) {
    var config = confy({configDir: CONFIG_DIR});
    config.load('development', function (err, mergedConfig) {
      var expectedProperty = 'defaultOnly';
      assert.isNull(err);
      assert.property(mergedConfig, expectedProperty);
      assert.isTrue(mergedConfig[expectedProperty]);
      done();
    });
  });

  test('should err if no default environment specified, and env parameter absent', function (done) {
    var config = confy({configDir: CONFIG_DIR, defaultEnv: ''});
    config.load(function (err) {
      assert.isNotNull(err);
      done();
    });
  });

  test('should err if invalid env specified', function (done) {
    var config = confy({configDir: CONFIG_DIR});
    config.load('bazinga', function (err) {
      assert.isNotNull(err);
      done();
    });
  });

  suite('#load (cache)', function () {

    var FAKE_CONFIG = {configName: 'fake'},
      UPDATED_CONFIG = {configName: 'updatedFake'},
      FAKE_CONFIG_FILE = path.join(CONFIG_DIR, 'fake.json');

    setup(function (done) {
      var json = JSON.stringify(FAKE_CONFIG);
      fs.writeFile(FAKE_CONFIG_FILE, json, function (err) {
        if (err) {
          console.error('unable to write fake config file: %s', err);
          throw err;
        }
        done();
      });
    });

    test('should cache config values by default', function (done) {
      var config = confy({configDir: CONFIG_DIR});
      config.load('fake', function (err1, config1) {
        assert.isNull(err1);
        assert.isObject(config1);
        fs.writeFileSync(FAKE_CONFIG_FILE, JSON.stringify(UPDATED_CONFIG));
        config.load('fake', function (err2, config2) {
          assert.isNull(err2);
          assert.isObject(config2);
          assert.deepEqual(config2, config1);
          done();
        });
      });
    });

    test('should cache config values when cache param is true', function (done) {
      var config = confy({configDir: CONFIG_DIR, cache: true});
      config.load('fake', function (err1, config1) {
        assert.isNull(err1);
        assert.isObject(config1);
        fs.writeFileSync(FAKE_CONFIG_FILE, JSON.stringify(UPDATED_CONFIG));
        config.load('fake', function (err2, config2) {
          assert.isNull(err2);
          assert.isObject(config2);
          assert.deepEqual(config2, config1);
          done();
        });
      });
    });

    test('should not cache config values when cache param is false', function (done) {
      var config = confy({configDir: CONFIG_DIR, cache: false});
      config.load('fake', function (err1, config1) {
        assert.isNull(err1);
        assert.isObject(config1);
        fs.writeFileSync(FAKE_CONFIG_FILE, JSON.stringify(UPDATED_CONFIG));
        config.load('fake', function (err2, config2) {
          assert.isNull(err2);
          assert.isObject(config2);
          assert.notDeepEqual(config2, config1);
          done();
        });
      });
    });

    teardown(function (done) {
      fs.unlink(FAKE_CONFIG_FILE, function (err) {
        if (err) {
          console.error('unable to delete fake config file: %s', err);
          throw err;
        }
        done();
      });
    });
  });

});
