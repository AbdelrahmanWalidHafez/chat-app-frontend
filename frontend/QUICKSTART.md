# Quick Start Guide

## Prerequisites

1. **Backend Running**: Ensure your Spring Boot backend is running on `http://localhost:8080`
2. **Node.js**: Install Node.js 16 or higher
3. **JWT Token**: Have a valid JWT token from your Keycloak server (or use a test token for development)

## Installation Steps

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## First Time Setup

### 1. Login
- Enter your JWT token in the login form
- Optionally provide:
  - User ID (extracted from token if not provided)
  - Name
  - Email

### 2. Start Chatting
- Click the "Users" icon (👥) in the header
- Select a user to start a conversation
- Type a message and press Enter or click Send

## Troubleshooting

### WebSocket Connection Issues
- **Problem**: WebSocket not connecting
- **Solution**: 
  - Verify backend is running on port 8080
  - Check browser console for errors
  - Ensure JWT token is valid
  - Verify CORS is configured in backend (should allow `http://localhost:3000`)

### API Request Failures
- **Problem**: 401 Unauthorized errors
- **Solution**:
  - Check that your JWT token is valid
  - Verify token is stored in localStorage
  - Ensure backend accepts the token format

### Messages Not Appearing
- **Problem**: Messages sent but not showing
- **Solution**:
  - Check WebSocket connection status
  - Verify message subscription path matches backend
  - Check browser console for errors
  - Refresh the page and try again

## Development Tips

1. **Hot Reload**: Changes to React components will automatically reload
2. **Browser DevTools**: Use React DevTools and Network tab for debugging
3. **Console Logs**: Check browser console for WebSocket connection status
4. **Token Format**: JWT tokens should be in format: `header.payload.signature`

## Next Steps

- Customize the UI colors in `tailwind.config.js`
- Add more features like message reactions, typing indicators, etc.
- Integrate with your actual authentication system
- Deploy to production

