import { useEffect, useState } from 'react';
import { articlesApi } from '../api/articles';
import { ArticleCard } from '../components/ArticleCard';
import type { Article } from '../types/article';

export function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const limit = 12;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await articlesApi.list({ page, limit, search: search || undefined, source: source || undefined });
      setArticles(res.articles);
      setTotal(res.total);
    } catch {
      setError('Error al cargar artículos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, source]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este artículo?')) return;
    try {
      await articlesApi.delete(id);
      load();
    } catch {
      alert('Error al eliminar el artículo.');
    }
  };

  const handleGenerate = async () => {
    if (!confirm('¿Generar artículos automáticos?')) return;
    setGenerating(true);
    try {
      const res = await articlesApi.generate();
      alert(res.message);
      load();
    } catch {
      alert('Error al generar artículos.');
    } finally {
      setGenerating(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.h1}>Artículos ({total})</h1>
        <button onClick={handleGenerate} disabled={generating} style={styles.btnGenerate}>
          {generating ? 'Generando...' : '⚡ Generar automáticos'}
        </button>
      </div>

      <form onSubmit={handleSearch} style={styles.filters}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por título..."
          style={styles.input}
        />
        <select value={source} onChange={e => { setSource(e.target.value); setPage(1); }} style={styles.select}>
          <option value="">Todos</option>
          <option value="manual">Manual</option>
          <option value="generated">Generado</option>
        </select>
        <button type="submit" style={styles.btnSearch}>Buscar</button>
      </form>

      {error && <p style={styles.error}>{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div style={styles.grid}>
          {articles.map(a => (
            <ArticleCard key={a.id} article={a} onDelete={handleDelete} />
          ))}
          {articles.length === 0 && <p>No hay artículos.</p>}
        </div>
      )}

      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={styles.btnPage}>←</button>
          <span>Página {page} de {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={styles.btnPage}>→</button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  h1: { margin: 0, fontSize: '24px' },
  btnGenerate: {
    padding: '8px 16px',
    background: '#2d6a2d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  filters: { display: 'flex', gap: '8px', marginBottom: '20px' },
  input: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 },
  select: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' },
  btnSearch: {
    padding: '8px 16px',
    background: '#1a1a2e',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' },
  btnPage: { padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' },
  error: { color: 'red' },
};
