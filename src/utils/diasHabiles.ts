// ========== diasHabiles.ts ========== (CON SOPORTE HISTÓRICO)

interface Feriado {
  dia: number;
  mes: number;
  motivo: string;
  tipo: string;
}

// Cache de feriados para evitar múltiples llamadas
const cacheFeriados = new Map<number, Feriado[]>();

/**
 * Obtiene los feriados de Argentina para un año específico
 * Usa API de ArgentinaDatos (soporta años desde 2000 en adelante)
 * La API tiene datos históricos y futuros
 */
async function obtenerFeriados(año: number): Promise<Feriado[]> {
  // Verificar caché
  if (cacheFeriados.has(año)) {
    return cacheFeriados.get(año)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`https://api.argentinadatos.com/v1/feriados/${año}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      const feriados = data.map((f: any) => ({
        dia: parseInt(f.dia),
        mes: parseInt(f.mes),
        motivo: f.nombre || f.motivo,
        tipo: f.tipo || 'inamovible'
      }));
      
      cacheFeriados.set(año, feriados);
      console.log(`✅ Feriados ${año} obtenidos (${feriados.length} feriados encontrados)`);
      return feriados;
    }
  } catch (error) {
    console.warn(`⚠️ No se pudieron obtener feriados de ${año}. Calculando solo con fines de semana.`);
  }

  // Si falla la API, devolver array vacío (cuenta solo fines de semana)
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

  // Si no hay feriados disponibles, considerar todos los días de semana como hábiles
  if (feriados.length === 0) {
    return true;
  }

  // Verificar si es feriado
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;

  const esFeriado = feriados.some(f => f.dia === dia && f.mes === mes);
  
  return !esFeriado;
}

/**
 * Calcula la cantidad de días hábiles del mes
 * Considerando feriados de Argentina
 * Funciona con cualquier año (histórico o futuro)
 */
export async function calcularDiasHabiles(año: number, mes: number): Promise<number> {
  const feriados = await obtenerFeriados(año);
  const primerDia = new Date(año, mes, 1);
  const ultimoDia = new Date(año, mes + 1, 0);

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
export async function calcularHorasMes(año: number, mes: number): Promise<number> {
  const diasHabiles = await calcularDiasHabiles(año, mes);
  return diasHabiles * 6;
}

/**
 * Limpia el caché de feriados (útil para testing o forzar actualización)
 */
export function limpiarCacheFeriados(): void {
  cacheFeriados.clear();
}