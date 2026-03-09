// src/pages/MyWorksHome.tsx
import { useNavigate } from "react-router-dom";

export default function MyWorksHome() {
  const navigate = useNavigate();
  
  console.log("🔥🔥🔥 MyWorksHome NEW VERSION LOADED 🔥🔥🔥");

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FFF9F0',
      padding: '20px'
    }}>
      {/* 제목 */}
      <h1 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '24px',
        textAlign: 'center',
        color: '#333'
      }}>
        내 작품 관리
      </h1>

      {/* 메뉴 3개 */}
      <div className="responsive-container" style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '16px'
      }}>

        {/* 🎨 이미지 */}
        <button
          onClick={() => navigate("/my-works/images")}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px',
            backgroundColor: 'white',
            border: '2px solid #E5E7EB',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}
        >
          <span style={{ fontSize: '36px' }}>🎨</span>
          <div>
            <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>이미지</p>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>AI로 만든 그림 보기</p>
          </div>
        </button>

        {/* 📝 글쓰기 */}
        <button
          onClick={() => navigate("/my-works/stories")}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px',
            backgroundColor: 'white',
            border: '2px solid #E5E7EB',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}
        >
          <span style={{ fontSize: '36px' }}>📝</span>
          <div>
            <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>글쓰기</p>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>작성한 글 보기</p>
          </div>
        </button>

        {/* 📕 동화책 */}
        <button
          onClick={() => navigate("/my-works/storybooks")}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px',
            backgroundColor: 'white',
            border: '2px solid #E5E7EB',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}
        >
          <span style={{ fontSize: '36px' }}>📕</span>
          <div>
            <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>동화책</p>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>만든 동화책 보기</p>
          </div>
        </button>

        {/* 📮 엽서 */}
        <button
          onClick={() => navigate("/my-works/postcards")}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px',
            backgroundColor: 'white',
            border: '2px solid #E5E7EB',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}
        >
          <span style={{ fontSize: '36px' }}>📮</span>
          <div>
            <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>엽서</p>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>만든 엽서 보기</p>
          </div>
        </button>

      </div>
    </div>
  );
}
