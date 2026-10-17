import React, { useState } from 'react';
import {
  Tv,
  Smartphone,
  Laptop,
  Copy,
  Check,
  RefreshCw,
  Share2,
  Download,
  Upload,
  ArrowRight,
  ShieldCheck,
  Radio,
  X,
} from 'lucide-react';
import { UserProfile, DeviceSession, Show } from '../types';
import { exportSyncPayload, importSyncPayload } from '../utils/storage';

interface DeviceSyncModalProps {
  profile: UserProfile;
  shows: Show[];
  activeSessions: DeviceSession[];
  onClose: () => void;
  onSwitchSimulatedDevice: (deviceType: 'tv' | 'mobile' | 'laptop', deviceName: string) => void;
  onRefreshSync: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({
  profile,
  shows,
  activeSessions,
  onClose,
  onSwitchSimulatedDevice,
  onRefreshSync,
  onProfileUpdated,
}) => {
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(profile.syncToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleExportBackup = () => {
    const payload = exportSyncPayload();
    navigator.clipboard.writeText(payload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleImport = () => {
    if (!importCode.trim()) return;
    const success = importSyncPayload(importCode);
    if (success) {
      setImportStatus('Sync state restored successfully! Refreshing...');
      setTimeout(() => {
        onRefreshSync();
        onClose();
      }, 1000);
    } else {
      setImportStatus('Invalid sync code format. Please check and try again.');
    }
  };

  const getDeviceIcon = (type: 'tv' | 'mobile' | 'laptop') => {
    switch (type) {
      case 'tv':
        return <Tv className="w-5 h-5 text-indigo-400" />;
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-emerald-400" />;
      default:
        return <Laptop className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="relative w-full max-w-2xl bg-[#181822] rounded-2xl border border-neutral-700/80 shadow-2xl p-6 text-white flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">
                Cross-Device Cloud Sync
              </h2>
              <p className="text-xs text-neutral-400">
                Seamlessly resume frame progress, watchlist, and custom shows across all your devices
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Pairing Token */}
        <div className="bg-[#12121a] p-4 rounded-xl border border-neutral-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>Your Unique Device Pairing Code:</span>
            </span>
            <span className="text-[11px] font-mono text-green-400 bg-green-950/60 border border-green-500/30 px-2 py-0.5 rounded">
              ● Live Sync Active
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-black/60 border border-neutral-700 rounded-lg px-3.5 py-2.5 font-mono text-base font-bold text-white tracking-widest text-center select-all">
              {profile.syncToken}
            </div>
            <button
              type="button"
              onClick={handleCopyToken}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-red-600/30 cursor-pointer"
            >
              {copiedToken ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedToken ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Live Device Simulator Switcher */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Active Paired Devices ({activeSessions.length})
            </h3>
            <span className="text-[11px] text-neutral-500">
              Click any device to switch and test instant sync
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeSessions.map((session) => {
              const isCurrent = profile.deviceType === session.type;

              return (
                <div
                  key={session.id}
                  onClick={() => onSwitchSimulatedDevice(session.type, session.name)}
                  className={`flex flex-col gap-2 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-neutral-800/90 border-red-500 shadow-lg shadow-red-950/40 ring-1 ring-red-500'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(session.type)}
                      <span className="text-xs font-bold text-white truncate max-w-[120px]">
                        {session.name.replace(' (Current)', '')}
                      </span>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-neutral-400">
                    <span className="block truncate">
                      {session.currentShowTitle || 'Browsing catalog'}
                    </span>
                    <span className="text-[10px] text-neutral-500">{session.lastActive}</span>
                  </div>

                  {session.currentProgress !== undefined && (
                    <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-red-500 h-full"
                        style={{ width: `${session.currentProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Export / Import Backup Code */}
        <div className="bg-[#12121a] p-4 rounded-xl border border-neutral-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export or Restore Cross-Device Sync State</span>
            </span>
            <button
              type="button"
              onClick={handleExportBackup}
              className="text-xs text-neutral-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
              {copiedPayload ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPayload ? 'Export Copied!' : 'Export Sync Payload'}</span>
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste exported sync code from another device here..."
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              className="flex-1 bg-black/60 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 font-mono"
            />
            <button
              type="button"
              onClick={handleImport}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-lg text-xs font-bold text-white transition-colors"
            >
              Import
            </button>
          </div>

          {importStatus && (
            <p
              className={`text-xs ${
                importStatus.includes('success') ? 'text-green-400' : 'text-amber-400'
              }`}
            >
              {importStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
