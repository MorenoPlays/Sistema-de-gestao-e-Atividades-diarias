import { useState, useCallback, useEffect } from 'react';

/**
 * Hook para gerenciar requisições à API
 * Fornece loading, erro e estado de sucesso
 */
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      const message = err.message || 'Erro na operação';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, request, setError };
}

/**
 * Hook para gerenciar lista de itens da API
 */
export function useApiList(fetchFn, dependencies = []) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadItems = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn(pageNum);
      setItems(result.data || result);
      if (result.pagination) {
        setPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (err) {
      setError(err.message || 'Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  // Carregar itens ao montar o componente
  useEffect(() => {
    loadItems(1);
  }, dependencies);

  return {
    items,
    loading,
    error,
    page,
    totalPages,
    setPage: (p) => {
      setPage(p);
      loadItems(p);
    },
    refresh: () => loadItems(page),
  };
}
