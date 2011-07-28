(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  module.exports = function(db) {
    return {
      key: {
        word: function(word) {
          return "w." + word;
        },
        doc: function(id) {
          return "d." + id;
        }
      },
      normalize: function(word) {
        return word.toLowerCase().replace(/[^\w]/g, "");
      },
      tokenize: function(doc) {
        var word, _i, _len, _ref, _results;
        _ref = doc.split(/\s+/);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          word = _ref[_i];
          _results.push(this.key.word(this.normalize(word)));
        }
        return _results;
      },
      addDocument: function(doc, next) {
        return db.incr("next.doc", __bind(function(err, id) {
          var f;
          if (err) {
            return next(err);
          }
          f = typeof doc === "string" ? db.set : db.hmset;
          return f.call(db, this.key.doc(id), doc, function(err) {
            if (err) {
              return next(err);
            }
            return next(null, id);
          });
        }, this));
      },
      indexDocument: function(doc, id, next) {
        var addWord, words;
        words = this.tokenize(doc);
        addWord = function(word) {
          return db.sadd(word, id, function(err) {
            if (err) {
              return next(err);
            }
            word = words.shift();
            if (word) {
              return addWord(word);
            } else {
              return next();
            }
          });
        };
        return addWord(words.shift());
      },
      index: function(docs, next) {
        var ids, index;
        if (docs instanceof Array) {
          index = __bind(function(doc) {
            return this.addDocument(doc, __bind(function(err, id) {
              if (err) {
                return next(err);
              }
              return this.indexDocument(doc, id, function(err) {
                if (err) {
                  return next(err);
                }
                doc = docs.shift();
                if (doc) {
                  return index(doc);
                } else {
                  return next();
                }
              });
            }, this));
          }, this);
          return index(docs.shift());
        } else {
          ids = Object.keys(docs);
          index = __bind(function(id) {
            return this.indexDocument(docs[id], id, function(err) {
              if (err) {
                return next(err);
              }
              id = ids.shift();
              if (id) {
                return index(id);
              } else {
                return next();
              }
            });
          }, this);
          return index(ids.shift());
        }
      },
      search: function() {
        var field, fields, get, next, params, term, _i;
        term = arguments[0], fields = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), next = arguments[_i++];
        if (fields.length) {
          get = (function() {
            var _j, _len, _results;
            _results = [];
            for (_j = 0, _len = fields.length; _j < _len; _j++) {
              field = fields[_j];
              _results.push(this.key.doc("*") + "->" + field);
            }
            return _results;
          }).call(this);
          get = ["get"].concat(get.join(" get ").split(" "));
        } else {
          get = ["get", this.key.doc("*")];
        }
        params = [this.key.word(this.normalize(term)), "by", "nosort", "get", "#"];
        params = params.concat(get);
        params.push(__bind(function(err, res) {
          if (err) {
            return next(err);
          }
          return this._mapSortResults.apply(this, [res].concat(__slice.call(fields), [next]));
        }, this));
        return db.sort.apply(db, params);
      },
      _mapSortResults: function() {
        var field, fields, id, item, next, res, result, _i, _j, _len;
        res = arguments[0], fields = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), next = arguments[_i++];
        result = {};
        while (id = res.shift()) {
          if (fields.length) {
            item = {};
            for (_j = 0, _len = fields.length; _j < _len; _j++) {
              field = fields[_j];
              item[field] = res.shift();
            }
            result[id] = item;
          } else {
            result[id] = res.shift();
          }
        }
        return next(null, result);
      }
    };
  };
}).call(this);
