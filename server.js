const express = require('express');
const cors = require('cors');
const problemRoutes = require('./src/routes/problemRoutes');
const practiceRoutes = require('./src/routes/practiceRoutes');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 内存存储
global.problems = [];
global.practices = [];

// API路径前缀
const API_PREFIX = '/api';

// 路由
app.use(`${API_PREFIX}/problem`, problemRoutes);
app.use(`${API_PREFIX}/practice`, practiceRoutes);

// 添加路由日志中间件
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// 404处理
app.use((req, res) => {
    console.log(`404 Not Found: ${req.method} ${req.path}`);
    res.status(404).json({
        code: 404,
        message: `Path not found: ${req.method} ${req.path}`
    });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        code: 500,
        message: err.message || 'Something went wrong!'
    });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Available routes:`);
    console.log(`- POST ${API_PREFIX}/problem/generate`);
    console.log(`- GET ${API_PREFIX}/problem/list`);
    console.log(`- POST ${API_PREFIX}/practice/start`);
    console.log(`- POST ${API_PREFIX}/practice/submit`);
    console.log(`- POST ${API_PREFIX}/practice/finish`);
}); 