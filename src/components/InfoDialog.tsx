import { X } from 'lucide-react';

interface InfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoDialog({ isOpen, onClose }: InfoDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2001] flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 z-[2002]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mt-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Informazioni su Trash Hunter
          </h3>
          
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              Trash Hunter è un'applicazione che permette di segnalare e monitorare i rifiuti abbandonati nella tua zona.
            </p>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Credits</h4>
              <ul className="space-y-2">
                <li>
                  Ideato e Sviluppato da <a 
                    href="https://fabiolarocca.dev" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                  >
                    Fabio La Rocca
                  </a>
                </li>
                <li>
                  Dati mappa © <a 
                    href="https://www.openstreetmap.org/copyright" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                  >
                    OpenStreetMap
                  </a> contributors
                </li>
                <li>
                  Centri di raccolta © <a 
                    href="https://www.amaroma.it/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                  >
                    AMA Roma S.p.A.
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Versione</h4>
              <p>Trash Hunter v1.0.0</p>
              <p className="text-sm">© 2025 Trash Hunter. Tutti i diritti riservati.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}