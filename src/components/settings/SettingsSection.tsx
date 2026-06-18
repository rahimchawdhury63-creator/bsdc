/** Generic settings section for real preference modules. */
export const SettingsSection = ({ title, description }: { readonly title: string; readonly description: string }) => <section className="surface-card"><h1>{title}</h1><p className="text-muted">{description}</p></section>;
