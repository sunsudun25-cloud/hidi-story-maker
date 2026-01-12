// 빠른 테스트용
export async function onRequestPost(context) {
  return new Response(
    JSON.stringify({
      success: true,
      imageData: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzRDQUY1MCIvPjwvc3ZnPg==",
      meta: {
        isCORSSafe: true,
        format: "test-base64"
      }
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}
