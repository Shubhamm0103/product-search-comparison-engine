import { Routes, Route } from 'react-router-dom';
import { CompareProvider } from './context/CompareContext';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import ComparePage from './pages/ComparePage';
import CompareBar from './components/CompareBar';

function App() {
  return (
    <CompareProvider>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
      <CompareBar />
    </CompareProvider>
  );
}

export default App;
