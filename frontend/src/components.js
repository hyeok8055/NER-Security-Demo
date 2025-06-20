import React from 'react';
import { Send, Settings, User, Bot, Shield, AlertTriangle, Info, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

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
  setPrivacyMode 
}) => {
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
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[48px] max-h-32"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="absolute right-2 bottom-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          개인정보가 포함된 메시지는 자동으로 검출되어 마스킹 처리됩니다.
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
export const PrivacyPanel = ({ detectedEntities, setDetectedEntities, privacyMode }) => {
  const entityCounts = {
    danger: detectedEntities.filter(e => e.level === 'danger').length,
    warning: detectedEntities.filter(e => e.level === 'warning').length,
    info: detectedEntities.filter(e => e.level === 'info').length
  };

  const handleEntityToggle = (entityId) => {
    setDetectedEntities(prev => 
      prev.map(entity => 
        entity.id === entityId 
          ? { ...entity, masked: !entity.masked }
          : entity
      )
    );
  };

  const clearAllEntities = () => {
    setDetectedEntities([]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">개인정보 분석</h2>
        </div>
        
        {/* Privacy Status Cards */}
        <div className="space-y-2">
          <PrivacyStatusCard
            level="danger"
            label="위험"
            count={entityCounts.danger}
            description="즉시 보호 필요"
            color="red"
          />
          <PrivacyStatusCard
            level="warning"
            label="유의"
            count={entityCounts.warning}
            description="주의 필요 정보"
            color="yellow"
          />
          <PrivacyStatusCard
            level="info"
            label="식별 가능"
            count={entityCounts.info}
            description="식별 가능 정보"
            color="blue"
          />
        </div>
      </div>

      {/* Entity List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {detectedEntities.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                개인정보가 검출되면<br />여기에 표시됩니다
              </p>
            </div>
          ) : (
            detectedEntities.map((entity) => (
              <EntityCard
                key={entity.id}
                entity={entity}
                onToggle={() => handleEntityToggle(entity.id)}
                privacyMode={privacyMode}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      {detectedEntities.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={clearAllEntities}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            모든 항목 지우기
          </button>
        </div>
      )}

      {/* Settings */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Settings</span>
          <Settings className="w-4 h-4 text-gray-500" />
        </div>
        
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Light</span>
            <span className="text-sm text-gray-600">Dark</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Privacy Status Card Component
const PrivacyStatusCard = ({ level, label, count, description, color }) => {
  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-500',
      indicator: 'bg-red-500'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200', 
      text: 'text-yellow-700',
      icon: 'text-yellow-500',
      indicator: 'bg-yellow-500'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700', 
      icon: 'text-blue-500',
      indicator: 'bg-blue-500'
    }
  };

  const styles = colorClasses[color];

  return (
    <div className={`p-3 rounded-lg border ${styles.bg} ${styles.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${styles.indicator}`}></div>
          <span className={`font-medium text-sm ${styles.text}`}>{label}</span>
        </div>
        <span className={`text-lg font-bold ${styles.text}`}>{count}</span>
      </div>
      <p className={`text-xs mt-1 ${styles.text} opacity-75`}>{description}</p>
    </div>
  );
};

// Entity Card Component
const EntityCard = ({ entity, onToggle, privacyMode }) => {
  const levelColors = {
    danger: { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' }
  };

  const colors = levelColors[entity.level];

  return (
    <div className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className={`w-2 h-2 rounded-full ${colors.dot} flex-shrink-0 mt-1`}></div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">{entity.label}</span>
              <span className="text-xs text-gray-500">{entity.type}</span>
            </div>
            <div className="mt-1">
              <p className="text-sm text-gray-700 truncate">
                원본: <span className="font-mono">{entity.original}</span>
              </p>
              {privacyMode && (
                <p className="text-sm text-gray-600 truncate mt-0.5">
                  마스킹: <span className="font-mono">{entity.masked}</span>
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1 ml-2">
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
            title={privacyMode ? "마스킹 해제" : "마스킹 적용"}
          >
            {privacyMode ? 
              <CheckCircle className="w-4 h-4 text-green-600" /> : 
              <XCircle className="w-4 h-4 text-gray-400" />
            }
          </button>
        </div>
      </div>
    </div>
  );
};