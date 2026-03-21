import { Material, Equipment } from '@/types';

export const mockMaterials: Material[] = [
  { id: 'm1', name: 'Portland Cement 42.5N', category: 'Cement', unit: 'bags', quantity: 1200, unitCost: 250, location: 'Main Warehouse', minStock: 500, lastRestocked: '2026-02-28', linkedProject: 'p1' },
  { id: 'm2', name: 'Y12 Steel Rebar', category: 'Steel', unit: 'tons', quantity: 45, unitCost: 18500, location: 'Site A - Riverside', minStock: 20, lastRestocked: '2026-02-25', linkedProject: 'p1' },
  { id: 'm3', name: 'Building Sand', category: 'Sand', unit: 'm³', quantity: 180, unitCost: 850, location: 'Site A - Riverside', minStock: 50, lastRestocked: '2026-02-20', linkedProject: 'p1' },
  { id: 'm4', name: 'Crushed Stone 19mm', category: 'Gravel', unit: 'm³', quantity: 95, unitCost: 1100, location: 'Site B - Green Acres', minStock: 40, lastRestocked: '2026-02-22', linkedProject: 'p2' },
  { id: 'm5', name: 'SA Pine 38x114mm', category: 'Timber', unit: 'lengths', quantity: 320, unitCost: 185, location: 'Main Warehouse', minStock: 100, lastRestocked: '2026-02-15', linkedProject: 'p3' },
  { id: 'm6', name: 'IBR Roof Sheeting 0.47mm', category: 'Roofing', unit: 'sheets', quantity: 85, unitCost: 420, location: 'Site C - Sunset Mall', minStock: 30, lastRestocked: '2026-02-18', linkedProject: 'p3' },
  { id: 'm7', name: '2.5mm Twin & Earth Cable', category: 'Electrical', unit: 'rolls', quantity: 28, unitCost: 1250, location: 'Main Warehouse', minStock: 15, lastRestocked: '2026-02-10', linkedProject: 'p2' },
  { id: 'm8', name: '15mm Copper Pipe', category: 'Plumbing', unit: 'lengths', quantity: 65, unitCost: 380, location: 'Site B - Green Acres', minStock: 25, lastRestocked: '2026-02-12', linkedProject: 'p2' },
  { id: 'm9', name: 'Dulux Weatherguard 20L', category: 'Paint', unit: 'tins', quantity: 18, unitCost: 1850, location: 'Main Warehouse', minStock: 10, lastRestocked: '2026-01-30', linkedProject: 'p5' },
  { id: 'm10', name: 'Portland Cement 42.5N', category: 'Cement', unit: 'bags', quantity: 380, unitCost: 250, location: 'Site C - Sunset Mall', minStock: 200, lastRestocked: '2026-02-26', linkedProject: 'p3' },
];

export const mockEquipment: Equipment[] = [
  { id: 'eq1', name: 'CAT 320 Excavator', type: 'Machinery', purchaseCost: 1800000, currentValue: 1350000, assignedProject: 'Riverside Plaza Complex', status: 'In Use', fuelUsagePerDay: 120, lastMaintenance: '2026-02-15' },
  { id: 'eq2', name: 'Concrete Mixer Truck', type: 'Vehicle', purchaseCost: 950000, currentValue: 720000, assignedProject: 'Sunset Mall Extension', status: 'In Use', fuelUsagePerDay: 85, lastMaintenance: '2026-01-28' },
  { id: 'eq3', name: 'Tower Crane TC5013', type: 'Machinery', purchaseCost: 2200000, currentValue: 1650000, assignedProject: 'Riverside Plaza Complex', status: 'In Use', fuelUsagePerDay: 95, lastMaintenance: '2026-02-01' },
  { id: 'eq4', name: 'Isuzu NQR Tipper', type: 'Vehicle', purchaseCost: 680000, currentValue: 480000, assignedProject: 'Green Acres Housing', status: 'In Use', fuelUsagePerDay: 65, lastMaintenance: '2026-02-10' },
  { id: 'eq5', name: 'Hilti TE 60-ATC Drill Set', type: 'Tool', purchaseCost: 28000, currentValue: 18000, assignedProject: 'Sunset Mall Extension', status: 'Available', fuelUsagePerDay: 0, lastMaintenance: '2026-01-15' },
  { id: 'eq6', name: 'Wacker Neuson Plate Compactor', type: 'Tool', purchaseCost: 45000, currentValue: 32000, assignedProject: 'Green Acres Housing', status: 'In Use', fuelUsagePerDay: 8, lastMaintenance: '2026-02-05' },
];
