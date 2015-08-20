/**
 * Core
 */

var fs = require('fs');
var http = require('http');
var https = require('https');
var parse = require('url').parse;
var cheerio = require('cheerio');

var schema = 'http://opengraphprotocol.org/schema/';

var generateOpenGraph = function (data) {
  var $ = cheerio.load(data);
  var meta = $('meta');
  var og = {};

  if (meta.length !== 0) {
    var i = 0;
    var metaLength = meta.length;

    for (i = 0; i < metaLength; i++) {
      var ele = meta[i];

      var attribs = ele.attribs;
      var property = attribs.property;

      if (property === undefined) {
        continue;
      }

      var content = attribs.content;

      var tmp = property.split(':');

      /**
       * Filter the invalid property.
       */
      if (tmp[0] !== 'og') {
        continue;
      }

      var length = tmp.length;

      if (length !== 3 && length !== 2) {
        continue;
      }

      var key = tmp[1];
      var subKey = tmp[2];

      /**
       * If the property like `og:foo:bar`
       * the `content` will be the value of `bar`.
       */
      if (subKey !== undefined) {
        if (og.hasOwnProperty(key)) {
          if (!Array.isArray(og[key])) {
            og[key][subKey] = content;
          } else {
            var tmpLength = og[key].length;
            og[key][tmpLength-1][subKey] = content;
          }
        }
      } else {
        if (!og.hasOwnProperty(key)) {
          og[key] = {}
          og[key][key] = content;
        } else {
          if (!Array.isArray(og[key])) {
            var current = og[key];
            og[key] = [current];
          }

          var tmpObj = {};
          tmpObj[key] = content;
          og[key].push(tmpObj);
        }
      }
    }
  }
  return og;
};

/**
 * Parse from given content.
 * @param {String} content
 */
exports.parseFromString = function (content) {
  return generateOpenGraph(content);
};

/**
 * Parse from given filename.
 * @param {String} filename
 */
exports.parseFromFile = function (filename, callback) {
  fs.readFile(filename, function (err, buf) {
    if (err) {
      throw err;
    }

    var og = generateOpenGraph(buf.toString());
    return callback(null, og);
  });
};

/**
 * Parse from given url.
 * @param {String} url
 */
exports.parseFromUrl = function (url, callback) {
  var requests = http;
  if (url.indexOf('https') !== -1) {
    requests = https;
  }
  var options = parse(url);
  var req = requests.get(options, function (res) {
    var bufs = [];
    var length = 0;
    res.on('error', function (err) {
      throw err;
    });

    res.on('data', function (chunk) {
      bufs.push(chunk);
      length += chunk.length;
    });

    res.on('end', function () {
      var data = Buffer.concat(bufs, length);
      var og = generateOpenGraph(data.toString());
      return callback(null, og);
    });
  });
  req.end();
};
