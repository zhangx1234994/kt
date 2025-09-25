#!/bin/bash

# 产品印刷图提取工具启动脚本

echo "=== 启动产品印刷图提取工具 ==="

# 检查.env文件是否存在
if [ ! -f ".env" ]; then
    echo "错误: .env 文件不存在，请先配置环境变量"
    echo "可以复制 .env.example 文件为 .env 并填入您的API密钥"
    exit 1
fi

# 检查node_modules是否存在
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
fi

# 创建public目录（如果不存在）
if [ ! -d "public" ]; then
    echo "创建public目录..."
    mkdir -p public
fi

# 复制前端文件到public目录
echo "复制前端文件到public目录..."
if [ -f "index.html" ]; then
    cp index.html public/
fi

if [ -f "styles.css" ]; then
    cp styles.css public/
fi

if [ -f "script.js" ]; then
    cp script.js public/
fi

# 启动应用
echo "启动应用..."
npm start