'use client';

import { useCallback, useEffect, useState } from 'react';
import { IconHistory, IconChevronDown, IconChevronUp, IconRefresh } from '@tabler/icons-react';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import { useAuthFetch } from '@/lib/useAuthFetch';
import type { ChangeLogEntry } from '@/contexts/UnsavedChangesContext';

const PREVIEW_COUNT = 5;

const KEY_COLORS: Record<string, string> = {
  maintenance_mode:      'bg-red-50 text-red-700 border-red-200',
  maintenance_message:   'bg-red-50 text-red-700 border-red-200',
  feature_flags_config:  'bg-violet-50 text-violet-700 border-violet-200',
  ai_models_config:      'bg-blue-50 text-blue-700 border-blue-200',
  api_keys_config:       'bg-amber-50 text-amber-700 border-amber-200',
  minimum_app_version:   'bg-orange-50 text-orange-700 border-orange-200',
  force_update_message:  'bg-orange-50 text-orange-700 border-orange-200',
};

function keyBadgeClass(key: string): string {
  return KEY_COLORS[key] ?? 'bg-slate-100 text-slate-600 border-slate-200';
}

function formatDate(entry: ChangeLogEntry): string {
  if (entry.timestamp) {
    return new Date(entry.timestamp).toLocaleString('en-PK', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  }
  return entry.date;
}

function truncate(val: string, len = 40): string {
  if (!val) return '(empty)';
  return val.length > len ? val.slice(0, len) + '…' : val;
}

export function ConfigChangesTable() {
  const { historyVersion } = useUnsavedChanges();
  const { fetchWithAuth } = useAuthFetch();

  const [entries, setEntries] = useState<ChangeLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth('/api/config-history');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch {
      setError('Could not load history.');
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, historyVersion]);

  const visible = showAll ? entries : entries.slice(0, PREVIEW_COUNT);
  const hasMore = entries.length > PREVIEW_COUNT;

  return (
    <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconHistory size={16} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700">Recent Config Changes</h2>
          {entries.length > 0 && (
            <span className="text-xs font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
              {entries.length}
            </span>
          )}
        </div>
        <button
          onClick={fetchHistory}
          aria-label="Refresh history"
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <IconRefresh size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="space-y-2 p-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-10 bg-slate-100 rounded-md" />
            ))}
          </div>
        ) : error ? (
          <div className="px-6 py-6 text-center text-sm text-red-500">
            {error}{' '}
            <button onClick={fetchHistory} className="underline hover:no-underline">
              Retry
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <IconHistory size={28} className="text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No changes yet.</p>
            <p className="text-xs text-slate-300 mt-0.5">Publish a config update to see it here.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">When</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">Key</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Old Value</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">New Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visible.map((change, idx) => (
                <tr key={change.id ?? idx} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                    {formatDate(change)}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`inline-block text-xs font-mono font-medium px-2 py-0.5 rounded-full border ${keyBadgeClass(change.key)}`}>
                      {change.key}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400 max-w-[180px]">
                    <span title={change.oldValue || '(empty)'}>{truncate(change.oldValue)}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-700 max-w-[180px]">
                    <span title={change.newValue}>{truncate(change.newValue)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View All / Show Less footer */}
      {!loading && !error && hasMore && (
        <div className="px-5 py-3 border-t border-slate-100 flex justify-center">
          <button
            onClick={() => setShowAll((s) => !s)}
            className="flex items-center gap-1.5 text-xs font-medium text-arctic-500 hover:text-arctic-700 transition-colors"
          >
            {showAll ? (
              <><IconChevronUp size={13} /> Show less</>
            ) : (
              <><IconChevronDown size={13} /> View all {entries.length} changes</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
