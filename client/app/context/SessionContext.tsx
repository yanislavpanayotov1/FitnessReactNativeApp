import { createContext, ReactNode, useState } from "react";

interface SessionContextType {
    sessionId: number | null;
    setSessionId: (sessionId: number | null) => void;
}

export const SessionContext = createContext<SessionContextType>({
    sessionId: 1,
    setSessionId: () => { },
});

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [sessionId, setSessionId] = useState<number | null>(null);

    return (
        <SessionContext.Provider value={{ sessionId, setSessionId }}>
            {children}
        </SessionContext.Provider>
    );
};