import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentLearner, clearCurrentLearner, saveArtifact } from "../services/classroomService";
import { getAllImages, getAllStories, getAllStorybooks, getAllPostcards } from "../services/dbService";

export default function Settings() {
  const navigate = useNavigate();
  const [learner, setLearner] = useState<any>(null);
  const [counts, setCounts] = useState({
    images: 0,
    stories: 0,
    storybooks: 0,
    postcards: 0
  });

  // 파일 업로드 상태
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadPreview, setUploadPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // 학생 정보 로드
    const currentLearner = getCurrentLearner();
    setLearner(currentLearner);

    // 작품 개수 카운트
    try {
      const [images, stories, storybooks, postcards] = await Promise.all([
        getAllImages(),
        getAllStories(),
        getAllStorybooks(),
        getAllPostcards()
      ]);

      setCounts({
        images: images.length,
        stories: stories.length,
        storybooks: storybooks.length,
        postcards: postcards.length
      });
    } catch (error) {
      console.error("작품 개수 로드 오류:", error);
    }
  };

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      clearCurrentLearner();
      alert("✅ 로그아웃 되었습니다.");
      navigate("/");
    }
  };

  const handleSubmitAll = () => {
    const total = counts.images + counts.stories + counts.storybooks + counts.postcards;
    
    if (total === 0) {
      alert("제출할 작품이 없습니다.");
      return;
    }

    const confirmed = confirm(
      `모든 작품을 선생님께 제출하시겠습니까?\n\n` +
      `📝 글: ${counts.stories}개\n` +
      `🎨 그림: ${counts.images}개\n` +
      `📕 동화책: ${counts.storybooks}개\n` +
      `📮 엽서: ${counts.postcards}개\n\n` +
      `총 ${total}개의 작품`
    );

    if (confirmed) {
      // 모든 작품 제출 (추후 구현)
      alert("⚠️ 일괄 제출 기능은 개발 중입니다.\n각 작품 유형별로 제출해주세요.");
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setUploadFile(file);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 기본 제목 설정
    const now = new Date();
    const defaultTitle = `업로드 이미지 - ${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}.`;
    setUploadTitle(defaultTitle);
  };

  // 파일 업로드 제출
  const handleUploadSubmit = async () => {
    if (!uploadFile || !uploadPreview) {
      alert('업로드할 파일을 선택해주세요.');
      return;
    }

    if (!uploadTitle.trim()) {
      alert('작품 제목을 입력해주세요.');
      return;
    }

    if (!learner) {
      alert('로그인이 필요합니다.');
      return;
    }

    const confirmed = confirm(
      `"${uploadTitle}"\n\n이 작품을 선생님께 제출하시겠습니까?`
    );

    if (!confirmed) return;

    setIsUploading(true);

    try {
      await saveArtifact({
        learnerId: learner.learnerId,
        type: 'image',
        title: uploadTitle,
        data: {
          source: 'upload',
          fileName: uploadFile.name,
          uploadedAt: new Date().toISOString()
        },
        files: {
          image: uploadPreview
        }
      });

      alert('✅ 제출되었습니다!');
      
      // 상태 초기화
      setUploadFile(null);
      setUploadTitle('');
      setUploadPreview('');
      
      // 파일 input 초기화
      const fileInput = document.getElementById('upload-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('업로드 제출 오류:', error);
      alert('❌ 제출 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#FFF9F0", 
      padding: "20px",
      paddingBottom: "80px"
    }}>
      <div className="responsive-container" style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* 헤더 */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px"
        }}>
          <button
            onClick={() => navigate("/home")}
            style={{
              fontSize: "24px",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            ←
          </button>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
            ⚙️ 설정
          </h2>
          <div style={{ width: "40px" }}></div>
        </div>

        {/* 내 정보 섹션 */}
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            👤 내 정보
          </h3>
          
          {learner ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px",
                background: "#F9FAFB",
                borderRadius: "8px"
              }}>
                <span style={{ color: "#666", fontSize: "15px" }}>이름</span>
                <span style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>
                  {learner.learnerName}
                </span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px",
                background: "#F9FAFB",
                borderRadius: "8px"
              }}>
                <span style={{ color: "#666", fontSize: "15px" }}>수업 코드</span>
                <span style={{ fontWeight: "600", color: "#667eea", fontSize: "15px" }}>
                  {learner.classCode}
                </span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px",
                background: "#F9FAFB",
                borderRadius: "8px"
              }}>
                <span style={{ color: "#666", fontSize: "15px" }}>학생 번호</span>
                <span style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>
                  {learner.learnerId.split('-')[1]}
                </span>
              </div>
            </div>
          ) : (
            <div style={{
              padding: "20px",
              textAlign: "center",
              color: "#666",
              fontSize: "15px"
            }}>
              <p style={{ marginBottom: "12px" }}>로그인이 필요합니다.</p>
              <button
                onClick={() => navigate("/onboarding")}
                style={{
                  padding: "10px 20px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                로그인하기
              </button>
            </div>
          )}
        </div>

        {/* 선생님께 제출 섹션 */}
        {learner && (
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              📤 선생님께 제출
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* 글 제출 */}
              <button
                onClick={() => navigate("/settings/submit/stories")}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  background: counts.stories > 0 
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#E5E7EB",
                  color: counts.stories > 0 ? "#ffffff" : "#9CA3AF",
                  border: "none",
                  borderRadius: "12px",
                  cursor: counts.stories > 0 ? "pointer" : "not-allowed",
                  fontSize: "16px",
                  fontWeight: "600",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s",
                  textAlign: "left"
                }}
                disabled={counts.stories === 0}
              >
                <span>📝 글 제출하기</span>
                <span style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "14px"
                }}>
                  {counts.stories}개
                </span>
              </button>

              {/* 그림 제출 */}
              <button
                onClick={() => navigate("/settings/submit/images")}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  background: counts.images > 0 
                    ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                    : "#E5E7EB",
                  color: counts.images > 0 ? "#ffffff" : "#9CA3AF",
                  border: "none",
                  borderRadius: "12px",
                  cursor: counts.images > 0 ? "pointer" : "not-allowed",
                  fontSize: "16px",
                  fontWeight: "600",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s",
                  textAlign: "left"
                }}
                disabled={counts.images === 0}
              >
                <span>🎨 그림 제출하기</span>
                <span style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "14px"
                }}>
                  {counts.images}개
                </span>
              </button>

              {/* 동화책 제출 */}
              <button
                onClick={() => navigate("/settings/submit/storybooks")}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  background: counts.storybooks > 0 
                    ? "linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)"
                    : "#E5E7EB",
                  color: counts.storybooks > 0 ? "#ffffff" : "#9CA3AF",
                  border: "none",
                  borderRadius: "12px",
                  cursor: counts.storybooks > 0 ? "pointer" : "not-allowed",
                  fontSize: "16px",
                  fontWeight: "600",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s",
                  textAlign: "left"
                }}
                disabled={counts.storybooks === 0}
              >
                <span>📕 동화책 제출하기</span>
                <span style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "14px"
                }}>
                  {counts.storybooks}개
                </span>
              </button>

              {/* 엽서 제출 */}
              <button
                onClick={() => navigate("/settings/submit/postcards")}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  background: counts.postcards > 0 
                    ? "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                    : "#E5E7EB",
                  color: counts.postcards > 0 ? "#ffffff" : "#9CA3AF",
                  border: "none",
                  borderRadius: "12px",
                  cursor: counts.postcards > 0 ? "pointer" : "not-allowed",
                  fontSize: "16px",
                  fontWeight: "600",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s",
                  textAlign: "left"
                }}
                disabled={counts.postcards === 0}
              >
                <span>📮 엽서 제출하기</span>
                <span style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "14px"
                }}>
                  {counts.postcards}개
                </span>
              </button>
            </div>

            {/* 한 번에 모두 제출 */}
            <button
              onClick={handleSubmitAll}
              style={{
                width: "100%",
                padding: "18px 20px",
                marginTop: "16px",
                background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "17px",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            >
              ⬇️ 한 번에 모두 제출하기
            </button>
          </div>
        )}

        {/* 파일 업로드 제출 섹션 */}
        {learner && (
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              📤 파일 업로드 제출하기
            </h3>

            <p style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "16px",
              lineHeight: "1.5"
            }}>
              작품을 만들지 않았거나 제출이 안 될 경우, 이미지 파일을 직접 업로드하여 제출할 수 있습니다.
            </p>

            {/* 파일 선택 */}
            <div style={{
              marginBottom: "16px"
            }}>
              <input
                id="upload-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <button
                onClick={() => document.getElementById('upload-file-input')?.click()}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                📁 이미지 파일 선택하기
              </button>
            </div>

            {/* 미리보기 및 제목 입력 */}
            {uploadPreview && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}>
                {/* 미리보기 */}
                <div style={{
                  width: "100%",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "2px solid #E5E7EB"
                }}>
                  <img
                    src={uploadPreview}
                    alt="미리보기"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "300px",
                      objectFit: "contain",
                      background: "#F9FAFB"
                    }}
                  />
                </div>

                {/* 제목 입력 */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: "8px"
                  }}>
                    작품 제목
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="작품 제목을 입력하세요"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      fontSize: "15px",
                      outline: "none"
                    }}
                  />
                </div>

                {/* 제출 버튼 */}
                <button
                  onClick={handleUploadSubmit}
                  disabled={isUploading}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    background: isUploading 
                      ? "#9CA3AF" 
                      : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    cursor: isUploading ? "not-allowed" : "pointer",
                    fontSize: "16px",
                    fontWeight: "600"
                  }}
                >
                  {isUploading ? "제출 중..." : "✅ 업로드하여 제출하기"}
                </button>

                {/* 취소 버튼 */}
                <button
                  onClick={() => {
                    setUploadFile(null);
                    setUploadTitle('');
                    setUploadPreview('');
                    const fileInput = document.getElementById('upload-file-input') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    background: "#F3F4F6",
                    color: "#666",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}
                >
                  취소
                </button>
              </div>
            )}
          </div>
        )}

        {/* 로그아웃 버튼 */}
        {learner && (
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "16px 20px",
              background: "#EF4444",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >
            🔓 로그아웃
          </button>
        )}
      </div>
    </div>
  );
}
