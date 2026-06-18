/** Shows active typing users from RTDB typing state. */
export const TypingIndicator = ({ names }: { readonly names: readonly string[] }) => names.length > 0 ? <p className="typing-indicator">{names.join(', ')} typing</p> : null;
