import { TodoPanel } from "../../components/TodoPanel.tsx";

/**
 * Journey 1: upload the purchasing SOP and see it become usable knowledge.
 * Uploading prepares knowledge — it must never look like it started a purchase.
 */
export function KnowledgeBasePage() {
  return (
    <>
      <div>
        <span className="eyebrow">&gt; 01 · Knowledge</span>
        <h1>Knowledge Base</h1>
        <p>Upload the purchasing SOP. Only an available document can be used by a request.</p>
      </div>

      <TodoPanel step="4.4" title="Upload form">
        <ul>
          <li>
            A single PDF file input plus a submit button, wired to <code>useUploadDocument()</code>.
          </li>
          <li>
            Disable the button while the mutation is in flight; show the server error when it fails.
          </li>
          <li>
            The brief demands a readable failure for an illegible PDF — design that state first.
          </li>
        </ul>
      </TodoPanel>

      <TodoPanel step="4.5" title="Document list">
        <ul>
          <li>Filename, uploaded-at, and status as a chip: processing / available / failed.</li>
          <li>Failed rows show the reason. Available rows open the extracted text for review.</li>
          <li>Mark which document is the active SOP — a request can only use an available one.</li>
        </ul>
      </TodoPanel>
    </>
  );
}
