import 'regenerator-runtime/runtime'; 
import { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './App.css';

const PaginaVoz: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.error("El navegador no soporta reconocimiento de voz.");
    }
  }, [browserSupportsSpeechRecognition]);

  const handleStartListening = () => {
    SpeechRecognition.startListening({ continuous: true });
    setIsListening(true);
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
    setIsListening(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleAddText = () => {
    setOutputText((prevText) => prevText + inputText + ' ');
    setInputText('');
  };

  const handleReset = () => {
    resetTranscript();
    setInputText('');
    setOutputText('');
  };

  return (
    <div className="speech-container">
      {browserSupportsSpeechRecognition ? (
        <>
          <h2>Reconocimiento de Voz</h2>
          <p>Micrófono: {listening ? 'Activado' : 'Desactivado'}</p>
          <div className="button-group">
            <button onClick={handleStartListening} disabled={isListening}>Iniciar</button>
            <button onClick={handleStopListening} disabled={!isListening}>Detener</button>
            <button onClick={handleReset}>Reiniciar</button>
          </div>

          <input 
            type="text" 
            value={inputText} 
            onChange={handleInputChange} 
            placeholder="Escribe aquí..." 
            className="text-input"
          />
          <button onClick={handleAddText}>Añadir Texto</button>

          <p className="output-text">{outputText} {transcript}</p> 
        </>
      ) : (
        <p>El navegador no soporta reconocimiento de voz.</p>
      )}
    </div>
  );
};

export default PaginaVoz;
