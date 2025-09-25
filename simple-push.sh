#!/bin/bash

# 简单的GitHub推送脚本
# 使用方法: ./simple-push.sh

echo "=== GitHub代码推送助手 ==="
echo ""

# 获取GitHub用户名
read -p "请输入您的GitHub用户名: " username

# 获取个人访问令牌
read -s -p "请输入您的GitHub个人访问令牌(PAT): " token
echo ""

# 设置远程仓库URL（包含认证信息）
echo "正在设置远程仓库..."
git remote set-url origin https://${username}:${token}@github.com/zhangx1234994/kt.git

# 尝试推送
echo "正在推送到GitHub..."
git push -u origin main

# 检查推送结果
if [ $? -eq 0 ]; then
    echo "✅ 推送成功！"
    
    # 恢复原始URL（不包含认证信息）
    git remote set-url origin https://github.com/zhangx1234994/kt.git
    echo "已恢复原始远程仓库URL"
else
    echo "❌ 推送失败，请检查用户名和令牌是否正确"
    
    # 恢复原始URL（不包含认证信息）
    git remote set-url origin https://github.com/zhangx1234994/kt.git
    echo "已恢复原始远程仓库URL"
fi