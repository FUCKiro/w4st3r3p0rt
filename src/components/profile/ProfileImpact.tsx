import { WasteReport } from '../../lib/supabase';
import { WASTE_IMPACT, SIZE_MULTIPLIER } from '../../lib/supabase';
import { wasteTypes } from '../../lib/constants';

interface ProfileImpactProps {
  reports: WasteReport[];
}

export function ProfileImpact({ reports }: ProfileImpactProps) {
  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Nessun dato sull'impatto ambientale disponibile
      </div>
    );
  }

  const totalCO2 = reports.reduce((total, report) => {
    const impact = WASTE_IMPACT[report.waste_type as keyof typeof WASTE_IMPACT];
    const multiplier = SIZE_MULTIPLIER[report.size as keyof typeof SIZE_MULTIPLIER];
    return total + (impact.avg_weight * multiplier * impact.co2_per_kg);
  }, 0);

  const totalWaste = reports.reduce((total, report) => {
    const impact = WASTE_IMPACT[report.waste_type as keyof typeof WASTE_IMPACT];
    const multiplier = SIZE_MULTIPLIER[report.size as keyof typeof SIZE_MULTIPLIER];
    return total + (impact.avg_weight * multiplier);
  }, 0);

  const wasteByType = reports.reduce((acc, report) => {
    const type = report.waste_type;
    if (!acc[type]) acc[type] = 0;
    const impact = WASTE_IMPACT[type as keyof typeof WASTE_IMPACT];
    const multiplier = SIZE_MULTIPLIER[report.size as keyof typeof SIZE_MULTIPLIER];
    acc[type] += impact.avg_weight * multiplier;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-2xl font-bold text-green-700 mb-1">
            {totalCO2.toFixed(1)} kg
          </div>
          <div className="text-sm text-green-600">
            CO₂ Risparmiata
          </div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-2xl font-bold text-green-700 mb-1">
            {totalWaste.toFixed(0)} kg
          </div>
          <div className="text-sm text-green-600">
            Rifiuti Recuperati
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
        <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Dettaglio per Tipo di Rifiuto</h3>
        <div className="space-y-3">
          {Object.entries(wasteByType).map(([type, weight]) => (
            <div key={type} className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">
                {wasteTypes[Number(type)]}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">{weight.toFixed(0)} kg</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium mb-3">Equivalente a:</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>🚗 {(totalCO2 / 2.3).toFixed(0)} km percorsi in auto</p>
          <p>🌳 {(totalCO2 / 22).toFixed(1)} alberi necessari per un anno</p>
          <p>💡 {(totalCO2 * 3.3).toFixed(0)} ore di lampada LED accesa</p>
        </div>
      </div>
    </div>
  );
}