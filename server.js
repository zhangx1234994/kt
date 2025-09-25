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
app.post('/api/generate', upload.single('image'), async (req, res) => {
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
    const apiKey = process.env.ARK_API_KEY;
    const baseUrl = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
    const modelName = process.env.MODEL_NAME || 'doubao-seedream-4-0-250828';
    
    if (!apiKey) {
        throw new Error('未配置火山方舟API密钥');
    }

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
            stream: true,
            watermark: true
        };

        console.log('发送请求到火山方舟API:', JSON.stringify(requestData, null, 2));

        // 发送请求
        const response = await axios.post(`${baseUrl}/images/generations`, requestData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            timeout: 120000, // 120秒超时
            responseType: 'text' // 接收文本格式的响应
        });

        console.log('API响应:', response.data);

        // 解析SSE格式的响应
        const lines = response.data.split('\n');
        const imageUrls = [];
        
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                try {
                    const data = JSON.parse(line.substring(6));
                    
                    // 检查事件类型
                    if (data.type === 'image_generation.partial_succeeded' && data.url) {
                        imageUrls.push(data.url);
                    }
                } catch (e) {
                    // 忽略JSON解析错误
                    console.warn('解析SSE数据时出错:', e);
                }
            }
        }

        if (imageUrls.length > 0) {
            return imageUrls;
        } else {
            throw new Error('未能从API响应中提取图片URL');
        }
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