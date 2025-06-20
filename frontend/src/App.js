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
        content: '○○구 ○○동 ○○번지 인근 불법주차 관련 민원에 대한 회신\n\n홍** 민원인께.\n안녕하십니까? 귀하께서 제기하신 ‘○○○ ○○○ 베스킨라빈스 앞 모퉁이 차량 주차 관련’ 민원에 대하여 아래와 같이 답변드립니다.\n\n해당 장소는 차량 통행에 불편을 초래할 수 있는 구간으로 판단되어, 현장 확인 결과 민원에서 지적하신 차량(K5, 차량번호 **가 ****)이 반복적으로 해당 위치에 주차되어 있음을 확인하였습니다.\n\n이에 따라 본 구청에서는 관련 부서(교통지도과)와 협조하여\n\n현장 지도 단속을 즉시 실시하였으며,\n\n재발 방지를 위해 지속적인 순찰 및 계도를 병행할 예정입니다.\n\n또한 해당 차량 소유주에게는 불법주차 금지 안내 및 협조 요청 문자를 발송하였습니다.\n\n향후에도 유사한 사례 발생 시 신속히 대응하여 시민 통행 불편이 최소화되도록 노력하겠습니다.\n\n불편을 드려 죄송하다는 말씀을 드리며, 기타 궁금하신 사항은 ○○구청 교통지도과(☎ 02-XXX-XXXX)로 문의하여 주시면 성심껏 안내드리겠습니다.\n\n감사합니다.\n\n○○구청 교통지도과\n담당자: ○○○\n연락처: 02-XXX-XXXX',
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