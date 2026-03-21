import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';
import { MaterialCategory } from '@/types';
import { toast } from 'sonner';

const CATEGORIES: MaterialCategory[] = ['Cement', 'Steel', 'Sand', 'Gravel', 'Timber', 'Roofing', 'Electrical', 'Plumbing', 'Paint', 'Other'];

export default function MaterialFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const { addMaterial, updateMaterial, materials, projects } = useAppData();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<MaterialCategory>('Cement');
  const [unit, setUnit] = useState('bags');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [location, setLocation] = useState('');
  const [minStock, setMinStock] = useState('10');
  const [linkedProject, setLinkedProject] = useState('');

  useEffect(() => {
    if (editId) {
      const mat = materials.find(m => m.id === editId);
      if (mat) {
        setName(mat.name); setCategory(mat.category); setUnit(mat.unit);
        setQuantity(String(mat.quantity)); setUnitCost(String(mat.unitCost));
        setLocation(mat.location); setMinStock(String(mat.minStock));
        setLinkedProject(mat.linkedProject);
      }
    }
  }, [editId, materials]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name is required'); return; }
    const data = {
      name: name.trim(), category, unit, quantity: parseFloat(quantity) || 0,
      unitCost: parseFloat(unitCost) || 0, location: location.trim(),
      minStock: parseFloat(minStock) || 10, lastRestocked: new Date().toISOString().split('T')[0],
      linkedProject,
    };
    if (editId) {
      updateMaterial(editId, data);
      toast.success('Material updated');
    } else {
      addMaterial(data);
      toast.success('Material added');
    }
    navigate('/more');
  };

  return (
    <div className="content-area pb-24 md:pb-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-primary mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
      <h1 className="text-2xl font-bold text-foreground font-display mb-6">{editId ? 'Edit' : 'Add'} Material</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <FormField label="Material Name"><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Portland Cement" /></FormField>
        <FormField label="Category">
          <select value={category} onChange={e => setCategory(e.target.value as MaterialCategory)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Quantity"><Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} /></FormField>
          <FormField label="Unit"><Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="bags" /></FormField>
          <FormField label="Unit Cost (LSL)"><Input type="number" value={unitCost} onChange={e => setUnitCost(e.target.value)} /></FormField>
        </div>
        <FormField label="Storage Location"><Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Site A Warehouse" /></FormField>
        <FormField label="Min Stock Level"><Input type="number" value={minStock} onChange={e => setMinStock(e.target.value)} /></FormField>
        <FormField label="Linked Project">
          <select value={linkedProject} onChange={e => setLinkedProject(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">— None —</option>
            {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </FormField>
        <Button type="submit" className="w-full">{editId ? 'Update' : 'Add'} Material</Button>
      </form>
    </div>
  );
}
