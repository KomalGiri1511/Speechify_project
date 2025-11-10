import { useState, useEffect, useRef } from 'react'




function StepCard({ children, title, icon, description }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])
  
  return (
    <div
      className={`max-w-2xl mx-auto rounded-2xl bg-white/5 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-white/10 border border-white/5 transition-all duration-500 hover:bg-white/10 hover:ring-white/20 hover:shadow-3xl hover:scale-[1.02] ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* Step header with icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500">
            {icon}
          </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-sm text-white/70">{description}</p>
        </div>
      </div>
      
      {children}
    </div>
  )
}

export default function MainSection({ openImmersiveReader }) {
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(null)
  const [uploadedVoiceFile, setUploadedVoiceFile] = useState(null)
  const [voiceMode, setVoiceMode] = useState('celebrity') // 'celebrity' or 'upload'
  const [playingVoice, setPlayingVoice] = useState(null)
  const fileInputRef = useRef(null)
  const voiceUploadRef = useRef(null)

  const handleBrowseClick = () => fileInputRef.current?.click()

  const normalizeFiles = (fileList) => {
    return Array.from(fileList).map((f) => {
      const parts = f.name.split('.')
      const ext = parts.length > 1 ? parts.pop().toLowerCase() : ''
      return { file: f, name: f.name, size: f.size, ext }
    })
  }

  const handleFiles = (fileList) => {
    const accepted = normalizeFiles(fileList).filter(({ ext }) => ['pdf', 'docx', 'txt'].includes(ext))
    if (accepted.length > 0) {
      setUploadedFiles((prev) => [...prev, ...accepted])
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  const iconForExt = (ext) => {
    const base = 'inline-flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold'
    if (ext === 'pdf') return <span className={`${base} bg-red-500/20 text-red-600 ring-1 ring-red-500/30`}>PDF</span>
    if (ext === 'docx') return <span className={`${base} bg-blue-500/20 text-blue-600 ring-1 ring-blue-500/30`}>DOC</span>
    return <span className={`${base} bg-slate-500/20 text-slate-700 ring-1 ring-slate-500/30`}>TXT</span>
  }

  const goNext = () => {
    if (step < 3) setStep(step + 1)
  }

  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      {/* Dark blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950"></div>
      
      {/* Animated floating headphones */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Headphone 1 */}
        <div className="absolute top-20 left-10 animate-float opacity-10">
          <svg className="h-32 w-32 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
          </svg>
        </div>
        
        {/* Headphone 2 */}
        <div className="absolute top-40 right-20 animate-float-delayed opacity-10" style={{animationDelay: '2s'}}>
          <svg className="h-40 w-40 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
          </svg>
        </div>
        
        {/* Headphone 3 */}
        <div className="absolute bottom-32 left-1/4 animate-float opacity-10" style={{animationDelay: '4s'}}>
          <svg className="h-36 w-36 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
          </svg>
        </div>

        {/* Headphone 4 */}
        <div className="absolute top-1/2 right-1/4 animate-float opacity-10" style={{animationDelay: '6s'}}>
          <svg className="h-28 w-28 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
          </svg>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(-5deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes soundWave {
          0% { height: 20%; }
          100% { height: 90%; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>

      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-6">
        {/* Horizontal timeline tracker */}
        <div className="mb-12 flex items-center justify-center">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-500 ${
                  step >= stepNum 
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 ring-2 ring-cyan-400/30' 
                    : 'bg-white/10 backdrop-blur-sm ring-1 ring-white/20'
                }`}>
                  <span className={`text-lg font-bold ${
                    step >= stepNum ? 'text-white' : 'text-white/60'
                  }`}>
                    {stepNum}
                  </span>
                </div>
                {stepNum < 3 && (
                  <div className={`h-1 w-24 transition-all duration-500 ${
                    step > stepNum 
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500' 
                      : 'bg-white/20'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <StepCard
            stepNumber={1}
            title="Input Course Material"
            description="Upload documents or paste your content"
            icon={
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            }
          >

            {/* Upload zone - only show when no files uploaded */}
            {uploadedFiles.length === 0 && (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`mt-4 rounded-xl border-2 border-dashed p-8 text-center transition ${
                  isDragging ? 'border-indigo-500 bg-indigo-50/60' : 'border-white/30 bg-white/5 backdrop-blur'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  {/* Big gradient upload button */}
                  <button
                    type="button"
                    onClick={handleBrowseClick}
                    className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-indigo-700 hover:to-indigo-600"
                  >
                    {/* upload icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M12 3a1 1 0 0 1 1 1v7.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4A1 1 0 1 1 8.707 9.293L11 11.586V4a1 1 0 0 1 1-1z"/>
                      <path d="M5 15a1 1 0 0 1 1 1v2h12v-2a1 1 0 1 1 2 0v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 2 0v2h2v-2a1 1 0 0 1 1-1z"/>
                    </svg>
                    Upload (.pdf, .docx, .txt)
                  </button>

                  <p className="text-xs text-white/80">or drag & drop files here</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  />
                </div>
              </div>
            )}

            {/* Uploaded file cards */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                {uploadedFiles.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-white/10 p-4 ring-1 ring-white/20 shadow-sm backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      {iconForExt(f.ext)}
                      <div>
                        <p className="text-sm font-medium text-white">{f.name}</p>
                        <p className="text-xs text-white/70">{formatSize(f.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-md border border-white/30 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Replace
                      </button>
                      <button
                        className="rounded-md bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                        onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Secondary textarea - only show when no files uploaded */}
            {uploadedFiles.length === 0 && (
              <textarea
                className="mt-6 w-full min-h-36 resize-y rounded-lg border border-white/20 bg-white/10 p-4 text-sm text-white placeholder-white/60 outline-none backdrop-blur-md focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/40"
                placeholder="Paste your course text here…"
              />
            )}

            <div className="mt-8 flex justify-end">
              <button onClick={goNext} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:from-cyan-500 hover:to-blue-600 hover:scale-105">
                Next
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </StepCard>
        )}

        {step === 2 && (
          <StepCard
            stepNumber={2}
            title="Choose or Customize Voice"
            description="Select a character, record, or upload your voice"
            icon={
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            }
          >

            {/* Voice Selection with Toggle */}
            <div className="space-y-8">
              
              {/* Toggle Switch */}
              <div className="flex justify-center">
                <div className="inline-flex rounded-2xl bg-white/5 p-1.5 ring-1 ring-white/10 backdrop-blur-xl">
                  <button
                    onClick={() => setVoiceMode('celebrity')}
                    className={`relative px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                      voiceMode === 'celebrity'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                        : 'text-white/60 hover:text-white/90'
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                      Celebrity Voices
                    </span>
                  </button>
                  <button
                    onClick={() => setVoiceMode('upload')}
                    className={`relative px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                      voiceMode === 'upload'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                        : 'text-white/60 hover:text-white/90'
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Your Voice
                    </span>
                  </button>
                </div>
              </div>

              {/* Celebrity Voices Section */}
              {voiceMode === 'celebrity' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white mb-2">Select Your Perfect Voice</h3>
                    <p className="text-sm text-white/60">Choose from our collection of premium AI voices</p>
                  </div>

                  {/* 4-column celebrity voice grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {[
                      { src: 'https://athena-user-assets.s3.eu-north-1.amazonaws.com/allAthenaAssets/char1.jpg', label: 'Character 1', desc: 'Warm & Clear' },
                      { src: 'https://athena-user-assets.s3.eu-north-1.amazonaws.com/allAthenaAssets/char2.jpg', label: 'Character 2', desc: 'Deep & Smooth' },
                      { src: 'https://athena-user-assets.s3.eu-north-1.amazonaws.com/allAthenaAssets/char3.jpg', label: 'Character 3', desc: 'Bright & Energetic' },
                      { src: 'https://athena-user-assets.s3.eu-north-1.amazonaws.com/allAthenaAssets/download+(1).jpg', label: 'Character 4', desc: 'Calm & Soothing' },
                    ].map((c, i) => (
                      <div key={i} className="relative">
                        <button
                          type="button"
                          onClick={() => { 
                            setSelectedAvatarIndex(i); 
                            setUploadedVoiceFile(null);
                            // Auto-start preview when selected
                            setPlayingVoice(i);
                            setTimeout(() => setPlayingVoice(null), 3000);
                          }}
                          className={`group relative overflow-hidden rounded-3xl transition-all duration-500 w-full ${
                            selectedAvatarIndex === i 
                              ? 'ring-2 ring-cyan-400 shadow-2xl shadow-cyan-400/30 scale-105' 
                              : 'ring-1 ring-white/10 hover:ring-2 hover:ring-white/30 hover:scale-105 hover:shadow-2xl'
                          }`}
                        >
                          {/* Image */}
                          <div className="aspect-[3/4] overflow-hidden">
                            <img 
                              src={c.src} 
                              alt={c.label} 
                              className={`h-full w-full object-cover transition-all duration-700 ${
                                selectedAvatarIndex === i ? 'scale-110 brightness-110' : 'group-hover:scale-110 group-hover:brightness-110'
                              }`}
                            />
                          </div>
                          
                          {/* Gradient overlay */}
                          <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-500 ${
                            selectedAvatarIndex === i ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
                          }`} />
                          
                          {/* Sound waves at bottom of image */}
                          {playingVoice === i && (
                            <div className="absolute bottom-8 left-0 right-0 px-6 py-2">
                              <div className="flex items-end justify-center gap-1 h-12">
                                {Array.from({ length: 20 }).map((_, idx) => (
                                  <div
                                    key={idx}
                                    className="w-1 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
                                    style={{
                                      height: `${20 + Math.random() * 80}%`,
                                      animation: `soundWave ${0.6 + Math.random() * 0.4}s ease-in-out infinite alternate`,
                                      animationDelay: `${idx * 0.05}s`
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Text content */}
                          <div className="absolute bottom-0 left-0 right-0 p-5">
                            <div className="text-center space-y-1">
                              <p className="text-sm font-bold text-white tracking-wide">{c.label}</p>
                              <p className="text-xs text-cyan-300 font-medium">{c.desc}</p>
                            </div>
                          </div>

                          {/* Selected indicator with pulse */}
                          {selectedAvatarIndex === i && (
                            <div className="absolute top-4 right-4">
                              <div className="relative">
                                <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
                                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 shadow-xl">
                                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Play preview button with glow */}
                          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                            selectedAvatarIndex === i ? 'opacity-0 scale-50' : 'opacity-0 group-hover:opacity-100 group-hover:scale-110'
                          }`}>
                            <div className="relative">
                              <div className="absolute inset-0 bg-white/50 rounded-full blur-xl"></div>
                              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-2xl">
                                <svg className="h-7 w-7 text-slate-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Voice Section */}
              {voiceMode === 'upload' && (
                <div className="max-w-2xl mx-auto animate-fadeIn">
                  <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-10 ring-1 ring-white/20 backdrop-blur-xl transition-all duration-500 hover:ring-2 hover:ring-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-400/20 hover:scale-[1.02]">
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative text-center space-y-6">
                      {/* Icon */}
                      <div className="flex justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 ring-1 ring-cyan-400/30 group-hover:scale-110 transition-transform duration-500">
                            <svg className="h-10 w-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Text */}
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold text-white">Upload Your Voice</h4>
                        <p className="text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                          Upload a clear audio file (MP3 or WAV) and we'll clone your voice using advanced AI
                        </p>
                      </div>

                      {/* Upload button */}
                      <label className="inline-block cursor-pointer">
                        <input
                          ref={voiceUploadRef}
                          type="file"
                          accept=".mp3,.wav"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) {
                              setUploadedVoiceFile({ name: f.name, size: f.size })
                              setSelectedAvatarIndex(null)
                            }
                          }}
                        />
                        <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-4 text-base font-bold text-white shadow-xl shadow-cyan-500/30 transition-all duration-300 hover:from-cyan-600 hover:to-blue-700 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/40">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Choose Audio File
                        </div>
                      </label>

                      {/* Upload indicator */}
                      {uploadedVoiceFile && (
                        <div className="pt-6 border-t border-white/10">
                          <div className="flex items-center justify-between rounded-2xl bg-white/10 px-6 py-4 ring-1 ring-white/20">
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg">
                                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-bold text-white">{uploadedVoiceFile.name}</p>
                                <p className="text-xs text-white/60 mt-0.5">{formatSize(uploadedVoiceFile.size)}</p>
                              </div>
                            </div>
                            <button 
                              className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation()
                                setUploadedVoiceFile(null)
                              }}
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Voice characteristics - Modern card style (applies to both modes) */}
              <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-8 ring-1 ring-white/10 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-base font-bold text-white">Fine-tune Voice Settings</h4>
                  <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition">Reset to Default</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-white/90 flex items-center gap-2">
                        <svg className="h-4 w-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v9.28l6.36 6.36a1 1 0 010 1.41l-1.41 1.41a1 1 0 01-1.41 0L9.18 15.1A7 7 0 1112 3zm0 2a5 5 0 105 5V5h-5z"/>
                        </svg>
                        Pitch
                      </label>
                      <span className="text-sm font-bold text-cyan-400">50%</span>
                    </div>
                    <input type="range" min="0" max="100" defaultValue="50" className="w-full accent-cyan-400 h-2 rounded-full" />
                    <p className="text-xs text-white/50">Adjust voice highness</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-white/90 flex items-center gap-2">
                        <svg className="h-4 w-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13 4.055L18.943 10 13 15.945v-4.834C5.25 11.111 1.667 18.889 1.667 18.889s.833-8.334 11.333-9.722V4.055z"/>
                        </svg>
                        Speed
                      </label>
                      <span className="text-sm font-bold text-cyan-400">50%</span>
                    </div>
                    <input type="range" min="0" max="100" defaultValue="50" className="w-full accent-cyan-400 h-2 rounded-full" />
                    <p className="text-xs text-white/50">Control speech pace</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-white/90 flex items-center gap-2">
                        <svg className="h-4 w-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm1-13h-2v6h2zm0 8h-2v2h2z"/>
                        </svg>
                        Tone
                      </label>
                      <span className="text-sm font-bold text-cyan-400">50%</span>
                    </div>
                    <input type="range" min="0" max="100" defaultValue="50" className="w-full accent-cyan-400 h-2 rounded-full" />
                    <p className="text-xs text-white/50">Modify voice warmth</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button onClick={goNext} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:from-cyan-500 hover:to-blue-600 hover:scale-105 shadow-lg shadow-cyan-400/20">
                Next
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </StepCard>
        )}

        {step === 3 && (
          <StepCard
            stepNumber={3}
            title="Convert & Listen"
            description="Generate audio and preview it instantly"
            icon={
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V9a2 2 0 012-2h6a2 2 0 012 2v1M7 7h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
              </svg>
            }
          >

            {/* Generate button */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setIsGenerating(true)
                  setTimeout(() => setIsGenerating(false), 2000)
                }}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:from-cyan-600 hover:to-blue-700 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Generating…
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    Generate Audio
                  </>
                )}
              </button>
            </div>

            {/* Audio player card */}
            {!isGenerating && (
              <div className="mt-8 rounded-xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-white">Course Audio Preview</p>
                    <p className="text-xs text-white/60 mt-1">intro-lesson.mp3</p>
                  </div>
                  <select className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none backdrop-blur transition hover:bg-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40">
                    <option className="bg-slate-800">1x</option>
                    <option className="bg-slate-800">1.5x</option>
                    <option className="bg-slate-800">2x</option>
                  </select>
                </div>

                {/* Waveform visualization */}
                <div className="mt-6 h-24 w-full rounded-lg bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-indigo-500/20 p-1 ring-1 ring-white/10">
                  <div className="flex h-full items-end justify-around gap-1 px-2">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full bg-gradient-to-t from-cyan-400 to-blue-500"
                        style={{ height: `${Math.random() * 80 + 20}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Controls */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                      </svg>
                    </button>
                    <button className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-blue-700">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                    <button className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 18h2V6h-2zM6 18l8.5-6L6 6z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openImmersiveReader && openImmersiveReader("Welcome to your course content! This is a sample text that demonstrates the immersive reading experience. You can customize the font size, theme, and playback speed to create the perfect learning environment for your needs.")}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:from-blue-600 hover:to-indigo-700"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Open Reader
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:from-emerald-600 hover:to-green-700">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download MP3
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:from-emerald-500 hover:to-green-600 hover:scale-105">
                Finish
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </StepCard>
        )}
      </div>
      
      
    </section>
    

    
  )
  

}



