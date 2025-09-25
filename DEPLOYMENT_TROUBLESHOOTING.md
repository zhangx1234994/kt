# 部署后出图错误排查与解决方案

## 问题分析

经过代码检查，发现以下几个可能导致部署后出图错误的问题：

### 1. API端点不匹配
- 服务器代码中使用 `/api/generate` 端点
- Supabase函数中使用 `/image/generation` 端点
- 这导致请求可能发送到错误的地方

### 2. 模型名称不一致
- 服务器代码中使用 `doubao-seedream-4-0-250828` 模型
- Supabase函数中使用 `ep-20241211140244-b8vq7` 模型
- 不同模型可能导致不同行为或错误

### 3. API密钥环境变量名称不一致
- 服务器代码中使用 `ARK_API_KEY`
- Supabase函数中使用 `VOLCANO_API_KEY`
- 这导致在Supabase环境中无法正确获取API密钥

### 4. Supabase服务角色密钥未配置
- `.env` 文件中的 `SUPABASE_SERVICE_ROLE_KEY` 为空
- 这影响Supabase存储桶的创建和文件上传功能

## 解决方案

### 方案1：修复服务器代码（推荐）

#### 1.1 统一API端点
修改 `server.js` 中的API调用端点：

```javascript
// 将这行
const response = await axios.post(`${baseUrl}/images/generations`, requestData, {

// 改为
const response = await axios.post(`${baseUrl}/image/generation`, requestData, {
```

#### 1.2 统一模型名称
修改 `server.js` 中的模型名称：

```javascript
// 将这行
const modelName = process.env.MODEL_NAME || 'doubao-seedream-4-0-250828';

// 改为
const modelName = process.env.MODEL_NAME || 'ep-20241211140244-b8vq7';
```

#### 1.3 修复环境变量名称
修改 `.env` 文件：

```bash
# 添加这行
VOLCANO_API_KEY=3978d498-75c8-4a81-a60a-e53dcda6e7eb
```

#### 1.4 配置Supabase服务角色密钥
1. 登录Supabase Dashboard
2. 进入Project Settings > API
3. 复制service_role密钥
4. 添加到 `.env` 文件中：

```bash
SUPABASE_SERVICE_ROLE_KEY=您的服务角色密钥
```

### 方案2：使用Supabase函数

如果您想使用Supabase函数而不是本地服务器，请确保：

1. 在Supabase Dashboard中设置环境变量 `VOLCANO_API_KEY`
2. 部署Supabase函数到您的项目
3. 修改前端代码，将请求发送到Supabase函数端点

### 方案3：测试API连接

创建一个测试脚本来验证API连接：

```javascript
// test-api.js
const axios = require('axios');

async function testAPI() {
  try {
    const response = await axios.post('https://ark.cn-beijing.volces.com/api/v3/image/generation', {
      model: 'ep-20241211140244-b8vq7',
      prompt: '测试提示词',
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      size: '1024x1024'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 3978d498-75c8-4a81-a60a-e53dcda6e7eb'
      }
    });
    
    console.log('API测试成功:', response.data);
  } catch (error) {
    console.error('API测试失败:', error.response ? error.response.data : error.message);
  }
}

testAPI();
```

运行测试：
```bash
node test-api.js
```

## 部署步骤

1. 应用上述修复
2. 重新部署您的应用
3. 测试图像生成功能

如果问题仍然存在，请检查服务器日志以获取更详细的错误信息。