import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articlesApi } from '../api/articles';

export function ArticleForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    articlesApi.getById(parseInt(id!, 10))
      .then(a => {
        setTitle(a.title);
        setContent(a.content);
        setSummary(a.summary || '');
        setStatus(a.status);
      })
      .catch(() => setError('Error al cargar artículo.'))
      .finally(() => setLoadingData(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Título y contenido son requeridos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      let article;
      if (isEdit) {
        article = await articlesApi.update(parseInt(id!, 10), { title, content, summary, status });
      } else {
        article = await articlesApi.create({ title, content, summary, status });
      }
      if (coverFile) {
        await articlesApi.uploadCover(article.id, coverFile);
      }
      navigate(`/articles/${article.id}`);
    } catch {
      setError('Error al guardar el artículo.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <p style={{ padding: '24px' }}>Cargando...</p>;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>{isEdit ? 'Editar artículo' : 'Nuevo artículo'}</h1>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Título *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} style={styles.input} required />

        <label style={styles.label}>Resumen</label>
        <input value={summary} onChange={e => setSummary(e.target.value)} style={styles.input} />

        <label style={styles.label}>Contenido *</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} style={styles.textarea} required />

        <label style={styles.label}>Estado</label>
        <select value={status} onChange={e => setStatus(e.target.value as 'published' | 'draft')} style={styles.input}>
          <option value="published">Publicado</option>
          <option value="draft">Borrador</option>
        </select>

        <label style={styles.label}>Imagen de portada (opcional)</label>
        <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] ?? null)} />

        <div style={styles.buttons}>
          <button type="submit" disabled={loading} style={styles.btnSubmit}>
            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear artículo'}
          </button>
          <button type="button" onClick={() => navigate(-1)} style={styles.btnCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '700px', margin: '0 auto', padding: '24px' },
  title: { marginBottom: '20px', fontSize: '24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  label: { fontWeight: 'bold', fontSize: '14px' },
  input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' },
  textarea: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', minHeight: '200px', resize: 'vertical' },
  buttons: { display: 'flex', gap: '8px', marginTop: '8px' },
  btnSubmit: { padding: '10px 20px', background: '#1a1a2e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  btnCancel: { padding: '10px 20px', background: '#eee', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  error: { color: 'red', background: '#fff0f0', padding: '10px', borderRadius: '4px' },
};
