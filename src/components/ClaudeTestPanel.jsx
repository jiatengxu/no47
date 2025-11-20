import React, { useState } from 'react';
import useClaudeAPI from '../hooks/useClaudeAPI';
import './ClaudeTestPanel.css';

const ClaudeTestPanel = () => {
  const { loading, error, response, testConnection, sendMessage } = useClaudeAPI();
  const [showPanel, setShowPanel] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testHistory, setTestHistory] = useState([]);

  const handleTestConnection = async () => {
    try {
      const result = await testConnection();
      setTestHistory([
        ...testHistory,
        {
          type: 'test',
          success: result.success,
          message: result.message,
          response: result.response,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      setTestHistory([
        ...testHistory,
        {
          type: 'error',
          message: 'Connection test failed',
          error: err.message,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (!testMessage.trim()) return;

    try {
      const result = await sendMessage(testMessage);
      setTestHistory([
        ...testHistory,
        {
          type: 'message',
          sent: testMessage,
          response: result,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setTestMessage('');
    } catch (err) {
      setTestHistory([
        ...testHistory,
        {
          type: 'error',
          message: 'Message failed',
          error: err.message,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  const handleClearHistory = () => {
    setTestHistory([]);
  };

  return (
    <>
      {/* Floating Test Button */}
      <div className="claude-test-button-container">
        <button
          className="claude-test-button"
          onClick={() => setShowPanel(!showPanel)}
          title="Claude API Test Panel"
        >
          {showPanel ? '✕' : '🤖'}
        </button>
      </div>

      {/* Test Panel */}
      {showPanel && (
        <div className="claude-test-panel">
          <div className="test-panel-header">
            <h3>Claude API Test Panel</h3>
            <button
              className="close-button"
              onClick={() => setShowPanel(false)}
            >
              ✕
            </button>
          </div>

          <div className="test-panel-content">
            {/* Connection Test */}
            <div className="test-section">
              <h4>Connection Test</h4>
              <button
                onClick={handleTestConnection}
                disabled={loading}
                className="test-button primary"
              >
                {loading ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {/* Message Test */}
            <div className="test-section">
              <h4>Send Message</h4>
              <div className="message-input-group">
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a test message..."
                  disabled={loading}
                  className="test-input"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !testMessage.trim()}
                  className="test-button primary"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>

            {/* History */}
            <div className="test-section">
              <div className="history-header">
                <h4>Test History</h4>
                {testHistory.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="test-button secondary"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="test-history">
                {testHistory.length === 0 ? (
                  <p className="empty-history">No tests run yet...</p>
                ) : (
                  testHistory.map((item, idx) => (
                    <div key={idx} className={`history-item ${item.type}`}>
                      <div className="item-timestamp">{item.timestamp}</div>

                      {item.type === 'test' && (
                        <>
                          <div className="item-label">Test: {item.message}</div>
                          {item.response && (
                            <div className="item-response">
                              Response: {item.response}
                            </div>
                          )}
                        </>
                      )}

                      {item.type === 'message' && (
                        <>
                          <div className="item-sent">You: {item.sent}</div>
                          <div className="item-response">Claude: {item.response}</div>
                        </>
                      )}

                      {item.type === 'error' && (
                        <div className="item-error">
                          ❌ {item.message}: {item.error}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Current Status */}
          {error && (
            <div className="test-panel-footer error">
              <strong>Error:</strong> {error}
            </div>
          )}
          {loading && (
            <div className="test-panel-footer loading">
              Loading...
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ClaudeTestPanel;