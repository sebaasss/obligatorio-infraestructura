import { Link } from 'react-router-dom';
import type { Article } from '../types/article';

interface Props {
  article: Article;
  onDelete: (id: number) => void;
}

export function ArticleCard({ article, onDelete }: Props) {
  const date = new Date(article.createdAt).toLocaleDateString('es-UY');

  return (
    <div style={styles.card}>
      {article.coverImageUrl && (
        <img src={article.coverImageUrl} alt="cover" style={styles.cover} />
      )}
      <div style={styles.body}>
        <div style={styles.meta}>
          <span style={article.source === 'generated' ? styles.badgeGen : styles.badgeManual}>
            {article.source}
          </span>
          <span style={styles.date}>{date}</span>
        </div>
        <h3 style={styles.title}>{article.title}</h3>
        {article.summary && <p style={styles.summary}>{article.summary}</p>}
        <div style={styles.actions}>
          <Link to={`/articles/${article.id}`} style={styles.btnView}>Ver</Link>
          <Link to={`/articles/${article.id}/edit`} style={styles.btnEdit}>Editar</Link>
          <button style={styles.btnDelete} onClick={() => onDelete(article.id)}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.07)',
  },
  cover: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
  },
  body: { padding: '16px' },
  meta: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  badgeGen: {
    background: '#d0f0c0',
    color: '#2d6a2d',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  badgeManual: {
    background: '#cce5ff',
    color: '#003d80',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  date: { color: '#888', fontSize: '12px' },
  title: { margin: '0 0 8px', fontSize: '16px', color: '#222' },
  summary: { color: '#555', fontSize: '13px', margin: '0 0 12px' },
  actions: { display: 'flex', gap: '8px' },
  btnView: {
    padding: '6px 12px',
    background: '#1a1a2e',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '13px',
  },
  btnEdit: {
    padding: '6px 12px',
    background: '#0066cc',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '13px',
  },
  btnDelete: {
    padding: '6px 12px',
    background: '#cc0000',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
};
