import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import EnterName from './pages/EnterName'
import JoinRoom from './pages/JoinRoom'
import InGamePage from './pages/InGamePage'
import SettingsPage from './pages/SettingsPage'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EnterName />} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/game" element={<InGamePage />} />
        <Route path="/" element={<SettingsPage />} />

      </Routes>
    </Router>
  )
}

export default App
