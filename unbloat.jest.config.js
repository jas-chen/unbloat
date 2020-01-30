const path = require('path');

module.exports = require('./lib/unbloat')({
  output: path.join(__dirname, 'build', 'style.css'),
});
