// Generated by CoffeeScript 1.4.0
(function() {

  module.exports = function(settings) {
    var Media;
    Media = (function() {

      function Media(settings) {
        this.media = settings.mongoose.model('media');
        this.helper = (require(__dirname + '/helper'))();
        this.settings = settings;
      }

      Media.prototype.create = function(res) {
        var promise, url,
          _this = this;
        promise = new this.settings.Promise;
        url = this.helper.linkify(res.slug);
        this.media.findOne({
          url: url
        }, function(err, data) {
          var media;
          if (data === null) {
            media = new _this.media({
              title: res.slug,
              id: res.id,
              url: url,
              type: res.type,
              date: new Date()
            });
            return media.save(function(err, data) {
              return promise.resolve(data);
            });
          } else {
            return promise.resolve(data);
          }
        });
        return promise;
      };

      Media.prototype.get = function(url) {
        var promise,
          _this = this;
        promise = new this.settings.Promise;
        this.media.findOne({
          url: url
        }, function(err, data) {
          if (data !== null) {
            return promise.resolve(data);
          } else {
            return promise.resolve(null);
          }
        });
        return promise;
      };

      return Media;

    })();
    return new Media(settings);
  };

}).call(this);
