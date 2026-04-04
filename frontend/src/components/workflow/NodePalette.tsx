import { Zap, Play, GitBranch, Send, Clock, Database, Mail, Code, Webhook, GripVertical } from 'lucide-react';

interface NodeTemplate {
  type: string;
  category: 'trigger' | 'action' | 'condition' | 'output';
  label: string;
  icon: string;
  description: string;
}

const nodeTemplates: NodeTemplate[] = [
  { type: 'webhook-trigger', category: 'trigger', label: 'Webhook', icon: 'webhook', description: 'Start on HTTP request' },
  { type: 'timer-trigger', category: 'trigger', label: 'Schedule', icon: 'timer', description: 'Run on a schedule' },
  { type: 'event-trigger', category: 'trigger', label: 'Event', icon: 'trigger', description: 'Listen for events' },
  { type: 'code-action', category: 'action', label: 'Run Code', icon: 'code', description: 'Execute custom code' },
  { type: 'api-action', category: 'action', label: 'HTTP Request', icon: 'webhook', description: 'Call an external API' },
  { type: 'db-action', category: 'action', label: 'Database', icon: 'database', description: 'Query a database' },
  { type: 'email-action', category: 'action', label: 'Send Email', icon: 'email', description: 'Send an email' },
  { type: 'condition-node', category: 'condition', label: 'If / Else', icon: 'condition', description: 'Branch on condition' },
  { type: 'output-node', category: 'output', label: 'Response', icon: 'output', description: 'Return a response' },
];

const iconMap: Record<string, React.ElementType> = {
  trigger: Zap, webhook: Webhook, timer: Clock, code: Code,
  database: Database, email: Mail, condition: GitBranch, output: Send, action: Play,
};

const colorMap: Record<string, string> = {
  trigger: 'var(--node-trigger)',
  action: 'var(--node-action)',
  condition: 'var(--node-condition)',
  output: 'var(--node-output)',
};

const categoryLabels: Record<string, string> = {
  trigger: 'Triggers',
  action: 'Actions',
  condition: 'Logic',
  output: 'Output',
};

const NodePalette = () => {
  const grouped = nodeTemplates.reduce((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {} as Record<string, NodeTemplate[]>);

  const onDragStart = (event: React.DragEvent, template: NodeTemplate) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(template));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-sidebar border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-bold text-foreground font-heading tracking-wide uppercase">
          Nodes
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Drag to canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {Object.entries(grouped).map(([category, templates]) => (
          <div key={category}>
            <h3
              className="text-[10px] font-semibold uppercase tracking-widest mb-2 px-1"
              style={{ color: `hsl(${colorMap[category]})` }}
            >
              {categoryLabels[category]}
            </h3>
            <div className="space-y-1.5">
              {templates.map((t) => {
                const Icon = iconMap[t.icon] || Play;
                return (
                  <div
                    key={t.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, t)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-card border border-border
                      cursor-grab active:cursor-grabbing hover:border-primary/40
                      transition-all duration-150 group"
                  >
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    <div
                      className="flex items-center justify-center w-6 h-6 rounded"
                      style={{ backgroundColor: `hsl(${colorMap[t.category]} / 0.12)` }}
                    >
                      <Icon
                        className="w-3.5 h-3.5"
                        style={{ color: `hsl(${colorMap[t.category]})` }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{t.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{t.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodePalette;
