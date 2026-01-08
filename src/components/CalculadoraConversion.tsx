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
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(new Date().getMonth());
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());
  const [mostrarSelector, setMostrarSelector] = useState(false);

  useEffect(() => {
    const obtenerDiasHabiles = async () => {
      setCargandoDias(true);
      try {
        const dias = await calcularDiasHabiles(añoSeleccionado, mesSeleccionado);
        setDiasHabiles(dias);
        setHorasBase((dias * 6).toString());
      } catch (error) {
        console.error('Error al calcular días hábiles:', error);
        const primerDia = new Date(añoSeleccionado, mesSeleccionado, 1);
        const ultimoDia = new Date(añoSeleccionado, mesSeleccionado + 1, 0);
        
        let dias = 0;
        for (let d = new Date(primerDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
          const diaSemana = d.getDay();
          if (diaSemana !== 0 && diaSemana !== 6) {
            dias++;
          }
        }
        setDiasHabiles(dias);
        setHorasBase((dias * 6).toString());
      } finally {
        setCargandoDias(false);
      }
    };

    obtenerDiasHabiles();
  }, [mesSeleccionado, añoSeleccionado]);

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

  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const años = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="calculadora-container">
      <div className="panel-inputs">
        <div className="info-dias-habiles">
          {cargandoDias ? (
            <div className="info-dias-cargando">Calculando...</div>
          ) : (
            <div className="info-dias-valor">
              <span className="info-dias-numero">{diasHabiles} </span>
              <span className="info-dias-texto">días laborables</span>
            </div>
          )}
          <div 
            className="info-dias-detalle"
            onClick={() => setMostrarSelector(!mostrarSelector)}
          >
            {meses[mesSeleccionado]} de {añoSeleccionado} ▼
          </div>

          {mostrarSelector && (
            <div className="selector-fecha">
              <div className="selector-header">Seleccionar período</div>
              <div className="selector-body">
                <div className="selector-seccion">
                  <label className="selector-label">Mes</label>
                  <select
                    className="selector-select"
                    value={mesSeleccionado}
                    onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
                  >
                    {meses.map((mes, idx) => (
                      <option key={idx} value={idx}>
                        {mes.charAt(0).toUpperCase() + mes.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="selector-seccion">
                  <label className="selector-label">Año</label>
                  <select
                    className="selector-select"
                    value={añoSeleccionado}
                    onChange={(e) => setAñoSeleccionado(parseInt(e.target.value))}
                  >
                    {años.map((año) => (
                      <option key={año} value={año}>
                        {año}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                className="selector-btn"
                onClick={() => setMostrarSelector(false)}
              >
                Aplicar
              </button>
            </div>
          )}
        </div>

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
          <div style={{ 
            fontSize: '0.7rem', 
            color: '#666', 
            marginTop: '0.25rem',
            fontWeight: '400'
          }}>
            Calculado automáticamente: {diasHabiles} días × 6 horas
          </div>
        </div>

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

      <div className="panel-resultado">
        {!resultado && (
          <div className="estado-vacio">
            <div className="estado-vacio-icono">🧮</div>
            <div className="estado-vacio-texto">Completa los campos para calcular</div>
          </div>
        )}

        {resultado && categoriaActual && categoriaNueva && (
          <div className="resultado-container">
            <div className="sueldos-comparados">
              <div className="sueldo-card sueldo-card-actual">
                <div className="sueldo-label sueldo-label-actual">Sueldo Actual</div>
                <div className="sueldo-monto sueldo-monto-actual">
                  ${formatearNumero(resultado.horasBase * categoriaActual.valorHora)}
                </div>
                <div className="sueldo-categoria sueldo-categoria-actual">
                  {categoriaActual.nombre}
                </div>
              </div>

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

            <div className="conversion-container">
              <div className="conversion-titulo">Conversión de Horas</div>

              <div className="conversion-grid">
                <div className="conversion-item">
                  <div className="conversion-label">Trabajadas</div>
                  <div className="conversion-numero conversion-numero-trabajadas">
                    {resultado.horasBase}
                  </div>
                  <div className="conversion-unidad conversion-unidad-trabajadas">horas</div>
                </div>

                <div className="conversion-item">
                  <div className="conversion-label">A Liquidar</div>
                  <div className="conversion-numero conversion-numero-liquidar">
                    {resultado.horasAjustadas}
                  </div>
                  <div className="conversion-unidad conversion-unidad-liquidar">horas</div>
                </div>

                <div className="conversion-item">
                  <div className="conversion-label">Diferencia</div>
                  <div className="conversion-numero conversion-numero-diferencia">
                    +{resultado.diferencia}
                  </div>
                  <div className="conversion-unidad conversion-unidad-diferencia">horas</div>
                </div>
              </div>

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