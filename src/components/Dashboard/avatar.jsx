import { useState, useRef, useEffect } from "react";
import { Volume2, Mic, Play, Square, Copy, Download, MessageCircle, Zap, Cloud, Cpu } from "lucide-react";

export default function SpeechToText() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCard, setActiveCard] = useState(1);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + event.results[i][0].transcript + " ");
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      document.getElementById("liveText").innerText = interim;
    };

    recognitionRef.current = recognition;
  }, []);

  const startRecording = () => {
    setTranscript("");
    document.getElementById("liveText").innerText = "";
    setIsRecording(true);
    recognitionRef.current?.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 1200);
  };

  const speakText = (text) => {
    if (!text.trim()) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const speechToSpeech = () => {
    if (transcript.trim()) {
      speakText(transcript);
    }
  };

  return (
    <section className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 via-white to-cyan-50 text-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating Geometric Shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 opacity-20 rounded-full animate-float-slow"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-cyan-200 opacity-25 rounded-lg animate-float-medium"></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-blue-300 opacity-20 rounded-full animate-float-fast"></div>
        <div className="absolute bottom-20 right-32 w-12 h-12 bg-cyan-300 opacity-30 rounded-lg animate-float-slow"></div>
        
        {/* Animated Waves */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-100 to-transparent opacity-50"></div>
        
        {/* Pulse Circles */}
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-blue-400 rounded-full opacity-30 animate-pulse-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-cyan-400 rounded-full opacity-40 animate-pulse-medium"></div>
        
        {/* Grid Dots */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-300 to-transparent"></div>
        </div>
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          33% { transform: translateY(-20px) translateX(10px) scale(1.1); }
          66% { transform: translateY(10px) translateX(-15px) scale(0.9); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          25% { transform: translateY(-15px) translateX(-12px) scale(1.15); }
          50% { transform: translateY(8px) translateX(18px) scale(0.85); }
          75% { transform: translateY(-10px) translateX(8px) scale(1.05); }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          20% { transform: translateY(-12px) translateX(8px) scale(1.2); }
          40% { transform: translateY(6px) translateX(-12px) scale(0.8); }
          60% { transform: translateY(-8px) translateX(15px) scale(1.1); }
          80% { transform: translateY(10px) translateX(-8px) scale(0.9); }
        }

        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0.6; }
        }

        @keyframes pulse-medium {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.8); opacity: 0.7; }
        }

        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-pulse-medium { animation: pulse-medium 2.5s ease-in-out infinite; }
      `}</style>

      {/* Left Side - Header and Navigation */}
      <div className="relative z-10 w-full lg:w-2/5 min-h-screen flex flex-col justify-center items-center px-6 lg:px-12 py-12">
        {/* Centered Header */}
        <div className="text-center mb-12 max-w-2xl">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center">
                  <Zap className="w-10 h-10 text-blue-600" />
                </div>
              </div>
              <div className="absolute -inset-4 border-4 border-blue-200 rounded-3xl animate-ping opacity-30"></div>
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 mb-4">
            Voice AI Studio
          </h1>
          <p className="text-xl lg:text-2xl text-slate-600 mb-8">
            Advanced Speech Processing Tools
          </p>
          
          {/* Navigation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-3 flex gap-3 max-w-md mx-auto">
            {[
              { id: 1, label: "Speech to Text", icon: Mic },
              { id: 2, label: "Text to Speech", icon: Volume2 },
              { id: 3, label: "Speech Pipeline", icon: MessageCircle }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveCard(item.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                  activeCard === item.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-700 hover:bg-blue-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
          {[
            { icon: Cloud, title: "Cloud AI", desc: "Powered by advanced AI" },
            { icon: Cpu, title: "Real-time", desc: "Instant processing" },
            { icon: Zap, title: "High Quality", desc: "Crystal clear audio" }
          ].map((feature, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-blue-200">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">{feature.title}</h4>
              <p className="text-slate-600 text-xs">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Cards Container */}
      <div className="relative z-10 w-full lg:w-3/5 min-h-screen flex flex-col justify-center px-6 lg:px-12 py-12">
        <div className="max-w-2xl mx-auto w-full">
          {/* Card 1: Speech to Text */}
          {activeCard === 1 && (
            <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-blue-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <Mic className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Speech to Text</h2>
                  <p className="text-slate-600">Convert your speech into text in real-time</p>
                </div>
              </div>

              <div className="flex flex-col items-center mb-6">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 rounded-2xl font-semibold text-white hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    <Mic className="h-6 w-6" />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-3 bg-red-600 px-8 py-4 rounded-2xl font-semibold text-white hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    <Square className="h-6 w-6" />
                    Stop Recording
                  </button>
                )}
                <p className="mt-3 text-sm text-slate-600">
                  {isRecording ? "🎤 Listening... Speak now!" : "Click to start speaking"}
                </p>
              </div>

              <div className="h-6 mb-4 text-blue-600 text-sm font-medium text-center" id="liveText"></div>

              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Your transcript will appear here as you speak..."
                className="w-full h-40 resize-none rounded-2xl p-6 bg-blue-50 text-slate-800 border border-blue-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 placeholder-slate-500 mb-6"
              />

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => navigator.clipboard.writeText(transcript)}
                  disabled={!transcript}
                  className="flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-200 transition disabled:opacity-50 border border-slate-300"
                >
                  <Copy size={18} />
                  Copy Text
                </button>

                <button
                  onClick={() => {
                    const blob = new Blob([transcript], { type: "text/plain" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = "transcript.txt";
                    a.click();
                  }}
                  disabled={!transcript}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 rounded-xl font-semibold text-white hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50"
                >
                  <Download size={18} />
                  Download
                </button>
              </div>
            </div>
          )}

          {/* Card 2: Text to Speech */}
          {activeCard === 2 && (
            <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-blue-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center">
                  <Volume2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Text to Speech</h2>
                  <p className="text-slate-600">Convert written text into natural speech</p>
                </div>
              </div>

              <textarea
                value={textToSpeech}
                onChange={(e) => setTextToSpeech(e.target.value)}
                placeholder="Type the text you want to convert to speech..."
                className="w-full h-40 resize-none rounded-2xl p-6 bg-blue-50 text-slate-800 border border-blue-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 placeholder-slate-500 mb-6"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => speakText(textToSpeech)}
                    disabled={!textToSpeech.trim()}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white transition-all ${
                      isSpeaking
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } disabled:opacity-50 shadow-lg`}
                  >
                    {isSpeaking ? <Square size={24} /> : <Play size={24} />}
                    {isSpeaking ? "Stop" : "Play"}
                  </button>
                  
                  {isSpeaking && (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-sm text-slate-500 bg-slate-100 px-4 py-2 rounded-xl">
                  {textToSpeech.length} characters
                </div>
              </div>
            </div>
          )}

          {/* Card 3: Speech to Speech */}
          {activeCard === 3 && (
            <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-blue-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-700 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Speech Pipeline</h2>
                  <p className="text-slate-600">Complete voice processing workflow</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">1</div>
                    <h3 className="font-semibold text-slate-800 text-lg">Record Speech</h3>
                  </div>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-full py-4 rounded-2xl font-semibold text-white transition-all ${
                      isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isRecording ? <Square className="inline w-6 h-6 mr-2" /> : <Mic className="inline w-6 h-6 mr-2" />}
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </button>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-slate-600 text-white rounded-full flex items-center justify-center text-lg font-bold">2</div>
                    <h3 className="font-semibold text-slate-800 text-lg">View Transcript</h3>
                  </div>
                  <textarea
                    value={transcript}
                    readOnly
                    placeholder="Transcript will appear here..."
                    className="w-full h-24 resize-none rounded-xl p-4 bg-white text-slate-800 border border-slate-300 outline-none"
                  />
                </div>

                {/* Step 3 */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">3</div>
                    <h3 className="font-semibold text-slate-800 text-lg">Play Back Audio</h3>
                  </div>
                  <button
                    onClick={speechToSpeech}
                    disabled={!transcript.trim()}
                    className={`w-full py-4 rounded-2xl font-semibold text-white transition-all ${
                      isSpeaking
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } disabled:opacity-50`}
                  >
                    {isSpeaking ? <Square className="inline w-6 h-6 mr-2" /> : <Volume2 className="inline w-6 h-6 mr-2" />}
                    {isSpeaking ? "Stop Playback" : "Play Back"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 