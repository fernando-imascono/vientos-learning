/**
 * Placeholder shown by a screen that has not been built yet, so the app runs
 * from the first `pnpm dev` and every screen tells you what it owes you.
 * Delete each one as you implement its screen.
 */
export function TodoPanel({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="todo-card">
      <span className="eyebrow">&gt; TODO {step}</span>
      <h3>{title}</h3>
      {children}
    </section>
  );
}
