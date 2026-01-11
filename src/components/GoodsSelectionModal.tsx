import { useNavigate } from "react-router-dom";
import "./GoodsSelectionModal.css";

interface GoodsSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  artwork: any; // 선택한 작품 데이터
  artworkType: 'image' | 'writing' | 'storybook';
}

export default function GoodsSelectionModal({
  isOpen,
  onClose,
  artwork,
  artworkType
}: GoodsSelectionModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoodsSelection = (category: string) => {
    // 작품 데이터와 함께 굿즈 페이지로 이동
    if (category === 'experience') {
      // 체험형 굿즈
      navigate('/goods/experience', {
        state: {
          artwork,
          artworkType,
          category: 'experience'
        }
      });
    } else {
      // AI 출판, 전시 공유, 실물 굿즈
      navigate('/goods', {
        state: {
          artwork,
          artworkType,
          category // 'publishing', 'exhibition', 'physical'
        }
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <h2>🎨 무엇을 만들까요?</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 선택한 작품 미리보기 */}
        <div className="selected-artwork-preview">
          {artworkType === 'image' && artwork.image && (
            <img src={artwork.image} alt="선택한 작품" />
          )}
          {artworkType === 'storybook' && artwork.coverImage && (
            <img src={artwork.coverImage} alt="동화책 표지" />
          )}
          {artworkType === 'writing' && (
            <div className="writing-preview">
              <p>"{artwork.title || '글 작품'}"</p>
            </div>
          )}
        </div>

        {/* 4가지 옵션 */}
        <div className="goods-options">
          {/* 1. AI 출판 */}
          <button
            className="goods-option-btn publishing"
            onClick={() => handleGoodsSelection('publishing')}
          >
            <div className="option-icon">📚</div>
            <div className="option-text">
              <h3>AI 출판</h3>
              <p>책으로 만들어 출판하기</p>
            </div>
          </button>

          {/* 2. 전시 공유 */}
          <button
            className="goods-option-btn exhibition"
            onClick={() => handleGoodsSelection('exhibition')}
          >
            <div className="option-icon">🖼️</div>
            <div className="option-text">
              <h3>전시 공유</h3>
              <p>디지털 전시로 공유하기</p>
            </div>
          </button>

          {/* 3. 실물 만들기 */}
          <button
            className="goods-option-btn physical"
            onClick={() => handleGoodsSelection('physical')}
          >
            <div className="option-icon">🎁</div>
            <div className="option-text">
              <h3>실물 만들기</h3>
              <p>실물 굿즈로 제작하기</p>
            </div>
          </button>

          {/* 4. 체험 만들기 */}
          <button
            className="goods-option-btn experience"
            onClick={() => handleGoodsSelection('experience')}
          >
            <div className="option-icon">✨</div>
            <div className="option-text">
              <h3>체험 만들기</h3>
              <p>엽서, 명함 등 직접 만들기</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
