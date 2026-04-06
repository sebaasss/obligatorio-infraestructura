import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ArticleList } from './pages/ArticleList';
import { ArticleDetail } from './pages/ArticleDetail';
import { ArticleForm } from './pages/ArticleForm';

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui, sans-serif' }}>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<ArticleList />} />
            <Route path="/articles/new" element={<ArticleForm />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/articles/:id/edit" element={<ArticleForm />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
