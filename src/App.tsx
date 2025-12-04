import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Welcome from './pages/Welcome'
import OnboardingLogin from './pages/OnboardingLogin'
import Home from './pages/Home'
import DrawStart from './pages/DrawStart'
import DrawPractice from './pages/DrawPractice'
import DrawDirect from './pages/DrawDirect'
import DirectInput from './pages/DirectInput'
import Write from './pages/Write'
import Storybook from './pages/Storybook'
import StorybookEditor from './pages/StorybookEditor'
import StorybookExport from './pages/StorybookExport'
import MyWorks from './pages/MyWorks'
import Goods from './pages/Goods'
import Result from './pages/Result'
import TestButtons from './pages/TestButtons'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 헤더가 필요 없는 페이지 */}
        <Route path="/" element={<Welcome />} />
        <Route path="/onboarding" element={<OnboardingLogin />} />
        <Route path="/home" element={<Home />} />

        {/* 나머지 페이지는 Layout으로 감싸기 */}
        <Route element={<Layout />}>
          <Route path="/drawing/start" element={<DrawStart />} />
          <Route path="/drawing/practice" element={<DrawPractice />} />
          <Route path="/drawing/direct" element={<DrawDirect />} />
          <Route path="/direct-input" element={<DirectInput />} />
          <Route path="/write" element={<Write />} />
          <Route path="/storybook" element={<Storybook />} />
          <Route path="/storybook-editor" element={<StorybookEditor />} />
          <Route path="/storybook-export" element={<StorybookExport />} />
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
