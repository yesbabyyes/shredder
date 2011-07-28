shredder
========

`shredder` is a text indexing library for Node.js and Redis.

## Version
0.1.0

## Installation

    npm install shredder

## Usage
    var redisClient = require("redis").createClient(),
        shredder = require("shredder")(redisClient);

    // Index your documents
    shredder.index("foo bar", "bar baz", "baz qux", function(err) {
        // Search for something
        shredder.search("bar", function(err, docs) {
            // Docs: {1: "foo bar", 2: "bar baz"}
        });
    });

## Credits

Linus G Thiel &lt;linus@hanssonlarsson.se&gt;

## Thank you

- [Ryan Dahl](http://github.com/ry) for the awesome Node.js
- [Salvatore Sanfilippo](http://github.com/antirez) for the amazing Redis
- [Caolan McMahon](http://github.com/caolan) for Nodeunit

## License 

(The MIT License)

Copyright (c) 2010 Hansson &amp; Larsson &lt;info@hanssonlarsson.se&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
