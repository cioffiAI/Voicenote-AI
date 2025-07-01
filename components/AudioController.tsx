import React, { useEffect, useRef, useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import { ActionButton } from './ActionButton';
import { MicIcon } from './icons/MicIcon';
import { StopIcon } from './icons/StopIcon';

export interface AudioControllerHandle {
  // requestStopRecognition: () => void; // No longer needed as file uploads are removed
}

interface AudioControllerProps {
  isRecording: boolean; // Global recording state from App.tsx
  onStartRecording: () => void; // Source is always 'mic', so param removed
  onStopRecording: (finalTranscript: string) => void; // Called when recognition ends
  onTranscriptChange: (transcript: string, isFinal: boolean) => void;
  onUnsupported: (message: string) => void;
  speechLang: string;
  disabled?: boolean; // Disables the microphone button
  className?: string; // Permette di personalizzare la classe del bottone
}

export const AudioController = forwardRef<AudioControllerHandle, AudioControllerProps>(({
  isRecording,
  onStartRecording,
  onStopRecording,
  onTranscriptChange,
  onUnsupported,
  speechLang,
  disabled = false,
  className,
}, ref) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');
  const [isRecognitionInitialized, setIsRecognitionInitialized] = useState(false);
  
  const isRecordingPropRef = useRef(isRecording);
  useEffect(() => {
    isRecordingPropRef.current = isRecording;
  }, [isRecording]);

  useImperativeHandle(ref, () => ({
    // requestStopRecognition: () => {
    //   console.log("AudioController: requestStopRecognition called.");
    //   if (recognitionRef.current) {
    //     recognitionRef.current.stop();
    //   }
    // }
  }));

  useEffect(() => {
    setIsRecognitionInitialized(false);
    console.log("AudioController: Initializing SpeechRecognition API...");
    const SpeechRecognitionAPI = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.error("AudioController: SpeechRecognition API not supported.");
      onUnsupported("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    if (recognitionRef.current) {
      console.log("AudioController: Aborting previous recognition instance.");
      recognitionRef.current.abort(); 
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onstart = null;
    }
    
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = speechLang;
    recognitionRef.current = recognition;
    console.log(`AudioController: SpeechRecognition instance created. Lang: ${speechLang}`);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscriptSegment = '';
      let finalTranscriptSegment = '';
      // console.log('AudioController: onresult event:', JSON.parse(JSON.stringify(event.results))); // Detailed log

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        // console.log(`AudioController: Result part ${i}, isFinal: ${event.results[i].isFinal}, confidence: ${event.results[i][0].confidence}, transcript: "${transcriptPart}"`);
        
        if (event.results[i].isFinal) {
          finalTranscriptSegment += transcriptPart;
        } else {
          interimTranscriptSegment += transcriptPart;
        }
      }

      if (finalTranscriptSegment.trim()) {
        const segmentToAdd = finalTranscriptSegment.trimEnd() + ' '; // Ensure a space for concatenation
        accumulatedTranscriptRef.current += segmentToAdd;
        console.log('AudioController: Final segment received:', `"${finalTranscriptSegment}"`, 'Accumulated:', `"${accumulatedTranscriptRef.current}"`);
        onTranscriptChange(segmentToAdd, true); 
      }
      if (interimTranscriptSegment) {
        // console.log('AudioController: Interim segment received:', `"${interimTranscriptSegment}"`);
        onTranscriptChange(interimTranscriptSegment, false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error(`AudioController: Speech recognition error: ${event.error}, Message: ${event.message}. Accumulated transcript before error: "${accumulatedTranscriptRef.current.trim()}"`);
      let errorMessage = `Speech recognition error: ${event.error}.`;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMessage += " Please ensure microphone access is allowed.";
      } else if (event.error === 'language-not-supported') {
        errorMessage += ` Selected language (${speechLang}) might not be supported for speech recognition.`;
      } else if (event.error === 'no-speech') {
         errorMessage += " No speech detected by the recognition service. The audio might be too quiet, unclear, or not recognized as speech.";
      } else if (event.error === 'audio-capture') {
        errorMessage += " Audio capture failed. There might be an issue with the audio source or microphone hardware.";
      }
      onUnsupported(errorMessage); 
      if (recognitionRef.current) {
         console.log("AudioController: Aborting recognition due to error.");
         recognitionRef.current.abort(); 
      }
    };

    recognition.onstart = () => {
        console.log("AudioController: SpeechRecognition service started.");
    };

    recognition.onend = () => {
      const finalTranscriptToReport = accumulatedTranscriptRef.current.trim();
      console.log(`AudioController: SpeechRecognition service ended. isRecordingPropRef.current: ${isRecordingPropRef.current}, Final Accumulated Transcript: "${finalTranscriptToReport}"`);
      if (isRecordingPropRef.current) { // Only call onStopRecording if it was actually recording (as per App.tsx state)
        onStopRecording(finalTranscriptToReport);
      }
    };
    
    setIsRecognitionInitialized(true);
    console.log("AudioController: SpeechRecognition initialized.");

    return () => {
      if (recognitionRef.current) {
        console.log("AudioController: Cleaning up SpeechRecognition instance.");
        recognitionRef.current.abort(); 
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onstart = null;
      }
      setIsRecognitionInitialized(false);
      console.log("AudioController: SpeechRecognition de-initialized.");
    };
  }, [speechLang, onUnsupported, onTranscriptChange, onStopRecording]);

  useEffect(() => {
    if (isRecording) { 
      if (recognitionRef.current && isRecognitionInitialized) {
        console.log("AudioController: Global isRecording is true. Starting recognition. Current accumulated transcript will be cleared.");
        accumulatedTranscriptRef.current = ''; 
        try {
          recognitionRef.current.start();
        } catch (e: any) {
          console.error("AudioController: Error starting recognition in useEffect:", e);
          let detailedError = "Failed to start recognition service.";
          if (e.name === 'InvalidStateError') {
              detailedError = "Failed to start recognition: Service is already active or in an invalid state. Please try again or refresh.";
          } else if (e.message) {
              detailedError += ` Error: ${e.message}`;
          }
          onUnsupported(detailedError);
          // Ensure App's recording state is also reset
          if (isRecordingPropRef.current) { 
            onStopRecording(''); 
          }
        }
      } else {
        console.log("AudioController: Global isRecording is true, but recognition not ready or not initialized. Recognition not started.");
      }
    } else { 
      if (recognitionRef.current) {
        console.log("AudioController: Global isRecording is false. Stopping recognition.");
        // Check if recognition is actually running before stopping
        // This check might be too simplistic, SpeechRecognition API has no direct 'isRunning' state
        // The onend handler logic is crucial here.
        recognitionRef.current.stop(); 
      }
    }
  }, [isRecording, isRecognitionInitialized, onStopRecording, onUnsupported]);


  const handleMicButtonClick = useCallback(() => {
    if (!isRecording) { 
        console.log("AudioController: Mic button clicked to start recording.");
        onStartRecording(); 
    } else { 
        console.log("AudioController: Mic button clicked to stop recording.");
        if (recognitionRef.current) {
            recognitionRef.current.stop(); 
            // onStopRecording will be called from recognition.onend
        }
    }
  }, [isRecording, onStartRecording]);

  return (
    <ActionButton
      onClick={handleMicButtonClick}
      disabled={disabled}
      isLoading={false}
      Icon={isRecording ? StopIcon : MicIcon}
      className={className}
    >
      {isRecording ? 'Ferma registrazione' : 'Avvia registrazione'}
    </ActionButton>
  );
});

AudioController.displayName = 'AudioController';
