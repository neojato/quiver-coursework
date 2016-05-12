var ENV = {
  "test": "environment values go here"
};

var hasOwnProperty = Object.prototype.hasOwnProperty;
exports.get = function(path, fallback) {
  path = path.toString();
  var segments = path.split('.');
  var cur = ENV;
  for (var i = 0; i < segments.length; i++) {
    if (hasOwnProperty.call(cur, segments[i])) {
      cur = cur[segments[i]];
    } else {
      if (typeof fallback !== 'undefined') {
        console.error('Using fallback for "' + path + '" environment value');
        return fallback;
      }
      throw new Error('Environment value "' + path + '" is not configured.');
    }
  }
  return cur;
};