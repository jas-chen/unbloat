const path = require('path');

module.exports = require('./lib/unbloat')({
  dest: path.join(__dirname, 'build'),
});
