import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// Components
import { ChatInterface, PrivacyPanel } from './components';

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: '안녕하세요! ChatGPT 개인정보 보호 솔루션 데모페이지지 입니다. 무엇을 도와드릴까요?',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [detectedEntities, setDetectedEntities] = useState([]);
  const [privacyMode, setPrivacyMode] = useState(true);
  
  // 새로운 상태들
  const [currentText, setCurrentText] = useState(''); // 현재 검사 중인 텍스트
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 검사 중인지 여부
  const [canSendToChatGPT, setCanSendToChatGPT] = useState(false); // ChatGPT 전송 가능 여부
  const [showToast, setShowToast] = useState(false); // 토스트 표시 여부
  
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 모든 엔티티가 처리되었는지 확인
  useEffect(() => {
    const allProcessed = detectedEntities.length === 0 || 
                        detectedEntities.every(entity => entity.status === 'applied' || entity.status === 'ignored');
    const newCanSend = allProcessed && isAnalyzing;
    
    // 이전에 전송 불가능했다가 가능해진 경우에만 토스트 표시
    if (!canSendToChatGPT && newCanSend && detectedEntities.length > 0) {
      setShowToast(true);
      // 3초 후 토스트 자동 숨김
      setTimeout(() => setShowToast(false), 3000);
    }
    
    setCanSendToChatGPT(newCanSend);
  }, [detectedEntities, isAnalyzing, canSendToChatGPT]);

  // Mock NER detection function
  const detectPersonalInfo = (text) => {
    const patterns = [
      // 위험 (danger)
      { pattern: /홍길동/g, type: 'name', level: 'danger', label: '위험' },
      { pattern: /010-1234-5432/g, type: 'phone', level: 'danger', label: '위험' },
      { pattern: /12가\s*3456/g, type: 'car_number', level: 'danger', label: '위험' },
      
      // 유의 (warning)
      { pattern: /대구시 북구 산격동 123번지/g, type: 'address', level: 'warning', label: '유의' },
      
      // 식별 가능 (info)
      { pattern: /k5/ig, type: 'car_model', level: 'info', label: '식별 가능' },
    ];
    
    const entities = [];
    patterns.forEach(({ pattern, type, level, label }) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const value = match[0];
        const startIndex = match.index;
        const endIndex = startIndex + value.length;
        
        const contextStart = Math.max(0, startIndex - 15);
        const contextEnd = Math.min(text.length, endIndex + 15);
        const context = text.substring(contextStart, contextEnd);

        entities.push({
          id: Date.now() + Math.random(),
          value: value,
          context: context,
          type,
          level,
          label,
          masked: maskText(value, type),
          status: 'pending' // 새로운 상태: pending, applied, ignored
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
        return text[0] + '**';
      case 'car_number':
        return '**가 ****';
      case 'address':
        return text.replace(/[가-힣0-9]/g, '*');
      case 'car_model':
        return '***';
      default:
        return text.replace(/./g, '*');
    }
  };

  // 입력창에서 분석 시작
  const handleAnalyzeText = () => {
    if (!inputValue.trim()) return;

    setCurrentText(inputValue);
    const entities = detectPersonalInfo(inputValue);
    setDetectedEntities(entities);
    setIsAnalyzing(true);
    setInputValue(''); // 입력창 비우기
  };

  // 엔티티 처리 (적용/미적용)
  const handleEntityAction = (entityId, action) => {
    setDetectedEntities(prev => 
      prev.map(entity => 
        entity.id === entityId 
          ? { ...entity, status: action } 
          : entity
      )
    );
  };

  // ChatGPT로 최종 전송
  const handleSendToChatGPT = async () => {
    if (!canSendToChatGPT) return;

    // 토스트 숨김
    setShowToast(false);

    // 적용된 엔티티들로 텍스트 마스킹
    const appliedEntities = detectedEntities.filter(entity => entity.status === 'applied');
    const processedText = appliedEntities.reduce(
      (text, entity) => text.replace(entity.value, entity.masked), 
      currentText
    );

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: processedText,
      originalContent: currentText,
      entities: appliedEntities,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    
    // 상태 초기화
    setCurrentText('');
    setDetectedEntities([]);
    setIsAnalyzing(false);
    setCanSendToChatGPT(false);
    
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'assistant',
        content: '네, 말씀해주신 내용을 잘 이해했습니다. 개인정보가 포함된 부분은 자동으로 마스킹 처리되었습니다.\n\n민원 처리 결과를 안내드리겠습니다:\n\n- 현장 확인 및 지도 단속 실시\n- 해당 차량 소유주에게 협조 요청 문자 발송\n- 지속적인 순찰 및 계도 예정\n\n추가 문의사항이 있으시면 언제든 말씀해 주세요.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isAnalyzing && canSendToChatGPT) {
        handleSendToChatGPT();
      } else {
        handleAnalyzeText();
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Left Panel - ChatGPT Interface */}
      <div className="flex-1 flex flex-col">
        <ChatInterface 
          messages={messages}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSendMessage={isAnalyzing && canSendToChatGPT ? handleSendToChatGPT : handleAnalyzeText}
          handleKeyPress={handleKeyPress}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
          privacyMode={privacyMode}
          setPrivacyMode={setPrivacyMode}
          isAnalyzing={isAnalyzing}
          canSendToChatGPT={canSendToChatGPT}
          showToast={showToast}
          setShowToast={setShowToast}
        />
      </div>

      {/* Divider */}
      <div className="w-px bg-gray-300"></div>

      {/* Right Panel - Privacy Analysis */}
      <div className="w-1/3 bg-white">
        <PrivacyPanel 
          detectedEntities={detectedEntities}
          setDetectedEntities={setDetectedEntities}
          privacyMode={privacyMode}
          currentText={currentText}
          isAnalyzing={isAnalyzing}
          onEntityAction={handleEntityAction}
        />
      </div>
    </div>
  );
}

export default App;