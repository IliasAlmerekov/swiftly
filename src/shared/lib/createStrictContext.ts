import { createContext, useContext } from 'react';

interface StrictContextOptions {
  contextName: string;
  errorMessage: string;
}

export function createStrictContext<T>({ contextName, errorMessage }: StrictContextOptions) {
  const Context = createContext<T | undefined>(undefined);
  Context.displayName = contextName;

  const useStrictContext = (): T => {
    const value = useContext(Context);

    if (value === undefined) {
      throw new Error(errorMessage);
    }

    return value;
  };

  return [Context, useStrictContext] as const;
}
