/**
 * 生命数字密码 — Node.js 静态站点服务
 * 用 Express 托管 public/ 下的前端文件。
 * 启动: npm start   |   PM2: 见 ecosystem.config.js
 */
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3300;
const HOST = process.env.HOST || '0.0.0.0'; // 0.0.0.0 = 允许局域网/公网访问
const PUBLIC_DIR = path.join(__dirname, 'public');

// 静态资源（index.html / calculator.js / data-*.js）
app.use(
  express.static(PUBLIC_DIR, {
    index: 'index.html',
    // 给 .js 返回 module 可用的 MIME，确保 <script type="module"> 正常加载
    setHeaders(res, filePath) {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
      }
    },
  })
);

// 兜底:未知路径返回首页
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`生命数字密码已启动 → http://${HOST}:${PORT}`);
  console.log(`前端目录: ${PUBLIC_DIR}`);
});
