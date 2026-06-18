/** Spell correction prompt for Bangla and English search. */
export const DidYouMean = ({ suggestion, onUse }: { readonly suggestion: string | null; readonly onUse: (value: string) => void }) => suggestion ? <p className="did-you-mean">Did you mean <button type="button" onClick={() => onUse(suggestion)}>{suggestion}</button>?</p> : null;
