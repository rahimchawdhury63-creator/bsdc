/** Exam results summary component. */
export const ExamResults = ({ score, passed }: { readonly score:number; readonly passed:boolean }) => <section className="surface-card"><h2>Exam result</h2><p>Score: {score}</p><p>{passed?'Passed':'Not passed'}</p></section>;
