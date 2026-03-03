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
  const startDate = new Date(year, 0, 1); // Jan 1st
  const endDate = new Date(year, 11, 31); // Dec 31st

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  const shifts: Shift[] = [];
  let shiftIdCounter = 1;

  const ensaioDates = ['2026-01-03', '2026-02-07', '2026-03-07', '2026-04-04', '2026-05-02', '2026-06-06'];

  allDays.forEach(date => {
    const dayOfWeek = getDay(date); // 0=Sun, ..., 6=Sat
    const dateStr = format(date, 'yyyy-MM-dd');

    // SANTA_CEIA
    if (dateStr === '2026-06-07') {
      shifts.push({ id: `shift-${shiftIdCounter++}`, date, type: 'SANTA_CEIA', assignedSisters: [] });
      return;
    }

    // TARDE ENSAIO
    if (ensaioDates.includes(dateStr)) {
      shifts.push({ id: `shift-${shiftIdCounter++}`, date, type: 'TARDE', assignedSisters: [] });
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
    status: dateValid === true ? 'pass' : (dateValid === 'warn' ? 'warn' : 'fail'),
    message: dateValid === true ? 'OK' : 'Verifique as datas',
    details: dateDetails
  });

  return results;
}

export function generateSchedule(): Shift[] {
  const shifts = generateEmptySchedule();

  // Hardcoded Schedule for Jan-Jun 2026 based on the provided image
  const scheduleData: Record<number, Record<number, string[]>> = {
    0: { 3: ['flora', 'jaqueline'], 4: ['nelci', 'rose'], 7: ['cris', 'izabel'], 10: ['raquel', 'fatima'], 11: ['valeria', 'laurenca'], 14: ['fatima', 'divone'], 17: ['rose', 'nelci'], 18: ['jaqueline', 'geralda'], 21: ['fatima', 'cris'], 24: ['izabel', 'francisca'], 25: ['divone', 'flora'], 28: ['laurenca', 'nelci'], 31: ['geralda', 'valeria'] },
    1: { 1: ['flora', 'izabel'], 4: ['cris', 'fatima'], 7: ['divone', 'nelci'], 8: ['valeria', 'geralda'], 11: ['jaqueline', 'raquel'], 14: ['izabel', 'rose'], 15: ['laurenca', 'flora'], 18: ['geralda', 'divone'], 21: ['fatima', 'francisca'], 22: ['valeria', 'laurenca'], 25: ['nelci', 'cris'], 28: ['rose', 'jaqueline'] },
    2: { 1: ['divone', 'izabel'], 4: ['valeria', 'rose'], 7: ['flora', 'nelci'], 8: ['jaqueline', 'fatima'], 11: ['cris', 'divone'], 14: ['geralda', 'francisca'], 15: ['laurenca', 'valeria'], 18: ['izabel', 'flora'], 21: ['fatima', 'raquel'], 22: ['nelci', 'geralda'], 25: ['laurenca', 'cris'], 28: ['divone', 'jaqueline'], 29: ['rose', 'flora'] },
    3: { 1: ['izabel', 'francisca'], 4: ['flora', 'divone'], 5: ['geralda', 'rose'], 8: ['cris', 'laurenca'], 11: ['jaqueline', 'nelci'], 12: ['fatima', 'flora'], 15: ['geralda', 'raquel'], 18: ['valeria', 'izabel'], 19: ['laurenca', 'fatima'], 22: ['rose', 'cris'], 25: ['flora', 'jaqueline'], 26: ['divone', 'valeria'], 29: ['nelci', 'geralda'] },
    4: { 2: ['valeria', 'flora'], 3: ['rose', 'jaqueline'], 6: ['geralda', 'cris'], 9: ['laurenca', 'izabel'], 10: ['nelci', 'divone'], 13: ['izabel', 'raquel'], 16: ['fatima', 'rose'], 17: ['flora', 'laurenca'], 20: ['cris', 'fatima'], 23: ['divone', 'geralda'], 24: ['jaqueline', 'valeria'], 27: ['francisca', 'cris'], 30: ['fatima', 'izabel'], 31: ['rose', 'nelci'] },
    5: { 3: ['izabel', 'francisca'], 6: ['geralda', 'laurenca'], 10: ['cris', 'rose'], 13: ['divone', 'izabel'], 14: ['flora', 'geralda'], 17: ['raquel', 'fatima'], 20: ['nelci', 'jaqueline'], 21: ['valeria', 'divone'], 24: ['laurenca', 'cris'], 27: ['rose', 'flora'], 28: ['jaqueline', 'valeria'] }
  };

  const ensaioData: Record<number, { day: number, sister: string }> = {
    0: { day: 3, sister: 'laurenca' },
    1: { day: 7, sister: 'cris' },
    2: { day: 7, sister: 'geralda' },
    3: { day: 4, sister: 'carla' },
    4: { day: 2, sister: 'divone' },
    5: { day: 6, sister: 'izabel' }
  };

  for (const shift of shifts) {
    if (shift.date.getFullYear() === 2026) {
      const month = shift.date.getMonth();
      const day = shift.date.getDate();

      if (month >= 0 && month <= 5) {
        if (shift.type === 'TARDE' && ensaioData[month]?.day === day) {
          shift.assignedSisters = [ensaioData[month].sister];
        } else if (shift.type === 'NOITE' && scheduleData[month]?.[day]) {
          shift.assignedSisters = [...scheduleData[month][day]];
        }
      }
    }
  }

  return shifts;
}
