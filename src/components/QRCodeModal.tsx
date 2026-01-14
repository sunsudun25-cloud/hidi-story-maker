import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export default function QRCodeModal({ isOpen, onClose, imageUrl, title = "QR 코드로 공유하기" }: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    if (isOpen && imageUrl && canvasRef.current) {
      // 디버깅: QR 코드 생성 확인
      console.log('🔍 [QR Modal] 열림:', { isOpen, imageUrl: imageUrl?.substring(0, 100) });
      
      // QR 코드 생성
      QRCode.toCanvas(
        canvasRef.current,
        imageUrl,
        {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H'
        },
        (error) => {
          if (error) {
            console.error('❌ [QR Modal] 생성 오류:', error);
            setQrGenerated(false);
          } else {
            console.log('✅ [QR Modal] 생성 완료');
            setQrGenerated(true);
          }
        }
      );
    }
  }, [isOpen, imageUrl]);

  if (!isOpen) return null;

  // 인라인 스타일로 확실하게 표시
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'qrcode.png';
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <div 
      style={overlayStyle}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        style={modalStyle}
        className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 제목 */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          {title}
        </h2>
        
        <p className="text-sm text-gray-600 mb-6 text-center">
          📱 스마트폰으로 QR 코드를 스캔하여<br />
          작품을 확인하세요
        </p>

        {/* QR 코드 */}
        <div className="qrcode-modal flex justify-center mb-6 bg-white p-6 rounded-xl border-2 border-gray-200">
          {imageUrl ? (
            <canvas 
              ref={canvasRef}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg mb-2">⚠️</p>
              <p className="text-sm">URL을 불러올 수 없습니다</p>
            </div>
          )}
        </div>

        {/* URL 표시 (선택사항) */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 text-center break-all px-4">
            {imageUrl.length > 100 ? imageUrl.substring(0, 100) + "..." : imageUrl}
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={!qrGenerated}
            className="flex-1 py-3 px-6 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            📥 QR 코드 저장
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            닫기
          </button>
        </div>

        {/* 안내 메시지 */}
        <p className="text-xs text-gray-400 text-center mt-4">
          💡 QR 코드를 저장하여 다른 사람에게 공유할 수 있습니다
        </p>
      </div>
    </div>
  );
}
