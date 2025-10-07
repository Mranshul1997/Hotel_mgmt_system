// utils/payroll.ts

export function getSalaryPerMinute(
  monthlySalary: number,
  days: number = 30,
  workHours: number = 9
) {
  const salaryPerDay = monthlySalary / days;
  const salaryPerHour = salaryPerDay / workHours;
  return salaryPerHour / 60;
}

export function getLateMinutes(
  checkIn: string,
  shiftStart: string,
  grace: number = 5
) {
  const [h1, m1] = checkIn.split(":").map(Number);
  const [h2, m2] = shiftStart.split(":").map(Number);
  const late = h1 * 60 + m1 - (h2 * 60 + m2);
  return late > grace ? late - grace : 0;
}

export function getOTMinutes(
  checkOut: string,
  shiftEnd: string,
  otGrace: number = 30
) {
  const [h1, m1] = checkOut.split(":").map(Number);
  const [h2, m2] = shiftEnd.split(":").map(Number);
  const ot = h1 * 60 + m1 - (h2 * 60 + m2);
  return ot > otGrace ? ot - otGrace : 0;
}

export function round2(num: number) {
  return Math.round(num * 100) / 100;
}
