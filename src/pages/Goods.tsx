// src/pages/Goods.tsx
import { useNavigate } from "react-router-dom";

export default function Goods() {
  const navigate = useNavigate();

  // 아직 세부 기능은 없으니, 클릭 시 안내만 띄우도록 처리
  const handleComingSoon = (feature: string) => {
    alert(`${feature} 기능은 곧 업데이트될 예정입니다 😊\n지금은 화면 구성만 확인해 주세요.`);
  };

  return (
    <div className="screen">
      <div className="screen-body p-5" style={{ paddingBottom: "60px" }}>
        {/* 제목 영역 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">
            ✨ 나만의 출판물 & 굿즈 만들기
          </h1>
          <p className="text-[15px] text-gray-600 leading-relaxed">
            AI로 만든 그림, 동화, 글을{" "}
            <span className="font-semibold">책 · 앨범 · 굿즈</span>로 제작해 보세요.
            <br />
            시니어·학생·창작자를 위한 출판·굿즈 제작 서비스입니다.
          </p>
        </div>

        {/* 기능 카드들 */}
        <div className="grid grid-cols-1 gap-4">
          {/* 1) AI 출판 */}
          <button
            type="button"
            onClick={() => handleComingSoon("AI 출판")}
            className="
              w-full text-left rounded-2xl p-4
              bg-white border-2 border-purple-200
              shadow-sm hover:shadow-md hover:border-purple-400
              transition-all duration-150
            "
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">📘</div>
              <div className="flex-1">
                <p className="text-lg font-bold mb-1">AI 출판 (책으로 만들기)</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  동화책, 수필집, 기록집 등 내가 쓴 글과 만든 그림을
                  <br />
                  <span className="font-semibold">책(PDF · 인쇄용 파일)</span>으로 자동 구성해 드려요.
                </p>
                <p className="mt-2 text-xs text-purple-700 bg-purple-50 inline-block px-2 py-1 rounded-lg">
                  동화책·글쓰기 페이지에서 만든 작품과 연결됩니다
                </p>
              </div>
            </div>
          </button>

          {/* 2) 실물 굿즈 제작 */}
          <button
            type="button"
            onClick={() => handleComingSoon("실물 굿즈 제작")}
            className="
              w-full text-left rounded-2xl p-4
              bg-white border-2 border-emerald-200
              shadow-sm hover:shadow-md hover:border-emerald-400
              transition-all duration-150
            "
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">🎁</div>
              <div className="flex-1">
                <p className="text-lg font-bold mb-1">실물 굿즈 제작</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  액자, 머그컵, 티셔츠, 퍼즐, 포토북 등
                  <br />
                  <span className="font-semibold">승화전사 굿즈</span>로 작품을 남길 수 있어요.
                </p>
                <p className="mt-2 text-xs text-emerald-700 bg-emerald-50 inline-block px-2 py-1 rounded-lg">
                  추후 공방·기기 연동 서비스로 확장 예정
                </p>
              </div>
            </div>
          </button>

          {/* 3) 전시 & 공유 (디지털 굿즈) */}
          <button
            type="button"
            onClick={() => handleComingSoon("전시 & 공유")}
            className="
              w-full text-left rounded-2xl p-4
              bg-white border-2 border-sky-200
              shadow-sm hover:shadow-md hover:border-sky-400
              transition-all duration-150
            "
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">🖼</div>
              <div className="flex-1">
                <p className="text-lg font-bold mb-1">전시 & 공유 (디지털 굿즈)</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  작품을 모아{" "}
                  <span className="font-semibold">디지털 앨범·슬라이드북·온라인 전시관</span>으로 만들고
                  <br />
                  QR코드로 가족·친구와 쉽게 공유할 수 있어요.
                </p>
              </div>
            </div>
          </button>

          {/* 4) 창작자 수익화 & 공방 */}
          <button
            type="button"
            onClick={() => handleComingSoon("창작자 수익화 & 공방")}
            className="
              w-full text-left rounded-2xl p-4
              bg-white border-2 border-amber-200
              shadow-sm hover:shadow-md hover:border-amber-400
              transition-all duration-150
            "
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">💰</div>
              <div className="flex-1">
                <p className="text-lg font-bold mb-1">창작자 수익화 & 공방 연계</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  만든 굿즈를 판매하거나, 승화전사·굿즈 제작 기술을
                  <br />
                  <span className="font-semibold">공방 창업·강의 프로그램</span>으로 확장할 수 있어요.
                </p>
                <p className="mt-2 text-xs text-amber-800 bg-amber-50 inline-block px-2 py-1 rounded-lg">
                  향후 마켓·기기 패키지·창업 과정으로 확장되는 핵심 비즈니스 영역
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* 하단 안내 문구 */}
        <div className="mt-8 text-center text-xs text-gray-500 leading-relaxed">
          지금은 화면 구성과 서비스 설명을 위한 체험 버전입니다.
          <br />
          실제 출판·굿즈 제작·판매 기능은 단계적으로 열릴 예정입니다.
        </div>
      </div>
    </div>
  );
}
