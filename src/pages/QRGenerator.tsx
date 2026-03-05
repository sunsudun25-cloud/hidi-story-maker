import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";

export default function QRGenerator() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 이미지 선택 처리
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이미지 파일인지 확인
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 선택해주세요.');
        return;
      }

      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }

      setImageFile(file);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // 이전 QR 코드 초기화
      setQrCodeDataUrl("");
      setUploadedUrl("");
    }
  };

  // 드래그 앤 드롭 처리
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const fakeEvent = {
        target: { files: [file] }
      } as any;
      handleImageSelect(fakeEvent);
    } else {
      alert('이미지 파일만 업로드해주세요.');
    }
  };

  // ImgBB에 이미지 업로드
  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    // ImgBB API 키 (무료, 공개용)
    const apiKey = 'd2e0c0b6b8c8b8f7e9a1f6e5d4c3b2a1'; // 실제 키로 교체 필요
    
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('업로드 실패');
      }

      const data = await response.json();
      return data.data.url;
    } catch (error) {
      console.error('ImgBB 업로드 오류:', error);
      throw error;
    }
  };

  // 이미지를 Base64 URL로 변환 (임시 방법)
  const getImageUrl = async (): Promise<string> => {
    if (!imageFile) {
      throw new Error('이미지가 선택되지 않았습니다.');
    }

    // 방법 1: ImgBB 업로드 시도
    try {
      setIsUploading(true);
      const url = await uploadToImgBB(imageFile);
      setIsUploading(false);
      return url;
    } catch (error) {
      console.warn('외부 업로드 실패, Base64 사용:', error);
      setIsUploading(false);
      
      // 방법 2: Base64 URL 사용 (폴백)
      // 주의: Base64는 QR 코드가 매우 커질 수 있음
      return selectedImage;
    }
  };

  // QR 코드 생성
  const handleGenerateQR = async () => {
    if (!selectedImage) {
      alert('먼저 이미지를 선택해주세요.');
      return;
    }

    try {
      setIsGenerating(true);

      // 이미지 URL 얻기
      const imageUrl = await getImageUrl();
      setUploadedUrl(imageUrl);

      // URL이 너무 길면 경고
      if (imageUrl.length > 2000) {
        alert(
          '⚠️ 주의\n\n' +
          '이미지 URL이 길어서 QR 코드가 복잡할 수 있습니다.\n' +
          '일부 스캐너에서 인식이 어려울 수 있습니다.\n\n' +
          '더 작은 이미지를 사용하거나,\n' +
          '이미지를 웹에서 공유하는 것을 권장합니다.'
        );
      }

      // QR 코드 생성
      if (canvasRef.current) {
        await QRCode.toCanvas(
          canvasRef.current,
          imageUrl,
          {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            errorCorrectionLevel: 'L' // 긴 URL을 위해 낮은 오류 수정
          }
        );

        // Canvas를 이미지로 변환
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setQrCodeDataUrl(dataUrl);
      }

      setIsGenerating(false);
      alert('✅ QR 코드가 생성되었습니다!');
    } catch (error) {
      console.error('QR 생성 오류:', error);
      setIsGenerating(false);
      alert('QR 코드 생성 중 오류가 발생했습니다.');
    }
  };

  // QR 코드 다운로드
  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) {
      alert('먼저 QR 코드를 생성해주세요.');
      return;
    }

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `qrcode-${Date.now()}.png`;
    link.click();
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px", paddingBottom: "80px" }}>
      <div className="responsive-container" style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-5">
          <button
            onClick={() => navigate(-1)}
            className="text-[24px] w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg cursor-pointer"
          >
            ←
          </button>
          <h2 className="text-[22px] font-bold">📱 QR 코드 생성기</h2>
          <div className="w-10"></div>
        </div>

        {/* 안내 메시지 */}
        <div style={{
          background: "#E7F3FF",
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "20px",
          fontSize: "14px",
          lineHeight: "1.6",
          color: "#1565C0"
        }}>
          <p style={{ margin: 0, fontWeight: "600", marginBottom: "8px" }}>
            💡 사용 방법
          </p>
          <p style={{ margin: 0 }}>
            1. 작품 이미지를 업로드하세요<br />
            2. "QR 코드 생성" 버튼을 클릭하세요<br />
            3. 생성된 QR 코드를 다운로드하세요<br />
            4. QR 코드를 스캔하면 이미지를 볼 수 있습니다
          </p>
        </div>

        {/* 이미지 업로드 영역 */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            border: "3px dashed #3498db",
            borderRadius: "16px",
            padding: "40px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: selectedImage ? "#f8f9fa" : "#ffffff",
            marginBottom: "24px",
            transition: "all 0.3s"
          }}
        >
          {selectedImage ? (
            <div>
              <img
                src={selectedImage}
                alt="선택된 이미지"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  borderRadius: "12px",
                  marginBottom: "16px"
                }}
              />
              <p style={{ color: "#666", fontSize: "14px" }}>
                다른 이미지를 선택하려면 클릭하세요
              </p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📷</div>
              <p style={{ fontSize: "16px", fontWeight: "600", color: "#333", marginBottom: "8px" }}>
                이미지를 선택하세요
              </p>
              <p style={{ fontSize: "14px", color: "#666" }}>
                클릭하거나 드래그 & 드롭
              </p>
              <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
                최대 5MB, JPG/PNG
              </p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: "none" }}
        />

        {/* QR 코드 생성 버튼 */}
        <button
          onClick={handleGenerateQR}
          disabled={!selectedImage || isUploading || isGenerating}
          style={{
            width: "100%",
            padding: "18px",
            fontSize: "18px",
            fontWeight: "bold",
            background: selectedImage ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#ccc",
            color: "#ffffff",
            border: "none",
            borderRadius: "12px",
            cursor: selectedImage ? "pointer" : "not-allowed",
            boxShadow: selectedImage ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
            marginBottom: "24px",
            transition: "all 0.3s"
          }}
        >
          {isUploading ? "📤 업로드 중..." : isGenerating ? "⚙️ 생성 중..." : "🎨 QR 코드 생성하기"}
        </button>

        {/* QR 코드 미리보기 */}
        {qrCodeDataUrl && (
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            marginBottom: "24px"
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", textAlign: "center" }}>
              ✅ QR 코드 생성 완료!
            </h3>
            
            <div style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
              background: "#f8f9fa",
              borderRadius: "12px",
              marginBottom: "16px"
            }}>
              <canvas
                ref={canvasRef}
                style={{
                  display: "none"
                }}
              />
              <img
                src={qrCodeDataUrl}
                alt="QR 코드"
                style={{
                  maxWidth: "300px",
                  width: "100%",
                  height: "auto"
                }}
              />
            </div>

            {uploadedUrl && uploadedUrl.startsWith('http') && (
              <div style={{
                background: "#E7F3FF",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "12px",
                color: "#666",
                wordBreak: "break-all"
              }}>
                <p style={{ margin: 0, fontWeight: "600", marginBottom: "4px" }}>이미지 URL:</p>
                <p style={{ margin: 0 }}>{uploadedUrl}</p>
              </div>
            )}

            <button
              onClick={handleDownloadQR}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "18px",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            >
              📥 QR 코드 다운로드
            </button>
          </div>
        )}

        {/* 추가 안내 */}
        <div style={{
          background: "#FFF3CD",
          padding: "16px",
          borderRadius: "12px",
          fontSize: "13px",
          lineHeight: "1.6",
          color: "#856404"
        }}>
          <p style={{ margin: 0, fontWeight: "600", marginBottom: "8px" }}>
            ⚠️ 주의사항
          </p>
          <p style={{ margin: 0 }}>
            • QR 코드는 이미지를 직접 담지 않습니다<br />
            • 이미지가 웹에 업로드되어 URL이 생성됩니다<br />
            • QR 코드를 스캔하면 해당 URL로 이동합니다<br />
            • 업로드된 이미지는 영구적으로 보관됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
