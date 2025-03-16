import React, { useState, useEffect, useRef } from 'react';
import transcriptManager from '../services/TranscriptManager';

const WordFocus = ({ language = 'en' }) => {
  const [focusedWords, setFocusedWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    console.log('WordFocus: Setting up with language:', language);
    
    // Set the language in the manager
    transcriptManager.setLanguage(language);
    
    // Subscribe to analysis results
    const unsubscribeAnalysis = transcriptManager.onAnalysisComplete((data) => {
      if (!mountedRef.current) return;

      console.log('WordFocus: Processing analysis results', {
        wordCount: data.words?.length,
        timestamp: new Date().toISOString()
      });

      if (!data.words) {
        console.error('WordFocus: Invalid analysis data:', data);
        setError('Invalid analysis data received');
        setIsLoading(false);
        return;
      }

      setFocusedWords(data.words);
      setIsLoading(false);
      setError(null);
    });

    // Subscribe to analysis errors
    const unsubscribeError = transcriptManager.onAnalysisError((err) => {
      if (!mountedRef.current) return;

      console.error('WordFocus: Analysis error', {
        error: err.message,
        timestamp: new Date().toISOString()
      });
      setError(err.message);
      setIsLoading(false);
    });

    // Subscribe to transcript updates to show loading state
    const unsubscribeTranscripts = transcriptManager.onTranscriptsUpdated((transcripts) => {
      if (!mountedRef.current) return;

      console.log('WordFocus: Received transcript update', {
        count: transcripts?.length,
        timestamp: new Date().toISOString()
      });

      // Only show loading if we have transcripts to analyze
      if (transcripts?.length > 0) {
        setIsLoading(true);
      } else {
        // Clear state for empty transcripts
        setFocusedWords([]);
        setIsLoading(false);
        setError(null);
      }
    });

    // Set up cleanup
    mountedRef.current = true;
    return () => {
      console.log('WordFocus: Cleaning up');
      mountedRef.current = false;
      unsubscribeAnalysis();
      unsubscribeError();
      unsubscribeTranscripts();
    };
  }, [language]);

  // Don't render anything if we have no data and no loading state
  if (!isLoading && !error && focusedWords.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 w-full max-w-md">
      <h3 className="text-lg font-semibold mb-4">Focused Words & Phrases</h3>
      
      {isLoading && (
        <div className="text-center text-white/70">
          Analyzing conversation...
        </div>
      )}
      
      {error && (
        <div className="text-red-400 text-sm mb-4">
          Error: {error}
        </div>
      )}
      
      {focusedWords.length > 0 && (
        <div className="space-y-4">
          {focusedWords.map((item, index) => (
            <div key={index} className="bg-white/10 rounded-lg p-4">
              <div className="font-medium">{item.word}</div>
              {item.translation && (
                <div className="text-sm text-white/70 mt-1">{item.translation}</div>
              )}
              {item.context && (
                <div className="text-sm text-white/70 mt-2">{item.context}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WordFocus; 