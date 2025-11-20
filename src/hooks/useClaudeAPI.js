import { useState, useCallback } from 'react';

const useClaudeAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const API_BASE_URL = 'http://localhost:8000/api/claude';

  const sendMessage = useCallback(async (message, useConversation = false) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`${API_BASE_URL}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          use_conversation: useConversation,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.response);
      return data.response;
    } catch (err) {
      setError(err.message);
      console.error('Claude API Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const testConnection = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`${API_BASE_URL}/test`, {
        method: 'POST',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.response);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Claude API Test Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetConversation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/reset`, {
        method: 'POST',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      setError(err.message);
      console.error('Reset Conversation Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    response,
    sendMessage,
    testConnection,
    resetConversation,
  };
};

export default useClaudeAPI;