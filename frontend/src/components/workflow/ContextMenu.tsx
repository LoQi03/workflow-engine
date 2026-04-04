import { useEffect, useRef } from 'react';
import { Trash2, Copy, Zap, Play, GitBranch, Send, Scissors } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  type: 'node' | 'canvas' | 'edge';
  onClose: () => void;
  onDeleteNode?: () => void;
  onDuplicateNode?: () => void;
  onDeleteEdge?: () => void;
  onAddNode?: (category: string) => void;
}

const ContextMenu = ({
  x, y, type, onClose,
  onDeleteNode, onDuplicateNode, onDeleteEdge, onAddNode,
}: ContextMenuProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as HTMLElement)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Clamp to viewport
  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 200),
    top: Math.min(y, window.innerHeight - 250),
    zIndex: 1000,
  };

  const itemClass =
    'flex items-center gap-2.5 px-3 py-2 text-xs rounded-md cursor-pointer transition-colors hover:bg-muted';

  return (
    <div ref={ref} style={style} className="bg-popover border border-border rounded-lg shadow-xl shadow-black/40 p-1 min-w-[170px] animate-in fade-in zoom-in-95 duration-100">
      {type === 'node' && (
        <>
          <div className={itemClass + ' text-foreground'} onClick={onDuplicateNode}>
            <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Duplicate
          </div>
          <div className="h-px bg-border my-1" />
          <div className={itemClass + ' text-destructive'} onClick={onDeleteNode}>
            <Trash2 className="w-3.5 h-3.5" /> Delete Node
          </div>
        </>
      )}
      {type === 'edge' && (
        <div className={itemClass + ' text-destructive'} onClick={onDeleteEdge}>
          <Scissors className="w-3.5 h-3.5" /> Delete Connection
        </div>
      )}
      {type === 'canvas' && onAddNode && (
        <>
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Add Node
          </div>
          <div className={itemClass + ' text-foreground'} onClick={() => onAddNode('trigger')}>
            <Zap className="w-3.5 h-3.5 text-node-trigger" /> Trigger
          </div>
          <div className={itemClass + ' text-foreground'} onClick={() => onAddNode('action')}>
            <Play className="w-3.5 h-3.5 text-node-action" /> Action
          </div>
          <div className={itemClass + ' text-foreground'} onClick={() => onAddNode('condition')}>
            <GitBranch className="w-3.5 h-3.5 text-node-condition" /> Condition
          </div>
          <div className={itemClass + ' text-foreground'} onClick={() => onAddNode('output')}>
            <Send className="w-3.5 h-3.5 text-node-output" /> Output
          </div>
        </>
      )}
    </div>
  );
};

export default ContextMenu;
