module.exports = {
  devServer: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        ws: true
      }
    }
  }
}