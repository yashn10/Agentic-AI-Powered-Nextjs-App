// components/userContext.tsx
import { createContext } from "react";

export interface User {
    sub?: string;
    name?: string;
    email?: string;
    picture?: string;
    // allow extra fields from Google userinfo
    [key: string]: any;
}

export interface UserContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// provide a safe default value (no-op setter)
const defaultContext: UserContextType = {
    user: null,
    setUser: () => { },
};

const userContext = createContext<UserContextType>(defaultContext);

export default userContext;
