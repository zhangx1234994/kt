const axios = require('axios');
require('dotenv').config();

async function testAPI() {
  try {
    console.log('正在测试火山方舟API连接...');
    
    // 从环境变量获取配置
    const apiKey = process.env.ARK_API_KEY || '3978d498-75c8-4a81-a60a-e53dcda6e7eb';
    const baseUrl = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
    const modelName = 'doubao-seedream-4-0-250828';
    
    // 使用一个有效的图片URL
    const imageUrl = 'https://httpbin.org/image/png';
    
    const prompt = '测试提示词';
    const size = '1024x1024';
    
    // 准备请求数据
    const requestData = {
      model: modelName,
      prompt: prompt,
      image: imageUrl,
      size: size
    };
    
    console.log('请求数据:', requestData);
    
    // 发送请求 - 使用正确的API端点（复数形式）
    const response = await axios.post(`${baseUrl}/images/generations`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: 120000, // 120秒超时
      responseType: 'text' // 接收文本格式的响应
    });
    
    console.log('✅ API测试成功!');
    
    // 解析SSE格式的响应
    const lines = response.data.split('\n');
    const imageUrls = [];
    let hasError = false;
    let errorMessage = '';
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      if (line.trim() === '[DONE]') {
        console.log('SSE流结束');
        break;
      }
      
      if (line.startsWith('data: ')) {
        const dataPart = line.substring(6);
        try {
          const data = JSON.parse(dataPart);
          
          // 检查是否有错误
          if (data.error) {
            hasError = true;
            errorMessage = data.error.message;
            console.error('API返回错误:', errorMessage);
            continue;
          }
          
          // 检查事件类型
          if (data.type === 'image_generation.partial_succeeded' && data.url) {
            imageUrls.push(data.url);
            console.log('找到图片URL:', data.url);
          } else if (data.type === 'image_generation.succeeded' && data.url) {
            imageUrls.push(data.url);
            console.log('最终图片URL:', data.url);
          } else {
            console.log('收到其他类型的事件:', data.type);
          }
        } catch (e) {
          // 忽略JSON解析错误
          console.warn('解析SSE数据时出错:', e.message, '数据:', dataPart);
        }
      }
    }
    
    if (imageUrls.length > 0) {
      console.log('提取的图片URL列表:', imageUrls);
    } else {
      if (hasError) {
        console.error('❌ API调用成功但没有返回图片URL，因为发生了错误:', errorMessage);
      } else {
        console.warn('⚠️ API调用成功但没有找到图片URL');
      }
    }
    
    // 输出完整的响应数据供调试
    console.log('\n完整响应数据:');
    console.log(response.data);
  } catch (error) {
    console.error('❌ API测试失败!');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

testAPI();