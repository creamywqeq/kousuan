const express = require('express');
const cors = require('cors');
const problemRoutes = require('./src/routes/problemRoutes');
const practiceRoutes = require('./src/routes/practiceRoutes');
const fileRoutes = require('./src/routes/fileRoutes');

const app = express();

// CORS 配置
const corsOptions = {
    origin: 'http://localhost:8081',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

// 应用 CORS 中间件
app.use(cors(corsOptions));

// 处理预检请求
app.options('*', cors(corsOptions));

// 解析 JSON
app.use(express.json());

// 添加请求日志
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    
    // 添加响应日志
    const oldSend = res.send;
    res.send = function(data) {
        console.log('Response:', data);
        oldSend.apply(res, arguments);
    };
    
    next();
});

// 内存存储
global.problems = [];
global.practices = [];

// API路径前缀
const API_PREFIX = '/api';

// 路由
app.use(`${API_PREFIX}/problem`, problemRoutes);
app.use(`${API_PREFIX}/practice`, practiceRoutes);
app.use(`${API_PREFIX}/file`, fileRoutes);

// 测试路由
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
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
    console.error('Error:', err);
    res.status(500).json({
        code: 500,
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});

// 在路由之前添加
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        path: req.path,
        body: req.body,
        query: req.query
    });
    next();
});

const PORT = process.env.PORT || 8083;

// 启动服务器
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Available routes:');
    console.log(`- GET /api/test`);
    console.log(`- POST ${API_PREFIX}/problem/generate`);
    console.log(`- GET ${API_PREFIX}/problem/list`);
    console.log(`- POST ${API_PREFIX}/practice/start`);
    console.log(`- POST ${API_PREFIX}/practice/submit`);
    console.log(`- POST ${API_PREFIX}/practice/finish`);
    console.log(`- GET ${API_PREFIX}/practice/history`);
    console.log(`- GET ${API_PREFIX}/practice/wrong-problems`);
    console.log(`- POST ${API_PREFIX}/practice/remove-wrong-problem`);
    console.log(`- POST ${API_PREFIX}/file/import`);
    console.log(`- POST ${API_PREFIX}/file/export`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port.`);
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});