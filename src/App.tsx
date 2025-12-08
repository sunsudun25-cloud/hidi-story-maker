import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Welcome from './pages/Welcome'
import OnboardingLogin from './pages/OnboardingLogin'
import Home from './pages/Home'
import DrawStart from './pages/DrawStart'
import DrawPractice from './pages/DrawPractice'
import DrawDirect from './pages/DrawDirect'
import DrawingResult from './pages/DrawingResult'
import DirectInput from './pages/DirectInput'
import Write from './pages/Write'
import WriteEditor from './pages/WriteEditor'
import WritingPracticeNew from './pages/WritingPracticeNew'
import WritingGenre from './pages/WritingGenre'
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

function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Routes>
        {/* 헤더가 필요 없는 페이지 */}
        <Route path="/" element={<Welcome />} />
        <Route path="/onboarding" element={<OnboardingLogin />} />
        <Route path="/home" element={<Home />} />

        {/* Storybook 페이지들 (헤더 자체 포함, Layout 불필요) */}
        <Route path="/storybook" element={<Storybook />} />
        <Route path="/storybook-manual" element={<StorybookManual />} />
        <Route path="/storybook-ai-suggestion" element={<StorybookAISuggestion />} />
        <Route path="/storybook-editor" element={<StorybookEditor />} />
        <Route path="/storybook-export" element={<StorybookExport />} />

        {/* 나머지 페이지는 Layout으로 감싸기 */}
        <Route element={<Layout />}>
          <Route path="/drawing/start" element={<DrawStart />} />
          <Route path="/drawing/practice" element={<DrawPractice />} />
          <Route path="/drawing/direct" element={<DrawDirect />} />
          <Route path="/drawing/result" element={<DrawingResult />} />
          <Route path="/direct-input" element={<DirectInput />} />
          <Route path="/write" element={<Write />} />
          <Route path="/write/practice" element={<WritingPracticeNew />} />
          <Route path="/write/editor" element={<WriteEditor />} />
          <Route path="/writing/practice" element={<WritingPractice />} />
          <Route path="/writing/photo" element={<WritingPhoto />} />
          <Route path="/writing/voice" element={<WritingVoice />} />
          <Route path="/writing/genre" element={<WritingGenre />} />
          <Route path="/writing/questions" element={<WritingAiQuestions />} />
          <Route path="/writing/help" element={<WritingHelp />} />
          <Route path="/writing/editor" element={<WritingEditor />} />
          <Route path="/writing/detail" element={<WritingDetail />} />
          <Route path="/export" element={<StorybookExport />} />
          <Route path="/image/practice" element={<ImageMakePractice />} />
          <Route path="/image/custom" element={<ImageMakeCustom />} />
          <Route path="/image/result" element={<ImageMakeResult />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/my-works" element={<MyWorks />} />
          <Route path="/goods" element={<Goods />} />
          <Route path="/result" element={<Result />} />
          <Route path="/test-buttons" element={<TestButtons />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
