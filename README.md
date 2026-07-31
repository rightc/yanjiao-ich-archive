# 燕郊非遗田野档案 · H5 正式交付 v1.0

「畿辅文薪·匠心永续」数字化调研实践团  
指导教师：赵鹏凯 · 2026 暑期

**本版用途：团队互动评审 + 答辩扫码展示**

---

## 快速开始

```bash
cd /Users/lizhiwu/Desktop/H5-v2
python3 -m http.server 8080
```

打开 http://localhost:8080 ，滑到「团队」页即可表态与留言。

更多协作说明见：[TEAM.md](./TEAM.md)  
交付验收见：[CHECKLIST.md](./CHECKLIST.md)

---

## 目录

```text
H5-v2/
├── index.html          # 档案首页（含互动区）
├── qrcode.html         # A4 二维码打印页
├── TEAM.md             # 团队协作手册
├── CHECKLIST.md        # 正式交付清单
├── deploy.sh
├── css/style.css
├── js/config.js        # ★ 优先改这里
├── js/app.js
├── images/ videos/ files/
```

---

## 团队互动说明

1. **快速表态**：4 个标签单选，结果保存在本机  
2. **留言板**：昵称 + 内容，本机列表展示（带示例留言）  
3. **复制链接**：发给队友打开同一档案  
4. **跨设备正式反馈**：在 `js/config.js` 配置 `links.feedbackForm`

---

## 改配置

编辑 `js/config.js`：标题、团队、数据、外链、引语、互动文案、二维码文案。

---

## 部署

1. 推送仓库 → GitHub Pages（或学校服务器）  
2. 回填 `links.siteUrl`  
3. 打开 `qrcode.html` 打印  

```bash
./deploy.sh "chore: release formal v1.0"
```

---

## 版本

| 项 | 值 |
|----|----|
| 版本号 | 1.0.0 |
| 状态 | 正式交付 · 可供团队互动评审 |
| 配置入口 | `js/config.js` |
