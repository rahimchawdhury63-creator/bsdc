/**
 * src/components/search/SearchBar.jsx
 * ---------------------------------------------------------------------------
 * Global search input with live suggestions dropdown.
 *
 * Used in: Header (desktop) and Search page (top).
 * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useSearch from '../../hooks/useSearch.js';
import SearchSuggestions from './SearchSuggestions.jsx';
import { TYPE_URL_SEGMENT } from '../../utils/seoGenerator.js';
import { IconSearch, IconClose } from '../common/Icons.jsx';

export default function SearchBar({ autoFocus = false, defaultValue = '' }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const { results, loading, recent, commit, clearHistory } = useSearch(query);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const submit = (q = query) => {
    const norm = String(q || '').trim();
    if (!norm) return;
    commit(norm);
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(norm)}`);
  };

  const onPick = (sel) => {
    if (sel.kind === 'history') {
      setQuery(sel.query);
      submit(sel.query);
    } else if (sel.kind === 'user') {
      setOpen(false);
      navigate(`/p/${sel.value.username}`);
    } else if (sel.kind === 'post') {
      setOpen(false);
      const seg = TYPE_URL_SEGMENT[sel.value.type] || 'post';
      navigate(`/${seg}/${sel.value.slug || sel.value.id}`);
    }
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="bsdc-search"
      >
        <span className="bsdc-search__icon" aria-hidden="true"><IconSearch size={18} /></span>
        <input
          type="search"
          className="bsdc-input bsdc-search__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search posts, people, code, jobs…"
          aria-label="Search BSDC"
          autoFocus={autoFocus}
          autoComplete="off"
          // Add right-padding so the clear button doesn't overlap typing.
          style={{ paddingRight: query ? 40 : 14 }}
        />
        {query && (
          <button
            type="button"
            className="bsdc-icon-btn bsdc-icon-btn--sm"
            aria-label="Clear search"
            onClick={() => setQuery('')}
            style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
          >
            <IconClose size={16} />
          </button>
        )}
      </form>

      {open && (
        <SearchSuggestions
          query={query}
          results={results}
          loading={loading}
          recent={recent}
          onPick={onPick}
          onClearHistory={clearHistory}
          onSubmit={submit}
        />
      )}
    </div>
  );
}
