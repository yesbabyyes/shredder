(function() {
  var db, module;
  var __slice = Array.prototype.slice;
  db = {};
  module = require("../lib/shredder")(db);
  exports.keyWord = function(test) {
    test.expect(1);
    test.equal(module.key.word("foo"), "w.foo");
    return test.done();
  };
  exports.keyDoc = function(test) {
    test.expect(1);
    test.equal(module.key.doc("foo"), "d.foo");
    return test.done();
  };
  exports.normalize = function(test) {
    test.expect(1);
    test.equal(module.normalize("-wOrd+'1"), "word1");
    return test.done();
  };
  exports.tokenize = function(test) {
    var _key_word, _normalize;
    test.expect(1);
    _normalize = module.normalize;
    _key_word = module.key.word;
    module.normalize = function(word) {
      return word;
    };
    module.key.word = function(word) {
      return word;
    };
    test.deepEqual(module.tokenize("foo \nbar  baz"), ["foo", "bar", "baz"]);
    module.normalize = _normalize;
    module.key.word = _key_word;
    return test.done();
  };
  exports.addDocument = function(test) {
    var aDoc, cb, _key_doc;
    test.expect(5);
    _key_doc = module.key.doc;
    module.key.doc = function(id) {
      test.equal(id, 2);
      return "keyed";
    };
    db.incr = function(key, next) {
      test.equal(key, "next.doc");
      return next(null, 2);
    };
    db.set = function(key, doc, next) {
      test.equal(key, "keyed");
      test.equal(doc, aDoc);
      return next();
    };
    cb = function(err, id) {
      return test.equal(id, 2);
    };
    aDoc = "foo bar";
    module.addDocument(aDoc, cb);
    module.key.doc = _key_doc;
    return test.done();
  };
  exports.addDocumentObject = function(test) {
    var aDoc, cb, _key_doc;
    test.expect(5);
    _key_doc = module.key.doc;
    module.key.doc = function(id) {
      test.equal(id, 2);
      return "keyed";
    };
    db.incr = function(key, next) {
      test.equal(key, "next.doc");
      return next(null, 2);
    };
    db.hmset = function(key, doc, next) {
      test.equal(key, "keyed");
      test.deepEqual(doc, aDoc);
      return next();
    };
    cb = function(err, id) {
      return test.equal(id, 2);
    };
    aDoc = {
      foo: 1,
      bar: "qux"
    };
    module.addDocument(aDoc, cb);
    module.key.doc = _key_doc;
    return test.done();
  };
  exports.indexDocument = function(test) {
    var aDoc, calls, cb, _tokenize;
    test.expect(6);
    _tokenize = module.tokenize;
    module.tokenize = function(doc) {
      test.equal(doc, aDoc);
      return ["foo", "bar"];
    };
    db.sadd = function(word, id, next) {
      test.equal(id, 1);
      if (calls++ === 0) {
        test.equal(word, "foo");
      } else {
        test.equal(word, "bar");
      }
      return next();
    };
    calls = 0;
    aDoc = "foo bar";
    cb = function() {
      return test.ok(true);
    };
    module.indexDocument(aDoc, 1, cb);
    module.tokenize = _tokenize;
    return test.done();
  };
  exports.search = function(test) {
    var _key_doc, _key_word, _normalize;
    test.expect(1);
    _normalize = module.normalize;
    _key_word = module.key.word;
    _key_doc = module.key.doc;
    module.normalize = function(word) {
      return word;
    };
    module.key.word = function(word) {
      return word;
    };
    module.key.doc = function(id) {
      return id;
    };
    db.sort = function() {
      var params;
      params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return test.deepEqual(params.slice(0, params.length - 1), ["foo", "by", "nosort", "get", "#", "get", "*"]);
    };
    module.search("foo", function() {});
    module.normalize = _normalize;
    module.key.word = _key_word;
    module.key.doc = _key_doc;
    return test.done();
  };
  exports.searchWithFields = function(test) {
    var _key_doc, _key_word, _normalize;
    test.expect(1);
    _normalize = module.normalize;
    _key_word = module.key.word;
    _key_doc = module.key.doc;
    module.normalize = function(word) {
      return word;
    };
    module.key.word = function(word) {
      return word;
    };
    module.key.doc = function(id) {
      return id;
    };
    db.sort = function() {
      var params;
      params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return test.deepEqual(params.slice(0, params.length - 1), ["foo", "by", "nosort", "get", "#", "get", "*->bar", "get", "*->baz"]);
    };
    module.search("foo", "bar", "baz", function() {});
    module.normalize = _normalize;
    module.key.word = _key_word;
    module.key.doc = _key_doc;
    return test.done();
  };
  exports._mapSortResults = function(test) {
    var cb, data;
    test.expect(1);
    data = [1, "foo", 2, "bar"];
    cb = function(err, res) {
      return test.deepEqual(res, {
        1: "foo",
        2: "bar"
      });
    };
    module._mapSortResults(data, cb);
    return test.done();
  };
  exports._mapSortResultsFields = function(test) {
    var cb, data;
    test.expect(1);
    data = [1, "foo", "qux", 2, "bar", "baz"];
    cb = function(err, res) {
      return test.deepEqual(res, {
        1: {
          "a": "foo",
          "b": "qux"
        },
        2: {
          "a": "bar",
          "b": "baz"
        }
      });
    };
    module._mapSortResults(data, "a", "b", cb);
    return test.done();
  };
}).call(this);
