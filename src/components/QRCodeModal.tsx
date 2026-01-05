import { QRCodeSVG } from "qrcode.react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export default function QRCodeModal({ isOpen, onClose, imageUrl, title = "QR 코드로 공유하기" }: QRCodeModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 제목 */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          {title}
        </h2>
        
        <p className="text-sm text-gray-600 mb-6 text-center">
          📱 스마트폰으로 QR 코드를 스캔하여<br />
          이미지를 확인하세요
        </p>

        {/* QR 코드 */}
        <div className="qrcode-modal flex justify-center mb-6 bg-white p-6 rounded-xl border-2 border-gray-200">
          <QRCodeSVG 
            value={imageUrl}
            size={256}
            level="H"
            includeMargin={true}
          />
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
            onClick={() => {
              // QR 코드 이미지 다운로드
              const svg = document.querySelector('.qrcode-modal svg');
              if (svg) {
                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                
                img.onload = () => {
                  canvas.width = img.width;
                  canvas.height = img.height;
                  ctx?.drawImage(img, 0, 0);
                  
                  canvas.toBlob((blob) => {
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
                
                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
              }
            }}
            className="flex-1 py-3 px-6 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
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
