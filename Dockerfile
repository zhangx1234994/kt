FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 创建public目录（如果不存在）
RUN mkdir -p public && \
    if [ -f index.html ]; then cp index.html public/; fi && \
    if [ -f styles.css ]; then cp styles.css public/; fi && \
    if [ -f script.js ]; then cp script.js public/; fi

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]