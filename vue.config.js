const path = require('path');

module.exports = {
    // 输出目录设置为后端的public目录
    outputDir: path.resolve(__dirname, '../backend/public'),

    // 开发服务器配置
    devServer: {
        proxy: {
            '/api': {
                target: 'http://localhost:8081',
                changeOrigin: true
            }
        }
    },

    // 确保资源路径正确
    publicPath: '/',

    // 生产环境配置
    productionSourceMap: false
} 