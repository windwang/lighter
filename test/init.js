// Generated by CoffeeScript 1.4.0
(function() {
  var TestBase;

  TestBase = (function() {

    function TestBase() {
      var path, settings;
      path = require('path');
      settings = (require(path.join(__dirname, '../modules/settings')))();
      require(path.join(__dirname, '../modules/schema'))(settings.mongoose);
      this.blog = (require('../modules/blog'))(settings);
      this.category = (require('../modules/category'))(settings);
    }

    TestBase.prototype.blog = TestBase.blog;

    TestBase.prototype.category = TestBase.category;

    return TestBase;

  })();

  module.exports = new TestBase();

}).call(this);
