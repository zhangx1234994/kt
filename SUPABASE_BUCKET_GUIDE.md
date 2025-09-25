# Supabase存储桶创建指南

## 方法一：使用Supabase Dashboard（推荐）

1. 登录到您的Supabase Dashboard：https://supabase.com/dashboard
2. 选择您的项目（yuyuqianqian_tk）
3. 在左侧菜单中，点击"Storage"图标
4. 点击"New bucket"按钮
5. 输入存储桶名称，例如：`product-images`
6. 配置存储桶设置：
   - Public bucket：勾选（允许公开访问）
   - File size limit：根据需要设置（例如100MB）
   - Allowed MIME types：添加图片类型（image/png, image/jpeg, image/gif, image/webp）
7. 点击"Create bucket"完成创建

## 方法二：使用JavaScript脚本

如果您想使用我们创建的脚本，请按照以下步骤操作：

1. 获取Supabase服务角色密钥：
   - 在Supabase Dashboard中，进入Project Settings > API
   - 找到"service_role"密钥并复制
   - 将此密钥添加到.env文件中的`SUPABASE_SERVICE_ROLE_KEY=`后面

2. 运行创建存储桶的脚本：
   ```bash
   node create-bucket.js
   ```

## 注意事项

- 服务角色密钥具有管理员权限，请妥善保管
- 如果脚本运行失败，请检查网络连接和密钥是否正确
- 创建存储桶后，您可以在Supabase Dashboard中管理文件和设置权限

## 集成到项目中

创建存储桶后，您可以在项目中使用以下代码上传文件：

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dzlwpcrpknyqtrbwxaad.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 上传文件示例
async function uploadFile(bucketName, filePath, file) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file);
    
  if (error) {
    console.error('上传失败:', error);
    return null;
  }
  
  return data;
}
```