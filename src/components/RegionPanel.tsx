import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Button,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { Region } from '../types/enums';
import { apiService } from '../services/api';

interface RegionPanelProps {
  selectedRegion: Region | null;
  onRegionChange: (region: Region | null) => void;
  onRegionStatusChange?: (status: Record<string, boolean>) => void;
}

const RegionPanel: React.FC<RegionPanelProps> = ({
  selectedRegion,
  onRegionChange,
  onRegionStatusChange
}) => {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<Region | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [regionStatus, setRegionStatus] = useState<Record<string, boolean>>({});
  const [availableRegions, setAvailableRegions] = useState<Region[]>([]);

  useEffect(() => {
    loadRegionStatus();
    // Restore selected region from localStorage
    restoreSelections();
  }, []);

  const restoreSelections = () => {
    const savedRegion = localStorage.getItem('selectedRegion');
    
    if (savedRegion && Object.values(Region).includes(savedRegion as Region)) {
      onRegionChange(savedRegion as Region);
    }
  };

  const handleRegionChange = (region: Region | null) => {
    if (region) {
      localStorage.setItem('selectedRegion', region);
    } else {
      localStorage.removeItem('selectedRegion');
    }
    onRegionChange(region);
  };

  const loadRegionStatus = async () => {
    try {
      setLoading(true);
      const status = await apiService.getRegionStatus();
      const regions = await apiService.getAvailableRegions();
      
      setRegionStatus(status);
      setAvailableRegions(regions);
      setError(null);
      
      // Notify parent component about status change
      if (onRegionStatusChange) {
        onRegionStatusChange(status);
      }
    } catch (err) {
      setError('Failed to load region status');
      console.error('Error loading region status:', err);
    } finally {
      setLoading(false);
    }
  };

  const connectToRegion = async (region: Region) => {
    try {
      setConnecting(region);
      setError(null);
      
      // First, disconnect from all other regions to ensure only one connection
      const connectedRegions = Object.entries(regionStatus)
        .filter(([_, isConnected]) => isConnected)
        .map(([regionName]) => regionName as Region);
      
      for (const connectedRegion of connectedRegions) {
        if (connectedRegion !== region) {
          try {
            await apiService.disconnectFromRegion(connectedRegion);
          } catch (err) {
            console.warn(`Failed to disconnect from ${connectedRegion}:`, err);
          }
        }
      }
      
      // Now connect to the selected region
      const result = await apiService.connectToRegion(region);
      
      if (result.success) {
        // Update region status - set all others to false, only the new one to true
        const newStatus: Record<string, boolean> = {};
        availableRegions.forEach(r => {
          newStatus[r] = r === region;
        });
        setRegionStatus(newStatus);
        
        // Notify parent component about status change
        if (onRegionStatusChange) {
          onRegionStatusChange(newStatus);
        }
        
        // Set the region as selected
        handleRegionChange(region);
        
      } else {
        throw new Error(result.message || 'Connection failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      console.error('Connection error:', err);
    } finally {
      setConnecting(null);
    }
  };

  const disconnectFromRegion = async (region: Region) => {
    try {
      setConnecting(region);
      setError(null);
      
      const result = await apiService.disconnectFromRegion(region);
      
      if (result.success) {
        // Update region status
        const newStatus = {
          ...regionStatus,
          [region]: false
        };
        setRegionStatus(newStatus);
        
        // Notify parent component about status change
        if (onRegionStatusChange) {
          onRegionStatusChange(newStatus);
        }
        
        // Clear selection if this region was selected
        if (selectedRegion === region) {
          handleRegionChange(null);
        }
      } else {
        throw new Error(result.message || 'Disconnection failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Disconnection failed');
      console.error('Disconnection error:', err);
    } finally {
      setConnecting(null);
    }
  };

  if (loading) {
    return (
      <Card 
        sx={{ 
          borderRadius: '20px',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
          border: 'none',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="center" alignItems="center" p={2}>
            <CircularProgress size={24} sx={{ color: 'primary.main' }} />
            <Typography variant="body2" sx={{ ml: 2, color: '#64748b' }}>
              Loading region status...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        borderRadius: '20px',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
        border: 'none',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Modern Header */}
        <Box sx={{ 
          p: 3,
          pb: 2,
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: '#0f172a',
            fontSize: '1.1rem',
            mb: 0.5
          }}>
            🌍 Region Selection
          </Typography>
          <Typography variant="body2" sx={{ 
            color: '#64748b', 
            fontSize: '0.875rem' 
          }}>
            Connect to a regional database
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #ef4444',
                '& .MuiAlert-icon': {
                  color: '#ef4444',
                },
              }}
            >
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                {error}
              </Typography>
            </Alert>
          )}

          {/* Region Selection */}
          <Box mb={3}>
            <Typography variant="subtitle2" sx={{ 
              mb: 1.5, 
              fontWeight: 600, 
              color: '#374151',
              fontSize: '0.875rem'
            }}>
              Choose Region
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedRegion || ''}
                displayEmpty
                onChange={(e) => handleRegionChange(e.target.value as Region)}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  '&:hover': {
                    border: '1px solid rgba(37, 99, 235, 0.3)',
                  },
                  '&.Mui-focused': {
                    border: '1px solid rgba(37, 99, 235, 0.5)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '& .MuiSelect-select': {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  },
                }}
              >
                <MenuItem value="" disabled sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  Select a region to connect...
                </MenuItem>
                {availableRegions.map((region) => (
                  <MenuItem 
                    key={region} 
                    value={region}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                      <Typography sx={{ fontWeight: 500 }}>
                        {region.toUpperCase()}
                      </Typography>
                      <Chip
                        size="small"
                        label={regionStatus[region] ? 'Connected' : 'Disconnected'}
                        sx={{
                          fontSize: '0.65rem',
                          height: '20px',
                          backgroundColor: regionStatus[region] ? '#f0fdf4' : '#fef2f2',
                          color: regionStatus[region] ? '#166534' : '#dc2626',
                          border: `1px solid ${regionStatus[region] ? '#22c55e' : '#ef4444'}`,
                          fontWeight: 600,
                        }}
                        variant="outlined"
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Connection Buttons */}
          {selectedRegion && (
            <Box mb={3}>
              <Button
                variant="contained"
                onClick={() => connectToRegion(selectedRegion)}
                disabled={connecting === selectedRegion || regionStatus[selectedRegion]}
                startIcon={connecting === selectedRegion ? <CircularProgress size={16} /> : null}
                fullWidth
                sx={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
                  py: 1.2,
                  mb: 1,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1e40af 0%, #5b21b6 100%)',
                    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    background: 'rgba(148, 163, 184, 0.3)',
                    color: 'rgba(148, 163, 184, 0.7)',
                    boxShadow: 'none',
                    transform: 'none',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {connecting === selectedRegion ? 'Connecting...' : 
                 regionStatus[selectedRegion] ? 'Already Connected' : 'Connect to Region'}
              </Button>
              
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  onClick={() => disconnectFromRegion(selectedRegion)}
                  disabled={connecting === selectedRegion || !regionStatus[selectedRegion]}
                  sx={{ 
                    flex: 1,
                    borderRadius: '12px',
                    borderColor: 'rgba(148, 163, 184, 0.3)',
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.05)',
                      borderColor: '#ef4444',
                      color: '#dc2626',
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      opacity: 0.5,
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Disconnect
                </Button>
                <Button
                  variant="outlined"
                  onClick={loadRegionStatus}
                  disabled={connecting !== null}
                  sx={{ 
                    flex: 1,
                    borderRadius: '12px',
                    borderColor: 'rgba(148, 163, 184, 0.3)',
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(37, 99, 235, 0.05)',
                      borderColor: '#2563eb',
                      color: '#2563eb',
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      opacity: 0.5,
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Refresh
                </Button>
              </Box>
            </Box>
          )}

          {/* Status Display */}
          <Box>
            <Typography variant="subtitle2" sx={{ 
              mb: 1.5, 
              fontWeight: 600, 
              color: '#374151',
              fontSize: '0.875rem'
            }}>
              Connection Status
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {availableRegions.map((region) => (
                <Chip
                  key={region}
                  label={region.toUpperCase()}
                  sx={{
                    fontSize: '0.75rem',
                    height: '28px',
                    borderRadius: '14px',
                    fontWeight: 600,
                    backgroundColor: regionStatus[region] 
                      ? 'rgba(34, 197, 94, 0.1)' 
                      : 'rgba(148, 163, 184, 0.1)',
                    color: regionStatus[region] ? '#166534' : '#64748b',
                    border: `1px solid ${regionStatus[region] ? '#22c55e' : '#cbd5e1'}`,
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: regionStatus[region] 
                        ? '0 4px 12px rgba(34, 197, 94, 0.15)'
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RegionPanel;