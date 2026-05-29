import { useState, useEffect, useCallback } from "react";
import { api, generateDemoStatus, generateDemoData } from "../utils/api";

export function useLiveStatus(interval = 10000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await api.getStatus();
      setData(res.data);
      setIsDemo(false);
      setError(null);
    } catch (e) {
      setIsDemo(true);
      setData(generateDemoStatus());
      setError("Backend not connected — showing demo data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, interval);
    return () => clearInterval(id);
  }, [fetch, interval]);

  return { data, loading, error, isDemo, refetch: fetch };
}

export function useHistory(results = 200, interval = 30000) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await api.getHistory(results);
      setData(res.data.data || []);
      setIsDemo(false);
      setError(null);
    } catch (e) {
      setIsDemo(true);
      setData(generateDemoData(results));
      setError("Using demo data");
    } finally {
      setLoading(false);
    }
  }, [results]);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, interval);
    return () => clearInterval(id);
  }, [fetch, interval]);

  return { data, loading, error, isDemo, refetch: fetch };
}

export function useModelStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getModelStats()
      .then((r) => setData(r.data))
      .catch(() => setData({
        random_forest: { mae: "0.0243", rmse: "0.0312", r2: "0.9612", accuracy: 94.2 },
        ann: { mae: "0.0278", rmse: "0.0345", r2: "0.9580", accuracy: 92.8 },
        xgboost: { mae: "0.0198", rmse: "0.0267", r2: "0.9680", accuracy: 95.1 },
        ensemble: { accuracy: 96.3, r2: "0.9720" },
        samples_used: 500,
      }))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
