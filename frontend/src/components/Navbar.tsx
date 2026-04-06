import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>📰 Plataforma de Artículos</Link>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Inicio</Link>
        <Link to="/articles/new" style={styles.link}>+ Nuevo artículo</Link>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    background: '#1a1a2e',
    color: 'white',
  },
  brand: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  links: {
    display: 'flex',
    gap: '16px',
  },
  link: {
    color: '#a0c4ff',
    textDecoration: 'none',
    fontSize: '14px',
  },
};
