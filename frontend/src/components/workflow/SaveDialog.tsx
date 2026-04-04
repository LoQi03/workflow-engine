import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SaveDialogProps {
  defaultName: string;
  onSave: (name: string) => void;
  onClose: () => void;
}

const SaveDialog = ({ defaultName, onSave, onClose }: SaveDialogProps) => {
  const [name, setName] = useState(defaultName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-2xl shadow-black/50 w-[380px] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold font-heading text-foreground">Save Workflow</h2>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Workflow Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-sm bg-background border-border focus:border-primary"
              placeholder="My Workflow"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onSave(name.trim()); }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-semibold"
              disabled={!name.trim()}
              onClick={() => onSave(name.trim())}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveDialog;
