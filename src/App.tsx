import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import KanbanBoard from './components/KanbanBoard'
import Budget from './components/Budget'
import GuestList from './components/GuestList'
import History from './components/History'
import SeatMap from './components/SeatMap'
import Timeline from './components/Timeline'
import Vendors from './components/Vendors'
import MusicPlaylist from './components/MusicPlaylist'
import Gifts from './components/Gifts'
import PhotoWall from './components/PhotoWall'
import Settings from './components/Settings'
import './index.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<KanbanBoard />} />
        <Route path="board" element={<KanbanBoard />} />
        <Route path="budget" element={<Budget />} />
        <Route path="guests" element={<GuestList />} />
        <Route path="history" element={<History />} />
        <Route path="seats" element={<SeatMap />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="music" element={<MusicPlaylist />} />
        <Route path="gifts" element={<Gifts />} />
        <Route path="photos" element={<PhotoWall />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
