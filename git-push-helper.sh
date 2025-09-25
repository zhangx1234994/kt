#!/bin/bash

# GitHub推送助手脚本
# 使用方法: ./git-push-helper.sh YOUR_GITHUB_USERNAME YOUR_PERSONAL_ACCESS_TOKEN

if [ $# -ne 2 ]; then
    echo "使用方法: $0 GitHub用户名 个人访问令牌"
    echo "请访问 https://github.com/settings/tokens 生成个人访问令牌"
    exit 1
fi

USERNAME=$1
TOKEN=$2

# 临时设置远程仓库URL，包含认证信息
git remote set-url origin https://${USERNAME}:${TOKEN}@github.com/zhangx1234994/kt.git

# 尝试推送
echo "正在推送到GitHub..."
git push -u origin main

# 恢复原始URL（不包含认证信息）
git remote set-url origin https://github.com/zhangx1234994/kt.git

echo "推送完成！"