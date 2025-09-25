const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://dzlwpcrpknyqtrbwxaad.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 需要在.env文件中设置

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey);

// 创建存储桶的函数
async function createStorageBucket(bucketName, options = {}) {
    try {
        const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: options.public || false,
            fileSizeLimit: options.fileSizeLimit || 52428800, // 默认50MB
            allowedMimeTypes: options.allowedMimeTypes || ['image/png', 'image/jpeg', 'image/gif']
        });

        if (error) {
            console.error('创建存储桶失败:', error);
            return { success: false, error };
        }

        console.log('存储桶创建成功:', data);
        return { success: true, data };
    } catch (error) {
        console.error('创建存储桶时出错:', error);
        return { success: false, error };
    }
}

// 主函数
async function main() {
    // 检查环境变量
    if (!supabaseKey) {
        console.error('错误: 请在.env文件中设置SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }

    // 创建存储桶
    const bucketName = 'product-images'; // 存储桶名称
    const result = await createStorageBucket(bucketName, {
        public: true, // 设置为公开存储桶
        fileSizeLimit: 104857600, // 100MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    });

    if (result.success) {
        console.log(`存储桶 "${bucketName}" 创建成功！`);
    } else {
        console.error(`存储桶 "${bucketName}" 创建失败:`, result.error.message);
    }
}

// 执行主函数
main();