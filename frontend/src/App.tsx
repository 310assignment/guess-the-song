import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import EnterName from './pages/EnterName'
import JoinRoom from './pages/JoinRoom'
import SettingsPage from './pages/SettingsPage'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EnterName />} />
        <Route path="/lobby" element={<JoinRoom />} />
        <Route path="/create_room" element={<SettingsPage />} />
      </Routes>
    </Router>
  )
}

export default App
