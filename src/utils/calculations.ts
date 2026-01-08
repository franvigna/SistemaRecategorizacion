import type { Categoria, ResultadoCalculo } from '../types';

export function calcularConversionHoras(
  categoriaActual: Categoria,
  categoriaNueva: Categoria,
  horasBase: number
): ResultadoCalculo {
  const horasConvertidas =
    (categoriaNueva.valorHora / categoriaActual.valorHora) * horasBase;

  const horasAjustadas = Math.ceil(horasConvertidas);

  const diferencia = horasAjustadas - horasBase;
  const porcentajeAumento = ((horasAjustadas - horasBase) / horasBase) * 100;

  return {
    horasBase,
    horasAjustadas,
    diferencia,
    porcentajeAumento,
    categoriaActual,
    categoriaNueva,
  };
}

export function validarRecategorizacion(
  categoriaActual: Categoria,
  categoriaNueva: Categoria
): { valido: boolean; mensaje?: string } {
  if (categoriaActual.id === categoriaNueva.id) {
    return {
      valido: false,
      mensaje: 'La categoría actual y nueva son iguales',
    };
  }

  if (categoriaActual.orden >= categoriaNueva.orden) {
    return {
      valido: false,
      mensaje: 'Solo se permiten aumentos de categoría',
    };
  }

  return { valido: true };
}

export function formatearNumero(numero: number): string {
  return new Intl.NumberFormat('es-AR').format(numero);
}

export function formatearMoneda(numero: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(numero);
}