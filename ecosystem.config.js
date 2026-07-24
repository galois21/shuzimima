// PM2 启动配置
// 用法: cd 到本目录后  pm2 start ecosystem.config.js && pm2 save
module.exports = {
  apps: [
    {
      name: 'shuzimima',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
        PORT: 3300,
        HOST: '0.0.0.0'
      }
    }
  ]
};
