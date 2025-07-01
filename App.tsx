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
    <>
      <div className="min-h-screen flex flex-col items-center justify-center main-container p-4 sm:p-6 lg:p-8 relative">
        {/* Bottone impostazioni in alto a destra */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="icon-button absolute top-8 right-8 z-20"
          aria-label="Impostazioni"
        >
          <span className="material-icons text-3xl">settings_applications</span>
        </button>
        <div className="w-full max-w-6xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-center mb-10 md:mb-12 text-center sm:text-left">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-main tracking-tight">
                VoiceNote <span className="text-accent">AI</span>
              </h1>
            </div>
          </header>
          <main className="space-y-8">
            {/* Inizia Trascrizione Live */}
            <div className="card">
              <div className="flex items-center mb-4">
                <span className="material-icons text-3xl text-accent mr-3">mic_none</span>
                <h2 className="text-2xl font-semibold text-main">Inizia trascrizione live</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2" htmlFor="language-select-lingua-di-registrazione">Lingua di registrazione:</label>
                  <LanguageSelector
                    selectedLanguage={inputLanguage}
                    onSelectLanguage={setInputLanguage}
                    disabled={commonSettingsDisabled}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2" htmlFor="speaker-count-select">Numero di parlanti:</label>
                  <SpeakerSelector
                    value={numberOfSpeakers}
                    onChange={setNumberOfSpeakers}
                    disabled={commonSettingsDisabled}
                  />
                </div>
              </div>
              <AudioController
                isRecording={isRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecordingAndDiarize}
                onTranscriptChange={handleTranscriptChange}
                onUnsupported={setSpeechApiUnsupported}
                speechLang={speechRecognitionLangCode}
                disabled={audioControllerDisabled}
                className="w-auto px-4 py-2 text-base rounded-md bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-150"
              />
            </div>
            {/* Trascrizione */}
            <div className="card">
              <div className="flex items-center mb-3">
                <span className="material-icons text-3xl text-accent mr-3">description</span>
                <h2 className="text-2xl font-semibold text-main">Trascrizione</h2>
              </div>
              <p className="text-sm text-secondary mb-4">L'audio trascritto apparirà qui...</p>
              <ResultDisplay
                title={undefined}
                text={transcriptionResultText + (interimTranscript ? ` ${interimTranscript}` : '')}
                isLoading={isDiarizing || (isRecording && !interimTranscript && !transcribedText && !diarizedText)}
                placeholder="La trascrizione apparirà qui..."
                small={false}
              />
            </div>
            {/* Riassumi e Traduci */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Riassumi Testo */}
              <div className="card flex flex-col h-full min-h-[340px]">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-3xl text-sky-400 mr-3">article</span>
                  <h2 className="text-2xl font-semibold text-main">Riassumi testo</h2>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-secondary mb-2" htmlFor="summary-language">Lingua del riassunto:</label>
                  <LanguageSelector
                    label="Lingua del riassunto:"
                    selectedLanguage={summaryLanguage}
                    onSelectLanguage={setSummaryLanguage}
                    disabled={commonSettingsDisabled}
                  />
                </div>
                <div className="feature-icon-container mb-6">
                  <ActionIcon
                    IconComponent={FileText}
                    label="Genera riassunto"
                    tooltip="Genera un riassunto del testo trascritto"
                    onClick={handleSummarize}
                    disabled={!canProcessText || isLoadingSummary}
                    isLoading={isLoadingSummary}
                    iconClassName="text-sky-400 text-6xl mb-2"
                    textClassName="text-secondary font-medium"
                  />
                </div>
                <ResultDisplay
                  text={summary}
                  isLoading={isLoadingSummary}
                  placeholder="Il riassunto apparirà qui..."
                  small={true}
                />
              </div>
              {/* Traduci Testo */}
              <div className="card flex flex-col h-full min-h-[340px]">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-3xl text-purple-400 mr-3">g_translate</span>
                  <h2 className="text-2xl font-semibold text-main">Traduci testo</h2>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-secondary mb-2" htmlFor="target-language">Lingua di destinazione:</label>
                  <LanguageSelector
                    label="Lingua di destinazione:"
                    selectedLanguage={targetLanguage}
                    onSelectLanguage={setTargetLanguage}
                    disabled={commonSettingsDisabled}
                  />
                </div>
                <div className="feature-icon-container mb-6">
                  <ActionIcon
                    IconComponent={Languages}
                    label="Genera traduzione"
                    tooltip="Genera la traduzione del testo trascritto"
                    onClick={handleTranslate}
                    disabled={!canProcessText || isLoadingTranslation}
                    isLoading={isLoadingTranslation}
                    iconClassName="text-purple-400 text-6xl mb-2"
                    textClassName="text-secondary font-medium"
                  />
                </div>
                <ResultDisplay
                  text={translatedText}
                  isLoading={isLoadingTranslation}
                  placeholder="La traduzione apparirà qui..."
                  small={true}
                />
              </div>
            </div>
            {/* Info box */}
            <div className="bg-blue-900/70 border border-blue-700 text-blue-100 text-sm p-6 rounded-lg shadow-lg flex items-start space-x-3">
              <span className="material-icons text-xl text-blue-300 mt-0.5">info_outline</span>
              <p>VoiceNote AI utilizza intelligenza artificiale avanzata. Sebbene potente, l'IA può commettere errori o generare informazioni imprecise. Si prega di rivedere attentamente i risultati importanti.</p>
            </div>
          </main>
          <footer className="text-center mt-16 mb-6">
            <p className="text-sm text-secondary">© 2025 VoiceNote AI. Realizzato con Intelligenza Artificiale e Web Speech API.</p>
            <p className="text-xs text-slate-500 mt-1">Innovazione al servizio della tua voce.</p>
          </footer>
        </div>
      </div>
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isRecording={commonSettingsDisabled}
        apiKeyMissing={apiKeyMissing}
        speechApiUnsupported={!!speechApiUnsupported}
      />
    </>
  );
};

export default App;
