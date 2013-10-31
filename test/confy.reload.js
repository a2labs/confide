/*global suite, test, setup, teardown*/
'use strict';
var assert = require('chai').assert,
  confy = require('../confy'),
  path = require('path'),
  fs = require('fs');

var CONFIG_DIR = path.join(__dirname, 'config');

suite('#reload', function () {

  var FAKE_DEFAULT = {configName: 'fakeDefault', defaultChanged: false},
    FAKE_CONFIG = {configName: 'fake', fakeChanged: false},
    FAKE_DEFAULT_FILE = path.join(CONFIG_DIR, 'fakeDefault.json'),
    FAKE_CONFIG_FILE = path.join(CONFIG_DIR, 'fake.json');

  setup(function (done) {
    fs.writeFileSync(FAKE_DEFAULT_FILE, JSON.stringify(FAKE_DEFAULT));
    fs.writeFileSync(FAKE_CONFIG_FILE, JSON.stringify(FAKE_CONFIG));
    done();
  });

  test('reloads a particular environment', function (done) {
    var config = confy({configDir: CONFIG_DIR, defaultEnv: 'fakeDefault'});
    config.load('fake', function (err1, config1) {
      assert.isNull(err1);
      assert.isObject(config1);
      assert.isFalse(config1.defaultChanged);
      assert.isFalse(config1.fakeChanged);
      var updatedConfig = {configName: 'fake', fakeChanged: true};
      fs.writeFileSync(FAKE_CONFIG_FILE, JSON.stringify(updatedConfig));
      config.reload('fake', function (err2, config2) {
        assert.isNull(err2);
        assert.isObject(config2);
        assert.isFalse(config2.defaultChanged);
        assert.isTrue(config2.fakeChanged);
        done();
      });
    });
  });

  test('reloads default environment', function (done) {
    var config = confy({configDir: CONFIG_DIR, defaultEnv: 'fakeDefault'});
    config.load('fake', function (err1, config1) {
      assert.isNull(err1);
      assert.isObject(config1);
      assert.isFalse(config1.defaultChanged);
      assert.isFalse(config1.fakeChanged);
      var updatedConfig = {configName: 'fakeDefault', defaultChanged: true};
      fs.writeFileSync(FAKE_DEFAULT_FILE, JSON.stringify(updatedConfig));
      config.reload('fake', function (err2, config2) {
        assert.isNull(err2);
        assert.isObject(config2);
        assert.isTrue(config2.defaultChanged);
        assert.isFalse(config2.fakeChanged);
        done();
      });
    });
  });

  test('reloads both environments', function (done) {
    var config = confy({configDir: CONFIG_DIR, defaultEnv: 'fakeDefault'});
    config.load('fake', function (err1, config1) {
      assert.isNull(err1);
      assert.isObject(config1);
      assert.isFalse(config1.defaultChanged);
      assert.isFalse(config1.fakeChanged);
      var updatedConfig = {configName: 'fakeDefault', defaultChanged: true};
      fs.writeFileSync(FAKE_DEFAULT_FILE, JSON.stringify(updatedConfig));
      updatedConfig = {configName: 'fake', fakeChanged: true};
      fs.writeFileSync(FAKE_CONFIG_FILE, JSON.stringify(updatedConfig));
      config.reload('fake', function (err2, config2) {
        assert.isNull(err2);
        assert.isObject(config2);
        assert.isTrue(config2.defaultChanged);
        assert.isTrue(config2.fakeChanged);
        done();
      });
    });
  });

  teardown(function (done) {
    fs.unlinkSync(FAKE_DEFAULT_FILE);
    fs.unlinkSync(FAKE_CONFIG_FILE);
    done();
  });

});
