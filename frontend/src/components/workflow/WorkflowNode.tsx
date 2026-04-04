import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap, Play, GitBranch, Send, Clock, Database, Mail, Code, Webhook } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  trigger: Zap,
  action: Play,
  condition: GitBranch,
  output: Send,
  timer: Clock,
  database: Database,
  email: Mail,
  code: Code,
  webhook: Webhook,
};

const colorMap: Record<string, string> = {
  trigger: 'var(--node-trigger)',
  action: 'var(--node-action)',
  condition: 'var(--node-condition)',
  output: 'var(--node-output)',
};

interface WorkflowNodeData {
  label: string;
  type: 'trigger' | 'action' | 'condition' | 'output';
  icon?: string;
  description?: string;
}

const WorkflowNode = ({ data, selected }: NodeProps<WorkflowNodeData>) => {
  const Icon = iconMap[data.icon || data.type] || Zap;
  const accentColor = colorMap[data.type] || colorMap.action;

  return (
    <div
      className={`
        relative rounded-lg border bg-card px-4 py-3 min-w-[180px] max-w-[220px]
        transition-all duration-200 cursor-grab active:cursor-grabbing
        ${selected ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : 'shadow-md shadow-black/30 hover:shadow-lg hover:shadow-black/40'}
      `}
      style={{
        borderColor: selected ? `hsl(${accentColor})` : 'hsl(var(--border))',
      }}
    >
      {/* Accent top bar */}
      <div
        className="absolute top-0 left-3 right-3 h-[2px] rounded-b"
        style={{ backgroundColor: `hsl(${accentColor})` }}
      />

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-md"
          style={{ backgroundColor: `hsl(${accentColor} / 0.15)` }}
        >
          <Icon
            className="w-4 h-4"
            style={{ color: `hsl(${accentColor})` }}
          />
        </div>
        <span className="text-sm font-semibold text-foreground truncate font-heading">
          {data.label}
        </span>
      </div>

      {/* Description */}
      {data.description && (
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {data.description}
        </p>
      )}

      {/* Handles */}
      {data.type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!-top-[6px]"
        />
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!-bottom-[6px]"
      />
      {data.type === 'condition' && (
        <Handle
          type="source"
          position={Position.Right}
          id="false"
          className="!-right-[6px]"
        />
      )}
    </div>
  );
};

export default memo(WorkflowNode);
