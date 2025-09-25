const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 配置multer用于文件上传
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 将前端文件移动到public目录
if (!fs.existsSync(path.join(__dirname, 'public'))) {
    fs.mkdirSync(path.join(__dirname, 'public'));
}

// 如果public目录为空，将前端文件复制过去
const publicFiles = ['index.html', 'styles.css', 'script.js'];
publicFiles.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const destPath = path.join(__dirname, 'public', file);
    
    if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
        fs.copyFileSync(sourcePath, destPath);
    }
});

// API路由：生成图片
app.post('/api/generate', async (req, res) => {
    try {
        console.log('接收到的请求体:', req.body);
        
        const { prompt, size = '1024x1024', image: imageUrl } = req.body;
        
        let imageDataUrl;
        
        // 检查是否有上传的文件或图片URL
        if (imageUrl) {
            // 使用提供的图片URL
            imageDataUrl = imageUrl;
        } else {
            console.log('未提供图片URL');
            return res.status(400).json({ error: '请提供图片和提示词' });
        }

        if (!prompt) {
            console.log('未提供提示词');
            return res.status(400).json({ error: '请提供提示词' });
        }

        // 调用火山方舟API
        const response = await callVolcanoEngineAPI(imageDataUrl, prompt, size);
        
        // 返回生成的图片
        res.json({ images: response });
    } catch (error) {
        console.error('生成图片时出错:', error);
        res.status(500).json({ error: '生成图片失败' });
    }
});

// 文件上传路由
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        const { prompt, size = '1024x1024' } = req.body;
        
        if (!req.file || !prompt) {
            return res.status(400).json({ error: '请提供图片和提示词' });
        }

        // 将图片转换为base64
        const imageBase64 = req.file.buffer.toString('base64');
        const imageMimeType = req.file.mimetype;
        const imageDataUrl = `data:${imageMimeType};base64,${imageBase64}`;

        // 调用火山方舟API
        const response = await callVolcanoEngineAPI(imageDataUrl, prompt, size);
        
        // 返回生成的图片
        res.json({ images: response });
    } catch (error) {
        console.error('生成图片时出错:', error);
        res.status(500).json({ error: '生成图片失败' });
    }
});

// 调用火山方舟API的函数
async function callVolcanoEngineAPI(imageUrl, prompt, size) {
    // 使用环境变量中的API密钥，如果没有则使用默认密钥
    const apiKey = process.env.ARK_API_KEY || '3978d498-75c8-4a81-a60a-e53dcda6e7eb';
    const baseUrl = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
    const modelName = process.env.MODEL_NAME || 'doubao-seedream-4-0-250828';
    
    // 不再需要检查apiKey是否存在，因为我们已经提供了默认值

    try {
        // 处理图片URL，确保是数组格式
        const imageArray = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
        
        // 准备请求数据
        const requestData = {
            model: modelName,
            prompt: prompt,
            image: imageArray,
            sequential_image_generation: "auto",
            sequential_image_generation_options: {
                max_images: 1  // 固定为1张图片
            },
            response_format: "url",
            size: size === "2K" ? "2K" : "1024x1024",
            // 在Vercel环境中禁用流式响应，避免超时问题
            stream: process.env.VERCEL ? false : true,
            watermark: true
        };

        console.log('发送请求到火山方舟API:', JSON.stringify(requestData, null, 2));
        console.log('当前环境:', process.env.VERCEL ? 'Vercel' : '本地');

        // 发送请求
        const response = await axios.post(`${baseUrl}/images/generations`, requestData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            // 在Vercel环境中减少超时时间，避免函数超时
            timeout: process.env.VERCEL ? 25000 : 120000, // Vercel环境25秒超时，本地120秒
            responseType: 'text' // 接收文本格式的响应
        });

        console.log('API响应状态:', response.status);
        console.log('API响应类型:', typeof response.data);
        // 限制日志大小，避免日志过大
        const logData = typeof response.data === 'string' 
            ? response.data.substring(0, 500) + (response.data.length > 500 ? '...(已截断)' : '')
            : '非字符串响应';
        console.log('API响应(部分):', logData);

        // 解析响应数据
        let responseData;
        
        // 检查响应是否为字符串类型
        const responseContent = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        
        // 首先尝试作为JSON解析
        try {
            responseData = JSON.parse(responseContent);
            console.log('成功解析为JSON格式');
            
            // 如果是JSON格式，直接提取图片URL
            if (responseData.data && responseData.data.length > 0) {
                return responseData.data.map(item => item.url);
            }
        } catch (e) {
            console.log('不是标准JSON格式，尝试解析SSE格式');
        }
        
        // 如果不是JSON格式或JSON中没有所需数据，尝试解析SSE格式
        const lines = responseContent.split('\n');
        const imageUrls = [];
        
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                try {
                    const data = JSON.parse(line.substring(6));
                    
                    // 检查各种可能的事件类型和数据结构
                    if (data.type && data.type.includes('image_generation') && data.url) {
                        imageUrls.push(data.url);
                    } else if (data.data && Array.isArray(data.data)) {
                        // 处理可能的数组格式
                        data.data.forEach(item => {
                            if (item.url) imageUrls.push(item.url);
                        });
                    } else if (data.url) {
                        // 直接包含URL的情况
                        imageUrls.push(data.url);
                    }
                } catch (e) {
                    // 忽略JSON解析错误
                    console.warn('解析SSE数据行时出错:', e.message);
                }
            }
        }
        
        if (imageUrls.length > 0) {
            console.log('从响应中提取到的图片URL数量:', imageUrls.length);
            return imageUrls;
        }
        
        // 如果上述方法都无法提取URL，尝试直接从响应中查找URL模式
        const urlRegex = /(https?:\/\/[^\s"]+)/g;
        const matches = responseContent.match(urlRegex);
        if (matches && matches.length > 0) {
            console.log('通过正则表达式找到的URL数量:', matches.length);
            // 过滤出可能是图片的URL
            const imageUrlMatches = matches.filter(url => 
                url.includes('.jpg') || url.includes('.jpeg') || 
                url.includes('.png') || url.includes('.webp') ||
                url.includes('image')
            );
            if (imageUrlMatches.length > 0) {
                return imageUrlMatches;
            }
        }
        
        // 如果所有方法都失败，抛出错误
        throw new Error('未能从API响应中提取图片URL');
    } catch (error) {
        console.error('调用火山方舟API时出错:', error.response ? error.response.data : error.message);
        throw new Error('调用火山方舟API失败');
    }
}

// 健康检查路由
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: '产品印刷图提取工具服务运行中' });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('请确保已配置.env文件中的ARK_API_KEY');
});

module.exports = app;