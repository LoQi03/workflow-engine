import { X } from 'lucide-react';
import { Node } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface NodePropertiesProps {
  node: Node | null;
  onUpdate: (id: string, data: Record<string, any>) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const colorMap: Record<string, string> = {
  trigger: 'var(--node-trigger)',
  action: 'var(--node-action)',
  condition: 'var(--node-condition)',
  output: 'var(--node-output)',
};

const NodeProperties = ({ node, onUpdate, onClose, onDelete }: NodePropertiesProps) => {
  if (!node) return null;

  const accentColor = colorMap[node.data.type] || colorMap.action;

  const handleChange = (field: string, value: any) => {
    onUpdate(node.id, { ...node.data, [field]: value });
  };

  return (
    <div className="w-72 bg-sidebar border-l border-border flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: `hsl(${accentColor})` }}
          />
          <h2 className="text-sm font-bold text-foreground font-heading">Properties</h2>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Node ID */}
        <div className="px-2 py-1.5 rounded bg-muted">
          <span className="text-[10px] text-muted-foreground font-mono">{node.id}</span>
        </div>

        {/* Label */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Label</Label>
          <Input
            value={node.data.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="h-8 text-sm bg-card border-border focus:border-primary"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Description</Label>
          <Textarea
            value={node.data.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className="text-sm bg-card border-border focus:border-primary resize-none min-h-[60px]"
            rows={2}
          />
        </div>

        {/* Type-specific config */}
        <div className="border-t border-border pt-4 space-y-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Configuration
          </h3>

          {node.data.type === 'trigger' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Method</Label>
                <Select
                  value={node.data.method || 'POST'}
                  onValueChange={(v) => handleChange('method', v)}
                >
                  <SelectTrigger className="h-8 text-sm bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Endpoint</Label>
                <Input
                  value={node.data.endpoint || '/api/webhook'}
                  onChange={(e) => handleChange('endpoint', e.target.value)}
                  className="h-8 text-sm bg-card border-border font-mono text-xs"
                  placeholder="/api/webhook"
                />
              </div>
            </>
          )}

          {node.data.type === 'action' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Timeout (ms)</Label>
                <Input
                  type="number"
                  value={node.data.timeout || 5000}
                  onChange={(e) => handleChange('timeout', Number(e.target.value))}
                  className="h-8 text-sm bg-card border-border font-mono"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Retry on failure</Label>
                <Switch
                  checked={node.data.retry || false}
                  onCheckedChange={(v) => handleChange('retry', v)}
                />
              </div>
              {node.data.retry && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Max retries</Label>
                  <Input
                    type="number"
                    value={node.data.maxRetries || 3}
                    onChange={(e) => handleChange('maxRetries', Number(e.target.value))}
                    className="h-8 text-sm bg-card border-border font-mono"
                  />
                </div>
              )}
            </>
          )}

          {node.data.type === 'condition' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Expression</Label>
                <Textarea
                  value={node.data.expression || ''}
                  onChange={(e) => handleChange('expression', e.target.value)}
                  className="text-xs bg-card border-border font-mono resize-none min-h-[70px]"
                  placeholder="data.status === 'valid'"
                  rows={3}
                />
              </div>
            </>
          )}

          {node.data.type === 'output' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Status Code</Label>
                <Input
                  type="number"
                  value={node.data.statusCode || 200}
                  onChange={(e) => handleChange('statusCode', Number(e.target.value))}
                  className="h-8 text-sm bg-card border-border font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Response Body</Label>
                <Textarea
                  value={node.data.responseBody || ''}
                  onChange={(e) => handleChange('responseBody', e.target.value)}
                  className="text-xs bg-card border-border font-mono resize-none min-h-[70px]"
                  placeholder='{ "success": true }'
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        {/* Danger zone */}
        <div className="border-t border-border pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
            onClick={() => onDelete(node.id)}
          >
            Delete Node
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NodeProperties;
