import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

console.log('Main.jsx loaded - React version:', React.version)

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found!')
  document.body.innerHTML = '<h1 style="padding: 20px; color: red;">ERROR: Root element not found!</h1>'
} else {
  console.log('Root element found, loading App...')
  
  // Try to load App with error handling
  import('./App.jsx')
    .then(({ default: App }) => {
      console.log('App module loaded successfully')
      ReactDOM.createRoot(rootElement).render(
        <App />
      )
    })
    .catch((error) => {
      console.error('Error loading App:', error)
      ReactDOM.createRoot(rootElement).render(
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <h1 style={{ color: 'red' }}>Error Loading App</h1>
          <p><strong>Error:</strong> {error.message}</p>
          <pre style={{ background: '#f0f0f0', padding: '10px', overflow: 'auto' }}>
            {error.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      )
    })
}
