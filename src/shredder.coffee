# Main entry point, takes a Redis client

module.exports = (db) ->
  # Return a key for a term/id
  key:
    word: (word) -> "w." + word
    doc: (id) -> "d." + id
  
  # Normalize word, lower-case alnum only
  normalize: (word) ->
    word.toLowerCase().replace /[^\w]/g, ""
  
  # Tokenize, normalize and make words into keys
  tokenize: (doc) ->
    # TODO: Add stemming
    (@key.word(@normalize(word)) for word in doc.split /\s+/)
  
  # Add document (documents can be objects or strings)
  addDocument: (doc, next) ->
    db.incr "next.doc", (err, id) =>
      return next err if err

      # Store objects as Redis hashes
      f = if typeof doc is "string" then db.set else db.hmset

      f.call db, @key.doc(id), doc, (err) ->
        return next err if err
    
        next null, id
  
  # Index document under supplied id
  indexDocument: (doc, id, next) ->
    words = @tokenize doc
    
    # Recurse through the words
    addWord = (word) ->
      db.sadd word, id, (err) ->
        return next err if err

        word = words.shift()
        # Continue with next word
        if word then addWord word
        # or pass continuation
        else next()

    # Start the loop
    addWord words.shift()
  
  # Index documents
  index: (docs, next) ->
    # Documents can be an array
    if docs instanceof Array
      # Recurse through the documents
      index = (doc) =>
        # Add the document
        @addDocument doc, (err, id) =>
          return next err if err
          
          # And index with it's new id
          @indexDocument doc, id, (err) ->
            return next err if err

            doc = docs.shift()
            # Continue with next document
            if doc then index doc
            # Or pass continuation
            else next()

      # Start the loop
      index docs.shift()

    # Documents is assumed to be an object with {id: document}
    else
      # Get the ids
      ids = Object.keys docs

      # Recurse through documents
      index = (id) =>
        # Index the document under it's supplied id
        @indexDocument docs[id], id, (err) ->
          return next err if err

          id = ids.shift()
          # Continue with the next document
          if id then index id
          # Or pass continuation
          else next()

      # Start the loop
      index ids.shift()
  
  # Search for the supplied term and return requested fields
  search: (term, fields..., next) ->
    if fields.length
      # If we should fetch fields, tell Redis to return them
      get = (@key.doc("*") + "->" + field for field in fields)
      get = ["get"].concat(get.join(" get ").split(" "))
    else
      # Otherwise, return the whole document
      get = ["get", @key.doc("*")]

    # Build parameters for Redis call
    params = [
      # Normalize the search term
      @key.word(@normalize(term))
      # No sorting needed
      "by", "nosort"
      # Get the document id first
      "get", "#"
    ]
    # Add field getters
    params = params.concat get
    # Add callback
    params.push (err, res) =>
      return next err if err

      @_mapSortResults res, fields..., next

    # Make the call
    db.sort.apply db, params

  # Map a result array from redis sort into an object keyed on id
  _mapSortResults: (res, fields..., next) ->
    result = {}
    # Iterate through all ids
    while id = res.shift()
      if fields.length
        # If should map fields, build an object with {field: value}
        item = {}
        item[field] = res.shift() for field in fields
        result[id] = item
      else
        # Otherwise, get the whole document under each id
        result[id] = res.shift()
    
    # Pass continuation
    next null, result
