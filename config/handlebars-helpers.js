const moment = require('moment')

module.exports = {
  ifCond: function(a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  },
  index: function(i, options) {
    return i + 1
  },
  moment: function(a) {
    return moment(a).fromNow()
  }
}
