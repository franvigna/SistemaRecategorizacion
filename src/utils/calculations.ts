// src/utils/calculations.ts

import type { Categoria, ResultadoCalculo } from '../types';

/**
 * Calcula la conversión de horas para una recategorización
 * Aplica la regla de 3: (valorNuevo / valorActual) × horasBase
 * Redondea hacia arriba como lo hace Cielo
 */
export function calcularConversionHoras(
  categoriaActual: Categoria,
  categoriaNueva: Categoria,
  horasBase: number
): ResultadoCalculo {
  // Regla de 3
  const horasConvertidas =
    (categoriaNueva.valorHora / categoriaActual.valorHora) * horasBase;

  // Redondear hacia arriba
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

/**
 * Valida que una recategorización sea válida
 * Solo permite aumentos de categoría
 */
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

/**
 * Formatea un número con separadores de miles
 */
export function formatearNumero(numero: number): string {
  return new Intl.NumberFormat('es-AR').format(numero);
}

/**
 * Formatea un número como moneda argentina
 */
export function formatearMoneda(numero: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(numero);
}