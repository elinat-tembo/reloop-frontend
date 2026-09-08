import { BrowserRouter, Routes, Route } from 'react-router-dom'

function Home() {
  return <h1 className="text-3xl font-bold text-blue-600">Reloop</h1>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
