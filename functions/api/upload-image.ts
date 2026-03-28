// Cloudflare Pages Functions - 이미지 업로드 API
// R2에 이미지를 업로드하고 공개 URL 반환

interface Env {
  R2_BUCKET: R2Bucket;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  // CORS 헤더 설정
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // POST 요청만 허용
  if (context.request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // FormData에서 파일 추출
    const formData = await context.request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: '파일이 없습니다.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 파일 타입 확인
    if (!file.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: '이미지 파일만 업로드 가능합니다.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: '파일 크기는 10MB 이하여야 합니다.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 고유한 파일명 생성
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'png';
    const fileName = `uploads/${timestamp}-${randomStr}.${extension}`;

    // R2에 업로드
    const arrayBuffer = await file.arrayBuffer();
    await context.env.R2_BUCKET.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // 공개 URL 생성
    // Cloudflare R2는 기본적으로 비공개이므로, 
    // Custom Domain 또는 Public Bucket 설정 필요
    // 여기서는 임시로 내부 URL 반환
    const publicUrl = `https://pub-r2.story-maker.kr/${fileName}`;

    return new Response(
      JSON.stringify({ 
        success: true,
        url: publicUrl,
        fileName: fileName
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Upload error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: '업로드 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};
