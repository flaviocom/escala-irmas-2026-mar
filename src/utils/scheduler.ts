import {
  eachDayOfInterval,
  getDay,
  isSameDay,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  addDays,
  differenceInDays,
  getDate,
  format,
  parseISO
} from 'date-fns';
import { Sister, Shift, ShiftType, SISTERS } from '../types/scheduler';

export function generateEmptySchedule(): Shift[] {
  const year = 2026;
  const startDate = new Date(year, 2, 1); // Mar 1st
  const endDate = new Date(year, 11, 31); // Dec 31st

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  const shifts: Shift[] = [];
  let shiftIdCounter = 1;

  allDays.forEach(date => {
    const dayOfWeek = getDay(date); // 0=Sun, ..., 6=Sat
    const dateStr = format(date, 'yyyy-MM-dd');

    // For Auxiliary Sisters, there is usually 1 main shift (NOITE) per cult day: Sun, Wed, Sat
    // Exception: 07/06/2026 -> SANTA CEIA
    if (dateStr === '2026-06-07') {
      shifts.push({ id: `shift-${shiftIdCounter++}`, date, type: 'SANTA_CEIA', assignedSisters: [] });
      return;
    }

    // Cults: Sunday(0), Wednesday(3), Saturday(6)
    if (dayOfWeek === 0 || dayOfWeek === 3 || dayOfWeek === 6) {
      shifts.push({ id: `shift-${shiftIdCounter++}`, date, type: 'NOITE', assignedSisters: [] });
    }
  });

  return shifts;
}

export interface ValidationResult {
  rule: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details: string[];
}

export function runValidation(shifts: Shift[]): ValidationResult[] {
  const results: ValidationResult[] = [];
  const sisters = SISTERS;

  // 1. No Overlap (Same Day)
  const overlapDetails: string[] = [];
  let overlapValid = true;
  const shiftsByDay: Record<string, Shift[]> = {};

  shifts.forEach(s => {
    const dayKey = s.date.toISOString().slice(0, 10);
    if (!shiftsByDay[dayKey]) shiftsByDay[dayKey] = [];
    shiftsByDay[dayKey].push(s);
  });

  Object.entries(shiftsByDay).forEach(([day, dayShifts]) => {
    const sistersOnDay = new Set<string>();
    dayShifts.forEach(s => {
      s.assignedSisters.forEach(sId => {
        if (sistersOnDay.has(sId)) {
          const sName = sisters.find(b => b.id === sId)?.name || sId;
          overlapDetails.push(`${sName} repetida em ${format(parseISO(day), 'dd/MM')}`);
          overlapValid = false;
        }
        sistersOnDay.add(sId);
      });
    });
  });

  results.push({
    rule: 'Sem Repetição no Mesmo Dia',
    status: overlapValid ? 'pass' : 'fail',
    message: overlapValid ? 'OK' : 'Irmãs repetidas encontradas',
    details: overlapDetails
  });

  // 2. Date Validation
  const dateDetails: string[] = [];
  let dateValid: boolean | 'warn' = true;
  const expectedShifts = generateEmptySchedule();

  if (shifts.length !== expectedShifts.length) {
    dateDetails.push(`Total de turnos diferente: ${shifts.length} (Referência: ${expectedShifts.length})`);
    dateValid = 'warn';
  }

  // Check for missing dates
  const shiftDates = new Set(shifts.map(s => s.date.toISOString().slice(0, 10)));
  const expectedDates = new Set(expectedShifts.map(s => s.date.toISOString().slice(0, 10)));

  expectedDates.forEach(d => {
    if (!shiftDates.has(d)) {
      dateDetails.push(`Data faltando: ${format(parseISO(d), 'dd/MM/yyyy')}`);
      if (dateValid !== 'warn') dateValid = false;
    }
  });

  results.push({
    rule: 'Validação de Datas',
    status: dateValid as any,
    message: dateValid === true ? 'OK' : 'Verifique as datas',
    details: dateDetails
  });

  return results;
}

export function generateSchedule(): Shift[] {
  const shifts = generateEmptySchedule();

  // Hardcoded Schedule for March 2026 based on the provided image
  const marchData: Record<number, string[]> = {
    1: ['divone', 'izabel'],
    4: ['valeria', 'rose'],
    7: ['flora', 'nelci'],
    8: ['jaqueline', 'fatima'],
    11: ['cris', 'divone'],
    14: ['geralda', 'francisca'],
    15: ['laurenca', 'valeria'],
    18: ['izabel', 'flora'],
    21: ['fatima', 'raquel'],
    22: ['nelci', 'geralda'],
    25: ['laurenca', 'cris'],
    28: ['divone', 'jaqueline'],
    29: ['rose', 'flora'],
  };

  for (const shift of shifts) {
    if (shift.date.getFullYear() === 2026 && shift.date.getMonth() === 2) { // Março = 2
      const day = shift.date.getDate();
      if (marchData[day]) {
        shift.assignedSisters = [...marchData[day]];
      }
    }
  }

  return shifts;
}
