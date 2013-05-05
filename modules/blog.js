// Generated by CoffeeScript 1.4.0
(function() {

  module.exports = function(settings) {
    var Blog;
    Blog = (function() {

      function Blog(settings) {
        this.settings = settings;
        this.blog = settings.mongoose.model('blog');
        this.post = settings.mongoose.model('post');
        this.helper = (require(__dirname + '/helper'))();
        this.category = (require(__dirname + '/category'))(settings);
        this.map = settings.mongoose.model('map');
      }

      Blog.prototype.create = function(obj) {
        var promise,
          _this = this;
        promise = new this.settings.Promise();
        this.blog.findOne({
          url: this.settings.url
        }, function(err, data) {
          var blog;
          obj.title = obj.title.trim();
          if (data !== null) {
            return _this._post({
              id: data._id,
              post: obj
            }, function(data) {
              return promise.resolve(data);
            });
          } else {
            blog = new _this.blog({
              url: _this.settings.url,
              title: _this.settings.title,
              updated: _this.settings.updated
            });
            return blog.save(function(err, data) {
              if (err === null) {
                return _this._post({
                  id: data._id,
                  posts: obj
                }, function(data) {
                  return promise.resolve(data);
                });
              }
            });
          }
        });
        return promise;
      };

      Blog.prototype.find = function(format) {
        var promise,
          _this = this;
        promise = new this.settings.Promise();
        this.blog.findOne({
          url: this.settings.url
        }, function(err, data) {
          var blog;
          if (err !== null) {
            throw err.message;
          }
          blog = data;
          return _this.post.find({
            id: blog._id
          }).sort({
            date: -1
          }).exec(function(err, data) {
            var body, post, posts, _i, _len;
            posts = [];
            for (_i = 0, _len = data.length; _i < _len; _i++) {
              post = data[_i];
              if (format === 'encode') {
                body = _this.settings.format(post.body);
                post.body = _this.helper.htmlEscape(body);
              } else if (format === 'sanitize') {
                post.body = _this.settings.format(post.body);
              }
              posts.push(post);
            }
            return promise.resolve({
              id: blog._id,
              title: blog.title,
              updated: blog.updated,
              posts: posts
            });
          });
        });
        return promise;
      };

      Blog.prototype.findMostRecent = function() {
        var promise,
          _this = this;
        promise = new this.settings.Promise();
        this.blog.findOne({
          url: this.settings.url
        }, function(err, data) {
          return _this.post.find({
            id: data._id
          }).sort({
            date: -1
          }).limit(5).exec(function(err, data) {
            var post, recent, _i, _len;
            recent = [];
            for (_i = 0, _len = data.length; _i < _len; _i++) {
              post = data[_i];
              recent.push({
                title: post.title,
                permaLink: post.permaLink
              });
            }
            return promise.resolve(recent);
          });
        });
        return promise;
      };

      Blog.prototype.findPost = function(permaLink) {
        var promise,
          _this = this;
        promise = new this.settings.Promise;
        this.blog.findOne({
          url: this.settings.url
        }, function(err, data) {
          var blog;
          blog = data;
          return _this.post.findOne({
            id: blog._id,
            permaLink: permaLink
          }, function(err, data) {
            if (err !== null || data === null) {
              promise.resolve(null);
              return;
            }
            data.body = _this.settings.format(data.body);
            return promise.resolve({
              title: blog.title,
              post: data
            });
          });
        });
        return promise;
      };

      Blog.prototype.hasPostMoved = function(permaLink) {
        var promise;
        promise = new this.settings.Promise;
        this.map.findOne({
          permaLink: permaLink
        }, function(err, data) {
          return promise.resolve(data);
        });
        return promise;
      };

      Blog.prototype.findPostById = function(id, callback) {
        var _this = this;
        return this.post.findOne({
          _id: id
        }, function(err, data) {
          return callback(data);
        });
      };

      Blog.prototype.updatePost = function(post) {
        var promise,
          _this = this;
        promise = new this.settings.Promise;
        this.post.findOne({
          _id: post.id
        }, function(err, data) {
          var category, previous, _i, _len, _ref;
          previous = {
            id: data._id,
            title: data.title,
            permaLink: data.permaLink,
            body: data.body
          };
          data.body = post.body;
          data.title = post.title;
          data.permaLink = _this.helper.linkify(post.title);
          data.categories = post.categories;
          if (data.categories) {
            _ref = data.categories;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              category = _ref[_i];
              _this.category.refresh(category);
            }
          }
          return data.save(function(err, data) {
            var permaLink;
            post = data;
            permaLink = previous.permaLink;
            return _this.map.findOne({
              permaLink: permaLink
            }, function(err, data) {
              var map;
              if (data === null) {
                map = new _this.map;
                map.permaLink = permaLink;
              } else {
                map = data;
              }
              map.content = JSON.stringify({
                id: post.id,
                title: post.title,
                permaLink: post.permaLink,
                body: post.body
              });
              return map.save(function(err, data) {
                if (err === null) {
                  return promise.resolve(post);
                } else {
                  throw err;
                }
              });
            });
          });
        });
        return promise;
      };

      Blog.prototype.deletePost = function(id, callback) {
        var _this = this;
        return this.post.remove({
          _id: id
        }, function() {
          _this.map.remove(function() {});
          return callback();
        });
      };

      Blog.prototype["delete"] = function(callback) {
        var _this = this;
        this.blog.find({
          url: this.settings.url
        }, function(err, data) {
          var blog, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            blog = data[_i];
            _results.push(_this.post.remove({
              id: blog._id
            }, function() {
              return _this.blog.remove({
                url: _this.settings.url
              });
            }));
          }
          return _results;
        });
        this.category.clear(function() {});
        return this.map.remove(function() {
          return callback();
        });
      };

      Blog.prototype._post = function(obj, callback) {
        var post, postSchema,
          _this = this;
        post = obj.post;
        postSchema = new this.post({
          id: obj.id,
          title: post.title,
          permaLink: this.helper.linkify(post.title),
          author: post.author,
          body: post.body,
          publish: 1,
          date: new Date(),
          categories: post.categories
        });
        return postSchema.save(function(err, data) {
          var category, _i, _len, _ref;
          if (err !== null) {
            callback(err.message);
          }
          if (data.categories) {
            _ref = data.categories;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              category = _ref[_i];
              _this.category.refresh(category, function(id) {});
            }
          }
          callback(data);
        });
      };

      return Blog;

    })();
    return new Blog(settings);
  };

}).call(this);
