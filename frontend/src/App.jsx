import { Navigate, Route, Routes } from 'react-router-dom'

import MainLayout from './layouts/MainLayout.jsx'
import LandingPage from './pages/LandingPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
