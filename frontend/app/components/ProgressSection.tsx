'use client';

// No auto-scroll imports needed - user controls all scrolling manually

interface LogEntry {
  type: string;
  message: string;
  timestamp: string;
}

interface ProgressSectionProps {
  progress: number;
  progressMessage: string;
  logEntries: LogEntry[];
}

export default function ProgressSection({
  progress,
  progressMessage,
  logEntries,
}: ProgressSectionProps) {
  // No auto-scroll - user controls all scrolling manually

  const getLogEntryColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800';
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border-2 border-cyan-100 dark:border-cyan-900/50 overflow-hidden transition-colors">
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analysis Progress
          </h3>
          <div className="text-sm font-semibold bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent">
            {Math.round(progress)}%
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-600 dark:via-blue-700 dark:to-purple-700 h-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <p className="text-center mt-3 text-gray-600 dark:text-gray-300 font-medium">
            {progressMessage || 'Processing...'}
          </p>
        </div>

        {/* Stream Log */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            {logEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="animate-pulse-slow">Waiting for updates...</div>
              </div>
            ) : (
              logEntries.map((entry, index) => (
                <div
                  key={index}
                  className={`animate-slide-in p-3 rounded-lg border ${getLogEntryColor(entry.type)} flex items-start gap-3`}
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-xs font-bold">
                    {getLogIcon(entry.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{entry.timestamp}</span>
                    </div>
                    <p className="text-sm font-medium break-words">{entry.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
