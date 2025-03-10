import { useState } from 'react';
import { Package, Car, Truck, Building, Trash2, Sofa, AlertTriangle, Trash, Leaf } from 'lucide-react';
import { wasteTypes, wasteSizes } from '../../lib/constants';

interface ReportFormProps {
  onSubmit: (type: number, size: number, notes: string) => void;
  onClose: () => void;
  session: any;
}

const wasteIcons = [Trash2, Sofa, AlertTriangle, Trash, Leaf];
const sizeIcons = [Package, Car, Truck, Building];

export function ReportForm({ onSubmit, onClose, session }: ReportFormProps) {
  const [selectedType, setSelectedType] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-[1000]" onClick={onClose}>
      <div 
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl shadow-lg z-[1000] report-form-panel transform transition-transform duration-300 ease-out"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <h3 className="text-base font-bold mb-3 text-gray-900 dark:text-white">Segnala Rifiuti</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tipo di Rifiuto
            </label>
            <div className="grid grid-cols-5 gap-2 waste-type-grid">
              {wasteTypes.map((type, index) => {
                const IconComponent = wasteIcons[index];
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(index)}
                    className={`flex flex-col items-center p-2 rounded-lg border mobile-button ${
                      selectedType === index
                        ? 'border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-200 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mb-0.5" />
                    <span className="text-xs text-center">{type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Dimensione
            </label>
            <div className="grid grid-cols-4 gap-2 waste-size-grid">
              {wasteSizes.map((size, index) => {
                const IconComponent = sizeIcons[index];
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(index)}
                    className={`flex flex-col items-center p-2 rounded-lg border mobile-button ${
                      selectedSize === index
                        ? 'border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-200 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mb-0.5" />
                    <span className="text-xs text-center">{size}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {(selectedType !== null && selectedSize !== null) && (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note aggiuntive..."
              className="w-full p-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-sm"
              rows={2}
            />
          )}

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded mobile-button hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={() => onSubmit(selectedType, selectedSize, notes)}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded mobile-button hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
              disabled={!session?.user}
            >
              Invia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}