// src/hooks/useFetch.js
import { useState, useEffect, useCallback } from "react";

export function useFetch(fetchFn, deps = []) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const reload = useCallback(async () => {
        setLoading(true);
        try {
        const result = await fetchFn();
        setData(result);
        } catch (err) {
        console.error("불러오기 실패:", err);
        } finally {
        setLoading(false);
        }
    }, deps);

    useEffect(() => {
        reload();
    }, [reload]);

    return { data, loading, reload };
}