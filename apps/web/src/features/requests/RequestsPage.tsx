import { TodoPanel } from "../../components/TodoPanel.tsx";

/**
 * Journey 2, entry point: write a request in plain language and send it.
 */
export function RequestsPage() {
  return (
    <>
      <div>
        <span className="eyebrow">&gt; 02 · Requests</span>
        <h1>Requests</h1>
        <p>
          Describe what you need. The agent reads the SOP and the catalog, and decides the route.
        </p>
      </div>

      <TodoPanel step="5.6" title="New request form">
        <ul>
          <li>
            One textarea, one submit button. Example input:{" "}
            <code>Necesito comprar dos monitores para el equipo de diseño</code>.
          </li>
          <li>No clarification chat — a wrong request is corrected by sending a new one.</li>
          <li>On success, go to the detail screen; the run continues in Inngest.</li>
        </ul>
      </TodoPanel>

      <TodoPanel step="5.7" title="Request list">
        <ul>
          <li>Text excerpt, status chip, route, total, submitted-at. Newest first.</li>
          <li>
            Requests waiting for approval need to stand out — that is the one row a human must act
            on.
          </li>
        </ul>
      </TodoPanel>
    </>
  );
}
