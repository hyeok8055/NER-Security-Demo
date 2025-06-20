import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, User, Bot, Shield, AlertTriangle, Info, Eye, EyeOff } from 'lucide-react';
import './App.css';

// Components
import { ChatInterface, PrivacyPanel } from './components';

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: '안녕하세요! 저는 개인정보 보호 기능이 탑재된 ChatGPT입니다. 무엇을 도와드릴까요?',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [detectedEntities, setDetectedEntities] = useState([]);
  const [privacyMode, setPrivacyMode] = useState(true);
  
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock NER detection function
  const detectPersonalInfo = (text) => {
    const patterns = [
      { pattern: /\b010-\d{4}-\d{4}\b/g, type: 'phone', level: 'danger', label: '위험' },
      { pattern: /\b[가-힣]{2,4}\s*님?\b/g, type: 'name', level: 'warning', label: '유의' },
      { pattern: /\b\d{6}-\d{7}\b/g, type: 'id', level: 'danger', label: '위험' },
      { pattern: /\b[가-힣]+시\s+[가-힣]+구\s+[가-힣]+동\b/g, type: 'address', level: 'info', label: '식별 가능' },
      { pattern: /\b\d{1,3}번지\b/g, type: 'address_detail', level: 'warning', label: '유의' },
      { pattern: /\b1[2-9]\d{1}\s*-?\s*\d{4}\b/g, type: 'address_number', level: 'warning', label: '유의' }
    ];
    
    const entities = [];
    patterns.forEach(({ pattern, type, level, label }) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            id: Date.now() + Math.random(),
            text: match,
            type,
            level,
            label,
            original: match,
            masked: maskText(match, type)
          });
        });
      }
    });
    
    return entities;
  };

  const maskText = (text, type) => {
    switch (type) {
      case 'phone':
        return text.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');
      case 'name':
        return text.replace(/[가-힣]/g, '*');
      case 'id':
        return text.replace(/(\d{6})-(\d{7})/, '$1-*******');
      case 'address':
        return text.replace(/[가-힣]/g, '*');
      case 'address_detail':
        return '***번지';
      case 'address_number':
        return '***-****';
      default:
        return text.replace(/./g, '*');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const entities = detectPersonalInfo(inputValue);
    setDetectedEntities(prev => [...prev, ...entities]);

    const processedText = privacyMode 
      ? entities.reduce((text, entity) => text.replace(entity.original, entity.masked), inputValue)
      : inputValue;

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: processedText,
      originalContent: inputValue,
      entities: entities,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'assistant',
        content: '네, 말씀해주신 내용을 잘 이해했습니다. 개인정보가 포함된 부분은 자동으로 마스킹 처리되었습니다. 더 도움이 필요한 것이 있으시면 언제든 말씀해 주세요.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - ChatGPT Interface */}
      <div className="flex-1 flex flex-col">
        <ChatInterface 
          messages={messages}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSendMessage={handleSendMessage}
          handleKeyPress={handleKeyPress}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
          privacyMode={privacyMode}
          setPrivacyMode={setPrivacyMode}
        />
      </div>

      {/* Divider */}
      <div className="w-px bg-gray-300"></div>

      {/* Right Panel - Privacy Analysis */}
      <div className="w-80 bg-white">
        <PrivacyPanel 
          detectedEntities={detectedEntities}
          setDetectedEntities={setDetectedEntities}
          privacyMode={privacyMode}
        />
      </div>
    </div>
  );
}

export default App;