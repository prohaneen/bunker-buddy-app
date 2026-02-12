"use client";

import React, { useState, useEffect } from 'react';
import { 
  Upload, AlertCircle, X, ShieldCheck, Instagram, Linkedin, 
  FileText, Settings, Percent, Sun, Moon 
} from 'lucide-react';
import { calculateAttendance, SubjectAttendance } from '@/utils/calculateAttendance';
import { parsePdf, extractAttendanceData } from '@/utils/parsePdf';

export default function AttendancePage() {
  // State
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SubjectAttendance[]>([]);
  const [rawExtracted, setRawExtracted] = useState<{subject: string, total: number, present: number}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [targetPercentage, setTargetPercentage] = useState<number>(75);
  
  // CHANGED: Default is now true (Dark Mode by default)
  const [isDarkMode, setIsDarkMode] = useState(true); 

  // Recalculate Logic
  useEffect(() => {
    if (rawExtracted.length > 0) {
      const processedData = rawExtracted.map(item => 
        calculateAttendance(item.subject, item.total, item.present, targetPercentage)
      );
      setData(processedData);
    }
  }, [targetPercentage, rawExtracted]);

  // Handlers
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Allow empty so you can delete, but don't force 75 yet
    if (val === "") {
      setTargetPercentage(0); 
      return;
    }

    let num = Number(val);
    if (num > 100) num = 100; // Keep the cap
    setTargetPercentage(num);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('PDF mathram mathi! 📂');
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setError(null);
    setRawExtracted([]);
    setData([]);

    // Fake loading delay for effect
    await new Promise(r => setTimeout(r, 800));

    try {
      const rawRows = await parsePdf(file);
      const extracted = extractAttendanceData(rawRows);
      
      if (extracted.length === 0) {
        setError('Vere PDF ayach enne patikkam ennu karuthiyo?');
        setLoading(false);
        return;
      }
      setRawExtracted(extracted);
    } catch (err) {
      console.error(err);
      setError('Pani Paali! Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData([]);
    setRawExtracted([]);
    setError(null);
    setFileName(null);
  };

  // Theme Classes Helper
  const theme = {
    bg: isDarkMode ? 'bg-[#0a0a0a]' : 'bg-slate-100',
    text: isDarkMode ? 'text-white' : 'text-slate-900',
    cardBg: isDarkMode ? 'bg-[#111] border-gray-800' : 'bg-white border-slate-200',
    cardHover: isDarkMode ? 'hover:border-gray-600' : 'hover:scale-[1.02]',
    subText: isDarkMode ? 'text-gray-400' : 'text-slate-500',
    accent: isDarkMode ? 'text-cyan-400' : 'text-blue-600',
    uploadBg: isDarkMode ? 'bg-[#111] border-gray-700' : 'bg-white border-slate-300',
  };

  return (
    <main className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${theme.bg} ${theme.text}`}>
      <div className="flex-1 w-full max-w-2xl mx-auto p-6 flex flex-col justify-center">
        
        {/* Theme Toggle (Top Right) */}
        <div className="absolute top-6 right-6">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-3 rounded-full transition-all shadow-md ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-slate-800'}`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Header */}
        <header className="mb-8 text-center mt-10">
          <h1 className="text-5xl font-black mb-2 tracking-tighter drop-shadow-sm flex items-center justify-center gap-3">
            Bunk Buddy <span className="text-4xl"></span>
          </h1>
          <p className={`font-bold transform -rotate-1 text-lg ${theme.subText}`}>
            &quot;Njan ullappo enthina pedikunne? Attendance varum pokum…!&quot; 🎓
          </p>
        </header>

        {/* Settings Control - The hybrid version (Type or Click) */}
<div className={`${theme.cardBg} p-4 rounded-2xl shadow-sm border-2 mb-6 flex items-center justify-between gap-4 transition-colors`}>
    <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 text-cyan-400' : 'bg-yellow-300 text-slate-900'}`}>
            <Settings className="w-6 h-6" />
        </div>
        <div className="text-sm">
            <p className={`font-black uppercase tracking-wide ${theme.text}`}>Target %</p>
            <p className={`text-xs font-bold ${theme.subText}`}>Peru enthaayalum… percentage 75 venam</p>
        </div>
    </div>

    {/* Stepper + Direct Input Container */}
    <div className={`flex items-center gap-1 rounded-xl px-2 py-1 border-2 transition-all ${isDarkMode ? 'bg-black border-gray-700 focus-within:border-cyan-400' : 'bg-slate-50 border-slate-200 focus-within:border-blue-500'}`}>
        
        {/* Minus Button - For quick clicks */}
        <button 
          type="button" 
          onClick={() => setTargetPercentage(prev => Math.max(75, prev - 1))}
          className={`p-2 hover:bg-gray-800 rounded-lg font-bold text-xl transition-colors ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}
        >
          −
        </button>

        {/* Direct Input - For when clicking is boring */}
        <input 
            type="number" 
            inputMode="decimal"
            value={targetPercentage === 0 ? "" : targetPercentage} 
            onChange={handlePercentageChange}
            onFocus={(e) => e.target.select()} // Selects all on tap so you can just type a new number
            onBlur={() => {
                // Safety check: if they type something crazy or leave it blank
                if (targetPercentage < 75) setTargetPercentage(75);
            }}
            className={`w-10 bg-transparent font-black text-xl text-center focus:outline-none ${theme.text} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        />

        {/* Plus Button - For quick clicks */}
        <button 
          type="button" 
          onClick={() => setTargetPercentage(prev => Math.min(100, prev + 1))}
          className={`p-2 hover:bg-gray-800 rounded-lg font-bold text-xl transition-colors ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}
        >
          +
        </button>
        
        <Percent className={`w-4 h-4 mr-1 ${theme.subText}`} />
    </div>
</div>

        {/* Upload Section */}
        {data.length === 0 && (
          <div className={`${theme.uploadBg} rounded-3xl shadow-lg border-2 border-dashed p-12 flex flex-col items-center justify-center text-center hover:translate-y-1 transition-all relative group cursor-pointer overflow-hidden`}>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`p-5 rounded-full mb-4 group-hover:scale-110 transition-transform ${isDarkMode ? 'bg-gray-800 text-cyan-400' : 'bg-blue-100 text-blue-600'}`}>
              <Upload className="w-10 h-10" />
            </div>
            <h3 className={`text-2xl font-black ${theme.text}`}>Upload PDF</h3>
            <p className={`text-sm font-bold mt-2 ${theme.subText}`}>Download Attendance Report from App  -&gt; Upload Here</p>
            
            {/* CHANGED: Dynamic color for Pro's Magic (Gold in Dark, Black in Light) */}
            <p className={`mt-4 text-sm font-bold tracking-widest ${isDarkMode ? 'text-amber-200' : 'text-gray-900'}`}>
               ✧ Experience the Pro’s Magic ✧
            </p>

            
            {loading && (
              <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 ${isDarkMode ? 'bg-black/90' : 'bg-white/95'}`}>
                <div className="animate-bounce text-4xl">🤔</div>
                <p className={`font-black ${theme.text}`}>Calculations... wait cheyyada...</p>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500 text-red-500 rounded-xl flex items-center gap-3 shadow-sm font-bold">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <p>{error}</p>
            <button onClick={reset} className="ml-auto p-1 hover:bg-red-500/20 rounded-lg">
              <X className="w-5 h-5"/>
            </button>
          </div>
        )}

        {/* Results List */}
        {data.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-end mb-2 px-1 gap-2">
                <div className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg border-2 ${isDarkMode ? 'bg-black border-gray-700 text-gray-400' : 'bg-white border-slate-200 text-slate-600'}`}>
                    <FileText className="w-4 h-4"/>
                    <span className="truncate max-w-[150px] md:max-w-xs">{fileName}</span>
                </div>
                <button 
                  onClick={reset} 
                  className={`text-xs font-black px-4 py-2 rounded-full transition-colors shadow-md ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-700'}`}
                >
                  UPLOAD NEW 🔄
                </button>
            </div>
            
            {data.map((item, idx) => (
               <div key={idx} className={`${theme.cardBg} p-5 rounded-2xl shadow-sm border-2 flex flex-col gap-3 transition-all ${theme.cardHover}`}>
                  <div className="flex justify-between items-start">
                      <div>
                          <h3 className={`font-black text-lg leading-tight uppercase tracking-tight ${theme.text}`}>{item.subjectName}</h3>
                          <div className={`text-xs font-bold mt-1 ${theme.subText}`}>
                              {item.classesAttended}/{item.totalClasses} Classes
                          </div>
                      </div>
                      <div className={`text-3xl font-black ${
                        item.status === 'Safe' || item.status === 'No Classes' 
                          ? 'text-emerald-500' 
                          : 'text-rose-500'
                      }`}>
                          {item.percentage}%
                      </div>
                  </div>
                  
                  {/* MEME LOGIC */}
                  {item.status === 'Safe' && (
                      <div className="bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-600 p-3 rounded-xl text-sm font-bold flex gap-3 items-center">
                          <div className="text-2xl">😎</div>
                          <span>Set aanu! Bunk <strong>{item.classesToBunk}</strong> more & chill.</span>
                      </div>
                  )}

                  {item.status === 'Warning' && (
                      <div className="bg-rose-500/10 border-2 border-rose-500/20 text-rose-600 p-3 rounded-xl text-sm font-bold flex gap-3 items-center">
                           <div className="text-2xl">😩</div>
                           <div>
                              <p className="uppercase text-[10px] opacity-70 mb-1">Danger Zone!</p>
                              <span>&quot;Thalalaruth Raman Kutty! Thalararuth!&quot; <br/>Attend <strong>{item.classesToAttend}</strong> classes.</span>
                           </div>
                      </div>
                  )}

                  {item.status === 'No Classes' && (
                      <div className={`p-3 rounded-xl text-sm text-center font-bold italic ${isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-slate-100 text-slate-500'}`}>
                          No classes? Lucky fellow. 😴
                      </div>
                  )}
               </div>
            ))}
          </div>
        )}
      </div>

      <footer className="py-8 text-center flex flex-col gap-3 mt-auto">
        <p className={`text-sm font-bold flex items-center justify-center gap-1.5 ${theme.subText}`}>
          Made with <span className="text-rose-500 animate-pulse">❤️</span> by <span className={theme.text}>Prohaneen</span>
        </p>
        <div className="flex justify-center gap-4">
            <a href="https://www.instagram.com/prohaneen1/" target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full border-2 transition-all ${isDarkMode ? 'bg-black border-gray-700 text-gray-400 hover:text-pink-400' : 'bg-white border-slate-200 text-slate-400 hover:text-pink-600'}`}>
                <Instagram className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/in/haneen-ershad-ab98aa25b/" target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full border-2 transition-all ${isDarkMode ? 'bg-black border-gray-700 text-gray-400 hover:text-blue-400' : 'bg-white border-slate-200 text-slate-400 hover:text-blue-700'}`}>
                <Linkedin className="w-5 h-5" />
            </a>
        </div>
      </footer>
    </main>
  );
}