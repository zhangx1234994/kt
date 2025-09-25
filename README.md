# 产品印刷图提取工具 - Demo

这是一个基于火山方舟Doubao-Seedream-4.0模型的产品印刷图提取工具的演示版本。

## 功能特点

- 上传产品图片
- 输入提示词描述想要的图像效果
- 使用火山方舟Doubao-Seedream-4.0模型生成高质量图片
- 支持生成多张图片
- 支持不同尺寸的图片输出
- 支持下载生成的图片

## 技术栈

- 前端：HTML, CSS, JavaScript
- 后端：Node.js, Express
- API：火山方舟Doubao-Seedream-4.0模型

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制`.env.example`文件为`.env`，并填入您的火山方舟API密钥：

```bash
cp .env.example .env
```

然后编辑`.env`文件，填入您的API密钥：

```
ARK_API_KEY=your_actual_api_key_here
PORT=3000
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
MODEL_NAME=doubao-seedream-4-0-250828
```

### 3. 启动服务器

```bash
# 生产环境
npm start

# 开发环境（自动重启）
npm run dev
```

### 4. 访问应用

打开浏览器访问：`http://localhost:3000`

## 使用指南

1. **上传图片**：点击或拖拽图片到上传区域
2. **输入提示词**：在文本框中输入描述您想要的图像效果的提示词
3. **设置选项**：选择生成图片的数量和尺寸
4. **生成图片**：点击"生成图片"按钮
5. **查看结果**：等待图片生成完成后，查看并下载生成的图片

## 获取火山方舟API密钥

1. 访问[火山方舟官网](https://www.volcengine.com/)
2. 注册并登录账号
3. 进入控制台
4. 在API Key管理页面创建API Key
5. 在在线推理页面创建推理接入点，选择doubao-seedream-4-0-250828模型

## 部署

### 本地部署

按照上述安装和运行步骤即可在本地部署。

### 云服务器部署

1. 将代码上传到云服务器
2. 安装Node.js和npm
3. 安装项目依赖：`npm install`
4. 配置环境变量
5. 使用PM2或其他进程管理工具启动服务：
   ```bash
   npm install -g pm2
   pm2 start server.js --name "pod-image-extraction"
   pm2 save
   pm2 startup
   ```

### Docker部署

1. 创建Dockerfile：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

2. 构建Docker镜像：

```bash
docker build -t pod-image-extraction .
```

3. 运行Docker容器：

```bash
docker run -d -p 3000:3000 --env-file .env pod-image-extraction
```

## 注意事项

- 确保您的火山方舟账户有足够的额度调用API
- 图片生成可能需要一些时间，请耐心等待
- 生成的图片质量取决于输入的提示词和参考图片

## 许可证

MIT

## 联系方式

如有问题或建议，请通过以下方式联系：

- 邮箱：your-email@example.com
- GitHub Issues：[项目Issues页面](https://github.com/yourusername/pod-image-extraction/issues)# kt
# kt
