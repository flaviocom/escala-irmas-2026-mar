export type ShiftType = 'MANHÃ' | 'TARDE' | 'NOITE' | 'SANTA_CEIA';

export interface Sister {
  id: string;
  name: string;
  constraints: {
    fixedPerMonth?: number;
    daysAllowed?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
    shiftsAllowed?: ShiftType[];
    forbiddenDays?: number[];
  };
}

export interface Shift {
  id: string;
  date: Date;
  type: ShiftType;
  assignedSisters: string[]; // Sister IDs
}

export const SISTERS: Sister[] = [
  { id: 'cris', name: 'Cris', constraints: {} },
  { id: 'divone', name: 'Divone', constraints: {} },
  { id: 'fatima', name: 'Fátima', constraints: {} },
  { id: 'flora', name: 'Flora', constraints: {} },
  { id: 'francisca', name: 'Francisca', constraints: {} },
  { id: 'geralda', name: 'Geralda', constraints: {} },
  { id: 'izabel', name: 'Izabel', constraints: {} },
  { id: 'jaqueline', name: 'Jaqueline', constraints: {} },
  { id: 'laurenca', name: 'Laurença', constraints: {} },
  { id: 'nelci', name: 'Nelci', constraints: {} },
  { id: 'raquel', name: 'Raquel', constraints: {} },
  { id: 'rose', name: 'Rose', constraints: {} },
  { id: 'valeria', name: 'Valéria', constraints: {} }
];
