/** Displays community rules from real community document. */
export const CommunityRules = ({ rules }: { readonly rules: readonly string[] }) => <section className="surface-card"><h2>Rules</h2>{rules.length === 0 ? <p className="text-muted">No rules added.</p> : <ol>{rules.map((rule) => <li key={rule}>{rule}</li>)}</ol>}</section>;
