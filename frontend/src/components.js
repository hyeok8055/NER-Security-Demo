import React from 'react';
import { Send, Settings, User, Bot, Shield, Eye, CheckCircle, XCircle } from 'lucide-react';

// ChatGPT Interface Component
export const ChatInterface = ({ 
  messages, 
  inputValue, 
  setInputValue, 
  handleSendMessage, 
  handleKeyPress, 
  isTyping, 
  messagesEndRef,
  privacyMode,
  setPrivacyMode,
  isAnalyzing,
  canSendToChatGPT,
  showToast,
  setShowToast
}) => {
  // 버튼 텍스트와 상태 결정
  const getButtonState = () => {
    if (isAnalyzing) {
      if (canSendToChatGPT) {
        return { text: 'ChatGPT로 전송', disabled: false, color: 'bg-green-600 hover:bg-green-700' };
      } else {
        return { text: '처리 중...', disabled: true, color: 'bg-gray-300' };
      }
    } else {
      return { text: '분석 시작', disabled: !inputValue.trim(), color: 'bg-blue-600 hover:bg-blue-700' };
    }
  };

  const buttonState = getButtonState();

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">ChatGPT 4</h1>
            <p className="text-sm text-gray-500">개인정보 보호 모드</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              privacyMode 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {privacyMode ? <Shield className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{privacyMode ? '보호됨' : '일반'}</span>
          </button>
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="flex items-start space-x-3 fade-in">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 relative">
        {/* Toast Notification */}
        {showToast && (
          <Toast 
            message="처리가 완료되었습니다! ChatGPT에 전송해보세요!" 
            onClose={() => setShowToast(false)}
          />
        )}
        
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isAnalyzing ? "처리 완료 후 전송됩니다..." : "메시지를 입력하세요..."}
              disabled={isAnalyzing}
              className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[68px] max-h-32 disabled:bg-gray-50 disabled:text-gray-500"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={buttonState.disabled}
              className={`absolute right-3 bottom-5 w-9 h-9 ${buttonState.color} disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors`}
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          {isAnalyzing 
            ? `${buttonState.text} - 우측 패널에서 개인정보 처리를 완료해주세요.`
            : "개인정보가 포함된 메시지는 자동으로 검출되어 마스킹 처리됩니다."
          }
        </div>
      </div>
    </>
  );
};

