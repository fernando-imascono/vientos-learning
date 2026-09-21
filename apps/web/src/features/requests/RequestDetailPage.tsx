import { useParams } from "react-router";

import { TodoPanel } from "../../components/TodoPanel.tsx";

/**
 * Journey 2, the screen that proves the exercise works: it shows the route,
 * the SOP fragments behind it, the priced items, and it is where approvals
 * happen.
 */
export function RequestDetailPage() {
  const { requestId } = useParams();

  return (
    <>
      <div>
        <span className="eyebrow">&gt; Request {requestId}</span>
        <h1>Request detail</h1>
      </div>

      <TodoPanel step="9.5" title="Decision panel">
        <ul>
          <li>
            Status, the route the agent chose, and the explanation in the user&apos;s own language.
          </li>
          <li>
            The SOP fragments that justify the route, quoted, with the document they came from. This
            is the evidence that the agent consulted the knowledge base.
          </li>
          <li>Priced line items and the total, computed by the backend from the catalog.</li>
          <li>Which SOP version was used — a later upload must not change this.</li>
        </ul>
      </TodoPanel>

      <TodoPanel step="8.8" title="Approve / reject">
        <ul>
          <li>
            Only while the status is <code>awaiting_approval</code>.
          </li>
          <li>
            Disable both buttons the moment one is clicked; a double click must not send two
            decisions.
          </li>
          <li>Show the outcome after the wait resolves, including an expiry.</li>
        </ul>
      </TodoPanel>

      <TodoPanel step="Extra B" title="Workflow graph (React Flow)">
        <ul>
          <li>Visualise the steps and the route taken. A read-only view, not an editor.</li>
          <li>
            Only after the required journey works end to end. See{" "}
            <code>features/workflow/WorkflowGraph.tsx</code>.
          </li>
        </ul>
      </TodoPanel>
    </>
  );
}
