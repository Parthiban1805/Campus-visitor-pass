# Implementation Guide - Remaining Screens

This guide provides templates and implementation patterns for the remaining screens across all three mobile apps.

## Visitor App - Remaining Screens

### 1. RegisterScreen.js (src/screens/Auth/RegisterScreen.js)

**Pattern**: Similar to LoginScreen with additional fields

```javascript
// Add these input fields:
- Name (icon: person-outline)
- Email (icon: mail-outline)
- Phone (icon: call-outline, keyboardType: phone-pad)
- Password (icon: lock-closed-outline, secureTextEntry)
- Confirm Password (secureTextEntry)

// Validation:
- All fields required
- Email format validation
- Phone: exactly 10 digits
- Password: min 6 characters
- Passwords must match

// Submit handler:
const result = await register({ name, email, phone, password });
```

### 2. DashboardScreen.js (src/screens/Dashboard/DashboardScreen.js)

**Components needed**:
- Header with user name and logout button
- Statistics cards (Total Requests, Pending, Approved)
- Quick action buttons:
  - "New Visit Request" (navigate to CreateRequest)
  - "View All Requests"
- Recent requests list (first 5)

**API Call**:
```javascript
const fetchDashboardData = async () => {
  const [profileRes, requestsRes] = await Promise.all([
    api.get(endpoints.getProfile),
    api.get(endpoints.getMyRequests + '?limit=5')
  ]);
  // Use profileRes.data.data.stats for statistics
};
```

### 3. CreateRequestScreen.js (src/screens/Request/CreateRequestScreen.js)

**Form Fields**:
- Purpose (CustomInput, multiline)
- Department (Picker component)
- Person to Meet: Name, Designation, Contact
- Visit Date (DateTimePicker from @react-native-community/datetimepicker)
- Time Slot (Picker: Morning, Afternoon, Evening)
- Additional Notes (CustomInput, multiline)

**Submission**:
```javascript
const response = await api.post(endpoints.submitRequest, formData);
// On success, show success alert and navigate back
```

### 4. RequestStatusScreen.js (src/screens/Request/RequestStatusScreen.js)

**Layout**:
- Tab navigation (Pending, Approved, Rejected)
- FlatList of requests
- Each item shows: purpose, date, status badge
- Tap to view details
- Pull-to-refresh

**Request Card Component**:
```javascript
<TouchableOpacity onPress={() => navigation.navigate('RequestDetails', { id })}>
  <View style card>
    <StatusBadge status={status} />
    <Text>{purpose}</Text>
    <Text>{visitDate}</Text>
    {status === 'approved' && <Button "View QR Pass" />}
  </View>
</TouchableOpacity>
```

### 5. QRPassScreen.js (src/screens/Request/QRPassScreen.js)

**Layout**:
- QRCode component from react-native-qrcode-svg
- Visitor details card
- Visit date and time
- Validity countdown timer
- Instructions for security

**QR Display**:
```javascript
import QRCode from 'react-native-qrcode-svg';

<QRCode
  value={visitRequest.qrCode.data}
  size={250}
  backgroundColor="white"
  color="black"
  logo={require('../../assets/logo.png')} // Optional
/>

// Check expiration
const isExpired = new Date() > new Date(qrCode.expiresAt);
```

### 6. VisitHistoryScreen.js (src/screens/History/VisitHistoryScreen.js)

**Features**:
- FlatList of past visits (with entry.scannedAt)
- Show entry and exit timestamps
- Filter by date range
- Pagination

### 7. ProfileScreen.js (src/screens/Profile/ProfileScreen.js)

**Sections**:
- Profile info display
- Edit profile button (navigate to EditProfile screen)
- Change password option
- Logout button

## Admin App Structure

### Package.json
```json
{
  "name": "admin-app",
  "dependencies": {
    // Same as visitor-app plus:
    "react-native-chart-kit": "^6.12.0",  // For analytics charts
    "react-native-picker-select": "^9.0.0"  // For filters
  }
}
```

### Key Screens

