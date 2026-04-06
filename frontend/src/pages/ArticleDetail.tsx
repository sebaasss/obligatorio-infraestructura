import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { articlesApi } from '../api/articles';
import type { Article } from '../types/article';

export function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    articlesApi.getById(parseInt(id!, 10))
      .then(setArticle)
      .catch(() => setError('Artículo no encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este artículo?')) return;
    try {
      await articlesApi.delete(parseInt(id!, 10));
      navigate('/');
    } catch {
      alert('Error al eliminar.');
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const updated = await articlesApi.uploadCover(parseInt(id!, 10), file);
      setArticle(updated);
    } catch {
      alert('Error al subir imagen.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p style={{ padding: '24px' }}>Cargando...</p>;
  if (error || !article) return <p style={{ padding: '24px', color: 'red' }}>{error || 'No encontrado'}</p>;

  const date = new Date(article.createdAt).toLocaleDateString('es-UY');
  const updatedDate = new Date(article.updatedAt).toLocaleDateString('es-UY');

  return (
    <div style={styles.page}>
      {article.coverImageUrl && (
        <img src={article.coverImageUrl} alt="cover" style={styles.cover} />
      )}
      <div style={styles.content}>
        <div style={styles.meta}>
          <span style={article.source === 'generated' ? styles.badgeGen : styles.badgeManual}>
            {article.source}
          </span>
          <span style={styles.date}>Creado: {date} · Modificado: {updatedDate}</span>
        </div>
        <h1 style={styles.title}>{article.title}</h1>
        {article.summary && <p style={styles.summary}>{article.summary}</p>}
        <div style={styles.body}>{article.content}</div>
        {article.externalSourceUrl && (
          <p style={styles.source}>
            Fuente: <a href={article.externalSourceUrl} target="_blank" rel="noreferrer">{article.externalSourceUrl}</a>
          </p>
        )}
        <div style={styles.actions}>
          <Link to={`/articles/${article.id}/edit`} style={styles.btnEdit}>Editar</Link>
          <button onClick={handleDelete} style={styles.btnDelete}>Eliminar</button>
          <label style={styles.btnCover}>
            {uploading ? 'Subiendo...' : 'Cambiar portada'}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
          </label>
          <Link to="/" style={styles.btnBack}>← Volver</Link>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '800px', margin: '0 auto', padding: '24px' },
  cover: { width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '24px' },
  content: {},
  meta: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  badgeGen: { background: '#d0f0c0', color: '#2d6a2d', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  badgeManual: { background: '#cce5ff', color: '#003d80', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  date: { color: '#888', fontSize: '12px' },
  title: { margin: '0 0 12px', fontSize: '28px' },
  summary: { color: '#555', fontSize: '15px', fontStyle: 'italic', marginBottom: '16px' },
  body: { whiteSpace: 'pre-wrap', lineHeight: '1.7', color: '#333', marginBottom: '24px' },
  source: { fontSize: '12px', color: '#888', marginBottom: '24px' },
  actions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  btnEdit: { padding: '8px 16px', background: '#0066cc', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' },
  btnDelete: { padding: '8px 16px', background: '#cc0000', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' },
  btnCover: { padding: '8px 16px', background: '#555', color: 'white', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' },
  btnBack: { padding: '8px 16px', background: '#eee', color: '#333', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' },
};
