# Test Plugins for Fiber Framework

## Overview
Two comprehensive test plugins designed to validate all capabilities of the Fiber plugin framework.

---

## 🧪 Test Plugin Alpha

**Location:** `test-plugin-files/test-plugin-alpha/`

### Purpose
Comprehensive testing suite for core Fiber Framework capabilities.

### Tests Included
1. **Database Operations**
   - Write data (setData)
   - Read data (getData)
   - Update data
   - Delete data (deleteData)
   - List all keys (listKeys)

2. **File Management**
   - Upload files (uploadFile)
   - Download files (getFileUrl)
   - Handle different file types

3. **API Endpoints**
   - Call plugin API endpoints
   - Test endpoint responses
   - 6 registered endpoints: testWrite, testRead, testDelete, testFileUpload, testRoleCheck, testBulkOperation

4. **Role & Permissions**
   - Check user roles (hasRole)
   - Validate permissions
   - Admin/user role detection

5. **User Profile**
   - Load user information (getUserProfile)
   - Display username and roles

6. **Shared Data**
   - Publish data to other plugins (publishSharedData)
   - Inter-plugin communication

### Features
- ✅ Automated test runner (runs all tests sequentially)
- ✅ Visual progress bar
- ✅ Real-time test results with color-coded status
- ✅ Timestamp tracking for each test
- ✅ User info display
- ✅ API endpoint registry display

---

## ⚡ Test Plugin Beta

**Location:** `test-plugin-files/test-plugin-beta/`

### Purpose
Advanced integration testing focused on inter-plugin communication and real-time monitoring.

### Tests Included
1. **Inter-Plugin Communication**
   - Subscribe to Alpha plugin status
   - Real-time monitoring (auto-refresh every 3 seconds)
   - Shared data registry viewer

2. **State Management**
   - Persistent counter storage
   - Operation tracking
   - State preservation across sessions

3. **Real-Time Updates**
   - Auto-sync with other plugins
   - Live activity log
   - Timestamp tracking

4. **Advanced Features**
   - Bulk data operations
   - File upload/download testing
   - Permission validation
   - User profile fetching

5. **HeroUI Component Testing**
   - Switch toggles
   - Tables with dynamic data
   - Cards with real-time updates
   - Activity log with auto-scroll

### Features
- 🔗 Live Alpha plugin integration
- 📊 Real-time status dashboard
- 🔄 Persistent state across reloads
- 📡 Shared data monitoring
- 📝 Activity log with timestamps
- 🎛️ Interactive control panel

---

## 📦 How to Upload

### Step 1: Access Plugin Publisher
1. Open your dashboard
2. Click the **Plugins** button in the bottom emergency tools menu
3. Or navigate to the Plugin Publisher page

### Step 2: Upload Test Plugin Alpha
1. Click **"Upload New Plugin"** or **"Browse"**
2. Navigate to: `test-plugin-files/test-plugin-alpha/`
3. Select all 4 files:
   - `manifest.json`
   - `core.js`
   - `icon-light.svg`
   - `icon-dark.svg`
4. Click **Upload** or **Publish**
5. Wait for confirmation

### Step 3: Upload Test Plugin Beta
1. Repeat the same process
2. Navigate to: `test-plugin-files/test-plugin-beta/`
3. Select all 4 files:
   - `manifest.json`
   - `core.js`
   - `icon-light.svg`
   - `icon-dark.svg`
4. Click **Upload** or **Publish**

### Step 4: Enable Plugins
1. After upload, both plugins should appear in your plugin list
2. Toggle them to **Active** status
3. Add them to your dashboard navigation

### Step 5: Test Integration
1. Open **Test Plugin Alpha** first
2. Click **"Run All Tests"** to execute the full test suite
3. Watch for ✅ success indicators
4. Open **Test Plugin Beta**
5. Enable **Monitor** toggle to watch for Alpha's status
6. Click control panel buttons to test features
7. Verify inter-plugin communication in the Shared Data table

---

## 🎯 What Each Plugin Tests

### Alpha Tests
| Feature | What It Tests | Status Indicator |
|---------|--------------|------------------|
| Database Write | PluginSDK.setData() | ✅ / ❌ |
| Database Read | PluginSDK.getData() | ✅ / ❌ |
| Database Update | PluginSDK.setData() overwrite | ✅ / ❌ |
| Database Delete | PluginSDK.deleteData() | ✅ / ❌ |
| File Upload | PluginSDK.uploadFile() | ✅ / ❌ |
| File Download | PluginSDK.getFileUrl() | ✅ / ❌ |
| API Endpoint | PluginSDK.callAPI() | ✅ / ❌ |
| Role Check | PluginSDK.hasRole() | ✅ / ❌ |
| Bulk Operations | PluginSDK.listKeys() | ✅ / ❌ |
| Shared Data | PluginSDK.publishSharedData() | ✅ / ❌ |

