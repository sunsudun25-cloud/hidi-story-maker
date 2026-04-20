import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Header from './components/Header'
import InstallPrompt from './components/InstallPrompt'
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
import NovelGenreSelect from './pages/NovelGenreSelect'
import WritingQuestions from './pages/WritingQuestions'
import WritingAiQuestions from './pages/WritingAiQuestions'
import FourcutInterviewTheme from './pages/FourcutInterviewTheme'
import FourcutInterviewSetup from './pages/FourcutInterviewSetup'
import FourcutInterviewResult from './pages/FourcutInterviewResult'
import FourcutInterviewPractice from './pages/FourcutInterviewPractice'
import FourcutImageGeneration from './pages/FourcutImageGeneration'
import FourcutStoryResult from './pages/FourcutStoryResult'
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
import MyWorksHome from './pages/MyWorksHome'
import MyWorksImages from './pages/MyWorksImages'

// 🔥 Debug log
console.log("🔥 MyWorksHome component loaded:", MyWorksHome)
import MyWorksImageDetail from './pages/MyWorksImageDetail'
import MyWorksStories from './pages/MyWorksStories'
import MyWorksStoryDetail from './pages/MyWorksStoryDetail'
import MyWorksStorybooks from './pages/MyWorksStorybooks'
import MyWorksStorybookDetail from './pages/MyWorksStorybookDetail'
import MyWorksPostcards from './pages/MyWorksPostcards'
import MyWorksPostcardDetail from './pages/MyWorksPostcardDetail'
import Settings from './pages/Settings'
import SubmitImages from './pages/SubmitImages'
import SubmitStories from './pages/SubmitStories'
import SubmitStorybooks from './pages/SubmitStorybooks'
import SubmitPostcards from './pages/SubmitPostcards'
import SharedStory from './pages/SharedStory'
import Goods from './pages/Goods'
import GoodsExperience from './pages/GoodsExperience'
import GoodsPostcard from './pages/GoodsPostcard'
import QRGenerator from './pages/QRGenerator'
import TeacherCreateClass from './pages/TeacherCreateClass'
import Result from './pages/Result'
import TestButtons from './pages/TestButtons'
import ImageMakePractice from './pages/ImageMake/Practice'
import ImageMakeCustom from './pages/ImageMake/Custom'
import ImageMakeResult from './pages/ImageMake/Result'
import Gallery from './pages/Gallery'
import GalleryStoryDetail from './pages/GalleryStoryDetail'
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

        {/* 🏆 내 작품 관리 - Layout 없이 독립 렌더링 */}
        <Route path="/my-works" element={<MyWorksHome />} />
        <Route path="/my-works/images" element={<MyWorksImages />} />
        <Route path="/my-works/images/:id" element={<MyWorksImageDetail />} />
        <Route path="/my-works/stories" element={<MyWorksStories />} />
        <Route path="/my-works/stories/:id" element={<MyWorksStoryDetail />} />
        <Route path="/shared/story" element={<SharedStory />} />
        <Route path="/my-works/storybooks" element={<MyWorksStorybooks />} />
        <Route path="/my-works/storybooks/:id" element={<MyWorksStorybookDetail />} />
        <Route path="/my-works/postcards" element={<MyWorksPostcards />} />
        <Route path="/my-works/postcards/:id" element={<MyWorksPostcardDetail />} />

        {/* ⚙️ 설정 페이지 - Layout 없이 독립 렌더링 */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/submit/images" element={<SubmitImages />} />
        <Route path="/settings/submit/stories" element={<SubmitStories />} />
        <Route path="/settings/submit/storybooks" element={<SubmitStorybooks />} />
        <Route path="/settings/submit/postcards" element={<SubmitPostcards />} />

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
          <Route path="/write/fourcut-theme" element={<FourcutInterviewTheme />} />
          <Route path="/write/fourcut-interview" element={<FourcutInterviewSetup />} />
          <Route path="/write/fourcut-result" element={<FourcutInterviewResult />} />
          <Route path="/write/fourcut-practice" element={<FourcutInterviewPractice />} />
          <Route path="/write/fourcut-images" element={<FourcutImageGeneration />} />
          <Route path="/write/fourcut-story-result" element={<FourcutStoryResult />} />
          <Route path="/writing/practice" element={<WritingPractice />} />
          <Route path="/writing/photo" element={<WritingPhoto />} />
          <Route path="/writing/voice" element={<WritingVoice />} />
          <Route path="/writing/genre" element={<WritingGenre />} />
          <Route path="/writing/novel/genre" element={<NovelGenreSelect />} />
          <Route path="/writing/genre/questions" element={<WritingQuestions />} />
          <Route path="/writing/questions" element={<WritingAiQuestions />} />
          <Route path="/writing/help" element={<WritingHelp />} />
          <Route path="/writing/editor" element={<WritingEditor />} />
          <Route path="/writing/detail" element={<WritingDetail />} />

          {/* 🎁 나만의 굿즈 */}
          <Route path="/goods" element={<Goods />} />
          <Route path="/goods/experience" element={<GoodsExperience />} />
          <Route path="/goods/postcard/:id" element={<GoodsPostcard />} />
          <Route path="/qr-generator" element={<QRGenerator />} />

          {/* 👨‍🏫 선생님 전용 */}
          <Route path="/teacher/create-class" element={<TeacherCreateClass />} />

          {/* 🎨 갤러리 */}
          <Route path="/gallery/:classCode" element={<Gallery />} />
          <Route path="/gallery/:classCode/story/:artifactId" element={<GalleryStoryDetail />} />

          {/* 기타 페이지 */}
          <Route path="/image/practice" element={<ImageMakePractice />} />
          <Route path="/image/custom" element={<ImageMakeCustom />} />
          <Route path="/image/result" element={<ImageMakeResult />} />
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
      <InstallPrompt />
    </BrowserRouter>
  );
}

export default App
