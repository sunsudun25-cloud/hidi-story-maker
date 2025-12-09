// src/pages/Report.tsx
import { useNavigate } from "react-router-dom";
import "./Report.css";

export default function Report() {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="report-container">
      <div className="report-header-actions">
        <button className="report-btn back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
        <button className="report-btn print-btn" onClick={handlePrint}>
          🖨️ PDF로 저장
        </button>
      </div>

      <div className="report-content">
        <h1 className="report-title">HI-DI Edu AI Story Maker 기능 구현 현황 보고서</h1>
        
        <div className="report-section">
          <h2>1. 프로젝트 개요</h2>
          <table className="info-table">
            <tbody>
              <tr>
                <th>프로젝트명</th>
                <td>HI-DI Edu AI Story Maker</td>
              </tr>
              <tr>
                <th>목적</th>
                <td>시니어·학생·창작자를 위한 AI 기반 창작 플랫폼</td>
              </tr>
              <tr>
                <th>배포 URL</th>
                <td>https://story-maker-4l6.pages.dev</td>
              </tr>
              <tr>
                <th>기술 스택</th>
                <td>React, TypeScript, Cloudflare Pages, Gemini API</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h2>2. 구현 완료 기능 ✅</h2>
          
          <h3>2.1 그림 만들기 모듈 (100%)</h3>
          <ul>
            <li>✅ AI 기반 이미지 생성 (Gemini API)</li>
            <li>✅ 음성 입력 지원 (Web Speech API)</li>
            <li>✅ 스타일 선택 기능</li>
            <li>✅ 예시 프롬프트 제공</li>
            <li>✅ 작품 저장 및 관리</li>
          </ul>

          <h3>2.2 동화책 만들기 모듈 (100%)</h3>
          <ul>
            <li>✅ AI 초안 자동 생성 (3페이지)</li>
            <li>✅ 페이지 확장 시스템 (AI/직접 선택)</li>
            <li>✅ 삽화 자동 생성</li>
            <li>✅ 최소 10페이지 시스템</li>
            <li>✅ PDF 내보내기 기능</li>
          </ul>

          <h3>2.3 글쓰기 모듈 (100%)</h3>
          <ul>
            <li>✅ 3가지 시작 모드 (연습/장르선택/자유쓰기)</li>
            <li>✅ 6가지 장르 시스템 (일기/편지/수필/시/소설/자서전)</li>
            <li>✅ AI 글쓰기 도우미 (8가지 기능)</li>
            <li>✅ 음성 입력 지원</li>
            <li>✅ 자동 저장 기능</li>
          </ul>

          <h3>2.4 내 작품 관리 모듈 (50%)</h3>
          <ul>
            <li>✅ 작품 목록 표시 (그림/글/동화책)</li>
            <li>✅ 작품 삭제 기능</li>
            <li>✅ 작품 상세보기</li>
            <li>✅ LocalStorage 기반 저장</li>
          </ul>

          <h3>2.5 기본 UI/UX (100%)</h3>
          <ul>
            <li>✅ 시니어 친화적 UI (큰 글자, 파스텔 톤)</li>
            <li>✅ 반응형 레이아웃</li>
            <li>✅ 헤더/네비게이션 시스템</li>
            <li>✅ 비회원 로그인</li>
          </ul>
        </div>

        <div className="report-section">
          <h2>3. 미구현 기능 ❌</h2>

          <h3>3.1 사용자 인증 시스템 (0%)</h3>
          <table className="feature-table">
            <thead>
              <tr>
                <th>기능</th>
                <th>상태</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>구글 로그인</td>
                <td className="status-fail">❌ 미구현</td>
                <td>버튼만 존재, OAuth 연동 필요</td>
              </tr>
              <tr>
                <td>카카오 로그인</td>
                <td className="status-fail">❌ 미구현</td>
                <td>버튼만 존재, OAuth 연동 필요</td>
              </tr>
              <tr>
                <td>사용자 계정 관리</td>
                <td className="status-fail">❌ 미구현</td>
                <td>DB 설계 필요</td>
              </tr>
              <tr>
                <td>세션 관리</td>
                <td className="status-fail">❌ 미구현</td>
                <td>JWT 또는 세션 쿠키 필요</td>
              </tr>
            </tbody>
          </table>
          <div className="requirement-box">
            <strong>필요 작업:</strong>
            <ul>
              <li>Google/Kakao OAuth 2.0 설정</li>
              <li>Cloudflare D1 사용자 테이블 생성</li>
              <li>JWT 토큰 발급/검증 API</li>
            </ul>
          </div>

          <h3>3.2 기기 간 동기화 (0%)</h3>
          <table className="feature-table">
            <thead>
              <tr>
                <th>기능</th>
                <th>상태</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>동기화 코드 생성</td>
                <td className="status-fail">❌ 미구현</td>
                <td>6자리 코드 시스템</td>
              </tr>
              <tr>
                <td>작품 데이터 업로드</td>
                <td className="status-fail">❌ 미구현</td>
                <td>Cloudflare KV 필요</td>
              </tr>
              <tr>
                <td>다른 기기에서 불러오기</td>
                <td className="status-fail">❌ 미구현</td>
                <td>코드 입력 UI</td>
              </tr>
              <tr>
                <td>QR 코드 공유</td>
                <td className="status-fail">❌ 미구현</td>
                <td>QR 생성 라이브러리</td>
              </tr>
            </tbody>
          </table>
          <p className="current-status"><strong>현재 상태:</strong> "준비중" 알림만 표시</p>
          <div className="requirement-box">
            <strong>필요 작업:</strong>
            <ul>
              <li>Cloudflare KV Storage 설정</li>
              <li>/api/sync/create API 구현</li>
              <li>/api/sync/retrieve API 구현</li>
              <li>동기화 UI/UX 구현</li>
            </ul>
          </div>

          <h3>3.3 파일 업로드 (0%)</h3>
          <table className="feature-table">
            <thead>
              <tr>
                <th>기능</th>
                <th>상태</th>
                <th>위치</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>사진 업로드</td>
                <td className="status-fail">❌ 미구현</td>
                <td>DrawDirect 페이지</td>
              </tr>
              <tr>
                <td>이미지 전처리</td>
                <td className="status-fail">❌ 미구현</td>
                <td>-</td>
              </tr>
              <tr>
                <td>클라우드 저장</td>
                <td className="status-fail">❌ 미구현</td>
                <td>Cloudflare R2 필요</td>
              </tr>
            </tbody>
          </table>
          <p className="current-status"><strong>현재 상태:</strong> "준비 중입니다" 알림 표시</p>
          <div className="requirement-box">
            <strong>필요 작업:</strong>
            <ul>
              <li>파일 선택 UI 구현</li>
              <li>이미지 리사이즈/압축</li>
              <li>Cloudflare R2 버킷 설정</li>
              <li>업로드 API 구현</li>
            </ul>
          </div>

          <h3>3.4 설정 기능 (0%)</h3>
          <table className="feature-table">
            <thead>
              <tr>
                <th>기능</th>
                <th>상태</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>글자 크기 조정</td>
                <td className="status-fail">❌ 미구현</td>
                <td>접근성 개선</td>
              </tr>
              <tr>
                <td>음성 속도 설정</td>
                <td className="status-fail">❌ 미구현</td>
                <td>TTS 옵션</td>
              </tr>
              <tr>
                <td>알림 설정</td>
                <td className="status-fail">❌ 미구현</td>
                <td>푸시 알림</td>
              </tr>
              <tr>
                <td>테마 변경</td>
                <td className="status-fail">❌ 미구현</td>
                <td>다크모드 등</td>
              </tr>
            </tbody>
          </table>
          <p className="current-status"><strong>현재 상태:</strong> "준비중" 알림 표시</p>

          <h3>3.5 굿즈 제작 모듈 (5%)</h3>
          <table className="feature-table">
            <thead>
              <tr>
                <th>기능</th>
                <th>상태</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>AI 출판 (책 제작)</td>
                <td className="status-fail">❌ 미구현</td>
                <td>PDF 고도화 필요</td>
              </tr>
              <tr>
                <td>창작자 수익화</td>
                <td className="status-fail">❌ 미구현</td>
                <td>결제 시스템 필요</td>
              </tr>
              <tr>
                <td>전시 & 공유</td>
                <td className="status-fail">❌ 미구현</td>
                <td>디지털 갤러리</td>
              </tr>
              <tr>
                <td>실물 굿즈 제작</td>
                <td className="status-fail">❌ 미구현</td>
                <td>외부 업체 연동</td>
              </tr>
            </tbody>
          </table>
          <p className="current-status"><strong>현재 상태:</strong> UI 화면만 구성, "업데이트 예정" 알림</p>
          <div className="requirement-box">
            <strong>필요 작업:</strong>
            <ul>
              <li>인쇄용 PDF 생성 (300dpi)</li>
              <li>결제 시스템 (Stripe/Toss)</li>
              <li>주문 관리 시스템</li>
              <li>굿즈 제작 업체 API 연동</li>
            </ul>
          </div>

          <h3>3.6 음성 입력 (부분 구현)</h3>
          <table className="feature-table">
            <thead>
              <tr>
                <th>페이지</th>
                <th>상태</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>DrawPractice</td>
                <td className="status-success">✅ 구현</td>
                <td>Web Speech API</td>
              </tr>
              <tr>
                <td>WriteEditor</td>
                <td className="status-success">✅ 구현</td>
                <td>Web Speech API</td>
              </tr>
              <tr>
                <td>DrawDirect</td>
                <td className="status-fail">❌ 미구현</td>
                <td>TODO 주석만 존재</td>
              </tr>
            </tbody>
          </table>
          <p className="current-status"><strong>현재 상태:</strong> DrawDirect 페이지에서 "음성 입력 시작" 알림만 표시</p>

          <h3>3.7 작품 관리 고도화 (50%)</h3>
          <table className="feature-table">
            <thead>
              <tr>
                <th>기능</th>
                <th>상태</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>기본 목록 표시</td>
                <td className="status-success">✅ 구현</td>
                <td>-</td>
              </tr>
              <tr>
                <td>삭제 기능</td>
                <td className="status-success">✅ 구현</td>
                <td>-</td>
              </tr>
              <tr>
                <td>검색 기능</td>
                <td className="status-fail">❌ 미구현</td>
                <td>-</td>
              </tr>
              <tr>
                <td>필터링</td>
                <td className="status-fail">❌ 미구현</td>
                <td>장르/날짜/타입</td>
              </tr>
              <tr>
                <td>정렬</td>
                <td className="status-fail">❌ 미구현</td>
                <td>최신순/이름순</td>
              </tr>
              <tr>
                <td>폴더/태그</td>
                <td className="status-fail">❌ 미구현</td>
                <td>분류 시스템</td>
              </tr>
              <tr>
                <td>작품 수정</td>
                <td className="status-warning">⚠️ 제한적</td>
                <td>일부만 가능</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h2>4. 기능별 구현 우선순위</h2>
          
          <div className="priority-box priority-high">
            <h3>🔴 최우선 (High Priority)</h3>
            <ol>
              <li><strong>사용자 인증 시스템</strong> - 개인화 서비스의 기반</li>
              <li><strong>기기 간 동기화</strong> - 사용자 편의성 핵심</li>
              <li><strong>작품 관리 고도화</strong> - 검색/필터링/정렬</li>
            </ol>
          </div>

          <div className="priority-box priority-medium">
            <h3>🟡 중요 (Medium Priority)</h3>
            <ol start={4}>
              <li><strong>설정 기능</strong> - 접근성 및 사용자 경험 개선</li>
              <li><strong>DrawDirect 음성 입력</strong> - 기능 일관성 확보</li>
              <li><strong>파일 업로드</strong> - 그림 기능 확장</li>
            </ol>
          </div>

          <div className="priority-box priority-low">
            <h3>🟢 장기 (Low Priority)</h3>
            <ol start={7}>
              <li><strong>굿즈 제작</strong> - 비즈니스 모델 (수익화)</li>
            </ol>
          </div>
        </div>

        <div className="report-section">
          <h2>5. 기술적 요구사항</h2>
          
          <h3>5.1 필요한 인프라</h3>
          <ul>
            <li><strong>Cloudflare D1</strong>: 사용자 계정 DB</li>
            <li><strong>Cloudflare KV</strong>: 동기화 코드 저장</li>
            <li><strong>Cloudflare R2</strong>: 이미지 파일 저장</li>
            <li><strong>OAuth Provider</strong>: Google/Kakao 개발자 등록</li>
          </ul>

          <h3>5.2 필요한 API</h3>
          <ul>
            <li><code>/api/auth/google/callback</code> - 구글 로그인</li>
            <li><code>/api/auth/kakao/callback</code> - 카카오 로그인</li>
            <li><code>/api/sync/create</code> - 동기화 코드 생성</li>
            <li><code>/api/sync/retrieve</code> - 동기화 데이터 가져오기</li>
            <li><code>/api/upload</code> - 파일 업로드</li>
          </ul>

          <h3>5.3 개발 예상 시간</h3>
          <table className="time-table">
            <thead>
              <tr>
                <th>기능</th>
                <th>예상 시간</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>구글/카카오 로그인</td>
                <td>4-6시간</td>
              </tr>
              <tr>
                <td>기기 동기화</td>
                <td>3-4시간</td>
              </tr>
              <tr>
                <td>파일 업로드</td>
                <td>2-3시간</td>
              </tr>
              <tr>
                <td>설정 기능</td>
                <td>2-3시간</td>
              </tr>
              <tr>
                <td>작품 관리 고도화</td>
                <td>3-4시간</td>
              </tr>
              <tr>
                <td>굿즈 제작</td>
                <td>20-30시간</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h2>6. 현재 구현률</h2>
          
          <div className="progress-section">
            <h3>전체 기능</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '60%'}}>60%</div>
            </div>
          </div>

          <div className="progress-section">
            <h3>핵심 기능</h3>
            <div className="progress-item">
              <span className="progress-label">그림 만들기</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '100%'}}>100%</div>
              </div>
            </div>
            <div className="progress-item">
              <span className="progress-label">동화책 만들기</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '100%'}}>100%</div>
              </div>
            </div>
            <div className="progress-item">
              <span className="progress-label">글쓰기</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '100%'}}>100%</div>
              </div>
            </div>
            <div className="progress-item">
              <span className="progress-label">작품 관리</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '50%'}}>50%</div>
              </div>
            </div>
            <div className="progress-item">
              <span className="progress-label">굿즈 제작</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '5%'}}>5%</div>
              </div>
            </div>
          </div>

          <div className="progress-section">
            <h3>부가 기능</h3>
            <div className="progress-item">
              <span className="progress-label">사용자 인증</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '0%'}}>0%</div>
              </div>
            </div>
            <div className="progress-item">
              <span className="progress-label">기기 동기화</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '0%'}}>0%</div>
              </div>
            </div>
            <div className="progress-item">
              <span className="progress-label">설정</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '0%'}}>0%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h2>7. 결론</h2>
          <div className="conclusion-box">
            <p><strong>구현 완료:</strong> 핵심 창작 기능 (그림/동화책/글쓰기)</p>
            <p><strong>미구현:</strong> 사용자 관리 및 부가 서비스</p>
            <p><strong>다음 단계:</strong> 사용자 인증 시스템 구현을 통한 클라우드 기반 서비스 전환 권장</p>
          </div>
        </div>

        <div className="report-footer">
          <p><strong>보고서 작성일:</strong> 2025-12-09</p>
          <p><strong>버전:</strong> v1.0</p>
          <p><strong>작성자:</strong> Development Team</p>
        </div>
      </div>

      <div className="report-print-instruction">
        <p>💡 <strong>PDF 저장 방법:</strong></p>
        <ol>
          <li>"PDF로 저장" 버튼 클릭 또는 Ctrl+P (Windows) / Cmd+P (Mac)</li>
          <li>프린터에서 "PDF로 저장" 선택</li>
          <li>파일 이름 입력 후 저장</li>
        </ol>
      </div>
    </div>
  );
}
