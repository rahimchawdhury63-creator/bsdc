/**
 * src/hooks/useAuth.js
 * ---------------------------------------------------------------------------
 * Convenience re-export so components can import from the conventional
 * hooks/ folder instead of the context/ folder.
 *
 *   import { useAuth } from '@hooks/useAuth';
 *
 * The actual implementation lives in src/context/AuthContext.jsx.
 * ---------------------------------------------------------------------------
 */
export { useAuth } from '../context/AuthContext.jsx';
export { default as AuthProvider } from '../context/AuthContext.jsx';
