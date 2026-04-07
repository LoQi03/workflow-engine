import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const TenantSelector = () => {
  const [tenant, setTenant] = useState('');
  const navigate = useNavigate();

  const handleApply = () => {
    if (!tenant.trim()) return;
    navigate('/editor');
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Logo / Title */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold font-heading text-foreground">Workflow Engine</h1>
          <p className="text-sm text-muted-foreground">Enter your tenant to continue</p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3 bg-card border border-border rounded-xl p-6 shadow-lg shadow-black/30">
          <div className="flex flex-col gap-3">
            <Label htmlFor="tenant">Select Tenant</Label>
            <Input
              id="tenant"
              placeholder="e.g. acme-corp"
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              autoFocus
            />
          </div>
          <Button
            className="w-full mt-1"
            onClick={handleApply}
            disabled={!tenant.trim()}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TenantSelector;
