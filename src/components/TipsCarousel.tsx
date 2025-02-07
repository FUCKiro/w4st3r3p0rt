import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Tip {
  title: string;
  content: string;
  icon: string;
}

const tips: Tip[] = [
  {
    title: "Riduci gli Sprechi",
    content: "Scegli contenitori riutilizzabili e riduci l'uso di prodotti usa e getta nella vita quotidiana",
    icon: "♻️"
  },
  {
    title: "Ricicla Correttamente",
    content: "Separa carta, plastica, vetro e organico. La corretta differenziazione trasforma i rifiuti in risorse",
    icon: "🗑️"
  },
  {
    title: "Riusa in Modo Creativo",
    content: "Prima di buttare, pensa al riuso creativo o alla donazione. Dai una seconda vita agli oggetti",
    icon: "🎨"
  },
  {
    title: "Compostaggio",
    content: "Trasforma gli scarti organici in prezioso compost per il tuo giardino e le tue piante",
    icon: "🌱"
  },
  {
    title: "Acquisti Consapevoli",
    content: "Preferisci prodotti con meno imballaggi e materiali facilmente riciclabili",
    icon: "🛍️"
  }
];

export function TipsCarousel() {
  const [currentTip, setCurrentTip] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (isAutoPlaying) {
      const timer = setInterval(() => {
        setCurrentTip((prev) => (prev + 1) % tips.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [isAutoPlaying]);

  const nextTip = () => {
    setIsAutoPlaying(false);
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setIsAutoPlaying(false);
    setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length);
  };

  return (
    <div className="fixed bottom-1 left-1/2 transform -translate-x-1/2 w-full max-w-sm px-4 z-[1000]">
      <div className="bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg p-1.5 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <div className="flex items-center justify-between">
            <button
              onClick={prevTip}
              className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              aria-label="Consiglio precedente"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="flex-1 text-center px-3 min-h-[50px] flex items-center">
              <div className="flex-shrink-0 mr-3">
                <span className="bg-gray-50 dark:bg-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">
                  {tips[currentTip].icon}
                </span>
              </div>
              <div className="text-left flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white text-xs truncate">
                  {tips[currentTip].title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-tight line-clamp-2">
                  {tips[currentTip].content}
                </p>
              </div>
            </div>
            
            <button
              onClick={nextTip}
              className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              aria-label="Prossimo consiglio"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Indicatori */}
          <div className="flex justify-center mt-0.5 space-x-1">
            {tips.map((_, index) => (
              <div
                key={index}
                className={`w-1 h-1 rounded-full transition-colors ${
                  index === currentTip
                    ? 'bg-green-600 dark:bg-green-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}