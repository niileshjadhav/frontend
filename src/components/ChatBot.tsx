import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Chip,
  Paper,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { apiService, type ChatResponse, type ChatMessage } from '../services/api';
import { Region } from '../types/enums';
import ConfirmationDialog from './ConfirmationDialog';
import StructuredContentRenderer from './StructuredContentRenderer';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
  requiresConfirmation?: boolean;
  operationData?: any;
  structuredContent?: any;  // For structured content rendering
}



interface ChatBotProps {
  userId: string;
  userRole: string;
  selectedRegion: Region | null;
  regionStatus: Record<string, boolean>;
}

interface PendingConfirmation {
  confirmationId: string;
  operation: string;
  details: string;
  originalMessage: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ userId, userRole, selectedRegion, regionStatus }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Helper function to check if the selected region is actually connected
  const isRegionConnected = () => {
    return selectedRegion ? regionStatus[selectedRegion] === true : false;
  };

  // Helper function to get role-specific colors and letters
  const getRoleConfig = () => {
    if (userRole === 'Admin') {
      return {
        color: '#10b981', // Green for Admin
        letter: 'A'
      };
    } else if (userRole === 'Monitor') {
      return {
        color: '#10b981', // Same green for Monitor to maintain consistency
        letter: 'M'
      };
    } else {
      return {
        color: '#667eea', // Default blue for other roles
        letter: 'AI'
      };
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Track the last region we initialized with to prevent duplicate messages
  const [lastInitializedRegion, setLastInitializedRegion] = useState<Region | null | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    // Send initial message only when:
    // 1. First load (lastInitializedRegion is undefined)
    // 2. Region changes (selectedRegion !== lastInitializedRegion)
    // 3. Not already initializing
    const shouldSendInitialMessage = 
      !isInitializing &&
      (lastInitializedRegion === undefined || selectedRegion !== lastInitializedRegion);

    if (shouldSendInitialMessage) {
      // Clear messages if this is a region change (not first load)
      if (lastInitializedRegion !== undefined) {
        setMessages([]);
      }
      
      sendInitialMessage();
      setLastInitializedRegion(selectedRegion);
    }
  }, [selectedRegion, isInitializing]);

  const sendInitialMessage = async () => {
    // Prevent multiple concurrent initialization attempts
    if (isInitializing) {
      return;
    }

    // Don't send initial message if there are already messages (except when clearing for region change)
    if (messages.length > 0 && lastInitializedRegion === selectedRegion) {
      return;
    }

    try {
      setIsInitializing(true);
      
      const initialMessage = isRegionConnected() 
        ? `Hello! I'm logged in as ${userRole} role. I'm working with region ${selectedRegion}.`
        : selectedRegion 
          ? `Hello! I'm logged in as ${userRole} role. Region ${selectedRegion} is selected but not connected.`
          : `Hello! I'm logged in as ${userRole} role.`;
        
      const response = await apiService.chatWithAgent({
        message: initialMessage,
        user_id: userId,
        session_id: sessionId,
        region: selectedRegion || undefined,
      });
      
      // Use the actual response from the backend with structured content
      addBotMessage(response);
      
    } catch (error) {
      console.error('Error sending initial message:', error);
      const roleCapabilities = userRole === 'Admin' 
        ? 'you have full access to all operations including archiving and deletion'
        : 'you have read-only access for viewing data';
        
      const connectionMessage = isRegionConnected() 
        ? `Currently connected to ${selectedRegion} region`
        : selectedRegion 
          ? `Region ${selectedRegion} is selected but not connected. Please connect to the region first.`
          : 'Please select and connect to a region to get started';

      addBotMessage({
        response: `Hello ${userId}! I'm your Cloud Inventory assistant. As a ${userRole} ${userRole === 'Admin' ? '👑' : '👁️'}, ${roleCapabilities}. ${connectionMessage}.`,
        suggestions: [
          'Show table statistics',
          userRole === 'Admin' ? 'Help with archiving' : 'View system status',
          'Explain available operations'
        ],
        requires_confirmation: false,
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const addBotMessage = (response: ChatResponse) => {
    const botMessage: Message = {
      id: `bot_${Date.now()}`,
      text: response.response,
      isBot: true,
      timestamp: new Date(),
      suggestions: response.suggestions,
      requiresConfirmation: response.requires_confirmation,
      operationData: response.operation_data,
      structuredContent: response.structured_content, // Fix: use snake_case from API
    };
    
    setMessages(prev => [...prev, botMessage]);
  };

  const addUserMessage = (text: string) => {
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text,
      isBot: false,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
  };

  const sendMessage = async (messageText: string = inputText) => {
    if (!messageText.trim() || isLoading) return;

    // Check if region is connected for database operations
    if (!isRegionConnected() && 
        (messageText.toLowerCase().includes('show') || 
         messageText.toLowerCase().includes('count') || 
         messageText.toLowerCase().includes('archive') || 
         messageText.toLowerCase().includes('delete') ||
         messageText.toLowerCase().includes('statistics'))) {
      
      addBotMessage({
        response: selectedRegion 
          ? `⚠️ Region ${selectedRegion} is selected but not connected. Please connect to the region first to perform database operations.`
          : '⚠️ No region is connected. Please select and connect to a region first to perform database operations.',
        suggestions: [
          'Connect to region first',
          'What can you do?',
          'Explain regions'
        ],
        requires_confirmation: false,
      });
      return;
    }

    setIsLoading(true);
    addUserMessage(messageText);
    setInputText('');

    try {
      const chatMessage: ChatMessage = {
        message: messageText,
        user_id: userId,
        session_id: sessionId,
        region: isRegionConnected() ? selectedRegion : undefined,
      };

      const response = await apiService.chatWithAgent(chatMessage);
      
      // Check if this response requires confirmation
      if (response.requires_confirmation && response.operation_data) {
        setPendingConfirmation({
          confirmationId: response.operation_data.confirmation_id,
          operation: response.operation_data.operation,
          details: response.operation_data.details,
          originalMessage: messageText,
        });
      }
      
      addBotMessage(response);
    } catch (error) {
      console.error('Error sending message:', error);
      addBotMessage({
        response: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        suggestions: ['Show table statistics', 'Help with archiving'],
        requires_confirmation: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    // Focus the input field after setting the text
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleConfirmOperation = async () => {
    if (!pendingConfirmation) return;

    try {
      setIsLoading(true);
      const response = await apiService.confirmChatOperation(pendingConfirmation.confirmationId);
      addBotMessage(response);
      setPendingConfirmation(null);
    } catch (error) {
      console.error('Error confirming operation:', error);
      addBotMessage({
        response: `Failed to confirm operation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestions: [],
        requires_confirmation: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOperation = () => {
    addBotMessage({
      response: 'Operation cancelled. No changes have been made.',
      suggestions: ['Show table statistics', 'Help with archiving'],
      requires_confirmation: false,
    });
    setPendingConfirmation(null);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '600px' }}>
      {/* Main Chat Area */}
      <Card 
        sx={{ 
          flex: 1,
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: '20px',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
          border: 'none',
          overflow: 'hidden',
        }}
      >
      <CardContent sx={{ 
        flexGrow: 1, 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column',
        p: 0,
      }}>
        {/* Modern Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 3,
          pb: 2,
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${getRoleConfig().color} 0%, ${getRoleConfig().color}dd 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              boxShadow: `0 4px 12px ${getRoleConfig().color}40`,
            }}
          >
            <BotIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
              AI Log Assistant
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.875rem',
                  color: isRegionConnected() ? '#10b981' : '#ef4444', // Green if connected, red if not
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {selectedRegion ? (
                  <>
                    <span style={{ fontWeight: 'bold' }}>{selectedRegion}</span>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: isRegionConnected() ? '#10b981' : '#ef4444', // Green dot if connected, red if not
                        boxShadow: isRegionConnected() 
                          ? '0 0 6px rgba(16, 185, 129, 0.4)' 
                          : '0 0 6px rgba(239, 68, 68, 0.4)',
                      }}
                    />
                    <span style={{ fontWeight: 'normal' }}>
                      {isRegionConnected() ? 'Connected' : 'Disconnected'}
                    </span>
                  </>
                ) : (
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>No region selected</span>
                )}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            size="small" 
            onClick={() => {
              // Clear messages and reset initialization state
              setMessages([]);
              setLastInitializedRegion(undefined);
              setIsInitializing(false);
              // This will trigger a new initial message
            }}
            title="Restart chat"
            sx={{
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
              },
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Messages Container */}
        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'auto', 
          p: 3,
          pt: 2,
          background: 'linear-gradient(to bottom, #fafafa 0%, #ffffff 100%)',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '3px',
            '&:hover': {
              background: 'rgba(0, 0, 0, 0.3)',
            },
          },
        }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.isBot ? 'flex-start' : 'flex-end',
                mb: 2,
                width: '100%', // Ensure full width usage
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  maxWidth: message.isBot ? '95%' : '85%', // Bot messages can be wider for tables
                  minWidth: message.isBot && message.structuredContent ? '300px' : 'auto', // Minimum width for structured content
                  width: message.isBot && message.structuredContent ? '100%' : 'auto', // Full width for structured content
                  p: 2,
                  background: message.isBot 
                    ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                    : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  color: message.isBot ? 'text.primary' : 'white',
                  borderRadius: message.isBot ? '20px 20px 20px 6px' : '20px 20px 6px 20px',
                  border: message.isBot 
                    ? '1px solid rgba(148, 163, 184, 0.2)'
                    : 'none',
                  boxShadow: message.isBot 
                    ? '0 2px 12px rgba(0, 0, 0, 0.08)'
                    : '0 4px 20px rgba(37, 99, 235, 0.3)',
                  overflow: 'hidden', // Prevent content from overflowing
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, width: '100%' }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: message.isBot 
                        ? `linear-gradient(135deg, ${getRoleConfig().color} 0%, ${getRoleConfig().color}dd 100%)`
                        : 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      flexShrink: 0,
                      mt: 0.2,
                    }}
                  >
                    {message.isBot ? (
                      <BotIcon sx={{ fontSize: 14, color: 'white' }} />
                    ) : (
                      <PersonIcon sx={{ fontSize: 14, color: 'white' }} />
                    )}
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}> {/* Ensure content can use full width */}
                    {/* Render structured content if available, otherwise plain text */}
                    {message.isBot && message.structuredContent ? (
                      <>
                        <Box sx={{ mb: 1 }}>
                          <StructuredContentRenderer 
                            content={message.structuredContent} 
                            onSuggestionClick={handleSuggestionClick}
                          />
                        </Box>
                      </>
                    ) : (
                      <Typography variant="body2" sx={{ 
                        whiteSpace: 'pre-wrap', 
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                      }}>
                        {message.text}
                      </Typography>
                    )}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        opacity: 0.7, 
                        display: 'block', 
                        mt: 1,
                        fontSize: '0.75rem',
                      }}
                    >
                      {formatTimestamp(message.timestamp)}
                    </Typography>
                  </Box>
                </Box>

                {/* Enhanced Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        opacity: 0.8, 
                        mb: 1.5, 
                        display: 'block',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {message.suggestions.map((suggestion, index) => (
                        <Chip
                          key={index}
                          label={suggestion}
                          size="small"
                          variant="outlined"
                          clickable
                          onClick={() => handleSuggestionClick(suggestion)}
                          sx={{ 
                            fontSize: '0.75rem',
                            height: '28px',
                            borderRadius: '14px',
                            background: message.isBot 
                              ? 'rgba(255, 255, 255, 0.9)'
                              : 'rgba(255, 255, 255, 0.2)',
                            border: message.isBot 
                              ? '1px solid rgba(148, 163, 184, 0.3)'
                              : '1px solid rgba(255, 255, 255, 0.3)',
                            color: message.isBot ? 'text.primary' : 'white',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              background: message.isBot 
                                ? 'rgba(37, 99, 235, 0.1)'
                                : 'rgba(255, 255, 255, 0.3)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Box>
          ))}

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  borderRadius: '20px 20px 20px 6px',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${getRoleConfig().color} 0%, ${getRoleConfig().color}dd 100%)`,
                    }}
                  >
                    <BotIcon sx={{ fontSize: 14, color: 'white' }} />
                  </Box>
                  <CircularProgress size={16} sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    Thinking...
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Modern Input Area */}
        <Box sx={{ 
          p: 3, 
          pt: 2,
          background: 'rgba(248, 250, 252, 0.8)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask me about log management, archiving, or statistics..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              multiline
              maxRows={3}
              inputRef={inputRef}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
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
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                },
              }}
            />
            <Button
              variant="contained"
              size="medium"
              onClick={() => sendMessage()}
              disabled={!inputText.trim() || isLoading}
              sx={{
                minWidth: 'auto',
                px: 2.5,
                py: 1.5,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1e40af 0%, #5b21b6 100%)',
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  background: 'rgba(148, 163, 184, 0.3)',
                  color: 'rgba(148, 163, 184, 0.7)',
                  boxShadow: 'none',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <SendIcon fontSize="small" />
            </Button>
          </Box>

          {/* General Prompts - Quick Access */}
          <Box sx={{ mt: 2 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                opacity: 0.8, 
                mb: 1.5, 
                display: 'block',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                letterSpacing: '0.05em',
              }}
            >
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="What can you do?"
                size="small"
                variant="outlined"
                clickable
                onClick={() => handleSuggestionClick("What can you do?")}
                sx={{ 
                  fontSize: '0.75rem',
                  height: '28px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: 'text.primary',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    background: 'rgba(37, 99, 235, 0.1)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  }
                }}
              />
              <Chip
                label="Show table statistics"
                size="small"
                variant="outlined"
                clickable
                onClick={() => handleSuggestionClick("Show table statistics")}
                sx={{ 
                  fontSize: '0.75rem',
                  height: '28px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: 'text.primary',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    background: 'rgba(37, 99, 235, 0.1)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {pendingConfirmation && (
        <ConfirmationDialog
          open={true}
          onClose={handleCancelOperation}
          onConfirm={handleConfirmOperation}
          operationType={pendingConfirmation.operation.toUpperCase() as 'ARCHIVE' | 'DELETE'}
          operationData={{
            table: pendingConfirmation.details.split(' ')[0], // Extract table name
            count: parseInt(pendingConfirmation.details.match(/\d+/)?.[0] || '0'),
            dateRange: pendingConfirmation.details.includes('from') ? 
              pendingConfirmation.details.split('from ')[1]?.split(' to ')[0] + ' to ' + 
              pendingConfirmation.details.split(' to ')[1] : 
              'N/A'
          }}
          loading={isLoading}
        />
      )}
    </Box>
  );
};