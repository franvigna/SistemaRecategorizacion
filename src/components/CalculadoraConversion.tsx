// ========== CalculadoraConversion.tsx ==========
import { useState, useEffect } from 'react';
import type { Categoria } from '../types';
import { calcularConversionHoras, formatearNumero } from '../utils/calculations';
import { calcularDiasHabiles } from '../utils/diasHabiles';
import categoriasData from '../data/categorias.json';
import './CalculadoraConversion.css';

export default function CalculadoraConversion() {
  const categorias = categoriasData.categorias as Categoria[];

  const [categoriaActualId, setCategoriaActualId] = useState<string>('');
  const [categoriaNuevaId, setCategoriaNuevaId] = useState<string>('');
  const [horasBase, setHorasBase] = useState<string>('');
  const [diasHabiles, setDiasHabiles] = useState<number | null>(null);
  const [cargandoDias, setCargandoDias] = useState(true);

  useEffect(() => {
    const obtenerDiasHabiles = async () => {
      setCargandoDias(true);
      try {
        const dias = await calcularDiasHabiles();
        setDiasHabiles(dias);
      } catch (error) {
        console.error('Error al calcular días hábiles:', error);
        // Fallback: calcular sin API de feriados
        const ahora = new Date();
        const año = ahora.getFullYear();
        const mes = ahora.getMonth();
        const primerDia = new Date(año, mes, 1);
        const ultimoDia = new Date(año, mes + 1, 0);
        
        let dias = 0;
        for (let d = new Date(primerDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
          const diaSemana = d.getDay();
          if (diaSemana !== 0 && diaSemana !== 6) {
            dias++;
          }
        }
        setDiasHabiles(dias);
      } finally {
        setCargandoDias(false);
      }
    };

    obtenerDiasHabiles();
  }, []);

  const categoriaActual = categorias.find((c) => c.id === categoriaActualId);
  const categoriaNueva = categorias.find((c) => c.id === categoriaNuevaId);

  const calcularResultado = () => {
    if (!categoriaActual || !categoriaNueva || !horasBase) {
      return null;
    }

    const horas = parseFloat(horasBase);
    if (isNaN(horas) || horas <= 0) {
      return null;
    }

    return calcularConversionHoras(categoriaActual, categoriaNueva, horas);
  };

  const resultado = calcularResultado();

  return (
    <div className="calculadora-container">
      {/* Panel Izquierdo - Inputs */}
      <div className="panel-inputs">
        {/* Información de Días Hábiles */}
        <div className="info-dias-habiles">
          {cargandoDias ? (
            <div className="info-dias-cargando">Calculando...</div>
          ) : (
            <div className="info-dias-valor">
              <span className="info-dias-numero">{diasHabiles} </span>
              <span className="info-dias-texto">días laborables</span>
            </div>
          )}
          <div className="info-dias-detalle">
            {new Date().toLocaleString('es-AR', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Categoría Actual */}
        <div className="input-wrapper">
          <label className="input-label">Categoría Actual</label>
          <select
            className="select"
            value={categoriaActualId}
            onChange={(e) => setCategoriaActualId(e.target.value)}
          >
            <option value="">Selecciona categoría actual</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre} - ${formatearNumero(cat.valorHora)}/h
              </option>
            ))}
          </select>
        </div>

        {/* Categoría Nueva */}
        <div className="input-wrapper">
          <label className="input-label">Categoría Nueva (Aumento)</label>
          <select
            className="select"
            value={categoriaNuevaId}
            onChange={(e) => setCategoriaNuevaId(e.target.value)}
            disabled={!categoriaActualId}
          >
            <option value="">Selecciona categoría nueva</option>
            {categorias
              .filter((cat) => {
                if (!categoriaActual) return true;
                return cat.orden > categoriaActual.orden;
              })
              .map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre} - ${formatearNumero(cat.valorHora)}/h
                </option>
              ))}
          </select>
        </div>

        {/* Horas Trabajadas */}
        <div className="input-wrapper">
          <label className="input-label">Horas Trabajadas</label>
          <input
            type="number"
            className="input"
            placeholder="Ej: 120"
            value={horasBase}
            onChange={(e) => setHorasBase(e.target.value)}
            min="0"
            step="0.1"
          />
        </div>

        {/* Tabla de Referencia */}
        <div className="tabla-referencia">
          <div className="tabla-referencia-titulo">Valores de Referencia</div>
          <div className="tabla-referencia-lista">
            {categorias.map((cat) => (
              <div key={cat.id} className="tabla-referencia-item">
                <span>{cat.nombre}</span>
                <span>${formatearNumero(cat.valorHora)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel Derecho - Resultado */}
      <div className="panel-resultado">
        {!resultado && (
          <div className="estado-vacio">
            <div className="estado-vacio-icono">🧮</div>
            <div className="estado-vacio-texto">Completa los campos para calcular</div>
          </div>
        )}

        {resultado && categoriaActual && categoriaNueva && (
          <div className="resultado-container">
            {/* Sueldos Comparados */}
            <div className="sueldos-comparados">
              {/* Sueldo Actual */}
              <div className="sueldo-card sueldo-card-actual">
                <div className="sueldo-label sueldo-label-actual">Sueldo Actual</div>
                <div className="sueldo-monto sueldo-monto-actual">
                  ${formatearNumero(resultado.horasBase * categoriaActual.valorHora)}
                </div>
                <div className="sueldo-categoria sueldo-categoria-actual">
                  {categoriaActual.nombre}
                </div>
              </div>

              {/* Sueldo Nuevo */}
              <div className="sueldo-card sueldo-card-nuevo">
                <div className="sueldo-label sueldo-label-nuevo">Sueldo Nuevo</div>
                <div className="sueldo-monto sueldo-monto-nuevo">
                  ${formatearNumero(resultado.horasBase * categoriaNueva.valorHora)}
                </div>
                <div className="sueldo-categoria sueldo-categoria-nuevo">
                  {categoriaNueva.nombre}
                </div>
              </div>
            </div>

            {/* Conversión de Horas */}
            <div className="conversion-container">
              <div className="conversion-titulo">Conversión de Horas</div>

              <div className="conversion-grid">
                {/* Horas Trabajadas */}
                <div className="conversion-item">
                  <div className="conversion-label">Trabajadas</div>
                  <div className="conversion-numero conversion-numero-trabajadas">
                    {resultado.horasBase}
                  </div>
                  <div className="conversion-unidad conversion-unidad-trabajadas">horas</div>
                </div>

                {/* Horas a Liquidar */}
                <div className="conversion-item">
                  <div className="conversion-label">A Liquidar</div>
                  <div className="conversion-numero conversion-numero-liquidar">
                    {resultado.horasAjustadas}
                  </div>
                  <div className="conversion-unidad conversion-unidad-liquidar">horas</div>
                </div>

                {/* Diferencia */}
                <div className="conversion-item">
                  <div className="conversion-label">Diferencia</div>
                  <div className="conversion-numero conversion-numero-diferencia">
                    +{resultado.diferencia}
                  </div>
                  <div className="conversion-unidad conversion-unidad-diferencia">horas</div>
                </div>
              </div>

              {/* Monto Final */}
              <div className="monto-final">
                <div className="monto-final-label">Monto final a cobrar</div>
                <div className="monto-final-valor">
                  ${formatearNumero(resultado.horasAjustadas * categoriaActual.valorHora)}
                </div>
                <div className="monto-final-detalle">
                  {resultado.horasAjustadas} horas × ${formatearNumero(categoriaActual.valorHora)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}