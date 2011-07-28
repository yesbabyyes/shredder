db = {}
module = require("../lib/shredder")(db)

exports.keyWord = (test) ->
  test.expect 1
  test.equal module.key.word("foo"), "w.foo"
  test.done()

exports.keyDoc = (test) ->
  test.expect 1
  test.equal module.key.doc("foo"), "d.foo"
  test.done()

exports.normalize = (test) ->
  test.expect 1
  test.equal module.normalize("-wOrd+'1"), "word1"
  test.done()

exports.tokenize = (test) ->
  test.expect 1
  _normalize = module.normalize
  _key_word = module.key.word
  module.normalize = (word) -> word
  module.key.word = (word) -> word
  
  test.deepEqual module.tokenize("foo \nbar  baz"), ["foo", "bar", "baz"]

  module.normalize = _normalize
  module.key.word = _key_word
  test.done()

exports.addDocument = (test) ->
  test.expect 5
  _key_doc = module.key.doc
  module.key.doc = (id) ->
    test.equal id, 2
    "keyed"
  db.incr = (key, next) ->
    test.equal key, "next.doc"
    next null, 2
  db.set = (key, doc, next) ->
    test.equal key, "keyed"
    test.equal doc, aDoc
    next()
  cb = (err, id) ->
    test.equal id, 2

  aDoc = "foo bar"
  module.addDocument aDoc, cb

  module.key.doc = _key_doc
  test.done()

exports.addDocumentObject = (test) ->
  test.expect 5
  _key_doc = module.key.doc
  module.key.doc = (id) ->
    test.equal id, 2
    "keyed"
  db.incr = (key, next) ->
    test.equal key, "next.doc"
    next null, 2
  db.hmset = (key, doc, next) ->
    test.equal key, "keyed"
    test.deepEqual doc, aDoc
    next()
  cb = (err, id) ->
    test.equal id, 2

  aDoc = {foo: 1, bar: "qux"}
  module.addDocument aDoc, cb

  module.key.doc = _key_doc
  test.done()

exports.indexDocument = (test) ->
  test.expect 6
  _tokenize = module.tokenize
  module.tokenize = (doc) ->
    test.equal doc, aDoc
    ["foo", "bar"]
  db.sadd = (word, id, next) ->
    test.equal id, 1
    if calls++ is 0
      test.equal word, "foo"
    else
      test.equal word, "bar"
    next()

  calls = 0
  aDoc = "foo bar"
  cb = -> test.ok true
  module.indexDocument aDoc, 1, cb

  module.tokenize = _tokenize
  test.done()

exports.search = (test) ->
  test.expect 1

  _normalize = module.normalize
  _key_word = module.key.word
  _key_doc = module.key.doc
  module.normalize = (word) -> word
  module.key.word = (word) -> word
  module.key.doc = (id) -> id
  db.sort = (params...) ->
    test.deepEqual params[0...params.length - 1],
      ["foo", "by", "nosort", "get", "#", "get", "*"]

  module.search "foo", ->

  module.normalize = _normalize
  module.key.word = _key_word
  module.key.doc = _key_doc
  test.done()

exports.searchWithFields = (test) ->
  test.expect 1

  _normalize = module.normalize
  _key_word = module.key.word
  _key_doc = module.key.doc
  module.normalize = (word) -> word
  module.key.word = (word) -> word
  module.key.doc = (id) -> id
  db.sort = (params...) ->
    test.deepEqual params[0...params.length - 1],
      ["foo", "by", "nosort", "get", "#", "get", "*->bar", "get", "*->baz"]

  module.search "foo", "bar", "baz", ->

  module.normalize = _normalize
  module.key.word = _key_word
  module.key.doc = _key_doc
  test.done()

exports._mapSortResults = (test) ->
  test.expect 1

  data = [1, "foo", 2, "bar"]
  cb = (err, res) ->
    test.deepEqual res, {1: "foo", 2: "bar"}

  module._mapSortResults data, cb

  test.done()

exports._mapSortResultsFields = (test) ->
  test.expect 1

  data = [1, "foo", "qux", 2, "bar", "baz"]
  cb = (err, res) ->
    test.deepEqual res, {1: {"a": "foo", "b": "qux"}, 2: {"a": "bar", "b": "baz"}}

  module._mapSortResults data, "a", "b", cb

  test.done()
