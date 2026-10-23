import { useState, useEffect, useRef, useCallback } from "react";

export function useNav(initialScreen) {
  const [stack, setStack] = useState([initialScreen]);
  const stackRef = useRef(stack);
  stackRef.current = stack;

  const guardRef = useRef(null);

  useEffect(() => {
    history.replaceState({ depth: 0 }, "");

    const onPop = (e) => {
      const depth = e.state?.depth ?? 0;
      const curDepth = stackRef.current.length - 1;
      if (depth >= curDepth) return;

      if (guardRef.current?.()) {
        history.pushState({ depth: curDepth }, "");
        return;
      }
      setStack((s) => s.slice(0, depth + 1));
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const push = useCallback((screen) => {
    history.pushState({ depth: stackRef.current.length }, "");
    setStack((s) => [...s, screen]);
  }, []);

  const back = useCallback(() => history.back(), []);

  return { screen: stack[stack.length - 1], push, back, guardRef };
}