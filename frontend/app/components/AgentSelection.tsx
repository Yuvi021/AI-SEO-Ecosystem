'use client';

import { AGENTS } from '../lib/constants';

interface AgentSelectionProps {
  selectedAgents: string[];
  onSelectionChange: (agents: string[]) => void;
  disabled?: boolean;
}

const agentIcons: Record<string, string> = {
  crawl: '🕷️',
  keyword: '🔑',
  content: '📝',
  schema: '📋',
  technical: '⚙️',
  meta: '🏷️',
  image: '🖼️',
  validation: '✅',
  report: '📊',
};

export default function AgentSelection({
  selectedAgents,
  onSelectionChange,
  disabled = false,
}: AgentSelectionProps) {
  const handleToggle = (agentId: string) => {
    if (disabled) return;
    
    if (selectedAgents.includes(agentId)) {
      // Don't allow unchecking crawl agent
      if (agentId === 'crawl') return;
      onSelectionChange(selectedAgents.filter(id => id !== agentId));
    } else {
      onSelectionChange([...selectedAgents, agentId]);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onSelectionChange(AGENTS.map(agent => agent.id));
  };

  const handleDeselectAll = () => {
    if (disabled) return;
    // Always keep crawl agent
    onSelectionChange(['crawl']);
  };

  const selectedCount = selectedAgents.length;
  const totalCount = AGENTS.length;

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Select Agents to Run</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedCount} of {totalCount} agents selected
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSelectAll}
            disabled={disabled || selectedCount === totalCount}
            className="px-4 py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select All
          </button>
          <button
            onClick={handleDeselectAll}
            disabled={disabled || selectedCount === 1}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Deselect All
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {AGENTS.map((agent) => {
          const isSelected = selectedAgents.includes(agent.id);
          const isRequired = agent.id === 'crawl';
          const icon = agentIcons[agent.id] || '🔧';
          
          return (
            <div
              key={agent.id}
              onClick={() => handleToggle(agent.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all cursor-pointer
                ${isSelected
                  ? 'border-cyan-500 dark:border-cyan-600 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-sm'
                }
                ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl
                  ${isSelected ? 'bg-cyan-100 dark:bg-cyan-900/50' : 'bg-gray-100 dark:bg-gray-700'}
                `}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800 dark:text-white text-sm">{agent.name}</h4>
                    {isRequired && (
                      <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 text-xs font-medium rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{agent.description}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className={`
                    relative w-6 h-6 rounded border-2 flex items-center justify-center transition-all
                    ${isSelected 
                      ? 'border-cyan-600 dark:border-cyan-500 bg-cyan-600 dark:bg-cyan-500' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                    }
                    ${disabled && isRequired ? 'opacity-50' : ''}
                  `}>
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
