import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome'
import OnboardingLogin from './pages/OnboardingLogin'
import Home from './pages/Home'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/onboarding" element={<OnboardingLogin />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
