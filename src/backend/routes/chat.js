const express = require('express');
const axios = require('axios');
const router = express.Router();

// Mistral API configuration
const MISTRAL_API_URL = process.env.MISTRAL_API_URL || 'http://127.0.0.1:1234';
const MISTRAL_TIMEOUT = parseInt(process.env.MISTRAL_TIMEOUT) || 30000; // 30 seconds

// Create axios instance for Mistral API
const mistralApi = axios.create({
  baseURL: MISTRAL_API_URL,
  timeout: MISTRAL_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Validation middleware
const validateChatRequest = (req, res, next) => {
  const { message } = req.body;
  
  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Message is required and must be a string'
    });
  }
  
  if (message.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Message cannot be empty'
    });
  }
  
  if (message.length > 10000) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Message is too long (max 10000 characters)'
    });
  }
  
  next();
};

// Format conversation history for Mistral
const formatConversationHistory = (history = []) => {
  return history
    .filter(msg => msg.role && msg.content)
    .slice(-10) // Keep only last 10 messages for context
    .map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content.trim()
    }));
};

// Chat endpoint
router.post('/', validateChatRequest, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    
    console.log(`📝 Received chat request: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);
    
    // Format conversation for Mistral API
    const formattedHistory = formatConversationHistory(history);
    const conversation = [
      ...formattedHistory,
      { role: 'user', content: message.trim() }
    ];
    
    // Prepare request for Mistral API (OpenAI-compatible format)
    const mistralRequest = {
      model: 'mistral', // or whatever model name your local server uses
      messages: conversation,
      max_tokens: 2000,
      temperature: 0.7,
      stream: false
    };
    
    console.log(`🤖 Sending request to Mistral API at ${MISTRAL_API_URL}`);
    
    // Call Mistral API
    const startTime = Date.now();
    const response = await mistralApi.post('/v1/chat/completions', mistralRequest);
    const endTime = Date.now();
    
    console.log(`✅ Received response from Mistral in ${endTime - startTime}ms`);
    
    // Extract response
    const mistralResponse = response.data;
    
    if (!mistralResponse.choices || mistralResponse.choices.length === 0) {
      throw new Error('No response choices received from Mistral API');
    }
    
    const assistantMessage = mistralResponse.choices[0].message?.content;
    
    if (!assistantMessage) {
      throw new Error('Empty response received from Mistral API');
    }
    
    // Log successful response
    console.log(`📤 Sending response: "${assistantMessage.substring(0, 100)}${assistantMessage.length > 100 ? '...' : ''}"`);
    
    res.json({
      response: assistantMessage.trim(),
      model: mistralResponse.model || 'mistral',
      usage: mistralResponse.usage || null,
      responseTime: endTime - startTime
    });
    
  } catch (error) {
    console.error('❌ Chat error:', error.message);
    
    // Handle different types of errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'Cannot connect to Mistral API. Please ensure it is running and accessible.',
        details: `Attempted to connect to: ${MISTRAL_API_URL}`
      });
    }
    
    if (error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'Mistral API endpoint not found. Please check the configuration.',
        details: `Endpoint: ${MISTRAL_API_URL}`
      });
    }
    
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      return res.status(504).json({
        error: 'Gateway Timeout',
        message: 'Mistral API request timed out. Please try again.',
        timeout: MISTRAL_TIMEOUT
      });
    }
    
    if (error.response) {
      // Mistral API returned an error response
      const status = error.response.status;
      const data = error.response.data;
      
      console.error('Mistral API error response:', data);
      
      return res.status(status >= 400 && status < 500 ? status : 500).json({
        error: 'Mistral API Error',
        message: data.error?.message || data.message || 'Unknown error from Mistral API',
        status: status
      });
    }
    
    // Generic error
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test endpoint to check Mistral API connectivity
router.get('/test', async (req, res) => {
  try {
    console.log(`🔍 Testing connection to Mistral API at ${MISTRAL_API_URL}`);
    
    const testRequest = {
      model: 'mistral',
      messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
      max_tokens: 50,
      temperature: 0.1
    };
    
    const startTime = Date.now();
    const response = await mistralApi.post('/v1/chat/completions', testRequest);
    const endTime = Date.now();
    
    res.json({
      status: 'success',
      message: 'Mistral API is accessible',
      endpoint: MISTRAL_API_URL,
      responseTime: endTime - startTime,
      testResponse: response.data.choices[0]?.message?.content || 'No content received'
    });
    
  } catch (error) {
    console.error('❌ Mistral API test failed:', error.message);
    
    res.status(503).json({
      status: 'error',
      message: 'Cannot connect to Mistral API',
      endpoint: MISTRAL_API_URL,
      error: error.message,
      code: error.code
    });
  }
});

// Get chat configuration
router.get('/config', (req, res) => {
  res.json({
    mistralEndpoint: MISTRAL_API_URL,
    timeout: MISTRAL_TIMEOUT,
    maxMessageLength: 10000,
    historyLimit: 10,
    status: 'active'
  });
});

module.exports = router;