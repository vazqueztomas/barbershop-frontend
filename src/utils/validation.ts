export function validateNaturalDateInput(input: string): string | null {
  if (!input || input.trim().length === 0) {
    return 'Ingrese una fecha o período de tiempo';
  }

  if (input.length > 50) {
    return 'El texto ingresado es demasiado largo (máximo 50 caracteres)';
  }

  const allowedPattern = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\d\/\-\,\.]+$/;
  if (!allowedPattern.test(input)) {
    return 'El texto contiene caracteres no válidos';
  }

  return null;
}

export function validateDateRange(startDate: string, endDate: string): string | null {
  if (!startDate || !endDate) {
    return 'Debe seleccionar ambas fechas';
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Formato de fecha no válido';
  }

  if (start > end) {
    return 'La fecha de inicio no puede ser posterior a la fecha de fin';
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (start > today || end > today) {
    return 'No puede seleccionar fechas futuras';
  }

  const maxDays = 365;
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > maxDays) {
    return `El rango de fechas no puede exceder ${maxDays} días`;
  }

  const minDate = new Date(today);
  minDate.setFullYear(minDate.getFullYear() - 5);
  if (start < minDate) {
    return 'La fecha de inicio es demasiado antigua (máximo 5 años)';
  }

  return null;
}

export function validateDateInput(input: string): string | null {
  if (!input || input.trim().length === 0) {
    return 'Ingrese una fecha';
  }

  if (input.length > 20) {
    return 'La fecha ingresada es demasiado larga';
  }

  const date = new Date(input);
  if (isNaN(date.getTime())) {
    return 'Formato de fecha no válido';
  }

  const today = new Date();
  if (date > today) {
    return 'No puede seleccionar fechas futuras';
  }

  return null;
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[<>\"\'&]/g, '')
    .substring(0, 50);
}
