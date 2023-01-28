const path = require('path')

function resolve(dir) {
  return path.join(__dirname, '.', dir)
}

module.exports = {
  context: path.resolve(__dirname, './'),
  resolve: {
    alias: {
      "@": resolve('example'),
      "r3f-third-person": resolve('src'),
    },
  },
}
