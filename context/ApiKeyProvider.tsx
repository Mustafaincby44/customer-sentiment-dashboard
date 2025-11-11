import React, { createContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { ApiKeyContextType } from '../types';

export const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [apiKey, setApiKey] = useLocalStorage<string | null>('gemini-api-key', null);
    
    return (
        <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
            {children}
        </ApiKeyContext.Provider>
    );
};
