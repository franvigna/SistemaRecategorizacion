interface Feriado {
  dia: number;
  mes: number;
  motivo: string;
  tipo: string;
}

const cacheFeriados = new Map<number, Feriado[]>();

async function obtenerFeriados(año: number): Promise<Feriado[]> {
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
      console.log(`Feriados ${año} obtenidos (${feriados.length} feriados encontrados)`);
      return feriados;
    }
  } catch (error) {
    console.warn(`No se pudieron obtener feriados de ${año}. Calculando solo con fines de semana.`);
  }

  return [];
}

function esDiaHabil(fecha: Date, feriados: Feriado[]): boolean {
  const diaSemana = fecha.getDay();
  
  if (diaSemana === 0 || diaSemana === 6) {
    return false;
  }

  if (feriados.length === 0) {
    return true;
  }

  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;

  const esFeriado = feriados.some(f => f.dia === dia && f.mes === mes);
  
  return !esFeriado;
}

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

export async function calcularHorasMes(año: number, mes: number): Promise<number> {
  const diasHabiles = await calcularDiasHabiles(año, mes);
  return diasHabiles * 6;
}

export function limpiarCacheFeriados(): void {
  cacheFeriados.clear();
}