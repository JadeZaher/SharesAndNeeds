import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Badge,
  InputAdornment,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { getMessages, createMessage, subscribeToMessages } from '../db';

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);
  const messageSubscription = useRef(null);

  // TODO: Replace with actual user ID from auth context
  const currentUserId = 'temp-user-id';

  useEffect(() => {
    loadConversations();
    return () => {
      if (messageSubscription.current) {
        messageSubscription.current.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      // TODO: Implement actual conversation loading
      // For now, using mock data
      const mockConversations = [
        {
          id: '1',
          userId: 'user1',
          username: 'John Doe',
          lastMessage: 'Hey, I am interested in your post',
          timestamp: new Date(),
          unread: 2,
        },
        {
          id: '2',
          userId: 'user2',
          username: 'Jane Smith',
          lastMessage: 'Thanks for sharing!',
          timestamp: new Date(),
          unread: 0,
        },
      ];
      setConversations(mockConversations);
      setLoading(false);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations');
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const messages = await getMessages(conversationId);
      setMessages(messages);

      // Subscribe to new messages
      if (messageSubscription.current) {
        messageSubscription.current.unsubscribe();
      }
      messageSubscription.current = subscribeToMessages(conversationId, (newMessages) => {
        setMessages(newMessages);
      });
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await createMessage({
        conversationId: selectedConversation.id,
        senderId: currentUserId,
        receiverId: selectedConversation.userId,
        content: newMessage.trim(),
      });

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ 
        display: 'flex', 
        height: '80vh',
        overflow: 'hidden',
      }}>
        {/* Conversations Sidebar */}
        <Box sx={{ 
          width: 320, 
          borderRight: 1, 
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Messages
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Divider />
          
          <List sx={{ 
            flex: 1,
            overflow: 'auto',
            '& .MuiListItem-root': {
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            },
          }}>
            {filteredConversations.map((conv) => (
              <React.Fragment key={conv.id}>
                <ListItem
                  button
                  selected={selectedConversation?.id === conv.id}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <ListItemAvatar>
                    <Badge
                      color="primary"
                      badgeContent={conv.unread}
                      invisible={!conv.unread}
                    >
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conv.username}
                    secondary={conv.lastMessage}
                    primaryTypographyProps={{
                      variant: 'subtitle1',
                      fontWeight: conv.unread ? 600 : 400,
                    }}
                    secondaryTypographyProps={{
                      noWrap: true,
                      variant: 'body2',
                    }}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Messages Area */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}>
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <Box sx={{ 
                p: 2, 
                borderBottom: 1, 
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}>
                <Typography variant="h6">
                  {selectedConversation.username}
                </Typography>
              </Box>

              {/* Messages */}
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      alignSelf: message.senderId === currentUserId ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        bgcolor: message.senderId === currentUserId ? 'primary.main' : 'background.paper',
                        color: message.senderId === currentUserId ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body1">
                        {message.content}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          mt: 0.5,
                          opacity: 0.8,
                        }}
                      >
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box
                component="form"
                onSubmit={handleSendMessage}
                sx={{
                  p: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          type="submit"
                          disabled={!newMessage.trim()}
                          color="primary"
                        >
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              flex={1}
              p={3}
              textAlign="center"
            >
              <MessageIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Select a Conversation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a conversation from the list to start messaging
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default Messages;
