import { useState } from 'react';
import { FolderOpen, Trash2, Clock, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SavedWorkflow } from '@/hooks/useWorkflowStore';

interface WorkflowManagerProps {
  workflows: SavedWorkflow[];
  activeId: string | null;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const WorkflowManager = ({ workflows, activeId, onLoad, onDelete, onClose }: WorkflowManagerProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-2xl shadow-black/50 w-[480px] max-h-[70vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold font-heading text-foreground">Saved Workflows</h2>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3">
          {workflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No saved workflows yet</p>
              <p className="text-xs mt-1">Save your current workflow to see it here</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {workflows.map((wf) => {
                const isActive = wf.id === activeId;
                const date = new Date(wf.updatedAt);
                const timeStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                return (
                  <div
                    key={wf.id}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-md border transition-colors cursor-pointer group
                      ${isActive ? 'border-primary/40 bg-primary/5' : 'border-transparent hover:bg-muted/50'}`}
                    onClick={() => onLoad(wf.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{wf.name}</p>
                        {isActive && (
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-muted-foreground/60" />
                        <span className="text-[10px] text-muted-foreground">{timeStr}</span>
                        <span className="text-[10px] text-muted-foreground/50">·</span>
                        <span className="text-[10px] text-muted-foreground">{wf.nodes.length} nodes</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); onDelete(wf.id); }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowManager;
