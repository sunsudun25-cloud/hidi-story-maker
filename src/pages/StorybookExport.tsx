import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { exportEnhancedPDF } from "../services/pdfService";
import { generateStoryImage } from "../services/imageService";
import StorybookLayout from "../components/storybook/StorybookLayout";
import "./StorybookExport.css";

type PageData = {
  text: string;
  image?: string | null;
  imageUrl?: string | null;
};

type StorybookExportProps = {
  pages?: PageData[];
  title?: string;
  coverImage?: string | null;
};

export default function StorybookExport({ 
  pages: propPages, 
  title: propTitle, 
  coverImage: propCoverImage 
}: StorybookExportProps = {}) {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Props 또는 State에서 동화책 데이터 받아오기 (Props 우선)
  const {
    title: stateTitle = "나의 동화책",
    pages: statePages = [],
    coverImageUrl: stateCover = null,
  } = state || {};

  // Props가 있으면 Props 사용, 없으면 State 사용
  const initialTitle = propTitle || stateTitle;
  const initialPages = propPages || statePages;
  const initialCover = propCoverImage || stateCover;

  // imageUrl을 image로 정규화
  const pages = initialPages.map((page: any) => ({
    text: page.text,
    imageUrl: page.imageUrl || page.image || null,
  }));

  // ===== 상태 정의 =====
  const [step, setStep] = useState(1);
  
  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState("");
  const [coverImage, setCoverImage] = useState(initialCover);

  const [layout, setLayout] = useState("horizontal");  // 기본값: 가로 (출판 표준)
  const [usePastelBackground, setUsePastelBackground] = useState(true);
  const [textImageLayout, setTextImageLayout] = useState("image-left");  // 기본값: 왼쪽 그림
  const [bookMode, setBookMode] = useState(true);  // 제본 모드
  const [pageSize, setPageSize] = useState("a4");  // 페이지 크기

  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 동화책 데이터가 없는 경우
  if (pages.length === 0) {
    return (
      <div className="export-container">
        <div className="empty-state">
          <h2>⚠️ 동화책 데이터가 없습니다</h2>
          <p>먼저 동화책을 생성해주세요.</p>
          <button className="btn-primary" onClick={() => navigate("/storybook")}>
            동화책 만들러 가기
          </button>
        </div>
      </div>
    );
  }

  // 표지 생성
  const generateCover = async () => {
    if (pages.length === 0 || !pages[0].text) {
      alert("페이지 내용이 없습니다!");
      return;
    }

    setIsGeneratingCover(true);

    try {
      const firstPageText = pages[0].text;
      const img = await generateStoryImage(firstPageText, {
        style: "동화 스타일",
        mood: "따뜻하고 부드러운"
      });
      setCoverImage(img);
      alert("🎨 표지 이미지가 생성되었습니다!");
    } catch (error) {
      console.error("표지 생성 오류:", error);
      alert("표지 이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGeneratingCover(false);
    }
  };

  // PDF 생성
  const handleExportPDF = async () => {
    setIsExporting(true);

    try {
      await exportEnhancedPDF({
        pages: pages.map((page: any) => ({
          text: page.text,
          image: page.imageUrl || null,
        })),
        title,
        author,
        layout: layout as "vertical" | "horizontal",
        usePastelBackground,
        textImageLayout: textImageLayout as "image-left" | "image-top",
        coverImage,
        bookMode,  // 제본 모드 전달
        pageSize: pageSize as "a4" | "a5",  // 페이지 크기 전달
      });

      alert("✨ 동화책 PDF가 다운로드되었습니다!");
    } catch (error) {
      console.error("PDF 내보내기 오류:", error);
      alert("PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsExporting(false);
    }
  };

  // ===== UI 템플릿 (고령친화 스타일) =====
  const StepCard = ({ children }: { children: React.ReactNode }) => (
    <div className="step-card">
      {children}
    </div>
  );

  const BigButton = ({ 
    label, 
    onClick, 
    color = "emerald",
    disabled = false 
  }: { 
    label: string; 
    onClick: () => void; 
    color?: string;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`big-button big-button-${color}`}
    >
      {label}
    </button>
  );

  return (
    <StorybookLayout title="📚 동화책 PDF 만들기">
      <div className="redesign-container">
        {/* ===== 상단 단계 안내 ===== */}
      <div className="step-indicator">
        <div className={`step-item ${step === 1 ? "active" : ""}`}>
          1. 제목/저자
        </div>
        <div className={`step-item ${step === 2 ? "active" : ""}`}>
          2. 표지
        </div>
        <div className={`step-item ${step === 3 ? "active" : ""}`}>
          3. 옵션
        </div>
        <div className={`step-item ${step === 4 ? "active" : ""}`}>
          4. PDF완성
        </div>
      </div>

      {/* ===== STEP 1: 제목 & 저자 ===== */}
      {step === 1 && (
        <>
          <StepCard>
            <label className="field-label">📙 책 제목</label>
            <input
              type="text"
              className="field-input"
              value={title}
              placeholder="예: 작은 별의 여행"
              onChange={(e) => setTitle(e.target.value)}
              lang="ko"
              autoComplete="off"
              inputMode="text"
            />

            <label className="field-label">✍️ 저자명</label>
            <input
              type="text"
              className="field-input"
              value={author}
              placeholder="예: 손선희"
              onChange={(e) => setAuthor(e.target.value)}
              onInput={(e) => setAuthor((e.target as HTMLInputElement).value)}
              lang="ko"
              autoComplete="off"
              inputMode="text"
            />
          </StepCard>

          <BigButton label="다음 단계로 이동" onClick={() => setStep(2)} color="blue" />
        </>
      )}

      {/* ===== STEP 2: 표지 설정 ===== */}
      {step === 2 && (
        <>
          <StepCard>
            <p className="step-title">🎨 표지 이미지 만들기</p>

            {coverImage && (
              <img src={coverImage} className="cover-preview-img" alt="표지" />
            )}

            <BigButton
              label={isGeneratingCover ? "⏳ 표지 생성 중..." : "표지 자동 생성"}
              color="purple"
              onClick={generateCover}
              disabled={isGeneratingCover}
            />
          </StepCard>

          <BigButton label="다음 단계로 이동" onClick={() => setStep(3)} color="blue" />

          <button className="back-link" onClick={() => setStep(1)}>
            ← 이전으로 돌아가기
          </button>
        </>
      )}

      {/* ===== STEP 3: PDF 옵션 - 출판용 그림책 설정 ===== */}
      {step === 3 && (
        <>
          <StepCard>
            <label className="field-label">📐 페이지 크기</label>
            <select
              className="field-select"
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
            >
              <option value="a4">A4 (210 × 297mm) - 권장</option>
              <option value="a5">A5 (148 × 210mm)</option>
            </select>

            <label className="field-label">📄 PDF 방향 (레이아웃)</label>
            <select
              className="field-select"
              value={layout}
              onChange={(e) => {
                const newLayout = e.target.value;
                setLayout(newLayout);
                // 방향에 따라 자동으로 레이아웃 설정
                if (newLayout === "vertical") {
                  setTextImageLayout("image-top");
                } else {
                  setTextImageLayout("image-left");
                }
              }}
            >
              <option value="horizontal">가로 (왼쪽 55% 그림, 오른쪽 40% 글) ⭐ 출판 표준</option>
              <option value="vertical">세로 (위: 그림 50%, 아래: 글 40%)</option>
            </select>

            <div style={{ 
              marginTop: '16px', 
              padding: '14px', 
              backgroundColor: layout === "horizontal" ? '#f0fdf4' : '#f0f9ff', 
              borderRadius: '10px',
              border: layout === "horizontal" ? '2px solid #86efac' : '1px solid #bfdbfe'
            }}>
              <p style={{ 
                fontSize: '15px', 
                color: layout === "horizontal" ? '#166534' : '#1e40af', 
                margin: 0,
                lineHeight: '1.6',
                fontWeight: layout === "horizontal" ? '600' : 'normal'
              }}>
                {layout === "vertical" 
                  ? "📖 세로 방향: 그림이 위쪽 50%, 글이 아래쪽 40%에 배치됩니다." 
                  : "📕 가로 그림책 (출판 표준): 왼쪽 55~60%에 삽화, 오른쪽 40~45%에 글이 배치됩니다. 전시·수업·제본에 최적화된 레이아웃입니다."}
              </p>
            </div>

            <label className="field-label">📚 출력 모드</label>
            <select
              className="field-select"
              value={String(bookMode)}
              onChange={(e) => setBookMode(e.target.value === "true")}
            >
              <option value="true">Book Mode (제본용 여백) ⭐ 권장</option>
              <option value="false">일반 모드 (균등 여백)</option>
            </select>

            {bookMode && (
              <div style={{ 
                marginTop: '12px', 
                padding: '12px', 
                backgroundColor: '#fef3c7', 
                borderRadius: '8px',
                border: '1px solid #fbbf24'
              }}>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#92400e', 
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  💡 <strong>Book Mode:</strong> 제본 안쪽 여백을 바깥쪽보다 크게 설정하여 인쇄·제본 시 글이 잘리지 않습니다.
                </p>
              </div>
            )}

            <label className="field-label">🎨 배경 스타일</label>
            <select
              className="field-select"
              value={String(usePastelBackground)}
              onChange={(e) => setUsePastelBackground(e.target.value === "true")}
            >
              <option value="true">파스텔톤 배경 (부드러운 느낌)</option>
              <option value="false">흰색 배경 (깔끔한 느낌)</option>
            </select>
          </StepCard>

          <BigButton label="다음 단계로 이동" onClick={() => setStep(4)} color="blue" />
          <button className="back-link" onClick={() => setStep(2)}>
            ← 이전으로 돌아가기
          </button>
        </>
      )}

      {/* ===== STEP 4: PDF 생성 ===== */}
      {step === 4 && (
        <>
          <StepCard>
            <p className="step-title">📕 모든 설정이 완료되었습니다!</p>
            
            <div className="summary-box">
              <div className="summary-item">
                <span className="summary-label">📙 제목:</span>
                <span className="summary-value">{title}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">✍️ 저자:</span>
                <span className="summary-value">{author || "(저자명 없음)"}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">📐 크기:</span>
                <span className="summary-value">{pageSize.toUpperCase()}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">📄 방향:</span>
                <span className="summary-value">{layout === "vertical" ? "세로" : "가로 (출판 표준)"}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">🖼️ 배치:</span>
                <span className="summary-value">
                  {layout === "vertical" ? "위: 그림 50%, 아래: 글 40%" : "왼쪽: 그림 55%, 오른쪽: 글 40%"}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">📚 모드:</span>
                <span className="summary-value">
                  {bookMode ? "Book Mode (제본용 여백)" : "일반 모드"}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">🎨 배경:</span>
                <span className="summary-value">
                  {usePastelBackground ? "파스텔톤" : "흰색"}
                </span>
              </div>
            </div>

            <BigButton
              label={isExporting ? "⏳ PDF 생성 중..." : "📘 PDF 만들기"}
              color="red"
              onClick={handleExportPDF}
              disabled={isExporting}
            />

            <button className="back-link" onClick={() => setStep(3)}>
              ← 옵션 다시 선택하기
            </button>
          </StepCard>
        </>
      )}
      </div>
    </StorybookLayout>
  );
}
