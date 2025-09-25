import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateRequest {
  imageData: string
  subjectElement: string
  imageSize: string
}

serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 只处理POST请求
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      })
    }

    // 获取请求体
    const { imageData, subjectElement, imageSize }: GenerateRequest = await req.json()
    
    if (!imageData || !subjectElement) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 从环境变量获取API密钥
    const apiKey = Deno.env.get('VOLCANO_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // 构建提示词
    const prompt = `我需要你从一张${subjectElement}产品图片中提取纯平面花纹纹理，分步骤处理：

步骤1：识别并定位${subjectElement}上的花纹图案区域
步骤2：提取花纹图案的纯平面纹理，去除所有褶皱、阴影和立体感
步骤3：将提取的纹理转换为无缝平铺图案
步骤4：输出最终的高质量平面花纹纹理图片

请严格按照以上步骤处理，确保最终结果是纯平面的花纹纹理，没有任何褶皱或立体感，适合用于产品印刷设计。`

    // 调用火山方舟API
    const apiResponse = await fetch('https://ark.cn-beijing.volces.com/api/v3/image/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'ep-20241211140244-b8vq7',
        prompt: prompt,
        image: imageData,
        size: imageSize || '2K',
      }),
    })

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json()
      console.error('API Error:', errorData)
      return new Response(JSON.stringify({ error: 'Failed to generate image' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const result = await apiResponse.json()
    
    // 返回成功响应
    return new Response(JSON.stringify({ 
      success: true, 
      data: result,
      prompt: prompt
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})