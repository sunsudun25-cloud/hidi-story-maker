import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Header from './components/Header'
import Welcome from './pages/Welcome'
import OnboardingLogin from './pages/OnboardingLogin'
import Home from './pages/Home'
import DrawStart from './pages/DrawStart'
import DrawPractice from './pages/DrawPractice'
import DrawDirect from './pages/DrawDirect'
import DrawingResult from './pages/DrawingResult'
import DirectInput from './pages/DirectInput'
import Write from './pages/Write'
import WriteStart from './pages/WriteStart'
import WriteEditor from './pages/WriteEditor'
import WritingPracticeNew from './pages/WritingPracticeNew'
import WritingGenre from './pages/WritingGenre'
import WritingQuestions from './pages/WritingQuestions'
import WritingAiQuestions from './pages/WritingAiQuestions'
import WritingPhoto from './pages/WritingPhoto'
import WritingVoice from './pages/WritingVoice'
import WritingHelp from './pages/WritingHelp'
import WritingEditor from './pages/WritingEditor'
import WritingDetail from './pages/WritingDetail'
import WritingPractice from './pages/WritingPractice'
import Storybook from './pages/Storybook'
import StorybookManual from './pages/StorybookManual'
import StorybookAISuggestion from './pages/StorybookAISuggestion'
import StorybookEditor from './pages/StorybookEditor'
import StorybookEditorModify from './pages/StorybookEditorModify'
import StorybookExport from './pages/StorybookExport'
import MyWorks from './pages/MyWorks'
import Goods from './pages/Goods'
import Result from './pages/Result'
import TestButtons from './pages/TestButtons'
import ImageMakePractice from './pages/ImageMake/Practice'
import ImageMakeCustom from './pages/ImageMake/Custom'
import ImageMakeResult from './pages/ImageMake/Result'
import Gallery from './pages/Gallery'
import './App.css'

// Header를 조건부로 렌더링하는 래퍼 컴포넌트
function AppContent() {
  const location = useLocation();
  const hideHeaderPaths = ['/', '/onboarding'];
  const shouldShowHeader = !hideHeaderPaths.includes(location.pathname);

  return (
    <>
      {/* ⭐ Header를 Layout 외부에서 전역으로 렌더링 */}
      {shouldShowHeader && <Header />}
      
      <Routes>
        {/* 헤더/Footer가 필요 없는 페이지 (Welcome, Onboarding만) */}
        <Route path="/" element={<Welcome />} />
        <Route path="/onboarding" element={<OnboardingLogin />} />

        {/* ⭐ 모든 페이지는 Layout 포함 (Footer 통일) */}
        <Route element={<Layout />}>
          {/* 🏠 홈 */}
          <Route path="/home" element={<Home />} />
          
          {/* 📚 동화책 */}
          <Route path="/storybook" element={<StorybookManual />} />
          <Route path="/storybook-editor" element={<StorybookEditor />} />
          <Route path="/storybook-editor-modify" element={<StorybookEditorModify />} />
          <Route path="/storybook-export" element={<StorybookExport />} />
          {/* 🎨 그림 */}
          <Route path="/drawing/start" element={<DrawStart />} />
          <Route path="/drawing/practice" element={<DrawPractice />} />
          <Route path="/drawing/direct" element={<DrawDirect />} />
          <Route path="/drawing/result" element={<DrawingResult />} />
          <Route path="/direct-input" element={<DirectInput />} />

          {/* ✏️ 글쓰기 */}
          <Route path="/write/start" element={<WriteStart />} />
          <Route path="/write" element={<Write />} />
          <Route path="/write/practice" element={<WritingPracticeNew />} />
          <Route path="/write/editor" element={<WriteEditor />} />
          <Route path="/writing/practice" element={<WritingPractice />} />
          <Route path="/writing/photo" element={<WritingPhoto />} />
          <Route path="/writing/voice" element={<WritingVoice />} />
          <Route path="/writing/genre" element={<WritingGenre />} />
          <Route path="/writing/genre/questions" element={<WritingQuestions />} />
          <Route path="/writing/questions" element={<WritingAiQuestions />} />
          <Route path="/writing/help" element={<WritingHelp />} />
          <Route path="/writing/editor" element={<WritingEditor />} />
          <Route path="/writing/detail" element={<WritingDetail />} />

          {/* 🏆 내 작품 */}
          <Route path="/my-works" element={<MyWorks />} />

          {/* 🎁 나만의 굿즈 */}
          <Route path="/goods" element={<Goods />} />

          {/* 기타 페이지 */}
          <Route path="/image/practice" element={<ImageMakePractice />} />
          <Route path="/image/custom" element={<ImageMakeCustom />} />
          <Route path="/image/result" element={<ImageMakeResult />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/result" element={<Result />} />
          <Route path="/test-buttons" element={<TestButtons />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AppContent />
    </BrowserRouter>
  );
}

export default App
