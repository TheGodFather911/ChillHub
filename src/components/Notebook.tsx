import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Save, FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Notebook: React.FC = () => {
  const { isDark } = useTheme();
  const [notes, setNotes] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('cozy-notebook');
    if (savedNotes) {
      setNotes(savedNotes);
      setWordCount(savedNotes.trim().split(/\s+/).filter(word => word.length > 0).length);
    }
  }, []);

  // Auto-save to localStorage whenever notes change
  useEffect(() => {
    if (notes !== '') {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('cozy-notebook', notes);
        setLastSaved(new Date());
      }, 1000); // Save after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [notes]);

  // Update word count
  useEffect(() => {
    const words = notes.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [notes]);

  // Handle scroll isolation for textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      
      const { scrollTop, scrollHeight, clientHeight } = textarea;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      
      // Prevent page scroll when scrolling within the textarea
      if ((e.deltaY < 0 && !isAtTop) || (e.deltaY > 0 && !isAtBottom)) {
        e.preventDefault();
      }
    };

    textarea.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      textarea.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const formatLastSaved = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h2 className={`text-xl font-semibold transition-colors duration-300 ${
            isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>Notebook</h2>
        </div>
        
        <div className={`flex items-center space-x-4 text-sm transition-colors duration-300 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <div className="flex items-center space-x-1">
            <FileText className="w-4 h-4" />
            <span>{wordCount} words</span>
          </div>
          {lastSaved && (
            <div className="flex items-center space-x-1">
              <Save className="w-4 h-4 text-green-500" />
              <span>Saved {formatLastSaved(lastSaved)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={handleNotesChange}
          placeholder="Start writing your thoughts... Everything is automatically saved as you type."
          className={`w-full h-full resize-none border-0 outline-none bg-transparent text-base leading-relaxed p-4 rounded-2xl transition-all duration-300 scrollbar-thin ${
            isDark 
              ? 'text-gray-200 placeholder-gray-500 bg-gradient-to-br from-gray-700/50 to-gray-800/50 focus:bg-gray-700/70 scrollbar-thumb-gray-600 scrollbar-track-gray-800' 
              : 'text-gray-800 placeholder-gray-400 bg-gradient-to-br from-white/50 to-gray-50/50 focus:bg-white/70 scrollbar-thumb-gray-300 scrollbar-track-gray-100'
          }`}
          style={{
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
            lineHeight: '1.7',
            scrollBehavior: 'smooth'
          }}
        />
        
        {/* Subtle gradient overlay for depth */}
        <div className={`absolute inset-0 bg-gradient-to-t pointer-events-none rounded-2xl transition-opacity duration-300 ${
          isDark ? 'from-gray-800/10 to-transparent' : 'from-white/10 to-transparent'
        }`}></div>
      </div>

      <div className={`mt-4 flex items-center justify-between text-xs rounded-lg p-3 transition-colors duration-300 ${
        isDark ? 'text-gray-400 bg-gray-700/80' : 'text-gray-500 bg-gray-50/80'
      }`}>
        <div className="flex items-center space-x-4">
          <span>✨ Auto-save enabled</span>
          <span>📝 Markdown supported</span>
        </div>
        <div>
          Press Ctrl+A to select all • Ctrl+Z to undo
        </div>
      </div>
    </div>
  );
};

export default Notebook;