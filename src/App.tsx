import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import ResumeList from "@/pages/ResumeList";
import ResumeDetail from "@/pages/ResumeDetail";
import JobList from "@/pages/JobList";
import JobDetail from "@/pages/JobDetail";
import Screening from "@/pages/Screening";
import InterviewList from "@/pages/InterviewList";
import InterviewDetail from "@/pages/InterviewDetail";
import OfferList from "@/pages/OfferList";
import OfferDetail from "@/pages/OfferDetail";
import Onboarding from "@/pages/Onboarding";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/resumes" element={<ResumeList />} />
          <Route path="/resume/:id" element={<ResumeDetail />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/screening" element={<Screening />} />
          <Route path="/interviews" element={<InterviewList />} />
          <Route path="/interview/:id" element={<InterviewDetail />} />
          <Route path="/offers" element={<OfferList />} />
          <Route path="/offer/:id" element={<OfferDetail />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
