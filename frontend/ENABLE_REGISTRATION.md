# Enable User Registration in Keycloak

To allow users to create accounts through Keycloak, you need to enable registration in your Keycloak realm.

## Steps to Enable Registration

1. **Open Keycloak Admin Console**
   - Go to `http://localhost:9090`
   - Login with admin credentials

2. **Select Your Realm**
   - Click on the realm dropdown (top left)
   - Select `chatapp` realm

3. **Enable User Registration**
   - Go to **Realm Settings** (left sidebar)
   - Click on the **Login** tab
   - Find **User registration** setting
   - Toggle it to **ON**
   - Click **Save**

4. **Optional: Enable Email Verification**
   - In the same **Login** tab
   - Enable **Email as username** (if you want users to use email as username)
   - Enable **User-managed access** (optional)
   - Configure **Email** settings if you want email verification

5. **Optional: Configure Registration Fields**
   - Go to **Realm Settings** → **User Profile** tab
   - You can customize which fields are required during registration
   - Add/remove fields like first name, last name, etc.

## Testing Registration

1. Start your app: `npm run dev`
2. Open `http://localhost:3000`
3. Click the **"Create New Account"** button
4. You'll be redirected to Keycloak's registration page
5. Fill in the registration form
6. After registration, you'll be automatically logged in

## Registration Flow

1. User clicks "Create New Account" button
2. Redirected to Keycloak registration page
3. User fills registration form
4. Keycloak creates the account
5. User is automatically logged in
6. Redirected back to the chat app

## Troubleshooting

### Registration button doesn't appear
- Check that the `register` method is available in AuthContext
- Check browser console for errors

### "Registration is disabled" error
- Make sure **User registration** is enabled in Realm Settings → Login tab
- Refresh the Keycloak admin console and verify the setting is saved

### Users can't register
- Check that the client `chat-app` has proper redirect URIs configured
- Verify that `http://localhost:3000` is in Valid Redirect URIs

