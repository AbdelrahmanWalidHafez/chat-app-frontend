# Keycloak Setup Guide

## Configuration

The Keycloak service is configured in `frontend/src/services/keycloakService.js`.

### Update Client ID

1. Open `frontend/src/services/keycloakService.js`
2. Find the `clientId` property (line ~10)
3. Update it to match your Keycloak client ID

```javascript
this._keycloak = new Keycloak({
  url: 'http://localhost:9090',
  realm: 'chatapp',
  clientId: 'YOUR_CLIENT_ID_HERE' // Update this!
})
```

## Keycloak Client Configuration

In your Keycloak Admin Console (`http://localhost:9090`):

### 1. Create or Configure Client

1. Go to **Clients** → Select your client (or create new)
2. Set **Client ID**: e.g., `chat-app-client`
3. Set **Client Protocol**: `openid-connect`
4. Click **Save**

### 2. Configure Client Settings

**Settings Tab:**
- **Access Type**: `public` (for frontend applications)
- **Standard Flow Enabled**: `ON`
- **Direct Access Grants Enabled**: `ON` (optional, for testing)
- **Valid Redirect URIs**: 
  - `http://localhost:3000/*`
  - `http://localhost:3000`
- **Web Origins**: 
  - `http://localhost:3000`
  - `+` (allows all origins - for development only)

**Advanced Settings:**
- **Proof Key for Code Exchange Code Challenge Method**: `S256` (recommended)

### 3. Enable User Registration

1. Go to **Realm Settings** → **Login** tab
2. Enable **User registration**: `ON`
3. Enable **Forgot password**: `ON` (optional)
4. Click **Save**

## How It Works

1. **User visits app** → `http://localhost:3000`
2. **Keycloak automatically redirects** to login page if not authenticated
3. **User logs in** (or registers if enabled)
4. **Keycloak redirects back** to the app with token
5. **App uses token** for API calls and WebSocket connections

## Features

- ✅ **Automatic login redirect** - Users are redirected to Keycloak login
- ✅ **User registration** - Users can register through Keycloak UI
- ✅ **Token refresh** - Tokens are automatically refreshed
- ✅ **Account management** - Users can access their account settings
- ✅ **Logout** - Proper logout with redirect

## Testing

1. Start the app: `npm run dev`
2. Open `http://localhost:3000`
3. You should be redirected to Keycloak login page
4. Login (or register if enabled)
5. You'll be redirected back to the chat app

## Troubleshooting

### "Invalid redirect URI" error
- Check that `http://localhost:3000/*` is in **Valid Redirect URIs**
- Make sure the client ID matches in `keycloakService.js`

### "Client not found" error
- Verify the client ID in Keycloak Admin Console
- Check that the client exists in the `chatapp` realm

### Token refresh issues
- Ensure **Standard Flow** is enabled
- Check that **Access Type** is set to `public`

### CORS errors
- Add `http://localhost:3000` to **Web Origins**
- Or use `+` for development (allows all origins)

