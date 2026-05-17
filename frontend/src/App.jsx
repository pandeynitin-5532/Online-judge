import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [serverMessage, setServerMessage] = useState("Connecting to server...")

  useEffect(() => {
    fetch('http://localhost:5000/api/status')
      .then(res => res.json())
      .then(data => setServerMessage(data.message))
      .catch(err => setServerMessage("Failed to connect to backend."));
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Online Judge Project</h1>
      <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px', color: '#333' }}>
        <strong>Server Status:</strong> {serverMessage}
      </div>
    </div>
  )
}

export default App