### Beta Tests
| Feature | What It Tests | Status Indicator |
|---------|--------------|------------------|
| Alpha Integration | getSharedData('alpha-status') | 🔗 Connected / 📡 Monitoring |
| State Persistence | setData/getData across sessions | Counter value |
| User Profile | getUserProfile() | ✅ / ❌ in log |
| Permissions | hasRole('admin'), hasRole('user') | ✅ / ❌ in log |
| File Operations | uploadFile + getFileUrl | ✅ / ❌ in log |
| Bulk Data | Multiple setData() calls | ✅ / ❌ in log |
| Real-Time Updates | Auto-refresh monitoring | Live status |
| Shared Data Registry | listSharedData() | Table display |

---

## 🔍 Expected Results

### Successful Test Run (Alpha)
All 10 tests should show ✅ green indicators with:
- Database operations completing
- File IDs generated
- API responses received
- Role checks returning boolean values
- Shared data published

### Successful Integration (Beta)
- Alpha status appears in integration card when Alpha is running
- Counter increments and persists
- Activity log shows real-time events
- Shared data table populated with Alpha's published data

---

## 🐛 Troubleshooting

### Alpha Tests Failing
- **Database errors**: Check Convex connection
- **File upload fails**: Verify storage permissions
- **API endpoint errors**: Ensure plugin is active
- **Role check fails**: Verify user authentication

### Beta Not Detecting Alpha
1. Ensure Alpha plugin is active
2. Run Alpha tests at least once (to publish shared data)
3. Enable monitoring toggle in Beta
4. Wait 3 seconds for next auto-sync
5. Check Shared Data table for "alpha-status" entry

### Upload Fails
- Verify all 4 files are selected
- Check file names match exactly (case-sensitive)
- Ensure manifest.json is valid JSON
- Check browser console for errors

---

## 📚 Technical Details

### File Structure
```
test-plugin-alpha/
├── manifest.json    (Plugin metadata + API endpoints)
├── core.js         (Main plugin code with React components)
├── icon-light.svg  (Light theme icon - blue)
└── icon-dark.svg   (Dark theme icon - lighter blue)

test-plugin-beta/
├── manifest.json    (Plugin metadata + API endpoints)
├── core.js         (Main plugin code with monitoring)
├── icon-light.svg  (Light theme icon - purple)
└── icon-dark.svg   (Dark theme icon - lighter purple)
```

### Dependencies
Both plugins use:
- **React 19** (hooks: useState, useEffect)
- **HeroUI Components** (Card, Button, Chip, Table, etc.)
- **PluginSDK** (Full Fiber Framework API)

### API Endpoints Registered
**Alpha:**
- testWrite, testRead, testDelete
- testFileUpload, testRoleCheck, testBulkOperation

**Beta:**
- getBetaStatus, syncWithAlpha
- testRealtimeUpdate, testAdvancedQuery

---

## ✅ Verification Checklist

After uploading both plugins:

- [ ] Alpha plugin appears in plugin list
- [ ] Beta plugin appears in plugin list
- [ ] Both plugins show active status
- [ ] Alpha runs 10 tests successfully
- [ ] Beta displays user profile correctly
- [ ] Beta detects Alpha status when monitoring
- [ ] Counter increments and persists in Beta
- [ ] Shared data table shows entries
- [ ] Activity log captures events
- [ ] Icons display correctly (light/dark themes)
- [ ] No console errors in browser

---

## 🎓 Learning Outcomes

These plugins demonstrate:
1. ✅ Full CRUD database operations
2. ✅ File upload/download workflows
3. ✅ Inter-plugin communication patterns
4. ✅ Real-time monitoring capabilities
5. ✅ State persistence across sessions
6. ✅ Role-based access control
7. ✅ HeroUI component integration
8. ✅ API endpoint registration and usage
9. ✅ Shared data registry patterns
10. ✅ Activity logging and debugging

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Convex connection is active
3. Ensure user has required permissions
4. Test plugins individually before integration
5. Review activity logs for specific error messages

---

**Version:** 1.0.0  
**Last Updated:** March 4, 2026  
**Framework:** Fiber Plugin System for Convex + Next.js
