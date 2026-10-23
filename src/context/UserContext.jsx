// src/context/UserContext.jsx
import { createContext, useContext } from "react";

const UserContext = createContext({ user: "SOO", meta: "1 members · Private" });

export function useUser() {
    return useContext(UserContext);
}