import { Play, Save, Undo2, Redo2, Settings, FolderOpen, ChevronDown, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  workflowName: string;
  onSave: () => void;
  onOpenManager: () => void;
  onNewWorkflow: () => void;
}

const TopBar = ({ workflowName, onSave, onOpenManager, onNewWorkflow }: TopBarProps) => {
  return (
    <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <h1 className="text-sm font-bold font-heading text-foreground">
            FlowCraft
          </h1>
        </div>
        <span className="text-xs text-muted-foreground font-mono px-2 py-0.5 rounded bg-muted">
          v1.0
        </span>
        <div className="h-4 w-px bg-border mx-1" />
        <span className="text-xs text-foreground font-medium truncate max-w-[200px]">
          {workflowName}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onNewWorkflow} title="New Workflow">
          <FilePlus className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onOpenManager} title="Open Workflow">
          <FolderOpen className="w-4 h-4" />
        </Button>
        <div className="h-4 w-px bg-border mx-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Redo2 className="w-4 h-4" />
        </Button>
        <div className="h-4 w-px bg-border mx-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onSave} title="Save">
          <Save className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          className="h-8 ml-2 bg-primary text-primary-foreground hover:bg-primary/90 font-heading text-xs font-semibold gap-1.5"
        >
          <Play className="w-3.5 h-3.5" />
          Run
        </Button>
      </div>
    </div>
  );
};

export default TopBar;
