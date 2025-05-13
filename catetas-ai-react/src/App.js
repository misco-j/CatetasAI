import React, { useState, useEffect } from 'react';

const API_KEY = 'AIzaSyAXI-yLqe4jfGv-abhQBNGDVOAXTEHThIY'; // Use your actual API key here

function App() {
  const [prompt, setPrompt] = useState('');
  const [conversation, setConversation] = useState([]);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Load conversation history from localStorage on mount
    const savedConversation = localStorage.getItem('catetasConversation');
    if (savedConversation) {
      setConversation(JSON.parse(savedConversation));
    }
  }, []);

  useEffect(() => {
    // Save conversation history to localStorage on change
    localStorage.setItem('catetasConversation', JSON.stringify(conversation));
  }, [conversation]);

  const generateContent = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt.');
      return;
    }

    // Append user prompt to conversation
    const newConversation = [...conversation, { sender: 'User', text: prompt }];
    setConversation(newConversation);

    try {
      // Call backend API to get AI response
      const response = await fetch('http://localhost:5000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI backend');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setConversation([...newConversation, { sender: 'AI', text: data.response }]);
      setPrompt('');
    } catch (error) {
      alert('An error occurred: ' + error.message);
    }
  };

  const generateWithImage = async () => {
    if (!selectedImage) {
      alert('Please select an image to upload.');
      return;
    }
    if (!prompt.trim()) {
      alert('Please enter a prompt.');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('prompt', prompt);

    // Append user prompt to conversation
    const newConversation = [...conversation, { sender: 'User', text: prompt }];
    setConversation(newConversation);

    try {
      const response = await fetch('http://localhost:5000/generate_with_image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI backend');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setConversation([...newConversation, { sender: 'AI', text: data.response }]);
      setPrompt('');
      setSelectedImage(null);
    } catch (error) {
      alert('An error occurred: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      alert('Please select an image to upload.');
      return;
    }
    if (!prompt.trim()) {
      alert('Please enter a prompt.');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('prompt', prompt);

    // Append user prompt to conversation
    const newConversation = [...conversation, { sender: 'User', text: prompt }];
    setConversation(newConversation);

    try {
      const response = await fetch('http://localhost:5000/generate_with_image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI backend');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setConversation([...newConversation, { sender: 'AI', text: data.response }]);
      setPrompt('');
      setSelectedImage(null);
    } catch (error) {
      alert('An error occurred: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const clearConversation = () => {
    setConversation([]);
    localStorage.removeItem('catetasConversation');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateContent();
    }
  };

  return (
    <div style={styles.app}>
      <h1 style={styles.title}>Catetas AI</h1>
      <div style={styles.inputFrame}>
        <label style={styles.label} htmlFor="promptInput">Enter your prompt:</label>
        <textarea
          id="promptInput"
          style={styles.textarea}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={5}
          placeholder="Type your prompt here..."
          onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
          onBlur={(e) => e.target.style.borderColor = '#6d28d9'}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
          id="imageInput"
        />
        <label
          htmlFor="imageInput"
          style={styles.imageInputLabel}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#a78bfa'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7c3aed'}
        >
          {selectedImage ? `Selected: ${selectedImage.name}` : 'Select Image'}
        </label>
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <button
            style={{
              ...styles.button,
              ...styles.uploadButton,
              width: '100%',
            }}
            onClick={uploadImage}
            disabled={!selectedImage}
          >
            Upload Image
          </button>
        </div>
        <div style={styles.buttonsContainer}>
          <button
            style={{
              ...styles.button,
              ...styles.clearButton,
              flex: 1,
              marginRight: 10,
            }}
            onClick={clearConversation}
            onMouseEnter={() => setHoveredButton('clear')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            Clear Conversation
          </button>
          <button
            style={{
              ...styles.button,
              ...styles.generateButton,
              flex: 1,
              marginLeft: 10,
            }}
            onClick={generateContent}
            disabled={!prompt.trim() && !selectedImage}
          >
            Generate with Image
          </button>
        </div>
      </div>
      <div style={styles.historyFrame}>
        <label style={styles.label}>Conversation History:</label>
        <div style={styles.historyText}>
          {conversation.length === 0 && <p style={{ color: '#9ca3af' }}>No conversation yet.</p>}
          {conversation.map((entry, index) => (
            <div
              key={index}
              style={entry.sender === 'User' ? styles.userMessage : styles.aiMessage}
            >
              <div style={styles.messageHeader}>
                {entry.sender === 'User' ? '👤 User' : '🤖 AI'}
              </div>
              <p style={styles.messageText}>{entry.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  app: {
    background: 'radial-gradient(circle at top left, #4c1d95, #7c3aed)',
    color: '#f9fafb',
    fontFamily: "'Roboto', Arial, Helvetica, sans-serif",
    maxWidth: 900,
    margin: '40px auto',
    padding: 40,
    borderRadius: 20,
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
    position: 'relative',
    overflow: 'hidden',
  },
  title: {
    fontWeight: '900',
    fontSize: 36,
    marginBottom: 40,
    textAlign: 'center',
    textShadow: '3px 3px 8px rgba(0,0,0,0.5)',
    letterSpacing: '0.1em',
    userSelect: 'none',
  },
  inputFrame: {
    backgroundColor: '#5b21b6',
    padding: 24,
    borderRadius: 16,
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)',
    border: '1px solid #7c3aed',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: 20,
    marginBottom: 14,
    display: 'block',
    color: '#d8d8d8',
    fontWeight: '700',
  },
  textarea: {
    width: '100%',
    fontFamily: "'Roboto Mono', Consolas, monospace",
    fontSize: 20,
    padding: 18,
    borderRadius: 12,
    border: '3px solid #6d28d9',
    resize: 'vertical',
    backgroundColor: '#4c1d95',
    color: '#e0e7ff',
    transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
    boxShadow: 'inset 0 0 12px rgba(0,0,0,0.6)',
    outline: 'none',
  },
  imageInputLabel: {
    display: 'inline-block',
    marginTop: 20,
    padding: '10px 20px',
    backgroundColor: '#7c3aed',
    color: '#f9fafb',
    borderRadius: 12,
    cursor: 'pointer',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.6)',
    transition: 'background-color 0.3s ease',
    userSelect: 'none',
  },
  buttonsContainer: {
    marginTop: 20,
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    fontSize: 20,
    fontWeight: '900',
    padding: '14px 28px',
    borderRadius: 14,
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
    userSelect: 'none',
  },
  generateButton: {
    backgroundColor: '#22c55e',
    color: '#f0fdf4',
    boxShadow: '0 8px 28px #22c55e',
    flex: 1,
    marginRight: 10,
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    color: '#f0fdf4',
    boxShadow: '0 8px 28px #3b82f6',
    fontWeight: '700',
    borderRadius: 14,
    padding: '14px 28px',
    cursor: 'pointer',
    border: 'none',
    fontSize: 20,
    transition: 'background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
    userSelect: 'none',
  },
  clearButton: {
    backgroundColor: '#ef4444',
    color: '#fef2f2',
    boxShadow: '0 8px 28px #ef4444',
    flex: 1,
    marginLeft: 10,
  },
  historyFrame: {
    backgroundColor: '#5b21b6',
    marginTop: 40,
    padding: 24,
    borderRadius: 16,
    flexGrow: 1,
    overflowY: 'auto',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)',
    border: '1px solid #7c3aed',
  },
  historyText: {
    backgroundColor: '#e0e7ff',
    color: '#1e293b',
    padding: 24,
    borderRadius: 14,
    minHeight: '100%',
    whiteSpace: 'pre-wrap',
    fontSize: 18,
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
    scrollbarWidth: 'thin',
    scrollbarColor: '#7c3aed #dbeafe',
  },
  userMessage: {
    marginBottom: 20,
    fontWeight: '700',
    color: '#2563eb',
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 14,
    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
  },
  aiMessage: {
    marginBottom: 20,
    fontStyle: 'italic',
    color: '#4b5563',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 14,
    boxShadow: '0 4px 14px rgba(107, 114, 128, 0.3)',
  },
  messageHeader: {
    fontWeight: '800',
    marginBottom: 8,
  },
  messageText: {
    margin: 0,
  },
};

export default App;
