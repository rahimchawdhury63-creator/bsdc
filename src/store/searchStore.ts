import { create } from 'zustand';
/** Search UI state store for preserving query across pages. */
export const useSearchStore = create<{ query:string; setQuery:(query:string)=>void }>((set)=>({ query:'', setQuery:(query)=>set({query}) }));
