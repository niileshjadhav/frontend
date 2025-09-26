import { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Paper,
  Button,
  Avatar,
} from '@mui/material';
import { Region } from './types/enums';
import { ChatBot } from './components/ChatBot';
import RegionPanel from './components/RegionPanel';
import Login from './components/Login';
import { apiService } from './services/api';
import type { UserInfo } from './services/api';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },
  },
});

function App() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [regionStatus, setRegionStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        // Check if we have stored authentication data
        if (apiService.hasStoredAuth()) {
          const isValid = await apiService.validateSession();
          
          if (isValid) {
            const userInfo = apiService.getUserInfo();
            if (userInfo) {
              setUserInfo(userInfo);
            }
          }
        } else {
          // Check if we have stored user info from previous session
          const storedUserInfo = apiService.getUserInfo();
          if (storedUserInfo) {
            // We have user info but no token, session expired
            apiService.clearSession();
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Clear any invalid session data
        apiService.clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (user: any) => {
    setUserInfo(user);
  };

  const handleLogout = () => {
    apiService.logout();
    setUserInfo(null);
    setSelectedRegion(null);
    setRegionStatus({});
  };

  const handleRegionStatusChange = (status: Record<string, boolean>) => {
    setRegionStatus(status);
  };

  const getRoleColor = () => {
    return '#10b981'; // Green color for all roles
  };

  const getRoleLetter = (role: string) => {
    return role === 'Admin' ? 'A' : role === 'Monitor' ? 'M' : 'U';
  };

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <Typography variant="h6" color="white">
            Loading...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  if (!userInfo) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Header */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'white',
                  mr: 2
                }}
              >
                Cloud Inventory AI Assistant
              </Typography>
            </Box>
            
            {/* User Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: getRoleColor(),
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }}>
                  {getRoleLetter(userInfo.role)}
                </Avatar>
                <Box sx={{ color: 'white' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {userInfo.username}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {userInfo.role}
                  </Typography>
                </Box>
              </Box>
              
              <Button
                color="inherit"
                onClick={handleLogout}
                size="small"
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { background: 'rgba(255, 255, 255, 0.2)' }
                }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Container */}
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 3 
          }}>
            {/* Chat Section */}
            <Box sx={{ flex: 3 }}>
              <Paper 
                elevation={0}
                sx={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  height: '75vh',
                }}
              >
                <Box sx={{ p: 3, height: '100%' }}>
                  <ChatBot 
                    userId={userInfo.username} 
                    userRole={userInfo.role}
                    selectedRegion={selectedRegion}
                    regionStatus={regionStatus}
                  />
                </Box>
              </Paper>
            </Box>
            
            {/* Region Panel */}
            <Box sx={{ flex: 1, minWidth: 280, maxWidth: 320 }}>
              <RegionPanel
                selectedRegion={selectedRegion}
                onRegionChange={setSelectedRegion}
                onRegionStatusChange={handleRegionStatusChange}
              />
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
