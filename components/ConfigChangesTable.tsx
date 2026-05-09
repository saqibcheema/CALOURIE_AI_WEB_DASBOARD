const MOCK_CONFIG_CHANGES = [
  { date: '2026-05-10', key: 'gemini_model_name', oldValue: 'gemini-1.5-flash', newValue: 'gemini-1.5-pro' },
  { date: '2026-05-09', key: 'maintenance_mode', oldValue: 'false', newValue: 'true' },
  { date: '2026-05-09', key: 'groq_temperature', oldValue: '0.7', newValue: '0.5' },
  { date: '2026-05-08', key: 'enable_barcode_scan', oldValue: 'false', newValue: 'true' },
  { date: '2026-05-07', key: 'minimum_app_version', oldValue: '1.0.0', newValue: '1.1.0' },
];

export function ConfigChangesTable() {
  return (
    <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700">Recent Config Changes</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Key Changed</th>
              <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Old Value</th>
              <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">New Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_CONFIG_CHANGES.map((change, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{change.date}</td>
                <td className="px-6 py-4 font-mono text-xs text-arctic-700 whitespace-nowrap">{change.key}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">{change.oldValue}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-700 whitespace-nowrap">{change.newValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
