# 生命数字密码 · 生命蓝图解析

基于毕达哥拉斯占数学的生命数字计算与解读网站。输入出生日期后，自动计算命数、天赋数、生日数、先天三阶段、限制数、流年、九宫图，并结合结构化 JSON 数据展示多维度解读。

> 仅供个人参考与学习研究。站内解读为结构化整理与摘要化表达，不用于替代专业建议。

## 当前版本

当前稳定版本为回滚后的数据增强版：

```text
6ec33d5 feat: 接入全部 5 个新维度板块（星座/健康/婚配/色彩水晶/人生周期）
```

该版本保留深色烫金 UI、结构化 JSON 数据驱动，以及 5 个扩展维度；不包含后续被回滚的 fear / tarot / innate 加厚版本。

## 功能

输入「年-月-日」后，自动计算并展示：

| 项目 | 说明 |
|------|------|
| **命数（命运数）** | 出生年月日所有数字相加至个位，保留大师数 11/22/33 |
| **天赋数** | 命数计算过程中的中间数，如 40/4，代表潜能方向 |
| **生日数** | 出生日对应的天性人格、行为模式与提醒 |
| **先天数 · 三阶段** | 出生月 / 日 / 年对应启蒙期、壮年期、晚年期的数字阶段 |
| **限制数** | 出生月 + 日推导出的早期限制模式 |
| **流年数** | 当前流年与未来 9 年循环时间轴 |
| **频率最多数** | 生日数字中出现 ≥3 次的高频数字能量 |
| **生日九宫图** | 洛书九宫布局、主副线连线、空缺数与补足建议 |
| **星座数字** | 星座与数字能量的对应解读 |
| **色彩 / 水晶 / 方位** | 按命数给出辅助色彩、水晶与方位建议 |
| **数字婚配** | 按命数展示适配关系、挑战关系与相处提醒 |
| **健康倾向** | 按命数与流年给出身心状态提醒 |
| **人生周期** | 九年循环、人生章节与年龄节点提示 |

## 技术栈

- **前端**：原生 HTML / CSS / JavaScript，浏览器 ES Modules，无框架、无打包器
- **数据**：`public/data/*.json` 结构化数据，前端通过 `fetch` 加载
- **计算**：`public/calculator.js` 负责命数、天赋数、生日数、限制数、流年、九宫图、星座等核心计算
- **界面**：深色烫金神秘风，CSS 设计令牌驱动，含生成动画、分享卡、折叠板块与流年时间轴
- **服务**：Node.js + Express，仅用于托管 `public/` 静态文件
- **进程**：PM2 守护
- **线上入口**：宝塔 Nginx 反向代理到 `127.0.0.1:3300`

## 目录结构

```text
shuzimima/
├── public/
│   ├── index.html              # 页面结构
│   ├── styles.css              # 深色烫金设计系统与响应式样式
│   ├── app.js                  # 数据加载与 UI 渲染逻辑
│   ├── calculator.js           # 生命数字计算逻辑
│   └── data/
│       ├── numbers.json        # 数字 1-9 + 11/22/33 基础特质
│       ├── lifePath.json       # 命数详细解读
│       ├── birthDay.json       # 生日数 1-31 解读
│       ├── talent.json         # 天赋数组合解读
│       ├── restriction.json    # 限制数解读
│       ├── personalYear.json   # 流年 1-9 解读
│       ├── grid.json           # 九宫图、连线、空缺数
│       ├── zodiac.json         # 星座数字解读
│       ├── colorCrystal.json   # 色彩 / 水晶 / 方位
│       ├── compatibility.json  # 数字婚配
│       ├── health.json         # 健康倾向与流年健康提醒
│       └── cycles.json         # 九年循环与人生周期
├── server.js                   # Express 静态服务
├── package.json
├── ecosystem.config.js         # PM2 配置，线上监听 127.0.0.1:3300
├── deploy.sh                   # 本地一键发布到 VPS
├── .deploy.env.example         # 部署配置示例，不含真实服务器信息
└── .gitignore
```

## 本地运行

当前推荐本地目录：

```bash
cd /Users/tangjianren/Github/shuzimima
```

启动方式：

```bash
npm install
HOST=127.0.0.1 PORT=3300 node server.js
```

访问：

```text
http://localhost:3300
```

如果只是临时预览，也可以使用静态服务器：

```bash
cd public
python3 -m http.server 8080
```

但正式本地调试建议使用 Node/Express，与线上行为保持一致。

## 部署到 VPS

线上部署路径：

```text
/www/wwwroot/shuzimima
```

线上进程：

```text
PM2 process: shuzimima
```

线上监听：

```text
127.0.0.1:3300
```

外部访问由宝塔 Nginx 反向代理到：

```text
http://127.0.0.1:3300
```

> 不需要、也不建议开放 3300 外网端口。

### 本地一键部署

真实 VPS 信息不入库，放在本地 `.deploy.env`：

```bash
cp .deploy.env.example .deploy.env
# 然后填入 VPS / REMOTE_DIR / KEY
```

之后本地执行：

```bash
./deploy.sh
```

脚本会自动完成：

1. `rsync --delete` 同步本地代码到 VPS
2. 按需 `npm install`
3. `pm2 reload ecosystem.config.js --update-env`
4. 在 VPS 内部自检 `http://127.0.0.1:3300/`

## 运维常用命令

在 VPS 上：

```bash
cd /www/wwwroot/shuzimima
pm2 status
pm2 logs shuzimima
pm2 restart shuzimima
curl -sI http://127.0.0.1:3300/
```

宝塔 Nginx 代理缓存目录：

```text
/www/server/nginx/proxy_cache_dir
```

如果线上域名显示旧页面，可以清理该目录后 reload nginx。

## 数据与版权边界

- 项目使用结构化 JSON 数据驱动解读内容。
- 解读内容用于个人学习、研究和自用展示。
- 不在公开仓库中保存 VPS 密钥、IP 配置文件或其它敏感信息。
- 不建议将完整书籍原文逐字搬运到站点或公开仓库。

## 已验证示例

计算逻辑已用以下日期做过验证：

| 日期 | 结果示例 |
|------|----------|
| 1976-07-06 | 命数 9 |
| 1993-12-25 | 命数 5 |
| 1984-10-29 | 命数 7 |
| 1982-04-05 | 命数 11 |
| 1988-05-09 | 命数 4 |

大师数 11 / 22 / 33 在命数计算中保留，不继续相加。
