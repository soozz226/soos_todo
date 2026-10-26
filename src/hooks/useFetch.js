// src/hooks/useFetch.js
import { useState, useEffect, useCallback } from "react";

// 화면을 나갔다 들어와도 남아 있는 캐시 (앱을 완전히 껐다 켜면 초기화됨)
const cache = new Map();

// cacheKey 를 넘기면: 이전에 받은 데이터를 먼저 보여 주고, 뒤에서 새로 불러와 조용히 교체
// cacheKey 를 안 넘기면: 기존과 동일하게 동작
export function useFetch(fetchFn, deps = [], cacheKey = null) {
    const key = cacheKey ? `${cacheKey}|${JSON.stringify(deps)}` : null;

    const [data, setData] = useState(() => (key && cache.has(key) ? cache.get(key) : []));
    const [loading, setLoading] = useState(false);

    const load = useCallback(async (showSpinner) => {
        if (showSpinner) setLoading(true);
        try {
            const result = await fetchFn();
            if (key) cache.set(key, result);
            setData(result);
        } catch (err) {
            console.error("불러오기 실패:", err);
        } finally {
            if (showSpinner) setLoading(false);
        }
    }, deps);

    useEffect(() => {
        const cached = key && cache.has(key);
        if (cached) setData(cache.get(key));
        load(!cached); // 캐시가 있으면 로딩 표시 없이 뒤에서 갱신
    }, [load]);

    // 동기화 버튼, 저장 후 새로고침 등 직접 호출할 때는 기존처럼 loading 표시
    const reload = useCallback(() => load(true), [load]);

    return { data, loading, reload };
}