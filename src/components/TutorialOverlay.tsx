import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const tutorialSteps = [
  {
    title: 'Benvenuto su Waste Monitor!',
    content: 'Questa app ti aiuta a segnalare e monitorare i rifiuti abbandonati nella tua zona.',
    target: 'body'
  },
  {
    title: 'Accedi o Registrati',
    content: 'Clicca qui per accedere o creare un nuovo account.',
    target: '.profile-button'
  },
  {
    title: 'Segnala Rifiuti',
    content: 'Dopo aver effettuato l\'accesso, usa questo pulsante per segnalare nuovi rifiuti.',
    target: '.report-button'
  },
  {
    title: 'La tua Posizione',
    content: 'Usa questo pulsante per centrare la mappa sulla tua posizione.',
    target: '.recenter-button'
  },
  {
    title: 'Area di Monitoraggio',
    content: 'Il cerchio verde mostra l\'area entro la quale puoi vedere e verificare le segnalazioni.',
    target: '.leaflet-container'
  }
];

export function TutorialOverlay() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostra il tutorial solo al primo accesso
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setIsVisible(true);
      localStorage.setItem('hasSeenTutorial', 'true');
    }
  }, []);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[2001] bg-black bg-opacity-50">
      <div className="absolute inset-0 pointer-events-none">
        {/* Evidenzia l'elemento target corrente */}
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-6 rounded-t-xl shadow-lg">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-bold mb-2 dark:text-white">
            {tutorialSteps[currentStep].title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {tutorialSteps[currentStep].content}
          </p>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep 
                      ? 'bg-green-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {currentStep < tutorialSteps.length - 1 ? 'Avanti' : 'Fine'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}