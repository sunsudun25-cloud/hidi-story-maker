import { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";

interface ClassData {
  id: string;
  classCode: string;
  className: string;
  teacherName: string;
  createdAt: any;
}

export default function Admin() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // 새 수업 생성 폼
  const [newClass, setNewClass] = useState({
    teacherName: "",
    teacherInitial: "",
    className: "",
  });

  // 비밀번호 확인
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  // 간단한 비밀번호 인증 (실제로는 더 강력한 인증 필요)
  const ADMIN_PASSWORD = "admin1234"; // 실제 배포 시 환경변수로 관리

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      loadClasses();
    } else {
      alert("❌ 비밀번호가 틀렸습니다.");
    }
  };

  // 전체 수업 코드 불러오기
  const loadClasses = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "classes"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      
      const classList: ClassData[] = [];
      snapshot.forEach((doc) => {
        classList.push({
          id: doc.id,
          ...doc.data(),
        } as ClassData);
      });
      
      setClasses(classList);
      console.log(`✅ ${classList.length}개의 수업 불러옴`);
    } catch (error) {
      console.error("수업 불러오기 오류:", error);
      alert("수업 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 새 수업 생성
  const handleCreateClass = async () => {
    const { teacherName, teacherInitial, className } = newClass;

    if (!teacherName || !teacherInitial || !className) {
      alert("모든 정보를 입력해주세요!");
      return;
    }

    if (!/^[A-Z]$/.test(teacherInitial)) {
      alert("이니셜은 영문 대문자 1글자여야 합니다. (예: C, K, P)");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(
        "https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/classCreate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teacherName,
            teacherInitial: teacherInitial.toUpperCase(),
            className,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert(`✅ 수업 생성 완료!\n\n수업 코드: ${result.classCode}\n수업 이름: ${result.className}\n강사 이름: ${result.teacherName}`);
        
        // 폼 초기화
        setNewClass({
          teacherName: "",
          teacherInitial: "",
          className: "",
        });
        
        // 목록 새로고침
        loadClasses();
      } else {
        alert("❌ 생성 실패: " + result.error);
      }
    } catch (error) {
      console.error("수업 생성 오류:", error);
      alert("수업 생성 중 오류가 발생했습니다.");
    } finally {
      setCreating(false);
    }
  };

  // 수업 삭제
  const handleDeleteClass = async (classCode: string, className: string) => {
    const confirmed = window.confirm(
      `정말로 이 수업을 삭제하시겠습니까?\n\n수업 코드: ${classCode}\n수업 이름: ${className}\n\n⚠️ 이 작업은 되돌릴 수 없습니다!`
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "classes", classCode));
      alert("✅ 수업이 삭제되었습니다.");
      loadClasses();
    } catch (error) {
      console.error("수업 삭제 오류:", error);
      alert("수업 삭제 중 오류가 발생했습니다.");
    }
  };

  // 로그인 화면
  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          maxWidth: "400px",
          width: "100%",
        }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px", textAlign: "center" }}>
            🔑 관리자 로그인
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            placeholder="비밀번호를 입력하세요"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              border: "2px solid #ddd",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          />
          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "18px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            로그인
          </button>
          <div style={{ marginTop: "16px", fontSize: "14px", color: "#666", textAlign: "center" }}>
            기본 비밀번호: admin1234
          </div>
        </div>
      </div>
    );
  }

  // 관리자 페이지
  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>
          🔑 관리자 페이지
        </h1>
        <button
          onClick={() => setIsAuthenticated(false)}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          로그아웃
        </button>
      </div>

      {/* 새 수업 생성 폼 */}
      <div style={{
        backgroundColor: "white",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: "30px",
      }}>
        <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "20px" }}>
          ➕ 새 수업 생성
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              강사 이름 (한글/영문)
            </label>
            <input
              type="text"
              value={newClass.teacherName}
              onChange={(e) => setNewClass({ ...newClass, teacherName: e.target.value })}
              placeholder="예: 최선호"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                border: "2px solid #ddd",
                borderRadius: "8px",
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              이니셜 (영문 대문자 1자)
            </label>
            <input
              type="text"
              value={newClass.teacherInitial}
              onChange={(e) => setNewClass({ ...newClass, teacherInitial: e.target.value.toUpperCase() })}
              placeholder="예: C"
              maxLength={1}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                border: "2px solid #ddd",
                borderRadius: "8px",
                textTransform: "uppercase",
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              수업 이름
            </label>
            <input
              type="text"
              value={newClass.className}
              onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
              placeholder="예: 국어 수업"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                border: "2px solid #ddd",
                borderRadius: "8px",
              }}
            />
          </div>
        </div>
        
        <button
          onClick={handleCreateClass}
          disabled={creating}
          style={{
            padding: "14px 28px",
            fontSize: "18px",
            backgroundColor: creating ? "#9ca3af" : "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: creating ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {creating ? "⏳ 생성 중..." : "✨ 수업 생성"}
        </button>
      </div>

      {/* 수업 목록 */}
      <div style={{
        backgroundColor: "white",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "600" }}>
            📚 전체 수업 목록
          </h2>
          <button
            onClick={loadClasses}
            disabled={loading}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: loading ? "#9ca3af" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
            }}
          >
            {loading ? "⏳ 로딩..." : "🔄 새로고침"}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", fontSize: "18px", color: "#666" }}>
            ⏳ 수업 목록을 불러오는 중...
          </div>
        ) : classes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", fontSize: "18px", color: "#666" }}>
            ⚠️ 등록된 수업이 없습니다.
          </div>
        ) : (
          <>
            <div style={{ 
              backgroundColor: "#dbeafe", 
              padding: "12px 16px", 
              borderRadius: "8px", 
              marginBottom: "16px",
              fontWeight: "600",
            }}>
              총 {classes.length}개의 수업
            </div>
            
            <div style={{ display: "grid", gap: "16px" }}>
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  style={{
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "20px",
                    borderLeftWidth: "4px",
                    borderLeftColor: "#3b82f6",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "16px", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                        수업 코드
                      </div>
                      <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2563eb" }}>
                        {cls.classCode}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                        수업 이름
                      </div>
                      <div style={{ fontSize: "18px", fontWeight: "600" }}>
                        {cls.className}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                        강사 이름
                      </div>
                      <div style={{ fontSize: "16px" }}>
                        {cls.teacherName}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                        생성 날짜
                      </div>
                      <div style={{ fontSize: "14px" }}>
                        {cls.createdAt?.toDate?.().toLocaleString("ko-KR") || "N/A"}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteClass(cls.classCode, cls.className)}
                      style={{
                        padding: "8px 16px",
                        fontSize: "14px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
