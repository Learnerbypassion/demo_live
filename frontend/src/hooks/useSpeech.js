/**
 * useSpeech — Multilingual ASR / TTS hook for MediKiosk
 *
 * Priority chain:
 *   1. Client In-Memory Cache (0ms instant playback for already generated audio)
 *   2. Server Persistent Cache (backend/audio_cache, <10ms instant response)
 *   3. Sarvam AI (https://api.sarvam.ai) / Bhashini — backend proxy at /api/bhasini
 *   4. Web Speech API fallback (browser built-in)
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { md5 } from '../utils/md5';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const LANGUAGE_CODES = {
  'English':  'en-IN',
  'Hindi':    'hi-IN',
  'Tamil':    'ta-IN',
  'Bengali':  'bn-IN',
  'Marathi':  'mr-IN',
  'Telugu':   'te-IN',
  'Kannada':  'kn-IN',
  'Gujarati': 'gu-IN',
};

const SARVAM_LANG_CODE = {
  'English':   'en-IN',
  'Hindi':     'hi-IN',
  'Tamil':     'ta-IN',
  'Bengali':   'bn-IN',
  'Marathi':   'mr-IN',
  'Telugu':    'te-IN',
  'Kannada':   'kn-IN',
  'Gujarati':  'gu-IN',
  'Malayalam': 'ml-IN',
  'Punjabi':   'pa-IN',
  'Odia':      'od-IN',
};

const SARVAM_VOICE_BY_LANG = {
  'bn-IN': 'suhani',
  'hi-IN': 'roopa',
  'ta-IN': 'gokul',
  'te-IN': 'kavitha',
  'mr-IN': 'ishita',
  'gu-IN': 'pooja',
  'kn-IN': 'kavitha',
  'ml-IN': 'roopa',
  'pa-IN': 'anand',
  'od-IN': 'roopa',
  'en-IN': 'roopa',
};

function isSensitiveClinicalContent(text) {
  if (!text || typeof text !== 'string') return false;
  if (/\b\d{10}\b/.test(text)) return true;
  if (/\b\d{14}\b/.test(text) || /\b\d{2}-\d{4}-\d{4}-\d{4}\b/.test(text)) return true;
  if (/\b(prescription|dosage|tablet|capsule|mg\b|mcg\b|ml\b|patient name|dr\.)/i.test(text)) return true;
  return false;
}

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_CODES);

const BHASINI_LANG_NAME = {
  'English':  'English',
  'Hindi':    'Hindi',
  'Tamil':    'Tamil',
  'Bengali':  'Bengali',
  'Marathi':  'Marathi',
  'Telugu':   'Telugu',
  'Kannada':  'Kannada',
  'Gujarati': 'Gujarati',
};

// Client-side in-memory cache for 0ms instant playback across language switches
const clientAudioCache = new Map(); // key -> blobUrl

async function checkBhasiniAvailable() {
  try {
    const res = await fetch(`${API_BASE}/bhasini/status`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { available: false, provider: 'none' };
    const data = await res.json();
    return { available: !!data.available, provider: data.provider || 'none', label: data.label || '' };
  } catch {
    return { available: false, provider: 'none' };
  }
}

export function useSpeech() {
  const [isListening, setIsListening]         = useState(false);
  const [isSpeaking, setIsSpeaking]           = useState(false);
  const [isVoiceLoading, setIsVoiceLoading]   = useState(false);
  const [voiceLoadingText, setVoiceLoadingText] = useState('');
  const [bhasiniAvailable, setBhasiniAvailable] = useState(false);
  const [voiceProvider, setVoiceProvider]       = useState('none');

  const recognitionRef     = useRef(null);
  const audioRef           = useRef(null);
  const abortControllerRef = useRef(null);
  const speechSequenceRef  = useRef(0);

  const isSupported = {
    tts: typeof window !== 'undefined' && 'speechSynthesis' in window,
    asr: typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
  };

  // Check Bhasini / Sarvam availability once on mount
  useEffect(() => {
    checkBhasiniAvailable().then(info => {
      setBhasiniAvailable(info.available);
      setVoiceProvider(info.provider);
    }).catch(() => {
      setBhasiniAvailable(false);
      setVoiceProvider('none');
    });
  }, []);

  // ---- Instant Stop --------------------------------------------------------
  const stopSpeaking = useCallback(() => {
    // Invalidate sequence so in-flight fetch is dropped
    speechSequenceRef.current++;
    if (abortControllerRef.current) {
      try { abortControllerRef.current.abort(); } catch (_) {}
      abortControllerRef.current = null;
    }

    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (_) {}
      audioRef.current = null;
    }

    if (isSupported.tts && typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }

    setIsSpeaking(false);
    setIsVoiceLoading(false);
    setVoiceLoadingText('');
  }, [isSupported.tts]);

  // ---- TTS ----------------------------------------------------------------
  const speakViaBhasini = useCallback(async (text, lang, currentSeq) => {
    const targetLang = SARVAM_LANG_CODE[lang] || 'hi-IN';
    const activeSpeaker = SARVAM_VOICE_BY_LANG[targetLang] || 'roopa';
    const cacheKey = `${lang}::${activeSpeaker}::${text.trim()}`;
    const hash = md5(cacheKey);

    // 1. Instant Client In-Memory Playback (0ms delay!)
    if (clientAudioCache.has(cacheKey)) {
      const cachedUrl = clientAudioCache.get(cacheKey);
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch (_) {}
      }
      const audio = new Audio(cachedUrl);
      audioRef.current = audio;

      setIsVoiceLoading(false);
      setVoiceLoadingText('');
      setIsSpeaking(true);

      audio.onended = () => {
        if (speechSequenceRef.current === currentSeq) setIsSpeaking(false);
      };
      audio.onerror = () => {
        if (speechSequenceRef.current === currentSeq) setIsSpeaking(false);
      };

      await audio.play().catch(() => {});
      return true;
    }

    // 2. Static Asset Cache Check (/audio_cache/<hash>.json deployed with frontend)
    try {
      const baseUrl = import.meta.env.BASE_URL ? import.meta.env.BASE_URL.replace(/\/$/, '') : '';
      const staticUrl = `${baseUrl}/audio_cache/${hash}.json`;
      const staticResp = await fetch(staticUrl).catch(() => null);
      if (staticResp && staticResp.ok) {
        const staticData = await staticResp.json().catch(() => null);
        if (staticData && staticData.audioContent && currentSeq === speechSequenceRef.current) {
          const binary = atob(staticData.audioContent);
          const bytes  = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], { type: 'audio/wav' });
          const url  = URL.createObjectURL(blob);
          clientAudioCache.set(cacheKey, url);

          if (audioRef.current) {
            try { audioRef.current.pause(); } catch (_) {}
          }
          const audio = new Audio(url);
          audioRef.current = audio;

          setIsVoiceLoading(false);
          setVoiceLoadingText('');
          setIsSpeaking(true);

          audio.onended = () => {
            if (speechSequenceRef.current === currentSeq) setIsSpeaking(false);
          };
          audio.onerror = () => {
            if (speechSequenceRef.current === currentSeq) setIsSpeaking(false);
          };

          await audio.play().catch(() => {});
          return true;
        }
      }
    } catch (_) {}

    // 3. Audio Privacy Guard: Never send sensitive patient information to external TTS API
    if (isSensitiveClinicalContent(text)) {
      return false; // Fallback to local Web Speech API
    }

    // 4. Fetch dynamically from backend TTS API (Sarvam / Bhashini proxy)
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setIsVoiceLoading(true);
      setVoiceLoadingText(`Loading ${lang} voice...`);

      const token = localStorage.getItem('medikiosk_token');
      const resp = await fetch(`${API_BASE}/bhasini/tts`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text, language: BHASINI_LANG_NAME[lang] || lang }),
        signal: controller.signal,
      });

      if (currentSeq !== speechSequenceRef.current) {
        return false;
      }

      if (!resp.ok) return false;
      const data = await resp.json();
      if (!data.audioContent || data.fallback) return false;

      if (currentSeq !== speechSequenceRef.current) {
        return false;
      }

      // Decode base64 WAV into Blob URL
      const binary = atob(data.audioContent);
      const bytes  = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'audio/wav' });
      const url  = URL.createObjectURL(blob);

      // Save into client cache for instant re-use
      clientAudioCache.set(cacheKey, url);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      setIsVoiceLoading(false);
      setVoiceLoadingText('');
      setIsSpeaking(true);

      audio.onended = () => {
        if (speechSequenceRef.current === currentSeq) setIsSpeaking(false);
      };
      audio.onerror = () => {
        if (speechSequenceRef.current === currentSeq) setIsSpeaking(false);
      };

      await audio.play().catch(() => {});
      return true;
    } catch (err) {
      if (err.name === 'AbortError') return false;
      return false;
    } finally {
      if (speechSequenceRef.current === currentSeq) {
        setIsVoiceLoading(false);
        setVoiceLoadingText('');
      }
    }
  }, []);

  const speakViaWebSpeech = useCallback((text, lang, currentSeq) => {
    if (!isSupported.tts || !text) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance  = new SpeechSynthesisUtterance(text);
    utterance.lang   = LANGUAGE_CODES[lang] || lang;
    utterance.rate   = 0.9;
    utterance.pitch  = 1;
    utterance.onstart = () => {
      if (speechSequenceRef.current === currentSeq) {
        setIsSpeaking(true);
      }
    };
    utterance.onend = () => {
      if (speechSequenceRef.current === currentSeq) {
        setIsSpeaking(false);
      }
    };
    utterance.onerror = () => {
      if (speechSequenceRef.current === currentSeq) {
        setIsSpeaking(false);
      }
    };
    window.speechSynthesis.speak(utterance);
  }, [isSupported.tts]);

  const speak = useCallback(async (text, lang = 'English') => {
    if (!text) return;

    // Immediately stop any prior speech before starting new speech!
    stopSpeaking();

    // Assign new sequence ID to track this specific speech request
    const seq = ++speechSequenceRef.current;

    // 1. Try audio cache / Bhasini / Sarvam first
    const ok = await speakViaBhasini(text, lang, seq);
    if (ok) return;
    if (seq !== speechSequenceRef.current) return;

    // 2. Fallback to browser Web Speech API
    speakViaWebSpeech(text, lang, seq);
  }, [speakViaBhasini, speakViaWebSpeech, stopSpeaking]);

  // ---- ASR ----------------------------------------------------------------
  const startListening = useCallback((lang = 'English', onResult, onError) => {
    if (!isSupported.asr) {
      if (onError) onError(new Error('Speech recognition not supported in this browser'));
      return;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }

    stopSpeaking();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition       = new SpeechRecognition();
    recognition.lang             = LANGUAGE_CODES[lang] || lang;
    recognition.continuous       = false;
    recognition.interimResults   = false;
    recognition.maxAlternatives  = 1;

    recognition.onstart  = () => setIsListening(true);
    recognition.onend    = () => setIsListening(false);
    recognition.onerror  = (e) => {
      setIsListening(false);
      console.warn('ASR event error:', e.error);
      if (onError && e.error !== 'no-speech') onError(new Error(e.error || 'Speech recognition error'));
    };
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i]?.[0]?.transcript) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (onResult && transcript.trim()) {
        onResult(transcript.trim());
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.warn('SpeechRecognition start() error:', err);
      setIsListening(false);
      if (onError) onError(err);
    }
  }, [isSupported.asr, stopSpeaking]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return {
    speak, stopSpeaking, startListening, stopListening,
    isListening, isSpeaking, isVoiceLoading, voiceLoadingText,
    isSupported, bhasiniAvailable, voiceProvider,
  };
}
