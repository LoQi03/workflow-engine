import { useState, useMemo } from 'react';
import { Plus, FolderOpen, Clock, Trash2, Workflow, Zap, ArrowRight, Search, Hash, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SavedWorkflow } from '@/hooks/useWorkflowStore';

interface WorkflowSelectorProps {
  workflows: SavedWorkflow[];
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

const ITEMS_PER_PAGE = 6;

const WorkflowSelector = ({ workflows, onSelect, onNew, onDelete }: WorkflowSelectorProps) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return workflows;
    const q = search.toLowerCase().trim();
    return workflows.filter(
      (wf) =>
        wf.name.toLowerCase().includes(q) ||
        wf.id.toLowerCase().includes(q)
    );
  }, [workflows, search]);

  // Reset to page 1 when search changes
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return (
      d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    );
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col items-center mb-10 z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Workflow className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">FlowCraft</h1>
        </div>
        <p className="text-sm text-muted-foreground">Select a workflow or create a new one</p>
      </div>

      {/* Content */}
      <div className="z-10 w-full max-w-2xl px-6">
        {/* New Workflow Card */}
        <button
          onClick={onNew}
          className="w-full mb-6 group flex items-center gap-4 p-5 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-card/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold text-foreground">New Workflow</p>
            <p className="text-xs text-muted-foreground mt-0.5">Start from scratch with a blank canvas</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
        </button>

        {/* Saved Workflows */}
        {workflows.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-3.5 h-3.5 text-muted-foreground/60" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Saved Workflows
                  <span className="ml-1.5 text-muted-foreground/50">({workflows.length})</span>
                </h2>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-9 bg-card border-border text-sm placeholder:text-muted-foreground/40"
              />
            </div>

            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-muted-foreground">
                  <Search className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">No workflows match "{search}"</p>
                </div>
              ) : (
                paged.map((wf) => (
                  <div
                    key={wf.id}
                    onClick={() => onSelect(wf.id)}
                    className="group flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all duration-150 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{wf.name}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Hash className="w-3 h-3 text-muted-foreground/40" />
                        <span className="text-[10px] text-muted-foreground/60 font-mono">{wf.id}</span>
                        <span className="text-[10px] text-muted-foreground/30">·</span>
                        <span className="text-[10px] text-muted-foreground">{wf.nodes.length} nodes</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground/40" />
                          <span className="text-[10px] text-muted-foreground">Created {formatDate(wf.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground/40" />
                          <span className="text-[10px] text-muted-foreground">Modified {formatDate(wf.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); onDelete(wf.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-1">
                <span className="text-[11px] text-muted-foreground">
                  {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={p === safePage ? 'default' : 'ghost'}
                      size="icon"
                      className="h-7 w-7 text-xs"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowSelector;
