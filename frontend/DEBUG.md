# Debugging White Page Issue

## Quick Checks

1. **Open Browser Console (F12)**
   - Go to Console tab
   - Look for red error messages
   - Copy any errors you see

2. **Check Network Tab**
   - Open DevTools (F12)
   - Go to Network tab
   - Refresh page (F5)
   - Look for failed requests (red)
   - Check if `main.jsx` loads (status 200)

3. **Verify Server is Running**
   - Check terminal for Vite dev server output
   - Should see: `Local: http://localhost:3000/`
   - Should see: `ready in XXX ms`

4. **Check Browser URL**
   - Make sure you're on: `http://localhost:3000`
   - Not `https://` or different port

## Common Issues

### Issue: "Failed to fetch" or Network errors
- **Solution**: Backend might not be running
- Check if backend is on port 8080

### Issue: "Cannot find module" errors
- **Solution**: Run `npm install` in frontend directory

### Issue: "Uncaught SyntaxError"
- **Solution**: Check browser console for exact error
- Might be an import issue

### Issue: Blank page with no errors
- **Solution**: 
  1. Check if `main.jsx` is loading (Network tab)
  2. Check if React is rendering (Elements tab, look for `#root`)
  3. Try hard refresh: `Ctrl + Shift + R` or `Ctrl + F5`

## Test Steps

1. Open `http://localhost:3000` in browser
2. Press F12 to open DevTools
3. Check Console tab for errors
4. Check Network tab - refresh page
5. Look for `main.jsx` - should be status 200
6. In Elements tab, check if `<div id="root">` exists

## If Still Not Working

Try this minimal test:
1. Temporarily replace `App.jsx` content with:
```jsx
function App() {
  return <div><h1>Test</h1></div>
}
export default App
```

2. If that works, the issue is in one of the components
3. If that doesn't work, the issue is in the build/setup

