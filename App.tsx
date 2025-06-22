
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AudioController, AudioControllerHandle } from './components/AudioController';
import { ResultDisplay } from './components/ResultDisplay';
import { SettingsPanel } from './components/SettingsPanel';
import { ActionIcon } from './components/ActionIcon';
import { SpeakerSelector } from './components/SpeakerSelector';
import { LanguageSelector } from './components/LanguageSelector'; // Import LanguageSelector
import { summarizeText, translateText, diarizeText } from './services/geminiService';
import { UNIFIED_LANGUAGES, Language } from './constants'; // AUTO_DETECT_LANGUAGE_OPTION removed
import { AlertTriangle, Info, Settings as SettingsIcon, FileText, Languages } from 'lucide-react';

const App: React.FC = () => {
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false); 
  
  const [summary, setSummary] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [diarizedText, setDiarizedText] = useState<string>('');
  
  const defaultLanguage = UNIFIED_LANGUAGES.find(lang => lang.code === 'en-US') || UNIFIED_LANGUAGES[0];
  // AUTO_DETECT_LANGUAGE_OPTION removed


  const [targetLanguage, setTargetLanguage] = useState<Language>(defaultLanguage);
  const [inputLanguage, setInputLanguage] = useState<Language>(defaultLanguage); // Default to a specific language
  const [summaryLanguage, setSummaryLanguage] = useState<Language>(defaultLanguage);

  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState<boolean>(false);
  const [isDiarizing, setIsDiarizing] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
  const [speechApiUnsupported, setSpeechApiUnsupported] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [numberOfSpeakers, setNumberOfSpeakers] = useState<number>(0); // 0 for Auto


  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
      setError("AI Service API Key is missing. Please configure the API_KEY environment variable.");
    }
  }, []);

  const resetAllOutputs = () => {
    setTranscribedText('');
    setInterimTranscript('');
    setDiarizedText('');
    setSummary('');
    setTranslatedText('');
    setError(null); 
  }

  const handleStartRecording = useCallback(() => { 
    setIsRecording(true);
    resetAllOutputs();
  }, []);

  const handleStopRecordingAndDiarize = useCallback(async (finalTranscript: string) => {
    setIsRecording(false); 
    setTranscribedText(finalTranscript);
    setInterimTranscript('');
    setDiarizedText('');
    
    // Simplified: inputLanguage.code will never be 'auto'
    const languageForDiarization: string = inputLanguage.name;
    const diarizationContextLanguageName: string = inputLanguage.name;

    if (finalTranscript.trim() && !apiKeyMissing) {
      setIsDiarizing(true);
      setError(null);
      try {
        const result = await diarizeText(finalTranscript, numberOfSpeakers, languageForDiarization);
        setDiarizedText(result);
      } catch (e: any) {
        const actionBase = numberOfSpeakers > 1 
          ? "diarize and punctuate" 
          : (numberOfSpeakers === 1 
              ? "punctuate" 
              : "auto-detect speakers and punctuate");
        const action = `${actionBase} in ${diarizationContextLanguageName}`;
        setError(e.message || `Failed to ${action}. Displaying raw transcript.`);
        setDiarizedText(''); 
      } finally {
        setIsDiarizing(false);
      }
    } else {
      setDiarizedText(''); 
    }
  }, [numberOfSpeakers, apiKeyMissing, inputLanguage.name]);


  const handleTranscriptChange = useCallback((transcript: string, isFinal: boolean) => {
    if (isFinal) {
      // Final segments are accumulated by AudioController and passed via onStopRecording
    } else {
      setInterimTranscript(transcript);
    }
  }, []);

  const getSourceTextForProcessing = () => diarizedText || transcribedText;

  const handleSummarize = async () => {
    const sourceText = getSourceTextForProcessing();
    if (!sourceText.trim() || apiKeyMissing) return;
    setIsLoadingSummary(true);
    setError(null);
    setSummary('');
    try {
      const result = await summarizeText(sourceText, summaryLanguage.name);
      setSummary(result);
    } catch (e: any) {
      setError(e.message || "Failed to summarize text.");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleTranslate = async () => {
    const sourceText = getSourceTextForProcessing();
    if (!sourceText.trim() || apiKeyMissing) return;
    setIsLoadingTranslation(true);
    setError(null);
    setTranslatedText('');
    try {
      const result = await translateText(sourceText, targetLanguage.name);
      setTranslatedText(result);
    } catch (e: any) { 
      setError(e.message || "Failed to translate text.");
    } finally {
      setIsLoadingTranslation(false);
    }
  };


  const transcriptionResultText = diarizedText || transcribedText;
  
  let transcriptionPlaceholderText: string;
  // Simplified: inputLanguage.code will never be 'auto'
  const langContext = inputLanguage.name;

  if (isDiarizing) {
    const baseAction = numberOfSpeakers > 1
        ? "Diarizing & punctuating"
        : (numberOfSpeakers === 1
            ? "Adding punctuation to"
            : "Automatically detecting speakers & punctuating");
    transcriptionPlaceholderText = `${baseAction} transcript (language: ${langContext}), please wait...`;
  } else if (isRecording) {
    transcriptionPlaceholderText = `Listening (microphone - language: ${langContext})...`;
  } else {
    transcriptionPlaceholderText = "Your transcribed audio will appear here...";
  }

  const canProcessText = (diarizedText.trim().length > 0 || transcribedText.trim().length > 0) && !isRecording && !apiKeyMissing && !isDiarizing;
  
  const commonSettingsDisabled = isRecording || apiKeyMissing || !!speechApiUnsupported || isDiarizing;
  const audioControllerDisabled = apiKeyMissing || !!speechApiUnsupported || isDiarizing; 
  
  // Simplified: inputLanguage.code will never be 'auto'
  const speechRecognitionLangCode = inputLanguage.code;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-800 dark:to-sky-900">
      <header className="w-full max-w-4xl mb-8 flex justify-between items-center">
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sky-700 dark:text-sky-400 text-center sm:text-left">
            VoiceNote AI
          </h1>
          <p className="text-md sm:text-lg text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 text-center sm:text-left">
            Transcribe, Diarize, Summarize, and Translate your audio with AI.
          </p>
        </div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Open settings"
        >
          <SettingsIcon className="w-7 h-7 sm:w-8 sm:h-8 text-gray-600 dark:text-gray-300" />
        </button>
      </header>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isRecording={commonSettingsDisabled} 
        apiKeyMissing={apiKeyMissing}
        speechApiUnsupported={!!speechApiUnsupported}
      />

      {apiKeyMissing && (
        <div className="w-full max-w-2xl bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-lg" role="alert">
          <div className="flex">
            <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-3" /></div>
            <div>
              <p className="font-bold">API Key Error</p>
              <p className="text-sm">{error || "AI Service API Key is missing."}</p>
            </div>
          </div>
        </div>
      )}

      {speechApiUnsupported && !apiKeyMissing && (
         <div className="w-full max-w-2xl bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md shadow-lg" role="alert">
          <div className="flex">
            <div className="py-1"><Info className="h-6 w-6 text-yellow-500 mr-3" /></div>
            <div>
              <p className="font-bold">Browser Compatibility</p>
              <p className="text-sm">{speechApiUnsupported}</p>
            </div>
          </div>
        </div>
      )}
      {error && !apiKeyMissing && !error.toLowerCase().includes("api key") && ( 
         <div className="w-full max-w-2xl bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative shadow mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

      <main className="w-full max-w-4xl space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl flex flex-col items-center space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
            {isRecording ? 'Recording (Microphone)...' : 'Start Live Transcription'}
            </h2>
             <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-2 text-center">
                Use your microphone. Select recording language and number of speakers below.
            </p>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LanguageSelector
                label="Recording Language:"
                selectedLanguage={inputLanguage}
                onSelectLanguage={setInputLanguage}
                disabled={commonSettingsDisabled}
                // showAutoOption={true} // Removed: Auto option no longer shown for mic
              />
              <SpeakerSelector
                value={numberOfSpeakers}
                onChange={setNumberOfSpeakers}
                disabled={commonSettingsDisabled} 
              />
            </div>
            <AudioController
              isRecording={isRecording} 
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecordingAndDiarize} 
              onTranscriptChange={handleTranscriptChange}
              onUnsupported={setSpeechApiUnsupported}
              speechLang={speechRecognitionLangCode} // Use the specific code for API
              disabled={audioControllerDisabled} 
            />
        </div>

        <ResultDisplay
          title="Transcription"
          text={transcriptionResultText + (interimTranscript ? ` ${interimTranscript}` : '')}
          isLoading={isDiarizing || (isRecording && !interimTranscript && !transcribedText && !diarizedText)}
          placeholder={transcriptionPlaceholderText}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl flex flex-col space-y-4">
             <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 text-center">Summarize</h3>
            <LanguageSelector
              label="Summary Language:"
              selectedLanguage={summaryLanguage}
              onSelectLanguage={setSummaryLanguage}
              disabled={commonSettingsDisabled}
            />
            <ActionIcon
              IconComponent={FileText}
              label="Summarize Text"
              tooltip="Generate a summary of the transcribed text"
              onClick={handleSummarize}
              disabled={!canProcessText || isLoadingSummary}
              isLoading={isLoadingSummary}
              iconClassName="text-sky-600 dark:text-sky-400 w-10 h-10 sm:w-12 sm:h-12"
              textClassName="text-sky-700 dark:text-sky-300"
            />
            <ResultDisplay
              text={summary}
              isLoading={isLoadingSummary}
              placeholder="Summary will appear here..."
              small
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl flex flex-col space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 text-center">Translate</h3>
            <LanguageSelector
              label="Target Language:"
              selectedLanguage={targetLanguage}
              onSelectLanguage={setTargetLanguage}
              disabled={commonSettingsDisabled}
            />
            <ActionIcon
              IconComponent={Languages}
              label="Translate Text"
              tooltip="Translate the transcribed text"
              onClick={handleTranslate}
              disabled={!canProcessText || isLoadingTranslation}
              isLoading={isLoadingTranslation}
              iconClassName="text-purple-600 dark:text-purple-400 w-10 h-10 sm:w-12 sm:h-12"
              textClassName="text-purple-700 dark:text-purple-300"
            />
            <ResultDisplay
              text={translatedText}
              isLoading={isLoadingTranslation}
              placeholder="Translation will appear here..."
              small
            />
          </div>
        </div>
      </main>

      <div className="w-full max-w-4xl mt-8 p-4 bg-blue-50 dark:bg-sky-900 border border-blue-200 dark:border-sky-700 rounded-lg text-center">
        <div className="flex items-center justify-center text-blue-600 dark:text-sky-300">
          {/* Icon removed from here */}
          <p className="text-sm">
            VoiceNote AI utilizes advanced artificial intelligence. While powerful, AI can make mistakes or generate inaccurate information. Please review important results carefully.
          </p>
        </div>
      </div>
      
      <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} VoiceNote AI. Powered by AI & Web Speech API.</p>
      </footer>
    </div>
  );
};

export default App;
