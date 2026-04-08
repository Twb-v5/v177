import { useState, useEffect, useCallback } from "react";

const ALQURAN_API = "https://api.alquran.cloud/v1";

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  translation: string;
  audio: string;
}

export function useSurahList() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSurahs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${ALQURAN_API}/surah`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSurahs(data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurahs();
  }, [fetchSurahs]);

  return { surahs, loading, error, refetch: fetchSurahs };
}

export function useAyahs(surahNumber: number) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAyahs = useCallback(async () => {
    if (!surahNumber) return;
    try {
      setLoading(true);
      const res = await fetch(`${ALQURAN_API}/surah/${surahNumber}/ar.alafasy`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAyahs(data.data.ayahs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [surahNumber]);

  useEffect(() => {
    fetchAyahs();
  }, [fetchAyahs]);

  return { ayahs, loading, error, refetch: fetchAyahs };
}

export function useSearchSurahs(query: string, surahs: Surah[]) {
  const [results, setResults] = useState<Surah[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(surahs);
      return;
    }
    const q = query.toLowerCase();
    const filtered = surahs.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        s.number.toString() === q
    );
    setResults(filtered);
  }, [query, surahs]);

  return results;
}
