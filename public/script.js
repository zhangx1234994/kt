document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeImageBtn = document.getElementById('removeImage');
    const subjectElement = document.getElementById('subjectElement');
    const imageCount = document.getElementById('imageCount');
    const imageSize = document.getElementById('imageSize');
    const generateBtn = document.getElementById('generateBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultSection = document.getElementById('resultSection');
    const resultImages = document.getElementById('resultImages');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const resetBtn = document.getElementById('resetBtn');

    // 上传区域点击事件
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // 拖拽上传功能
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#2980b9';
        uploadArea.style.backgroundColor = '#f0f7ff';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#3498db';
        uploadArea.style.backgroundColor = '#f8fafc';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#3498db';
        uploadArea.style.backgroundColor = '#f8fafc';
        
        if (e.dataTransfer.files.length) {
            handleImageUpload(e.dataTransfer.files[0]);
        }
    });

    // 图片选择事件
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleImageUpload(e.target.files[0]);
        }
    });

    // 处理图片上传
    function handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('请上传图片文件！');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            uploadArea.style.display = 'none';
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    // 移除图片
    removeImageBtn.addEventListener('click', () => {
        imageInput.value = '';
        uploadArea.style.display = 'block';
        imagePreview.style.display = 'none';
    });

    // 生成按钮点击事件
    generateBtn.addEventListener('click', generateImages);

    // 生成图片函数
async function generateImages() {
    // 验证输入
    if (!previewImg.src || previewImg.src === window.location.href) {
        alert('请上传图片！');
        return;
    }

    const subjectValue = subjectElement.value.trim();
    if (!subjectValue) {
        alert('请输入主体元素！');
        return;
    }
    
    // 生成完整的提示词
    const prompt = `任务要求：提取${subjectValue}的花纹图案并制作成印刷素材

具体步骤：
1. 识别并提取${subjectValue}上的花纹图案
2. 完全去除所有褶皱、阴影、光影和立体效果
3. 将花纹处理为纯平面纹理，没有任何三维感
4. 对提取的花纹进行边缘修复和图案补全，确保图案完整
5. 将处理后的花纹进行无缝平铺排列，形成连续重复的图案
6. 确保最终结果清晰、色彩准确，适合直接用于印刷

输出要求：
- 只保留花纹图案，去除所有背景和其他无关元素
- 花纹必须是纯平面的，不能有任何褶皱或立体感
- 平铺图案要无缝连接，重复自然
- 最终图像应是一个完整的、可印刷的纹理素材`;

    // 显示加载指示器
    generateBtn.disabled = true;
    loadingIndicator.style.display = 'flex';
    resultSection.style.display = 'none';

    try {
        // 准备请求数据
        const formData = new FormData();
        formData.append('image', imageInput.files[0]);
        formData.append('prompt', prompt);
        formData.append('size', imageSize.value);

        // 发送请求到后端API
        const response = await fetch('/api/generate', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('生成图片失败');
        }

        const result = await response.json();
        
        // 显示结果
        displayGeneratedImages(result.images);
    } catch (error) {
        console.error('生成图片时出错:', error);
        alert('生成图片时出错，请重试！');
    } finally {
        // 隐藏加载指示器
        generateBtn.disabled = false;
        loadingIndicator.style.display = 'none';
    }
}

    // 显示结果
function displayGeneratedImages(images) {
    resultImages.innerHTML = '';
    
    if (!images || images.length === 0) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = '未能生成图片，请重试';
        resultImages.appendChild(errorMsg);
        resultSection.style.display = 'block';
        return;
    }
    
    images.forEach((imageData, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'result-image-item';
        
        const img = document.createElement('img');
        // 确保图片URL是有效的
        if (imageData && typeof imageData === 'string') {
            img.src = imageData;
            img.alt = `生成结果 ${index + 1}`;
            
            // 添加错误处理
            img.onerror = function() {
                this.onerror = null;
                this.src = ''; // 清除错误的src
                this.alt = '图片加载失败';
                this.style.height = '200px';
                this.style.background = '#f8d7da';
                this.style.display = 'flex';
                this.style.alignItems = 'center';
                this.style.justifyContent = 'center';
                
                const errorText = document.createElement('span');
                errorText.textContent = '图片加载失败';
                this.parentNode.insertBefore(errorText, this.nextSibling);
            };
            
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'btn-download';
            downloadBtn.textContent = '下载';
            downloadBtn.style.marginTop = '10px';
            downloadBtn.style.width = '100%';
            downloadBtn.addEventListener('click', () => downloadImage(imageData, `result_${index + 1}.png`));
            
            imageItem.appendChild(img);
            imageItem.appendChild(downloadBtn);
            resultImages.appendChild(imageItem);
        }
    });
    
    resultSection.style.display = 'block';
}

    // 下载单张图片
    function downloadImage(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.click();
    }

    // 下载全部图片
    downloadAllBtn.addEventListener('click', () => {
        const imageElements = resultImages.querySelectorAll('img');
        imageElements.forEach((img, index) => {
            setTimeout(() => {
                downloadImage(img.src, `result_${index + 1}.png`);
            }, index * 500); // 延迟下载，避免浏览器阻止多个下载
        });
    });

    // 重置按钮
resetBtn.addEventListener('click', () => {
    // 重置表单
    imageInput.value = '';
    subjectElement.value = '';
    imageCount.value = '3';
    imageSize.value = '1024x1024';
    
    // 重置UI
    uploadArea.style.display = 'block';
    imagePreview.style.display = 'none';
    resultSection.style.display = 'none';
});
});