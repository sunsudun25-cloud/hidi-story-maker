// 페이지별 헤더 색상 매핑 (파스텔 톤)
export const headerColors: Record<string, string> = {
  "그림 연습하기": "#C8F3DC",      // 연두색 (파스텔 그린)
  "그림": "#C8F3DC",
  "그림 만들기": "#C8F3DC",
  "글쓰기": "#FFF2A8",            // 노란색 (파스텔 옐로우)
  "글쓰기 연습": "#FFF2A8",
  "동화책": "#D8E9FF",            // 하늘색 (파스텔 블루)
  "동화책 만들기": "#D8E9FF",
  "내 작품": "#FFE1D1",           // 복숭아색 (파스텔 오렌지)
  "내 작품 보기": "#FFE1D1",
  "나만의 굿즈": "#EAD8FF",       // 연보라색 (파스텔 퍼플)
  "나만의 굿즈 만들기": "#EAD8FF",
  "설정": "#FFE1D1",
  "도움말": "#D8E9FF",
  "다른 기기에서 보기": "#C8F3DC",
};

// 기본 헤더 색상 (지정되지 않은 경우)
export const defaultHeaderColor = "#B5D7FF";

// 헤더 색상 가져오기 헬퍼 함수
export function getHeaderColor(title: string): string {
  return headerColors[title] || defaultHeaderColor;
}
