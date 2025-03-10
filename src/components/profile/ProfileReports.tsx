import { WasteReport } from '../../lib/supabase';
import { wasteTypes, wasteSizes } from '../../lib/constants';

interface ProfileReportsProps {
  reports: WasteReport[];
}

export function ProfileReports({ reports }: ProfileReportsProps) {
  return (
    <div className="space-y-4">
      {reports && reports.length > 0 ? (
        reports.map((report) => (
          <div
            key={report.id}
            className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium dark:text-white">
                {wasteTypes[report.waste_type]}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                report.status === 'new' ? 'bg-blue-100 text-blue-800' :
                report.status === 'verified' ? 'bg-yellow-100 text-yellow-800' :
                report.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {report.status === 'new' ? 'Nuovo' :
                 report.status === 'verified' ? 'Verificato' :
                 report.status === 'in_progress' ? 'In Corso' :
                 report.status === 'resolved' ? 'Risolto' :
                 'Archiviato'}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Dimensione: {wasteSizes[report.size]}</p>
              {report.notes && (
                <p>Note: {report.notes}</p>
              )}
              <p>Data: {new Date(report.created_at).toLocaleDateString('it-IT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          Non hai ancora effettuato nessuna segnalazione
        </div>
      )}
    </div>
  );
}