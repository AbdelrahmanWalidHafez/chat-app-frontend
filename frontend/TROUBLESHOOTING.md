# Troubleshooting Guide

## Blank Page / Nothing Shows

### 1. Check Browser Console
- Press `F12` to open Developer Tools
- Go to the **Console** tab
- Look for red error messages
- Common issues:
  - `Failed to fetch` - Backend not running
  - `Module not found` - Dependencies not installed
  - `Cannot read property` - JavaScript error

### 2. Check Network Tab
- In Developer Tools, go to **Network** tab
- Refresh the page
- Look for failed requests (red status codes)
- Check if `main.jsx` and CSS files are loading

### 3. Verify Server is Running
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000
```

### 4. Clear Browser Cache
- Press `Ctrl + Shift + Delete`
- Clear cached images and files
- Or use `Ctrl + F5` to hard refresh

## Keycloak Configuration

### Finding Your Client ID
1. Open Keycloak Admin Console: `http://localhost:9090`
2. Login with admin credentials
3. Select your realm: `chatapp`
4. Go to **Clients** in the left menu
5. Find your client (common names: `chat-app-client`, `chatapp`, `account`)
6. Update `frontend/src/config/keycloak.js` with the correct `clientId`

### Keycloak Client Settings
Your Keycloak client should have:
- **Valid Redirect URIs**: `http://localhost:3000/callback`
- **Web Origins**: `http://localhost:3000`
- **Access Type**: `public` (for frontend apps)

## Backend Connection Issues

### API Requests Failing
- Verify backend is running on `http://localhost:8080`
- Check CORS configuration in `SecurityConfig.java`
- Ensure JWT token is valid

### WebSocket Connection Issues
- Check browser console for WebSocket errors
- Verify WebSocket endpoint: `http://localhost:8080/ws`
- Ensure token is included in WebSocket headers

## Common Errors

### "Cannot read property 'split' of undefined"
- Token might not be a valid JWT
- Check token format in browser localStorage

### "401 Unauthorized"
- Token expired or invalid
- Get a new token from Keycloak
- Check token in browser DevTools -> Application -> Local Storage

### "CORS error"
- Backend CORS not configured for `http://localhost:3000`
- Check `SecurityConfig.java` allows your origin

### "WebSocket connection failed"
- Backend WebSocket not running
- Check `WebSocketConfig.java` allows your origin
- Verify SockJS endpoint is accessible

## Getting a JWT Token

### Option 1: Keycloak Admin Console
1. Go to `http://localhost:9090`
2. Login to admin console
3. Use the token from browser DevTools

### Option 2: Keycloak Login Page
1. Go to: `http://localhost:9090/realms/chatapp/protocol/openid-connect/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000&response_type=code&scope=openid`
2. Login with your credentials
3. Extract token from the redirect URL or use browser DevTools

### Option 3: Postman/curl
```bash
curl -X POST http://localhost:9090/realms/chatapp/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "username=YOUR_USERNAME" \
  -d "password=YOUR_PASSWORD" \
  -d "grant_type=password"
```

## Still Having Issues?

1. **Check all services are running**:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8080`
   - Keycloak: `http://localhost:9090`
   - PostgreSQL: `localhost:5432`

2. **Check logs**:
   - Frontend: Browser console
   - Backend: Spring Boot console output
   - Keycloak: Docker logs if using Docker

3. **Verify configuration**:
   - Keycloak realm name matches: `chatapp`
   - Client ID matches your Keycloak client
   - Redirect URI matches: `http://localhost:3000/callback`

