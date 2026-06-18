import { create } from 'zustand';
/** Local UI settings store; durable settings remain in Firestore user preferences. */
export const useSettingsStore = create<{ theme: 'light' | 'dark' | 'system'; language: 'bn' | 'en'; setTheme: (theme:'light'|'dark'|'system')=>void; setLanguage:(language:'bn'|'en')=>void }>((set)=>({ theme:'system', language:'bn', setTheme:(theme)=>set({theme}), setLanguage:(language)=>set({language}) }));
