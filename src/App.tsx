import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome'
import OnboardingLogin from './pages/OnboardingLogin'
import Home from './pages/Home'
import Draw from './pages/Draw'
import Write from './pages/Write'
import Storybook from './pages/Storybook'
import MyWorks from './pages/MyWorks'
import Goods from './pages/Goods'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/onboarding" element={<OnboardingLogin />} />
          <Route path="/home" element={<Home />} />
          <Route path="/draw" element={<Draw />} />
          <Route path="/write" element={<Write />} />
          <Route path="/storybook" element={<Storybook />} />
          <Route path="/my-works" element={<MyWorks />} />
          <Route path="/goods" element={<Goods />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