// Message Bubble Component
const MessageBubble = ({ message }) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex items-start space-x-3 fade-in ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-blue-600' : 'bg-green-600'
      }`}>
        {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
      </div>
      
      <div className={`max-w-3xl rounded-2xl px-4 py-3 shadow-sm ${
        isUser 
          ? 'bg-blue-600 text-white ml-auto' 
          : 'bg-white text-gray-900'
      }`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.entities && message.entities.length > 0 && (
          <div className="mt-2 text-xs opacity-75">
            🛡️ {message.entities.length}개의 개인정보 항목이 보호되었습니다
          </div>
        )}
        <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {message.timestamp.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

// Privacy Panel Component
export const PrivacyPanel = ({ 
  detectedEntities, 
  setDetectedEntities, 
  privacyMode, 
  currentText, 
  isAnalyzing, 
  onEntityAction 
}) => {
  const entityCounts = {
    danger: detectedEntities.filter(e => e.level === 'danger').length,
    warning: detectedEntities.filter(e => e.level === 'warning').length,
    info: detectedEntities.filter(e => e.level === 'info').length
  };

  // 처리된 엔티티 수 계산
  const processedCounts = {
    danger: detectedEntities.filter(e => e.level === 'danger' && (e.status === 'applied' || e.status === 'ignored')).length,
    warning: detectedEntities.filter(e => e.level === 'warning' && (e.status === 'applied' || e.status === 'ignored')).length,
    info: detectedEntities.filter(e => e.level === 'info' && (e.status === 'applied' || e.status === 'ignored')).length
  };
  
  // 기본 텍스트 (분석 중이 아닐 때 보여줄 예시)
  const defaultText = "현재 민원인이 주차문제로 민원을 제기했는데, 해당 내용을 보고 답변을 작성해줘.\n이름: 홍길동, 연락처: 010-1234-5432.\n민원 내용: '대구시 북구 산격동 123번지 앞 베스킨라빈스 앞 모퉁이에 항상 주차 된 차량 k5, 차량번호 12가 3456 때문에 너무 통행이 불편합니다. 조치를 취해 주세요.";

  const displayText = isAnalyzing ? currentText : defaultText;
  const displayEntities = isAnalyzing ? detectedEntities : [];

  const handleEntityAction = (entityId, action) => {
    onEntityAction(entityId, action);
  };
  
  const renderHighlightedText = (text, entities) => {
    if (!entities || entities.length === 0) {
      return text;
    }

    let lastIndex = 0;
    const parts = [];
    
    // Sort entities by their position in the text
    const sortedEntities = [...entities].sort((a, b) => text.indexOf(a.value) - text.indexOf(b.value));

    sortedEntities.forEach((entity, i) => {
      const startIndex = text.indexOf(entity.value, lastIndex);
      if (startIndex === -1) return;

      const colorMap = {
        danger: 'bg-red-100',
        warning: 'bg-yellow-100',
        info: 'bg-blue-100',
      };
      
      // 처리된 엔티티는 더 연한 색상으로 표시
      const isProcessed = entity.status === 'applied' || entity.status === 'ignored';
      const className = isProcessed 
        ? `${colorMap[entity.level]} opacity-50 font-semibold line-through`
        : `${colorMap[entity.level]} font-semibold`;

      // Add the text before the entity
      if (startIndex > lastIndex) {
        parts.push(text.substring(lastIndex, startIndex));
      }
      
      // Add the highlighted entity
      parts.push(<span key={i} className={className}>{entity.value}</span>);
      
      lastIndex = startIndex + entity.value.length;
    });

    // Add the remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 bg-white grid grid-cols-3 gap-x-3">
        <PrivacyStatusCard
          level="danger"
          label="위험"
          count={entityCounts.danger}
          processed={processedCounts.danger}
          color="red"
        />
        <PrivacyStatusCard
          level="warning"
          label="유의"
          count={entityCounts.warning}
          processed={processedCounts.warning}
          color="yellow"
        />
        <PrivacyStatusCard
          level="info"
          label="식별 가능"
          count={entityCounts.info}
          processed={processedCounts.info}
          color="blue"
        />
      </div>

      {/* Full Sentence Section */}
      <div className="p-4 border-b border-gray-200 bg-white mt-2">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          테스트용 전체 문장(복사해서 입력창에 적용) {isAnalyzing && <span className="text-sm font-normal text-blue-600">(분석 중)</span>}
        </h3>
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {renderHighlightedText(displayText, displayEntities)}
          </p>
        </div>
      </div>

      {/* Entity List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {displayEntities.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                {isAnalyzing 
                  ? "개인정보가 검출되지 않았습니다"
                  : "개인정보가 검출되면\n여기에 표시됩니다"
                }
              </p>
            </div>
          ) : (
            displayEntities.map((entity) => (
              <EntityCard
                key={entity.id}
                entity={entity}
                onAction={handleEntityAction}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Privacy Status Card Component
const PrivacyStatusCard = ({ level, label, count, processed = 0, color }) => {
  const colorClasses = {
    red: { text: 'text-red-600', bg: 'bg-red-500', lightBg: 'bg-red-100' },
    yellow: { text: 'text-yellow-600', bg: 'bg-yellow-500', lightBg: 'bg-yellow-100' },
    blue: { text: 'text-blue-600', bg: 'bg-blue-500', lightBg: 'bg-blue-100' },
  };
  const selectedColor = colorClasses[color];
  
  // 처리된 비율과 전체 비율 계산
  const totalPercentage = 100; // 전체 길이는 고정
  const processedPercentage = count > 0 ? (processed / count) * 100 : 0;
  const remainingPercentage = totalPercentage - processedPercentage;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className={`font-bold ${selectedColor.text}`}>{label}</span>
        <span className="text-sm text-gray-500">{processed}/{count}</span>
      </div>
      <div className={`w-full h-2 rounded-full ${selectedColor.lightBg} relative overflow-hidden`}>
        {/* 처리된 부분 (흐릿하게) */}
        <div 
          className={`h-2 rounded-full ${selectedColor.bg} opacity-30 absolute left-0 top-0`} 
          style={{ width: `${processedPercentage}%` }}
        ></div>
        {/* 처리되지 않은 부분 (진한 색상) */}
        <div 
          className={`h-2 rounded-full ${selectedColor.bg} absolute top-0`} 
          style={{ 
            left: `${processedPercentage}%`, 
            width: `${remainingPercentage}%` 
          }}
        ></div>
      </div>
    </div>
  );
};

// Entity Card Component
const EntityCard = ({ entity, onAction }) => {
  const levelInfo = {
    danger: { label: '위험', color: 'red', recommendation: '삭제 필요' },
    warning: { label: '유의', color: 'yellow', recommendation: '일부 삭제 권장' },
    info: { label: '식별 가능', color: 'blue', recommendation: '대체 권고' },
  };

  const selectedLevel = levelInfo[entity.level];

  const colorClasses = {
    red: { text: 'text-red-500', ring: 'ring-red-200' },
    yellow: { text: 'text-yellow-500', ring: 'ring-yellow-200' },
    blue: { text: 'text-blue-500', ring: 'ring-blue-200' },
  };
  const selectedColor = colorClasses[selectedLevel.color];

  const getHighlightedText = (text, value) => {
    const parts = text.split(value);
    return (
      <span>
        {parts[0]}
        <span className={`font-bold ${selectedColor.text}`}>{value}</span>
        {parts[1]}
      </span>
    );
  };

  const isProcessed = entity.status === 'applied' || entity.status === 'ignored';
  
  return (
    <div className={`bg-white p-4 rounded-lg border border-gray-200 ${isProcessed ? 'opacity-60' : ''}`}>
      <div className="flex items-center mb-3">
        <span className={`w-2 h-2 rounded-full mr-2 bg-${selectedLevel.color}-500`}></span>
        <span className={`font-bold mr-2 ${selectedColor.text}`}>{selectedLevel.label}</span>
        <span className="text-xs text-gray-500">{entity.count || 1}개 식별됨</span>
        <span className="text-xs text-gray-400 mx-1">·</span>
        <span className="text-xs text-gray-500">{selectedLevel.recommendation}</span>
        
        {/* 처리 상태 표시 */}
        {entity.status === 'applied' && (
          <span className="ml-auto flex items-center text-xs text-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            적용됨
          </span>
        )}
        {entity.status === 'ignored' && (
          <span className="ml-auto flex items-center text-xs text-gray-500">
            <XCircle className="w-3 h-3 mr-1" />
            미적용
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        ... {getHighlightedText(entity.context, entity.value)} ...
      </p>

      {!isProcessed && (
        <div className="flex justify-end space-x-2">
          <button 
            onClick={() => onAction(entity.id, 'applied')}
            className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            적용
          </button>
          <button 
            onClick={() => onAction(entity.id, 'ignored')}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            미적용
          </button>
        </div>
      )}
    </div>
  );
};

// Toast Component
const Toast = ({ message, onClose }) => {
  return (
    <div className="absolute bottom-20 right-4 z-50 animate-slide-up">
      <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm">
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">{message}</span>
        <button 
          onClick={onClose}
          className="ml-2 text-green-200 hover:text-white transition-colors"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};