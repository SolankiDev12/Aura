import { useState, useEffect, useContext, createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // React Native async storage
import { useNavigation } from '@react-navigation/native';

// Create a context to share auth state
const AuthContext = createContext(null);

// Custom hook to access the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider component to wrap around the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores the user object
  const [loading, setLoading] = useState(true); // Loading state for async operations
  const navigation = useNavigation();

  useEffect(() => {
    // Check for an existing token or session when the app starts
    const checkUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    // Dummy login function; replace with API call
    setLoading(true);
    const response = await fakeLoginApiCall(email, password);
    if (response.success) {
      setUser(response.user);
      await AsyncStorage.setItem('user', JSON.stringify(response.user)); // Store user info
    }
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    setUser(null);
    await AsyncStorage.removeItem('user'); // Clear user info
    setLoading(false);
    navigation.navigate('Login'); // Navigate to login screen
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {loading ? null : children} {/* Show app only when loading is done */}
    </AuthContext.Provider>
  );
};

// Example fake API login call (replace this with a real API request)
const fakeLoginApiCall = async (email, password) => {
  // Simulate an API response
  if (email === 'test@example.com' && password === 'password') {
    return {
      success: true,
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'John Doe',
      },
    };
  } else {
    return { success: false, message: 'Invalid credentials' };
  }
};