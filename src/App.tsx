// ========== App.tsx ========== (Actualizado)
import './styles/index.css';
import './styles/components.css';
import CalculadoraConversion from './components/CalculadoraConversion';

function App() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        background: 'linear-gradient(to bottom, #fafafa 0%, #ffffff 100%)',
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 300,
            color: 'var(--gray-900)',
            marginBottom: '0.25rem',
            letterSpacing: '0.05em',
          }}
        >
          Sistema de Recategorizaciones
        </h1>
        <p
          style={{
            color: 'var(--gray-500)',
            fontSize: '0.8rem',
            fontWeight: 300,
            letterSpacing: '0.03em',
          }}
        >
          Calculadora de conversión de horas
        </p>
      </header>

      {/* Calculadora */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <CalculadoraConversion />
      </div>
    </div>
  );
}

export default App;