import { useState, useEffect, useRef, useCallback } from 'react';
import { searchAddress } from '../services/ban.service';
import type { BANFeature } from '../types/ban.types';

interface UseAddressSearchOptions {
  debounceMs?: number;
  minLength?: number;
}

interface UseAddressSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  suggestions: BANFeature[];
  loading: boolean;
  error: string | null;
  clearSuggestions: () => void;
}

export function useAddressSearch(
  options: UseAddressSearchOptions = {}
): UseAddressSearchReturn {
  const { debounceMs = 300, minLength = 3 } = options;

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<BANFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (!query || query.trim().length < minLength) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    timerRef.current = setTimeout(async () => {
      abortRef.current = new AbortController();
      try {
        const result = await searchAddress(query, {
          limit: 8,
          autocomplete: 1,
        });
        setSuggestions(result.features);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Erreur lors de la recherche d\'adresse');
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, debounceMs, minLength]);

  return { query, setQuery, suggestions, loading, error, clearSuggestions };
}