1. **AdminLoginScreen.js** - Similar to visitor login, different branding
2. **AdminDashboardScreen.js** - Statistics cards, charts, quick actions
3. **RequestListScreen.js** - Tabbed view (Pending/Approved/Rejected), filters
4. **RequestDetailScreen.js** - Full request info, Approve/Reject buttons
5. **AnalyticsScreen.js** - Charts (LineChart, BarChart, PieChart)
6. **VisitorLogsScreen.js** - Entry/exit logs table
7. **SecurityManagementScreen.js** - CRUD for security users
8. **QRSettingsScreen.js** - Configure validity duration

### Approval Flow Example

```javascript
const approveRequest = async (requestId, validityHours, remarks) => {
  try {
    setLoading(true);
    const response = await api.put(
      `/admin/request/${requestId}/approve`,
      { validityHours, remarks }
    );
    Alert.alert('Success', 'Request approved successfully');
    navigation.goBack();
  } catch (error) {
    Alert.alert('Error', error.response?.data?.message);
  } finally {
    setLoading(false);
  }
};
```

## Security App Structure

### Required Permissions (app.json)
```json
{
  "android": {
    "permissions": [
      "android.permission.CAMERA"
    ]
  }
}
```

### Key Screens

1. **SecurityLoginScreen.js** - Security guard login
2. **QRScannerScreen.js** - Camera scanner with overlay
3. **ValidationResultScreen.js** - Show scan result, entry/exit buttons
4. **ScanHistoryScreen.js** - Today's scans
5. **ActiveVisitorsScreen.js** - Currently on campus

### QR Scanner Implementation

```javascript
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';

const QRScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    
    // Validate with backend
    try {
      const response = await api.post(endpoints.scanQR, {
        qrData: data,
        gate: selectedGate
      });
      
      // Navigate to result screen
      navigation.navigate('ValidationResult', {
        visitRequest: response.data.data.visitRequest,
        canEnter: response.data.data.canEnter,
        canExit: response.data.data.canExit
      });
    } catch (error) {
      Alert.alert('Scan Failed', error.response?.data?.message);
      setScanned(false);
    }
  };

  return (
    <Camera
      onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      barCodeScannerSettings={{
        barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
      }}
      style={StyleSheet.absoluteFillObject}
    >
      {/* Scan overlay UI */}
    </Camera>
  );
};
```

### Entry/Exit Logging

```javascript
const logEntry = async (requestId, gate) => {
  await api.post('/security/log-entry', { requestId, gate });
  Alert.alert('Success', 'Entry logged successfully');
  navigation.navigate('Scanner');
};

const logExit = async (requestId, gate) => {
  await api.post('/security/log-exit', { requestId, gate });
  Alert.alert('Success', 'Exit logged successfully');
  navigation.navigate('Scanner');
};
```

## Common Patterns

### Loading State
```javascript
const [loading, setLoading] = useState(false);

{loading && <ActivityIndicator size="large" color={COLORS.primary} />}
```

### Error Handling
```javascript
catch (error) {
  const message = error.response?.data?.message || 'An error occurred';
  Alert.alert('Error', message);
}
```

### Pull to Refresh
```javascript
const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await loadData();
  setRefreshing(false);
};

<FlatList
  data={data}
  refreshing={refreshing}
  onRefresh={onRefresh}
  ...
/>
```

### Date Formatting
```javascript
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
```

## Testing Before Deployment

1. **Backend**: Verify all endpoints with Postman
2. **Visitor App**: Complete flow from registration to QR display
3. **Admin App**: Approval workflow and analytics
4. **Security App**: QR scanning and logging
5. **Email**: Check all notification emails
6. **Error Cases**: Test invalid QR, expired QR, duplicate scans

## Build Checklist

- [ ] Update API_URL in all three apps
- [ ] Configure app.json with correct package names
- [ ] Add app icons and splash screens
- [ ] Test on physical devices
- [ ] Build APKs with EAS
- [ ] Deploy backend to Render
- [ ] Configure MongoDB Atlas
- [ ] Set up Gmail SMTP
- [ ] Test end-to-end in production

## Performance Optimization

- Use React.memo for complex components
- Implement lazy loading for large lists
- Cache API responses where appropriate
- Optimize images
- Use FlatList instead of ScrollView for long lists
