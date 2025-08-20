import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import EnterName from './pages/EnterName'
import JoinRoom from './pages/JoinRoom'
import InGamePage from './pages/InGamePage'
import SettingsPage from './pages/SettingsPage'
import MultipleChoiceMode from './pages/MultipleChoiceMode'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EnterName />} />
        <Route path="/game" element={<InGamePage />} />
        <Route path="/lobby" element={<JoinRoom />} />
        <Route path="/create_room" element={<SettingsPage />} />
        <Route path="/game_mode_2" element={<MultipleChoiceMode />} />
      </Routes>
    </Router>
  )
}

export default App
