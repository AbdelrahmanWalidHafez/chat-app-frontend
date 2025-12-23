// Temporary test file - minimal App to test if React works
import React from 'react'

function TestApp() {
  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333' }}>✅ React is Working!</h1>
      <p style={{ color: '#666' }}>If you see this, React is rendering correctly.</p>
      <p style={{ color: '#999', fontSize: '14px' }}>Check browser console (F12) for any errors.</p>
    </div>
  )
}

export default TestApp

