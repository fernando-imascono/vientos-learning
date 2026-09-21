import { NavLink, Navigate, Route, Routes } from "react-router";

import { KnowledgeBasePage } from "./features/knowledge-base/KnowledgeBasePage.tsx";
import { RequestDetailPage } from "./features/requests/RequestDetailPage.tsx";
import { RequestsPage } from "./features/requests/RequestsPage.tsx";

/** The two sections the brief asks for, plus the detail screen approvals happen on. */
export function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <span className="app-header__brand">Vientos · Purchase Requests</span>
          <nav className="app-nav">
            <NavLink to="/knowledge-base">Knowledge Base</NavLink>
            <NavLink to="/requests">Requests</NavLink>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/knowledge-base" replace />} />
          <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/requests/:requestId" element={<RequestDetailPage />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}
