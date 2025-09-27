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
  Menu,
  MenuItem,
} from '@mui/material';
import {
  KeyboardArrowDown as ArrowDownIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
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
      main: '#1F4C5F',
    },
    background: {
      default: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#ffffff',
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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
    setAnchorEl(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRegionStatusChange = (status: Record<string, boolean>) => {
    setRegionStatus(status);
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
            background: '#ffffff',
          }}
        >
          <Typography variant="h6" color="#1F4C5F">
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
          background: '#ffffff',
        }}
      >
        {/* Header */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            background: '#253746',
            boxShadow: '0 2px 10px rgba(31, 76, 95, 0.1)',
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <img 
                  src="/DSI_logo.png" 
                  alt="DSI Logo" 
                  style={{ width: 32, height: 32, borderRadius: '6px' }}
                />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'white',
                    fontSize: '1.1rem'
                  }}
                >
                  Cloud Inventory AI Assistant
                </Typography>
              </Box>
            </Box>
            
            {/* User Info with Dropdown */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                color="inherit"
                onClick={handleMenuClick}
                endIcon={<ArrowDownIcon />}
                sx={{
                  background: '#253746',
                  fontSize: '0.875rem',
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  textTransform: 'none'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 48, 
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src="/user_logo.svg" 
                      alt="User" 
                      style={{ width: 48, height: 48 }}
                    />
                  </Box>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1, color: 'white' }}>
                      {userInfo.username.charAt(0).toUpperCase() + userInfo.username.slice(1)}
                    </Typography>
                    <Box sx={{ 
                      backgroundColor: '#1F4C5F', 
                      borderRadius: '12px', 
                      px: 1, 
                      py: 0.25, 
                      mt: 0.5,
                      display: 'inline-block'
                    }}>
                      <Typography variant="caption" sx={{ color: 'white', fontSize: '0.65rem', fontWeight: 500 }}>
                        {userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Button>
              
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                sx={{
                  '& .MuiPaper-root': {
                    backgroundColor: 'white',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    borderRadius: '8px',
                    minWidth: '200px',
                    mt: 1
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ 
                    fontSize: '0.875rem',
                    py: 1.5,
                    px: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.1)'
                    }
                  }}
                >
                  <LogoutIcon sx={{ fontSize: 16, mr: 1, color: '#ef4444' }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Container */}
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 3,
            height: 'calc(100vh - 120px)' // Adjust based on header height
          }}>
            {/* Chat Section */}
            <Box sx={{ flex: 3, height: '100%' }}>
              <Paper 
                elevation={2}
                sx={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  height: '100%',
                  border: '1px solid #e5e7eb',
                }}
              >
                <Box sx={{ height: '100%' }}>
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
            <Box sx={{ flex: 1, minWidth: 280, maxWidth: 320, height: '100%' }}>
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
