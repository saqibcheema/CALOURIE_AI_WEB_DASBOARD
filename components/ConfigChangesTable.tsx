import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import { IconHistory } from '@tabler/icons-react';

export function ConfigChangesTable() {
  const { changeHistory } = useUnsavedChanges();

  return (
    <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <IconHistory size={16} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-700">Recent Config Changes</h2>
      </div>
      <div className="overflow-x-auto">
        {changeHistory.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-slate-400">
            No changes yet. Publish a config update to see it here.
          </div>
        ) : (
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
              {changeHistory.map((change, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{change.date}</td>
                  <td className="px-6 py-4 font-mono text-xs text-arctic-700 whitespace-nowrap">{change.key}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400 whitespace-nowrap max-w-[200px] truncate">{change.oldValue || '(empty)'}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-700 whitespace-nowrap max-w-[200px] truncate">{change.newValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
