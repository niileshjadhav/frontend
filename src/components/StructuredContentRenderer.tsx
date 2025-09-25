import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Storage as StorageIcon,
  QueryStats as QueryStatsIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

interface StructuredContentProps {
  content: any;
  onSuggestionClick?: (suggestion: string) => void;
}

const StructuredContentRenderer: React.FC<StructuredContentProps> = ({ content, onSuggestionClick }) => {
  if (!content || typeof content !== 'object') {
    return null;
  }

  const renderStatsCard = (data: any) => (
    <Card 
      elevation={1} 
      sx={{ 
        backgroundColor: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '12px',
        maxWidth: '350px',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              backgroundColor: '#0ea5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <QueryStatsIcon sx={{ color: 'white', fontSize: 16 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
              {data.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
              Table: {data.table_name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {data.stats?.map((stat: any, index: number) => (
            <Box key={index} sx={{ flex: '1 1 auto'}}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: '6px',
                  backgroundColor: stat.highlight ? '#f8fafc' : '#ffffff',
                  border: stat.highlight 
                    ? '1px solid #0ea5e9'
                    : '1px solid #e2e8f0',
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" sx={{ color: '#64748b', mb: 0.25, fontWeight: 500, fontSize: '0.75rem' }}>
                  {stat.label}
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: stat.highlight ? '#0ea5e9' : '#0f172a',
                    fontSize: stat.type === 'number' ? '1.2rem' : '0.9rem',
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </Typography>
                {stat.type === 'number' && (
                  <TrendingUpIcon sx={{ color: '#059669', fontSize: 12, mt: 0.25 }} />
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const renderDataTable = (data: any) => (
    <Card 
      elevation={1} 
      sx={{ 
        backgroundColor: '#fefce8',
        border: '1px solid #f59e0b',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              backgroundColor: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
              flexShrink: 0,
            }}
          >
            <StorageIcon sx={{ color: 'white', fontSize: 16 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}> {/* minWidth: 0 allows text to truncate */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
              {data.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
              <strong>{data.total_count.toLocaleString()}</strong> records • <strong>{data.showing_count}</strong> shown
            </Typography>
          </Box>
          <Chip
            label={data.table_name}
            size="small"
            sx={{
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#d97706',
              fontWeight: 600,
              fontSize: '0.7rem',
              flexShrink: 0, // Prevent chip from shrinking
            }}
          />
        </Box>

        {data.data && data.data.length > 0 ? (
          <>
            <Box 
              sx={{ 
                width: '100%',
                overflowX: 'auto',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                backgroundColor: 'white',
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f5f9',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#cbd5e1',
                  borderRadius: '3px',
                  '&:hover': {
                    background: '#94a3b8',
                  },
                },
              }}
            >
              <Box sx={{ minWidth: '320px' }}> {/* Minimum width for table readability */}
                <Table size="small" sx={{ tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow>
                      {data.columns.slice(0, 4).map((column: string, index: number) => ( // Limit to 4 columns max
                        <TableCell 
                          key={column}
                          sx={{
                            fontWeight: 700,
                            backgroundColor: '#f8fafc',
                            color: '#374151',
                            borderBottom: '2px solid rgba(148, 163, 184, 0.2)',
                            textTransform: 'capitalize',
                            fontSize: '0.75rem',
                            width: index === 0 ? '80px' : 'auto', // First column narrower (usually ID)
                            padding: '8px 6px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {column.replace(/_/g, ' ')}
                        </TableCell>
                      ))}
                      {data.columns.length > 4 && (
                        <TableCell 
                          sx={{
                            fontWeight: 700,
                            backgroundColor: '#f8fafc',
                            color: '#374151',
                            fontSize: '0.75rem',
                            width: '40px',
                            padding: '8px 6px',
                            textAlign: 'center',
                          }}
                        >
                          {/* +{data.columns.length - 4} */}
                          ...
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.data.slice(0, 5).map((row: any, rowIndex: number) => ( // Limit to 5 rows
                      <TableRow 
                        key={rowIndex}
                        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: 'rgba(248, 250, 252, 0.8)',
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(245, 158, 11, 0.05)',
                          },
                        }}
                      >
                        {data.columns.slice(0, 4).map((column: string, colIndex: number) => (
                          <TableCell 
                            key={column}
                            sx={{
                              fontSize: '0.7rem',
                              color: '#374151',
                              padding: '6px 6px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: colIndex === 0 ? '80px' : '120px',
                            }}
                          >
                            {typeof row[column] === 'object' 
                              ? JSON.stringify(row[column]).substring(0, 20) + '...'
                              : String(row[column] || '—').substring(0, 30) // Truncate long values
                            }
                          </TableCell>
                        ))}
                        {data.columns.length > 4 && (
                          <TableCell 
                            sx={{
                              fontSize: '0.7rem',
                              color: '#94a3b8',
                              padding: '6px 6px',
                              textAlign: 'center',
                              fontStyle: 'italic',
                            }}
                          >
                            ...
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Box>

            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                Showing <strong>{Math.min(5, data.data.length)}</strong> of <strong>{data.total_count.toLocaleString()}</strong> records
              </Typography>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="textSecondary">
              No data to display
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderConfirmationCard = (data: any) => {
    const isDelete = data.operation?.toLowerCase().includes('delete');

    return (
      <Card 
        elevation={1} 
        sx={{ 
          backgroundColor: isDelete ? '#fef2f2' : '#fff7ed',
          border: `1px solid ${isDelete ? '#ef4444' : '#f97316'}`,
          borderRadius: '12px',
          maxWidth: '350px',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              backgroundColor: isDelete ? '#ef4444' : '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            {isDelete ? (
              <DeleteIcon sx={{ color: 'white', fontSize: 16 }} />
            ) : (
              <ArchiveIcon sx={{ color: 'white', fontSize: 16 }} />
            )}
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
              {data.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
              {isDelete ? 'Permanent deletion' : 'Moving to archive'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
          <Box sx={{ flex: '1 1 auto' }}>
            <Box
              sx={{
                p: 1.2,
                borderRadius: '6px',
                backgroundColor: isDelete ? '#fef2f2' : '#fff7ed',
                border: `1px solid ${isDelete ? '#ef4444' : '#f97316'}`,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" sx={{ color: '#64748b', mb: 0.25, fontWeight: 500, fontSize: '0.75rem' }}>
                Records to {isDelete ? 'delete' : 'archive'}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 900,
                  color: isDelete ? '#dc2626' : '#ea580c',
                  fontSize: '1.4rem',
                  lineHeight: 1.2,
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                {data.count?.toLocaleString() || '0'}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {isDelete && (
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: '10px',
              backgroundColor: '#fef2f2',
              border: '1px solid #ef4444',
              mb: 1.5,
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>
              ⚠️ This action cannot be undone!
            </Typography>
          </Alert>
        )}

        <Box sx={{ textAlign: 'center', mt: 1.5 }}>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 1, fontSize: '0.8rem' }}>
            {data.instructions || `Click below to confirm or cancel this ${isDelete ? 'deletion' : 'archive'} operation.`}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`CONFIRM ${isDelete ? 'DELETE' : 'ARCHIVE'}`}
              size="small"
              clickable
              onClick={() => onSuggestionClick?.(`CONFIRM ${isDelete ? 'DELETE' : 'ARCHIVE'}`)}
              sx={{
                backgroundColor: isDelete ? '#fef2f2' : '#fff7ed',
                color: isDelete ? '#dc2626' : '#ea580c',
                fontWeight: 600,
                fontSize: '0.7rem',
                border: `1px solid ${isDelete ? '#ef4444' : '#f97316'}`,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: isDelete ? '#fee2e2' : '#fed7aa',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            />
            <Chip
              label="CANCEL"
              size="small"
              clickable
              onClick={() => onSuggestionClick?.('CANCEL')}
              sx={{
                backgroundColor: '#f9fafb',
                color: '#6b7280',
                fontWeight: 600,
                fontSize: '0.7rem',
                border: '1px solid #d1d5db',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            />
          </Box>
        </Box>
        </CardContent>
      </Card>
    );
  };

  const renderSuccessCard = (data: any) => (
    <Card 
      elevation={1} 
      sx={{ 
        backgroundColor: '#f0fdf4',
        border: '1px solid #22c55e',
        borderRadius: '12px',
        maxWidth: '350px',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              backgroundColor: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <CheckIcon sx={{ color: 'white', fontSize: 16 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
              {data.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#22c55e', fontWeight: 600, fontSize: '0.8rem' }}>
              ✓ Operation completed successfully
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <LinearProgress 
            variant="determinate" 
            value={100} 
            sx={{ 
              height: 4, 
              borderRadius: 2,
              backgroundColor: '#f0fdf4',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#22c55e',
              },
            }}
          />
        </Box>

        {data.details && (
          <Box sx={{ mt: 1.5 }}>
            {data.details.map((detail: any, index: number) => (
              <Typography key={index} variant="body2" sx={{ color: '#374151', mb: 0.25, fontSize: '0.8rem' }}>
                • {detail}
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderCapabilitiesCard = (data: any) => (
    <Card 
      elevation={1} 
      sx={{ 
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '12px',
        maxWidth: '450px',
        width: '100%',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              backgroundColor: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <QueryStatsIcon sx={{ color: 'white', fontSize: 16 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.1rem' }}>
              {data.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
              Cloud Inventory Management Assistant
            </Typography>
          </Box>
        </Box>

        {data.capabilities && data.capabilities.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1.5, fontSize: '0.9rem' }}>
              🚀 My Capabilities
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {data.capabilities.map((capability: any, index: number) => (
                <Box 
                  key={index}
                  sx={{
                    p: 1.5,
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#fffbeb',
                      borderColor: '#f59e0b',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.2 }}>
                      {capability.icon}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', fontSize: '0.85rem', mb: 0.25 }}>
                        {capability.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.75rem', lineHeight: 1.3 }}>
                        {capability.description}
                      </Typography>
                      {capability.examples && capability.examples.length > 0 && (
                        <Box sx={{ mt: 0.75, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {capability.examples.map((example: string, exampleIndex: number) => (
                            <Chip
                              key={exampleIndex}
                              label={example}
                              size="small"
                              clickable
                              onClick={() => onSuggestionClick?.(example)}
                              sx={{
                                fontSize: '0.65rem',
                                height: '20px',
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                color: '#d97706',
                                borderColor: 'rgba(245, 158, 11, 0.3)',
                                cursor: 'pointer',
                                '& .MuiChip-label': {
                                  px: 1,
                                },
                                '&:hover': {
                                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 2px 6px rgba(245, 158, 11, 0.2)',
                                },
                                transition: 'all 0.2s ease-in-out',
                              }}
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {data.quick_tips && data.quick_tips.length > 0 && (
          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1, fontSize: '0.9rem' }}>
              💡 Quick Tips
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {data.quick_tips.map((tip: string, index: number) => (
                <Typography key={index} variant="body2" sx={{ color: '#64748b', fontSize: '0.75rem', lineHeight: 1.4 }}>
                  • {tip}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderConversationalCard = (data: any) => (
    <Card 
      elevation={1} 
      sx={{ 
        backgroundColor: '#f0f9ff',
        border: '1px solid #3b82f6',
        borderRadius: '12px',
        maxWidth: '100%',
        width: '100%',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <QueryStatsIcon sx={{ color: 'white', fontSize: 16 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
              {data.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
              {data.region} • {data.user_role} Access
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" sx={{ 
            color: '#374151', 
            fontSize: '0.85rem', 
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap'
          }}>
            {data.content}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderErrorCard = (data: any) => (
    <Card 
      elevation={1} 
      sx={{ 
        backgroundColor: '#fef2f2',
        border: '1px solid #ef4444',
        borderRadius: '12px',
        maxWidth: '100%',
        width: '100%',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              backgroundColor: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <DeleteIcon sx={{ color: 'white', fontSize: 16 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
              {data.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
              {data.region} Region
            </Typography>
          </Box>
        </Box>

        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #ef4444',
            mb: 1.5,
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {data.error_message}
          </Typography>
        </Alert>

        {data.suggestions && data.suggestions.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" sx={{ 
              opacity: 0.8, 
              mb: 1, 
              display: 'block',
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
            }}>
              Suggested Actions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {data.suggestions.map((suggestion: string, index: number) => (
                <Chip
                  key={index}
                  label={suggestion}
                  size="small"
                  clickable
                  onClick={() => onSuggestionClick?.(suggestion)}
                  sx={{
                    fontSize: '0.75rem',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #ef4444',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#fee2e2',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(220, 38, 38, 0.15)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderCancelledCard = (data: any) => (
    <Card 
      elevation={1} 
      sx={{ 
        backgroundColor: '#f9fafb',
        border: '1px solid #6b7280',
        borderRadius: '12px',
        maxWidth: '350px',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              backgroundColor: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <DeleteIcon sx={{ color: 'white', fontSize: 16 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
              {data.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
              {data.region} Region
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" sx={{ 
            color: '#374151', 
            fontSize: '0.85rem', 
            lineHeight: 1.5,
            mb: 1
          }}>
            {data.message}
          </Typography>
          {data.details && data.details.map((detail: string, index: number) => (
            <Typography key={index} variant="body2" sx={{ color: '#6b7280', fontSize: '0.8rem', mb: 0.25 }}>
              • {detail}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const renderDatabaseOverviewCard = (data: any) => (
    <Card 
      elevation={1} 
      sx={{ 
        backgroundColor: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              backgroundColor: '#0ea5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <QueryStatsIcon sx={{ color: 'white', fontSize: 16 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.1rem' }}>
              {data.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
              {data.summary?.main_tables_count || 0} main tables • {data.summary?.archive_tables_count || 0} archive tables
            </Typography>
          </Box>
        </Box>

        {/* Main Tables */}
        {data.main_tables && data.main_tables.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1, fontSize: '0.9rem' }}>
              🗂️ Main Tables
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {data.main_tables.map((table: any, index: number) => (
                <Box 
                  key={index}
                  sx={{
                    p: 1.5,
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(14, 165, 233, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>
                      {table.name}
                    </Typography>
                    {table.error ? (
                      <Typography variant="body2" sx={{ color: '#ef4444', fontSize: '0.75rem' }}>
                        ❌ Error: {table.error}
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                        Records older than {table.age_days} days: <Typography component="span" sx={{ fontWeight: 900, color: '#f59e0b', fontSize: '0.8rem' }}>{table.age_based_count?.toLocaleString() || '0'}</Typography>
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0ea5e9', fontSize: '1.0rem' }}>
                      {table.total_records?.toLocaleString() || '0'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>
                      Total records
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Archive Tables */}
        {data.archive_tables && data.archive_tables.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1, fontSize: '0.9rem' }}>
              📦 Archive Tables
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {data.archive_tables.map((table: any, index: number) => (
                <Box 
                  key={index}
                  sx={{
                    p: 1.5,
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>
                      {table.name}
                    </Typography>
                    {table.error ? (
                      <Typography variant="body2" sx={{ color: '#ef4444', fontSize: '0.75rem' }}>
                        ❌ Error: {table.error}
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                        Records older than {table.age_days} days: <Typography component="span" sx={{ fontWeight: 900, color: '#f59e0b', fontSize: '0.8rem' }}>{table.age_based_count?.toLocaleString() || '0'}</Typography>
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#d97706', fontSize: '1.0rem' }}>
                      {table.total_records?.toLocaleString() || '0'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>
                      Total records
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Main rendering logic
  switch (content.type) {
    case 'stats_card':
      return renderStatsCard(content);
    case 'data_table':
      return renderDataTable(content);
    case 'database_overview':
      return renderDatabaseOverviewCard(content);
    case 'confirmation_card':
      return renderConfirmationCard(content);
    case 'success_card':
      return renderSuccessCard(content);
    case 'capabilities_card':
      return renderCapabilitiesCard(content);
    case 'conversational_card':
      return renderConversationalCard(content);
    case 'error_card':
      return renderErrorCard(content);
    case 'cancelled_card':
      return renderCancelledCard(content);
    default:
      // Fallback to plain JSON display for unknown types
      return (
        <Box
          sx={{
            p: 2,
            borderRadius: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(content, null, 2)}
          </Typography>
        </Box>
      );
  }
};

export default StructuredContentRenderer;