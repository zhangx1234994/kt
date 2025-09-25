#!/bin/bash

# 产品印刷图提取工具部署脚本

echo "=== 产品印刷图提取工具部署脚本 ==="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: npm 未安装，请先安装 npm"
    exit 1
fi

# 检查.env文件是否存在
if [ ! -f ".env" ]; then
    echo "警告: .env 文件不存在，正在创建示例文件..."
    cp .env.example .env
    echo "请编辑 .env 文件，填入您的火山方舟API密钥"
    echo "编辑完成后，请重新运行此脚本"
    exit 1
fi

# 安装依赖
echo "正在安装依赖..."
npm install

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

# 询问用户是否要使用PM2部署
read -p "是否使用PM2部署? (y/n): " use_pm2

if [ "$use_pm2" = "y" ] || [ "$use_pm2" = "Y" ]; then
    # 检查PM2是否安装
    if ! command -v pm2 &> /dev/null; then
        echo "PM2 未安装，正在安装..."
        npm install -g pm2
    fi

    # 停止现有进程（如果有）
    pm2 stop pod-image-extraction 2>/dev/null || true
    pm2 delete pod-image-extraction 2>/dev/null || true

    # 启动应用
    echo "使用PM2启动应用..."
    pm2 start server.js --name "pod-image-extraction"

    # 保存PM2配置
    pm2 save

    # 设置开机自启
    read -p "是否设置开机自启? (y/n): " setup_startup
    if [ "$setup_startup" = "y" ] || [ "$setup_startup" = "Y" ]; then
        pm2 startup
    fi

    echo "部署完成！"
    echo "应用已通过PM2启动"
    echo "使用 'pm2 list' 查看应用状态"
    echo "使用 'pm2 logs pod-image-extraction' 查看日志"
else
    # 直接使用npm启动
    echo "使用npm启动应用..."
    npm start &
    echo "应用已启动，PID: $!"
fi

echo "=== 部署完成 ==="
echo "请访问 http://localhost:3000 查看应用"