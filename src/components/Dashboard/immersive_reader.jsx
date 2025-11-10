import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { Play, Pause, Volume2, Settings, X, BookOpen, Eye, Type, Palette, Globe, Mic, Zap, Turtle, Gauge, MessageCircle } from 'lucide-react';

const ImmersiveReader = ({ text, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [theme, setTheme] = useState('lightblue');
  const [showSettings, setShowSettings] = useState(false);
  const [highlightedWord, setHighlightedWord] = useState(-1);
  const [userText, setUserText] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [voice, setVoice] = useState('');
  const [voices, setVoices] = useState([]);
  const [audioVolume, setAudioVolume] = useState(1);
  const [showSlogans, setShowSlogans] = useState(true);
  
  const speechSynthesis = useRef(null);

  // Optimized memoized constants
  const displayText = text || '';
  const wordCount = userText ? userText.trim().split(/\s+/).filter(Boolean).length : 0;

  const languages = useMemo(() => [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Portuguese', flag: '🇧🇷' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' }
  ], []);

  const sloganCards = useMemo(() => [
    {
      title: "Learning Made Easy",
      content: "Transform any text into an engaging learning experience with our immersive reader. Perfect for students and lifelong learners.",
      icon: BookOpen,
      bgGradient: "radial-gradient(circle at 30% 20%, #3b82f6 0%, #6366f1 25%, #8b5cf6 50%, #a855f7 75%, #c084fc 100%)",
      overlayGradient: "conic-gradient(from 45deg at 50% 50%, rgba(59, 130, 246, 0.9) 0deg, rgba(99, 102, 241, 0.7) 90deg, rgba(139, 92, 246, 0.9) 180deg, rgba(168, 85, 247, 0.7) 270deg, rgba(59, 130, 246, 0.9) 360deg)",
      hoverGradient: "linear-gradient(135deg, #1d4ed8 0%, #3730a3 25%, #6b21a8 50%, #86198f 75%, #a21caf 100%)",
      meshGradient: "radial-gradient(ellipse at top left, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.3) 0%, transparent 50%)"
    },
    {
      title: "Focus & Comprehension",
      content: "Enhance your reading comprehension and maintain focus with customizable themes, speeds, and audio support.",
      icon: Eye,
      bgGradient: "radial-gradient(circle at 70% 30%, #9333ea 0%, #ec4899 25%, #f97316 50%, #ef4444 75%, #f59e0b 100%)",
      overlayGradient: "conic-gradient(from 135deg at 50% 50%, rgba(147, 51, 234, 0.9) 0deg, rgba(236, 72, 153, 0.7) 90deg, rgba(249, 115, 22, 0.9) 180deg, rgba(239, 68, 68, 0.7) 270deg, rgba(147, 51, 234, 0.9) 360deg)",
      hoverGradient: "linear-gradient(135deg, #6b21a8 0%, #be185d 25%, #c2410c 50%, #dc2626 75%, #d97706 100%)",
      meshGradient: "radial-gradient(ellipse at top right, rgba(147, 51, 234, 0.3) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(249, 115, 22, 0.3) 0%, transparent 50%)"
    },
    {
      title: "Multi-Language Master",
      content: "Learn and practice languages with native pronunciation support across multiple languages and accents.",
      icon: Globe,
      bgGradient: "radial-gradient(circle at 50% 80%, #059669 0%, #0d9488 25%, #0891b2 50%, #0284c7 75%, #2563eb 100%)",
      overlayGradient: "conic-gradient(from 225deg at 50% 50%, rgba(5, 150, 105, 0.9) 0deg, rgba(13, 148, 136, 0.7) 90deg, rgba(8, 145, 178, 0.9) 180deg, rgba(37, 99, 235, 0.7) 270deg, rgba(5, 150, 105, 0.9) 360deg)",
      hoverGradient: "linear-gradient(135deg, #047857 0%, #0f766e 25%, #0e7490 50%, #1d4ed8 75%, #1e40af 100%)",
      meshGradient: "radial-gradient(ellipse at bottom left, rgba(5, 150, 105, 0.3) 0%, transparent 50%), radial-gradient(ellipse at top right, rgba(37, 99, 235, 0.3) 0%, transparent 50%)"
    }
  ], []);

  const speedPresets = useMemo(() => [
    { value: 0.5, label: 'Slow', icon: Turtle },
    { value: 1, label: 'Normal', icon: Gauge },
    { value: 1.5, label: 'Fast', icon: Zap },
    { value: 2, label: 'Turbo', icon: Zap }
  ], []);

  useEffect(() => {
    speechSynthesis.current = window.speechSynthesis;
    
    const loadVoices = () => {
      const availableVoices = speechSynthesis.current.getVoices();
      if (availableVoices.length === 0) return;
      
      setVoices(availableVoices);
      if (!voice) {
        const defaultVoice = availableVoices.find(v => v.lang.startsWith(language)) || availableVoices[0];
        setVoice(defaultVoice.name);
      }
    };

    loadVoices();
    if (speechSynthesis.current.onvoiceschanged !== undefined) {
      speechSynthesis.current.onvoiceschanged = loadVoices;
    }
    
    const timeoutId = setTimeout(loadVoices, 100);
    return () => {
      clearTimeout(timeoutId);
      speechSynthesis.current?.cancel();
    };
  }, [language, voice]);

  const createUtterance = useCallback((text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    Object.assign(utterance, { rate: playbackSpeed, lang: language, volume: audioVolume });
    
    if (voice) {
      const selectedVoice = voices.find(v => v.name === voice);
      if (selectedVoice) utterance.voice = selectedVoice;
    }
    
    utterance.onend = () => (setIsPlaying(false), setHighlightedWord(-1));
    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        const words = text.split(/\s+/);
        let char = 0;
        for (let i = 0; i < words.length; i++) {
          if (e.charIndex <= char + words[i].length) return setHighlightedWord(i);
          char += words[i].length + 1;
        }
      }
    };
    
    return utterance;
  }, [playbackSpeed, language, audioVolume, voice, voices]);

  const handlePlay = () => {
    const text = userText || displayText;
    if (!isPlaying && text) {
      speechSynthesis.current.speak(createUtterance(text));
      setIsPlaying(true);
    } else {
      speechSynthesis.current.cancel();
      setIsPlaying(false);
      setHighlightedWord(-1);
    }
  };

  const stopSpeech = useCallback(() => isPlaying && (speechSynthesis.current.cancel(), setIsPlaying(false), setHighlightedWord(-1)), [isPlaying]);

  const handleChange = useCallback((setter) => (value) => (setter(value), stopSpeech()), [stopSpeech]);
  const [handleSpeedChange, handleLanguageChange, handleVoiceChange, handleVolumeChange] = [setPlaybackSpeed, setLanguage, setVoice, setAudioVolume].map(handleChange);

  const insertSlogan = useCallback((content) => (
    stopSpeech(), setUserText(content), setShowSlogans(false),
    setTimeout(() => {
      const u = createUtterance(content);
      u.onstart = () => setIsPlaying(true);
      speechSynthesis.current.speak(u);
    }, 300)
  ), [stopSpeech, createUtterance]);

  const handleCardHover = useCallback((content) => {
    speechSynthesis.current?.cancel();
    const u = createUtterance(content);
    Object.assign(u, { rate: playbackSpeed * 1.1, volume: audioVolume * 0.8 });
    speechSynthesis.current.speak(u);
  }, [createUtterance, playbackSpeed, audioVolume]);

  const handleCardLeave = useCallback(() => speechSynthesis.current?.cancel(), []);


  const themeClasses = useMemo(() => ({
    white: {
      container: 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900',
      header: 'bg-gradient-to-r from-gray-50/90 to-gray-100/90 border-gray-200 backdrop-blur-sm',
      controls: 'bg-gradient-to-r from-white/90 to-gray-50/90 border-gray-200 backdrop-blur-sm',
      button: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all',
      secondaryButton: 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 backdrop-blur-sm',
      text: 'text-gray-900',
      settings: 'bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-200 shadow-xl backdrop-blur-sm',
      input: 'bg-gradient-to-r from-white to-gray-50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 backdrop-blur-sm',
      highlight: 'bg-gradient-to-r from-yellow-200 to-yellow-300 text-gray-900',
      card: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
    },
    lightblue: {
      container: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 text-blue-900',
      header: 'bg-gradient-to-r from-blue-100/80 to-cyan-100/80 border-blue-200 backdrop-blur-sm',
      controls: 'bg-gradient-to-r from-blue-50/80 to-cyan-50/80 border-blue-200 backdrop-blur-sm',
      button: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all',
      secondaryButton: 'bg-gradient-to-r from-blue-200/80 to-cyan-200/80 hover:from-blue-300/80 hover:to-cyan-300/80 text-blue-800 backdrop-blur-sm',
      text: 'text-blue-900',
      settings: 'bg-gradient-to-br from-blue-100/90 to-cyan-100/90 border-blue-200 shadow-2xl backdrop-blur-sm',
      input: 'bg-gradient-to-r from-white/90 to-blue-50/90 text-blue-900 placeholder-blue-600 focus:ring-2 focus:ring-blue-400 backdrop-blur-sm',
      highlight: 'bg-gradient-to-r from-blue-300 to-cyan-300 text-blue-900',
      card: 'bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm border border-blue-200/50'
    },
    blue: {
      container: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white',
      header: 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90 border-blue-500 backdrop-blur-sm',
      controls: 'bg-gradient-to-r from-blue-600/80 to-indigo-600/80 border-blue-500 backdrop-blur-sm',
      button: 'bg-gradient-to-r from-white to-blue-50 hover:from-blue-50 hover:to-blue-100 text-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all',
      secondaryButton: 'bg-gradient-to-r from-blue-500/80 to-indigo-500/80 hover:from-blue-400/80 hover:to-indigo-400/80 text-white backdrop-blur-sm',
      text: 'text-white',
      settings: 'bg-gradient-to-br from-blue-600/90 to-indigo-600/90 border-blue-500 shadow-2xl backdrop-blur-sm',
      input: 'bg-gradient-to-r from-white/10 to-blue-100/10 text-white placeholder-blue-200 focus:ring-2 focus:ring-white border border-blue-400/50 backdrop-blur-sm',
      highlight: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-blue-900',
      card: 'bg-gradient-to-br from-white/10 to-blue-100/10 backdrop-blur-sm border border-blue-400/30'
    },
    darkblue: {
      container: 'bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-blue-100',
      header: 'bg-gradient-to-r from-blue-800/90 to-indigo-800/90 border-blue-700 backdrop-blur-sm',
      controls: 'bg-gradient-to-r from-blue-800/80 to-indigo-800/80 border-blue-700 backdrop-blur-sm',
      button: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all',
      secondaryButton: 'bg-gradient-to-r from-blue-700/80 to-indigo-700/80 hover:from-blue-600/80 hover:to-indigo-600/80 text-blue-100 backdrop-blur-sm',
      text: 'text-blue-100',
      settings: 'bg-gradient-to-br from-blue-800/90 to-indigo-800/90 border-blue-700 shadow-2xl backdrop-blur-sm',
      input: 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 text-blue-100 placeholder-blue-300 focus:ring-2 focus:ring-blue-400 border border-blue-600/50 backdrop-blur-sm',
      highlight: 'bg-gradient-to-r from-blue-400 to-cyan-400 text-blue-900',
      card: 'bg-gradient-to-br from-blue-800/50 to-indigo-800/50 backdrop-blur-sm border border-blue-600/30'
    }
  }), []);

  const currentTheme = themeClasses[theme];

  const availableVoices = voices.filter(v => v.lang.startsWith(language));
  const currentLanguageName = languages.find(l => l.code === language)?.name || 'Unknown';
  const currentVoiceName = voice ? voice.split(' ')[0] : '';

  const renderedWords = useMemo(() => {
    const text = userText || displayText;
    if (!text) return null;
    
    return text.split(/\s+/).filter(Boolean).map((word, i) => (
      <span
        key={`${word}-${i}`}
        className={`transition-all duration-300 px-1 py-0.5 rounded ${
          highlightedWord === i ? currentTheme.highlight + ' font-bold scale-110' : ''
        }`}
      >
        {word}{' '}
      </span>
    ));
  }, [userText, displayText, highlightedWord, currentTheme.highlight]);

  return (
    <>
      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 0%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 0%; }
        }
        
        @keyframes gradient-pulse {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.02);
          }
        }
        
        @keyframes mesh-flow {
          0%, 100% { 
            background-position: 0% 0%, 100% 100%; 
            opacity: 0.3;
          }
          33% { 
            background-position: 50% 0%, 50% 100%; 
            opacity: 0.5;
          }
          66% { 
            background-position: 100% 0%, 0% 100%; 
            opacity: 0.4;
          }
        }
        
        @keyframes conic-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes color-wave {
          0%, 100% { filter: hue-rotate(0deg) saturate(1); }
          25% { filter: hue-rotate(15deg) saturate(1.2); }
          50% { filter: hue-rotate(0deg) saturate(1.4); }
          75% { filter: hue-rotate(-15deg) saturate(1.2); }
        }
      `}</style>
      <section className={`w-full min-h-screen ${currentTheme.container} transition-all duration-500`}>
      {/* Header */}
      <div className={`p-6 border-b ${currentTheme.header} transition-all duration-300`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white/80 rounded-xl shadow-lg">
              <BookOpen className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Immersive Reader
              </h1>
              <p className="text-sm opacity-75">Read, Listen, Learn - Your Way</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${currentTheme.secondaryButton} shadow-lg`}
            >
              <Settings className="w-5 h-5" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${currentTheme.secondaryButton} shadow-lg`}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Text Input Field */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold">Enter your text to read:</label>
            <div className="flex space-x-2">
              {userText && <button onClick={() => setUserText('')} className={`px-3 py-1 rounded-lg transition-all duration-300 ${currentTheme.secondaryButton} text-sm shadow-lg hover:scale-105`}>Clear Text</button>}
              <button onClick={() => setShowSlogans(!showSlogans)} className={`px-3 py-1 rounded-lg transition-all duration-300 ${currentTheme.secondaryButton} text-sm shadow-lg hover:scale-105`}>
                {showSlogans ? 'Hide Examples' : 'Show Examples'}
              </button>
            </div>
          </div>
          <textarea
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            placeholder="Type or paste your content here..."
            className={`w-full h-32 p-4 rounded-2xl border-none resize-none transition-all duration-300 focus:scale-[1.02] ${currentTheme.input} shadow-lg backdrop-blur-sm`}
            rows={4}
            spellCheck={true}
            autoComplete="off"
            style={{ pointerEvents: 'auto', userSelect: 'text' }}
          />
        </div>
      </div>

      {/* Slogan Cards */}
      {showSlogans && !userText && (
        <div className="w-full max-w-6xl mx-auto p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Try These Examples:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sloganCards.map((s, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-2xl transition-all duration-700 hover:scale-105 hover:shadow-2xl shadow-xl backdrop-blur-sm group border-2 border-transparent hover:border-white/30 cursor-pointer`}
                  style={{
                    background: s.bgGradient,
                    backgroundSize: '600% 600%',
                    animation: 'gradient-shift 12s ease infinite'
                  }}
                  onMouseEnter={() => handleCardHover(s.content)}
                  onMouseLeave={handleCardLeave}
                >
                  {/* Mesh Gradient Base Layer */}
                  <div 
                    className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700"
                    style={{
                      background: s.meshGradient,
                      backgroundSize: '300% 300%',
                      animation: 'mesh-flow 20s ease infinite'
                    }}
                  ></div>
                  
                  {/* Conic Gradient Overlay with Rotation */}
                  <div 
                    className="absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity duration-500"
                    style={{
                      background: s.overlayGradient,
                      backgroundSize: '400% 400%',
                      animation: 'conic-spin 25s linear infinite'
                    }}
                  ></div>
                  
                  {/* Color Wave Effect Layer */}
                  <div 
                    className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                    style={{
                      background: s.bgGradient,
                      backgroundSize: '500% 500%',
                      animation: 'color-wave 8s ease infinite, gradient-shift 12s ease infinite reverse'
                    }}
                  ></div>
                  
                  {/* Hover Gradient Effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-80 transition-all duration-700"
                    style={{
                      background: s.hoverGradient,
                      backgroundSize: '300% 300%',
                      animation: 'gradient-shift 6s ease infinite'
                    }}
                  ></div>
                  
                  {/* Additional Radial Gradient Layer */}
                  <div 
                    className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at ${i * 30 + 20}% ${i * 25 + 30}%, rgba(255,255,255,0.2) 0%, transparent 70%)`,
                      animation: 'gradient-pulse 4s ease infinite'
                    }}
                  ></div>
                  
                  {/* Animated Gradient Border */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out"></div>
                  
                  {/* Content */}
                  <div className="relative p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/40 group-hover:from-white/40 group-hover:to-white/20 transition-all duration-500 group-hover:shadow-2xl group-hover:scale-110">
                        <s.icon className="w-8 h-8 text-white drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300" />
                      </div>
                    </div>
                    
                    <button
                      onClick={() => insertSlogan(s.content)}
                      className="w-full text-left group-hover:transform group-hover:translate-y-1 transition-all duration-300"
                    >
                      <h4 className="text-xl font-bold mb-3 text-white drop-shadow-lg leading-tight">
                        {s.title}
                      </h4>
                      <p className="text-sm text-white/90 leading-relaxed line-clamp-3 drop-shadow-sm">
                        {s.content}
                      </p>
                    </button>
                    
                    {/* Enhanced Decorative Elements */}
                    <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-white/15 to-white/5 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-white/10 to-white/2 rounded-full blur-lg group-hover:blur-xl transition-all duration-500"></div>
                    
                    {/* Floating Gradient Orbs */}
                    <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-white/40 to-white/20 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-6 left-6 w-2 h-2 bg-gradient-to-r from-white/30 to-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                  
                  {/* Enhanced Hover Effect Border with Gradient */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ 
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.3) 100%)',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'xor'
                  }}></div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="w-full max-w-6xl mx-auto p-6">
          <div className={`p-6 rounded-2xl border-2 ${currentTheme.settings} transition-all duration-500 transform scale-100`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center">
                <Settings className="w-6 h-6 mr-3" />
                Reading Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${currentTheme.secondaryButton}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-3 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />Language & Voice
                </label>
                <select value={language} onChange={(e) => handleLanguageChange(e.target.value)} className={`w-full p-3 rounded-xl mb-3 ${currentTheme.input} shadow-lg transition-all duration-300`}>
                  {languages.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                </select>
                {availableVoices.length > 0 && (
                  <select value={voice} onChange={(e) => handleVoiceChange(e.target.value)} className={`w-full p-3 rounded-xl ${currentTheme.input} shadow-lg transition-all duration-300`}>
                    {availableVoices.map((v, i) => <option key={i} value={v.name}>{v.name} ({v.lang})</option>)}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 flex items-center">
                  <Gauge className="w-5 h-5 mr-2" />Voice Speed
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {speedPresets.map(p => (
                    <button key={p.value} onClick={() => handleSpeedChange(p.value)} className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 ${playbackSpeed === p.value ? currentTheme.button + ' scale-105 shadow-xl' : currentTheme.secondaryButton + ' shadow-lg'}`}>
                      <p.icon className="w-4 h-4" />
                      <span className="text-sm">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 flex items-center">
                  <Volume2 className="w-5 h-5 mr-2" />Volume: {Math.round(audioVolume * 100)}%
                </label>
                <input type="range" min="0" max="1" step="0.1" value={audioVolume} onChange={(e) => handleVolumeChange(+e.target.value)} className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer mb-2" />
                <div className="flex justify-between text-xs"><span>Mute</span><span>Medium</span><span>Loud</span></div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 flex items-center">
                  <Palette className="w-5 h-5 mr-2" />Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'white', label: 'White', color: 'bg-white border-2 border-gray-300' },
                    { key: 'lightblue', label: 'Light Blue', color: 'bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-300' },
                    { key: 'blue', label: 'Blue', color: 'bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-400' },
                    { key: 'darkblue', label: 'Dark Blue', color: 'bg-gradient-to-br from-blue-800 to-indigo-800 border-2 border-blue-600' }
                  ].map(t => (
                    <button key={t.key} onClick={() => setTheme(t.key)} className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${theme === t.key ? 'ring-2 ring-offset-2 ring-blue-500 scale-105' : 'opacity-90 hover:opacity-100'} ${t.color} shadow-lg`}>
                      <span className={`text-sm font-medium ${['blue', 'darkblue'].includes(t.key) ? 'text-white' : 'text-gray-800'}`}>
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 flex items-center">
                  <Type className="w-5 h-5 mr-2" />Font Size: {fontSize}px
                </label>
                <input type="range" min="14" max="28" value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between text-xs mt-1"><span>Small</span><span>Medium</span><span>Large</span></div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />Line Height: {lineHeight}
                </label>
                <input type="range" min="1.2" max="2.5" step="0.1" value={lineHeight} onChange={(e) => setLineHeight(+e.target.value)} className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between text-xs mt-1"><span>Compact</span><span>Comfortable</span><span>Spacious</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Text Display Area */}
      {userText && (
        <div className="w-full max-w-4xl mx-auto p-6">
          <div 
            className={`p-8 rounded-2xl shadow-2xl backdrop-blur-sm transition-all duration-500 ${currentTheme.card}`}
            style={{ 
              fontSize: `${fontSize}px`, 
              lineHeight: lineHeight,
              minHeight: '200px'
            }}
          >
            {renderedWords}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={`p-6 border-t ${currentTheme.controls} transition-all duration-300`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-6 mb-4">
            <button
              onClick={handlePlay}
              className={`p-5 rounded-full transition-all duration-500 transform hover:scale-110 shadow-2xl ${
                isPlaying ? 'animate-pulse' : ''
              } ${currentTheme.button}`}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </button>
          </div>
          

          {/* Status Info */}
          <div className="text-center">
            <div className="text-sm opacity-75 flex items-center justify-center">
              {isPlaying ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  Reading in {currentLanguageName}{currentVoiceName && ` with ${currentVoiceName}`}
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Ready to read - {wordCount} words
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default memo(ImmersiveReader);