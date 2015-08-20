var parser = require('../index');

describe('Test open graph parser', function () {
  describe('Test normal document', function () {
    it('should be ok', function () {
      var html = '<html xmlns:og="http://opengraphprotocol.org/schema/"><head><meta property="og:title" content="test"/></head><body></body></html>';
      var og = parser.parseFromString(html);

      expect(og.hasOwnProperty('title')).toBe(true);
      expect(og.title.title).toBe('test');
    });
  });

  describe('Test constructed array', function () {
    it('should be ok', function () {
      var html = '<html xmlns:og="http://opengraphprotocol.org/schema/">\
        <head>\
          <meta property="og:image" content="0"/>\
          <meta property="og:image" content="1"/>\
        </head><body></body></html>';
      var og = parser.parseFromString(html);

      expect(og.hasOwnProperty('image')).toBe(true);
      expect(og.image.length).toBe(2);

      for (var i = 0; i < og.image.length; i++) {
        expect(og.image[i].image).toBe(i.toString());
      }
    });
  });

  describe("Test complex constructed array", function () {
    it('should be ok', function () {
      var html = '<html xmlns:og="http://opengraphprotocol.org/schema/">\
        <head>\
          <meta property="og:image" content="0"/>\
          <meta property="og:image:height" content="400"/>\
          <meta property="og:image:width" content="400"/>\
          <meta property="og:image" content="1"/>\
          <meta property="og:image" content="2"/>\
          <meta property="og:image:width" content="400"/>\
        </head><body></body></html>';
      var og = parser.parseFromString(html);

      expect(og.hasOwnProperty('image')).toBe(true);
      expect(og.image.length).toBe(3);

      expect(og.image[0].image).toBe('0');
      expect(og.image[0].height).toBe('400');
      expect(og.image[0].width).toBe('400');

      expect(og.image[1].image).toBe('1');

      expect(og.image[2].image).toBe('2');
      expect(og.image[2].width).toBe('400');
    });
  });

  describe("Test read from file", function () {
    it('should be ok', function (done) {
      var path = __dirname + '/test.html';
      parser.parseFromFile(path, function (err, og) {
        expect(og.hasOwnProperty('image')).toBe(true);
        expect(og.image.length).toBe(4);

        expect(og.image[0].image).toBe('0');
        expect(og.image[0].height).toBe('400');
        expect(og.image[0].width).toBe('400');

        expect(og.image[1].image).toBe('1');

        expect(og.image[2].image).toBe('2');
        expect(og.image[2].width).toBe('400');

        expect(og.image[3].image).toBe('3');
        expect(og.image[3].height).toBe('400');
        expect(og.image[3].width).toBe('400');
        done();
      });
    });
  });

  describe("Test read from url", function () {
    it('should be ok', function (done) {
      parser.parseFromUrl('http://www.zappos.com/timberland-pro-titan-safety-toe-oxford', function (err, og) {
        expect(og.hasOwnProperty('title')).toBe(true);
        done();
      });
    });
  });
});
