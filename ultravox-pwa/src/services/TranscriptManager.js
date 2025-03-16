// TranscriptManager.js - Handles all transcript-related operations
import EventEmitter from 'events';

class TranscriptManager {
  constructor() {
    console.log('TranscriptManager: Initializing');
    this.emitter = new EventEmitter();
    this.transcripts = [];
    this.isAnalyzing = false;
    this.language = 'en';
    
    // Increase max listeners to prevent memory leak warnings
    this.emitter.setMaxListeners(20);
  }

  // Set the current language
  setLanguage(language) {
    this.language = language;
    console.log('TranscriptManager: Language set to', language);
  }

  // Add new transcripts and emit events
  addTranscripts(newTranscripts) {
    if (!Array.isArray(newTranscripts)) {
      console.error('TranscriptManager: Invalid transcripts format:', newTranscripts);
      return;
    }

    console.log('TranscriptManager: Processing new transcripts', {
      count: newTranscripts?.length,
      total: this.transcripts.length,
      hasListeners: this.emitter.listenerCount('transcriptsUpdated') > 0,
      timestamp: new Date().toISOString()
    });

    // Always update transcripts and analyze, even if empty
    // This ensures we handle transcript clearing properly
    this.transcripts = newTranscripts || [];
    
    // Log before emitting events
    console.log('TranscriptManager: About to emit events', {
      transcriptCount: this.transcripts.length,
      analysisListeners: this.emitter.listenerCount('analysisComplete'),
      transcriptListeners: this.emitter.listenerCount('transcriptsUpdated'),
      timestamp: new Date().toISOString()
    });
    
    // Always emit transcriptsUpdated
    this.emitter.emit('transcriptsUpdated', this.transcripts);
    
    // Always try to analyze, let analyzeTranscripts handle validation
    this.analyzeTranscripts(true);
  }

  // Analyze transcripts using Gemini
  async analyzeTranscripts(force = false) {
    if (this.isAnalyzing && !force) {
      console.log('TranscriptManager: Analysis already in progress');
      return;
    }

    if (!this.transcripts.length) {
      console.log('TranscriptManager: No transcripts to analyze');
      // Emit empty analysis to clear previous results
      this.emitter.emit('analysisComplete', { words: [] });
      return;
    }

    this.isAnalyzing = true;
    console.log('TranscriptManager: Starting analysis', {
      transcriptCount: this.transcripts.length,
      language: this.language,
      force,
      timestamp: new Date().toISOString()
    });

    try {
      const transcriptText = this.transcripts
        .map(t => t.text)
        .join('\n');

      console.log('TranscriptManager: Sending request to analyze-transcript', {
        textLength: transcriptText.length,
        language: this.language,
        timestamp: new Date().toISOString()
      });

      const response = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: transcriptText,
          language: this.language
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('TranscriptManager: Analysis complete', {
        wordCount: data.words?.length,
        hasListeners: this.emitter.listenerCount('analysisComplete') > 0,
        timestamp: new Date().toISOString()
      });

      this.emitter.emit('analysisComplete', data);
    } catch (error) {
      console.error('TranscriptManager: Analysis error', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      this.emitter.emit('analysisError', error);
    } finally {
      this.isAnalyzing = false;
    }
  }

  // Clear all transcripts
  clear() {
    console.log('TranscriptManager: Clearing transcripts');
    this.transcripts = [];
    this.isAnalyzing = false;
    // Emit both events to ensure UI updates
    this.emitter.emit('transcriptsUpdated', []);
    this.emitter.emit('analysisComplete', { words: [] });
  }

  // Subscribe to transcript updates
  onTranscriptsUpdated(callback) {
    console.log('TranscriptManager: Adding transcripts listener');
    this.emitter.on('transcriptsUpdated', callback);
    return () => {
      console.log('TranscriptManager: Removing transcripts listener');
      this.emitter.off('transcriptsUpdated', callback);
    };
  }

  // Subscribe to analysis results
  onAnalysisComplete(callback) {
    console.log('TranscriptManager: Adding analysis listener');
    this.emitter.on('analysisComplete', callback);
    return () => {
      console.log('TranscriptManager: Removing analysis listener');
      this.emitter.off('analysisComplete', callback);
    };
  }

  // Subscribe to analysis errors
  onAnalysisError(callback) {
    console.log('TranscriptManager: Adding error listener');
    this.emitter.on('analysisError', callback);
    return () => {
      console.log('TranscriptManager: Removing error listener');
      this.emitter.off('analysisError', callback);
    };
  }
}

// Create a singleton instance
const transcriptManager = new TranscriptManager();
export default transcriptManager; 