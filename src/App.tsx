import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import InspirationPage from "@/pages/InspirationPage";
import MaterialsPage from "@/pages/MaterialsPage";
import DraftsPage from "@/pages/DraftsPage";
import EvaluationPage from "@/pages/EvaluationPage";
import ReviewPage from "@/pages/ReviewPage";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<InspirationPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/drafts" element={<DraftsPage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="/review" element={<ReviewPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
