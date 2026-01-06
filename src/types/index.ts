// src/types/index.ts

export interface Categoria {
  id: string;
  nombre: string;
  valorHora: number;
  orden: number;
}

export interface Becario {
  id: string;
  nombre: string;
  categoriaActual: string;
  categoriaNueva: string;
  horasBase: number;
  horasAjustadas?: number;
}

export interface ResultadoCalculo {
  horasBase: number;
  horasAjustadas: number;
  diferencia: number;
  porcentajeAumento: number;
  categoriaActual: Categoria;
  categoriaNueva: Categoria;
}

export interface CategoriasData {
  categorias: Categoria[];
  ultimaActualizacion: string;
}