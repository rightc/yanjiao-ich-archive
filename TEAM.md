# 团队协作手册 · 正式交付 v1.0

面向：「畿辅文薪·匠心永续」数字化调研实践团  
工程：`/Users/lizhiwu/Desktop/H5-v2`

---

## 1. 这版能做什么

| 能力 | 说明 |
|------|------|
| 浏览档案 | 下滑阅读黄泥烧鸽子 / 景泰蓝 / 对比 / 建议 |
| 快速表态 | 团队页选 4 个态度标签之一（本机记住） |
| 留言板 | 本机保存留言，适合互评；可清空 |
| 复制链接 | 一键复制当前页或正式站点地址发给队友 |
| 工序视频 | 放入 `videos/cloisonne-process.mp4` 后即可播放 |

> 本机留言与表态存在浏览器 `localStorage`，**换手机/清缓存会消失**。答辩现场跨设备收集反馈，请在 `js/config.js` 填 `links.feedbackForm`（问卷星）。

---

## 2. 3 分钟上手

```bash
cd /Users/lizhiwu/Desktop/H5-v2
python3 -m http.server 8080
```

手机或电脑打开：http://localhost:8080  
滑到底部「团队」→ 试一下表态 + 留言 + 复制链接。

---

## 3. 谁改什么（分工建议）

| 角色 | 主要文件 | 做什么 |
|------|----------|--------|
| 项目统筹 | `js/config.js` | 核对团队名、指导老师、数据、外链 |
| 田野 A / B | `js/config.js` 引语 + 素材图 | 替换访谈金句与现场图 |
| 影像组 | `videos/` | 放工序视频 |
| 写作组 | `files/report-summary.pdf` | 报告摘要 PDF |
| 设计 / 编程 | `css/` `index.html` | 仅在必要时改版式 |

**原则：能改 `config.js` 就不要动 HTML。**

---

## 4. 素材文件名（必须一致）

```text
images/pigeon-cover.jpg
images/pigeon-shop.jpg
images/cloisonne-poster.jpg
images/share-cover.jpg        # 可选，微信分享
videos/cloisonne-process.mp4
files/report-summary.pdf
```

---

## 5. 互动评审怎么开

1. 一人本机起服务，或部署到 GitHub Pages / 学校服务器  
2. 群里发链接（或打印 `qrcode.html`）  
3. 队友打开 → 快速表态 → 留言（写清组别昵称）  
4. 统筹收截图 / 导出问卷星结果，写进答辩反思

---

## 6. 上线前必改

打开 `js/config.js`：

1. `links.siteUrl` → 正式网址  
2. `links.documentaryUrl` → 纪录片链接  
3. `links.feedbackForm` → 问卷星（可选但推荐）  
4. 确认 `stats` 与答辩报告一致  

然后打开 `qrcode.html` 打印 A4。

---

## 7. 常见问题

**留言提交没反应？**  
确认用 `http://localhost` 打开，不要直接双击 `index.html`（部分浏览器会限制存储）。

**想恢复示例留言？**  
点「清空本机留言」后刷新；若仍为空，删除浏览器该站点数据再刷新即可重新载入示例。

**问卷星优先还是本机留言？**  
只要 `feedbackForm` 非空，点「提交留言」就会跳转问卷星。
