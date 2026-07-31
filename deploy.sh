#!/usr/bin/env bash
set -euo pipefail

MSG="${1:-chore: update H5 archive}"

git add .
git commit -m "$MSG" || echo "No changes to commit"
git push origin master

echo "✅ 已推送。请到 Gitee 仓库开启 Pages，并等待刷新（约 1-3 分钟）"
echo "🔗 https://right_c.gitee.io/yanjiao-ich-archive/"
echo "仓库：https://gitee.com/right_c/yanjiao-ich-archive"
