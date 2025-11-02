import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, Loader2 } from 'lucide-react';

const FarmerChatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'السلام علیکم! میں آپ کا زرعی مشیر ہوں۔ آپ مجھ سے کھیتی باڑی کے بارے میں کچھ بھی پوچھ سکتے ہیں۔ فصلوں، پانی، کیڑے مکوڑے، کھاد، موسم - کسی بھی موضوع پر رہنمائی حاصل کریں۔',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const API_BASE_URL = 'http://127.0.0.1:8000';

  const quickQuestions = [
    '🌾 گندم کی کاشت کا بہترین وقت؟',
    '💧 پانی کی بچت کیسے کریں؟',
    '🦟 کیڑوں سے کیسے بچیں؟',
    '🌱 نامیاتی کھاد کیسے بنائیں؟',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Urdu Speech-to-Text via your FastAPI backend
  const transcribeAudioWithWhisper = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");

      const response = await fetch(`${API_BASE_URL}/api/stt`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Transcription failed");
      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error("STT error:", error);
      alert("آواز کو متن میں تبدیل نہیں کیا جا سکا۔");
      return null;
    }
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        // Transcribe using Whisper
        setIsLoading(true);
        const transcription = await transcribeAudioWithWhisper(audioBlob);
        setIsLoading(false);

        if (transcription) {
          setInput(transcription);
        } else {
          alert('معذرت! آواز کو سمجھنے میں مشکل ہوئی۔ براہ کرم دوبارہ کوشش کریں۔');
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      alert('معذرت! مائیکروفون تک رسائی نہیں ہو سکی۔ براہ کرم اجازت دیں۔');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const speakTextWithMMS = async (text) => {
    setIsSpeaking(true);

    try {
      const formData = new FormData();
      formData.append("text", text);

      const response = await fetch(`${API_BASE_URL}/api/tts`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("TTS generation failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (error) {
      console.error("Local TTS error:", error);
      setIsSpeaking(false);
      alert("TTS API error — Urdu voice not generated.");
    }
  };


  // Call Backend API
  const callGroqAPI = async (userMessage) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ message: userMessage })
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      const data = await response.json();
      console.log('API Response:', data);

      return data.reply || data.response || 'معذرت! جواب موصول نہیں ہوا۔';
    } catch (error) {
      console.error('Chat API error:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowQuickQuestions(false);

    const response = await callGroqAPI(input);

    const assistantMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleQuickQuestion = (question) => {
    setInput(question.replace(/🌾|💧|🦟|🌡️|💰|🌱|🥔/g, '').trim());
    setShowQuickQuestions(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // --- Inline style helpers for repeated small things ---
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    direction: 'rtl',
    background: 'linear-gradient(to bottom, #ecfdf5, #f0fff4)'
  };

  const centerMaxWidth = {
    maxWidth: '1100px',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%'
  };

  const headerStyle = {
    position: 'fixed',  // add this
    top: 0,             // stick to top
    left: 0,
    right: 0,
    zIndex: 100,        // stay above messages
    background: 'linear-gradient(90deg, #16a34a, #166534)',
    color: 'white',
    padding: 20,
    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.15)'
  };

  const headerInnerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...centerMaxWidth
  };

  const headerLeftStyle = { display: 'flex', alignItems: 'center', gap: 16 };
  const avatarCircleStyle = {
    width: 56,
    height: 56,
    backgroundColor: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
  };
  const headerTitleStyle = { fontSize: 20, fontWeight: 700, margin: 0 };
  const headerSubtitleStyle = { fontSize: 13, margin: 0, color: '#bbf7d0' };

  const onlineBoxStyle = {
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center'
  };
  const onlineInnerStyle = {
    backgroundColor: '#065f46',
    padding: '8px 14px',
    borderRadius: 10,
    color: 'white'
  };

  const messagesWrapperStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
    paddingTop: '102px', 
    // paddingBottom: '120px',
    ...centerMaxWidth
  };

  const messageRowBase = {
    marginBottom: 20,
    display: 'flex'
  };

  const userBubbleStyle = {
    maxWidth: '90%',
    padding: 20,
    borderRadius: 28,
    boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
    backgroundColor: 'white',
    color: '#111827',
    border: '2px solid #bbf7d0'
  };

  const assistantBubbleStyle = {
    maxWidth: '90%',
    padding: 20,
    borderRadius: 28,
    boxShadow: '0 8px 28px rgba(16, 185, 129, 0.15)',
    background: 'linear-gradient(135deg,#16a34a,#165e3b)',
    color: 'white'
  };

  const bubbleTextStyle = {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: 18,
    lineHeight: 1.5,
    fontWeight: 500
  };

  const assistantBtnStyle = (disabled) => ({
    marginTop: 12,
    padding: '8px 14px',
    borderRadius: 12,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    transition: 'opacity 0.12s',
    backgroundColor: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.2)',
    cursor: disabled ? 'wait' : 'pointer',
    border: 'none',
    color: disabled ? 'rgba(255,255,255,0.7)' : 'white'
  });

  const timestampStyle = {
    fontSize: 12,
    marginTop: 10,
    opacity: 0.7
  };

  const loadingWrapperStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 20
  };

  const loadingBubbleStyle = {
    backgroundColor: '#16a34a',
    color: 'white',
    padding: 20,
    borderRadius: 28,
    boxShadow: '0 8px 28px rgba(16, 185, 129, 0.16)'
  };

  const quickTitleStyle = {
    textAlign: 'center',
    color: '#374151',
    fontWeight: 700,
    fontSize: 20,
    marginBottom: 12
  };

  const quickGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 12
  };

  // adapt for medium screens - not possible with inline styles, so keep single column; user wanted inline styles
  const quickButtonStyle = {
    backgroundColor: 'white',
    border: '3px solid #86efac',
    color: '#111827',
    padding: 16,
    borderRadius: 20,
    textAlign: 'right',
    boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
    fontSize: 18,
    fontWeight: 600,
    cursor: 'pointer'
  };

  const inputAreaStyle = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    borderTop: "1px solid #e5e7eb",
    boxShadow: "0 -2px 5px rgba(0,0,0,0.05)",
    zIndex: 50,
  };

  const inputInnerStyle = {
    ...centerMaxWidth,
    display: 'flex',
    flexDirection: 'column'
  };

  const recordingIndicatorStyle = {
    marginBottom: 12,
    backgroundColor: '#fff1f2',
    border: '2px solid #fecaca',
    padding: 12,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  };

  const bigControlsRowStyle = {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-end'
  };

  const textAreaStyle = {
    width: '100%',
    padding: 10,
    border: '3px solid #86efac',
    borderRadius: 20,
    outline: 'none',
    fontSize: 18,
    fontWeight: 500,
    resize: 'none',
    boxSizing: 'border-box'
  };

  const recordButtonStyle = (active) => ({
    padding: 10,
    borderRadius: 15,
    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: active ? '#ef4444' : '#3b82f6',
    color: 'white',
    transform: active ? 'scale(1.05)' : 'none'
  });

  const sendButtonStyle = {
    background: 'linear-gradient(90deg,#16a34a,#166534)',
    color: 'white',
    padding: 10,
    borderRadius: 15,
    border: 'none',
    boxShadow: '0 12px 30px rgba(16,185,129,0.15)',
    cursor: 'pointer'
  };

  const noteBoxStyle = {
    marginTop: 16,
    backgroundColor: '#ecfdf5',
    border: '2px solid #bbf7d0',
    padding: 4,
    borderRadius: 14,
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* Messages */}
      <div style={messagesWrapperStyle}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              style={{
                ...messageRowBase,
                justifyContent: isUser ? 'flex-start' : 'flex-end'
              }}
            >
              <div style={isUser ? userBubbleStyle : assistantBubbleStyle}>
                <div style={bubbleTextStyle}>{msg.content}</div>

                {msg.role === 'assistant' && (
                  <button
                    onClick={() => speakTextWithMMS(msg.content)}
                    disabled={isSpeaking}
                    style={assistantBtnStyle(isSpeaking)}
                  >
                    <Volume2 style={{ width: 18, height: 18, opacity: isSpeaking ? 0.9 : 1 }} />
                    <span style={{ fontWeight: 700 }}>
                      {isSpeaking ? 'بول رہا ہوں...' : 'اردو میں سنیں'}
                    </span>
                  </button>
                )}

                <p style={timestampStyle}>
                  {msg.timestamp.toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div style={loadingWrapperStyle}>
            <div style={loadingBubbleStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Loader2 style={{ width: 26, height: 26, animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 18, fontWeight: 700 }}>جواب تیار کیا جا رہا ہے...</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Questions */}
        {showQuickQuestions && messages.length <= 1 && (
          <div style={{ marginTop: 18 }}>
            <p style={quickTitleStyle}>🎯 عام سوالات - کسی پر بھی کلک کریں:</p>
            <div style={quickGridStyle}>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(q)}
                  style={quickButtonStyle}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={inputAreaStyle}>
        <div style={inputInnerStyle}>
          {/* Recording Indicator */}
          {isRecording && (
            <div style={recordingIndicatorStyle}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: '#dc2626',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px rgba(220,38,38,0.7)'
                }}
              />
              <Mic style={{ width: 24, height: 24, color: '#dc2626' }} />
              <span style={{ color: '#b91c1c', fontWeight: 700, fontSize: 16 }}>
                رکارڈنگ جاری ہے... بولیں
              </span>
            </div>
          )}

          <div style={bigControlsRowStyle}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اپنا سوال یہاں لکھیں یا مائیک دبا کر اردو میں بولیں..."
                style={{
                  ...textAreaStyle,
                  borderColor: isRecording ? '#fda4af' : '#86efac',
                  backgroundColor: isRecording ? '#fef2f2' : 'white'
                }}
                rows={1}
                disabled={isRecording}
              />
            </div>

            <button
              onClick={toggleRecording}
              disabled={isLoading}
              title={isRecording ? 'رکارڈنگ بند کریں' : 'اردو میں بولیں (Whisper)'}
              style={recordButtonStyle(isRecording)}
            >
              {isRecording ? (
                <MicOff style={{ width: 28, height: 28 }} />
              ) : (
                <Mic style={{ width: 28, height: 28 }} />
              )}
            </button>

            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isRecording}
              title="بھیجیں"
              style={{
                ...sendButtonStyle,
                opacity: !input.trim() || isLoading || isRecording ? 0.6 : 1,
                cursor: !input.trim() || isLoading || isRecording ? 'not-allowed' : 'pointer'
              }}
            >
              <Send style={{ width: 28, height: 28 }} />
            </button>
          </div>

          <div style={noteBoxStyle}>
            {/* <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#065f46' }}>
              🎤 <span style={{ color: '#2563eb' }}>Whisper STT</span> +{' '}
              <span style={{ color: '#7c3aed' }}>Llama 3.1 LLM</span> +{' '}
              <span style={{ color: '#15803d' }}>Facebook MMS TTS</span>
            </p> */}
            <p style={{ marginTop: 2, marginBottom: 0, fontSize: 13, color: '#4b5563' }}>
              💡 مکمل اردو آواز کا نظام - بولیں اور سنیں
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  );
};

export default FarmerChatbot;
