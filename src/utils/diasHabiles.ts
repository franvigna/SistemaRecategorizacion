// ========== diasHabiles.ts ==========

interface Feriado {
  dia: number;
  mes: number;
  motivo: string;
  tipo: string;
}

/**
 * Obtiene los feriados de Argentina para un año específico
 * Intenta múltiples APIs como fallback
 */
async function obtenerFeriados(año: number): Promise<Feriado[]> {
  // API 1: argentina.gob.ar (scraping del sitio oficial)
  // API 2: nolaborables hosted version (si está disponible)
  // API 3: Fallback manual con feriados conocidos de 2026
  
  const feriadosBase2026: Feriado[] = [
    { dia: 1, mes: 1, motivo: 'Año Nuevo', tipo: 'inamovible' },
    { dia: 16, mes: 2, motivo: 'Carnaval', tipo: 'inamovible' },
    { dia: 17, mes: 2, motivo: 'Carnaval', tipo: 'inamovible' },
    { dia: 24, mes: 3, motivo: 'Día Nacional de la Memoria por la Verdad y la Justicia', tipo: 'inamovible' },
    { dia: 2, mes: 4, motivo: 'Día del Veterano y de los Caídos en la Guerra de Malvinas', tipo: 'inamovible' },
    { dia: 3, mes: 4, motivo: 'Jueves Santo', tipo: 'inamovible' },
    { dia: 4, mes: 4, motivo: 'Viernes Santo', tipo: 'inamovible' },
    { dia: 1, mes: 5, motivo: 'Día del Trabajador', tipo: 'inamovible' },
    { dia: 25, mes: 5, motivo: 'Día de la Revolución de Mayo', tipo: 'inamovible' },
    { dia: 15, mes: 6, motivo: 'Paso a la Inmortalidad del General Martín Miguel de Güemes', tipo: 'trasladable' },
    { dia: 20, mes: 6, motivo: 'Paso a la Inmortalidad del General Manuel Belgrano', tipo: 'inamovible' },
    { dia: 9, mes: 7, motivo: 'Día de la Independencia', tipo: 'inamovible' },
    { dia: 17, mes: 8, motivo: 'Paso a la Inmortalidad del General José de San Martín', tipo: 'trasladable' },
    { dia: 12, mes: 10, motivo: 'Día del Respeto a la Diversidad Cultural', tipo: 'trasladable' },
    { dia: 23, mes: 11, motivo: 'Día de la Soberanía Nacional', tipo: 'trasladable' },
    { dia: 8, mes: 12, motivo: 'Inmaculada Concepción de María', tipo: 'inamovible' },
    { dia: 25, mes: 12, motivo: 'Navidad', tipo: 'inamovible' }
  ];

  // Intentar API de ArgentinaDatos
  try {
    const response = await fetch(`https://api.argentinadatos.com/v1/feriados/${año}`);
    if (response.ok) {
      const data = await response.json();
      return data.map((f: any) => ({
        dia: parseInt(f.dia),
        mes: parseInt(f.mes),
        motivo: f.nombre,
        tipo: f.tipo
      }));
    }
  } catch (error) {
    console.log('API ArgentinaDatos no disponible, intentando siguiente...');
  }

  // Intentar API alternativa (Feriados Argentina API de GitHub)
  try {
    const response = await fetch(`https://ggomez0.github.io/Feriados-Argentina-API/feriados-${año}.json`);
    if (response.ok) {
      const data = await response.json();
      return data.map((f: any) => ({
        dia: f.dia,
        mes: f.mes,
        motivo: f.motivo,
        tipo: f.tipo
      }));
    }
  } catch (error) {
    console.log('API GitHub no disponible, usando datos locales...');
  }

  // Fallback: usar datos locales para 2026
  if (año === 2026) {
    return feriadosBase2026;
  }

  // Si es otro año y no hay APIs disponibles, devolver array vacío
  return [];
}

/**
 * Verifica si una fecha es día hábil (lunes a viernes, sin feriados)
 */
function esDiaHabil(fecha: Date, feriados: Feriado[]): boolean {
  const diaSemana = fecha.getDay();
  
  // Si es sábado (6) o domingo (0), no es día hábil
  if (diaSemana === 0 || diaSemana === 6) {
    return false;
  }

  // Verificar si es feriado
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1; // getMonth() devuelve 0-11

  const esFeriado = feriados.some(f => f.dia === dia && f.mes === mes);
  
  return !esFeriado;
}

/**
 * Calcula la cantidad de días hábiles del mes actual
 * Considerando feriados de Argentina
 */
export async function calcularDiasHabiles(): Promise<number> {
  const ahora = new Date();
  const año = ahora.getFullYear();
  const mes = ahora.getMonth(); // 0-11

  // Obtener feriados del año
  const feriados = await obtenerFeriados(año);

  // Obtener primer y último día del mes
  const primerDia = new Date(año, mes, 1);
  const ultimoDia = new Date(año, mes + 1, 0);

  // Contar días hábiles
  let diasHabiles = 0;
  const fechaActual = new Date(primerDia);

  while (fechaActual <= ultimoDia) {
    if (esDiaHabil(fechaActual, feriados)) {
      diasHabiles++;
    }
    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return diasHabiles;
}

/**
 * Calcula las horas totales del mes basado en días hábiles
 * (6 horas por día según el documento de reunión)
 */
export async function calcularHorasMes(): Promise<number> {
  const diasHabiles = await calcularDiasHabiles();
  return diasHabiles * 6;
}