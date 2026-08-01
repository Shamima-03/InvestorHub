import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getMe } from "./features/auth/authSlice";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import FindingGoalPage from "./pages/FindingGoalPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import MyPosts from "./pages/dashboard/MyPosts";
import CreatePost from "./pages/dashboard/CreatePost";
import ProfilePage from "./pages/dashboard/ProfilePage";
import MatchesPage from "./pages/dashboard/MatchesPage";
import ChatPage from "./pages/dashboard/ChatPage";
import ManageUsers from "./pages/dashboard/ManageUsers";
import ReportsPage from "./pages/dashboard/ReportsPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import PostDetail from "./pages/dashboard/PostDetail";
import EditPost from "./pages/dashboard/EditPost";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) dispatch(getMe());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
        <Route path="/finding-goal" element={<PublicLayout><FindingGoalPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/post/:id" element={<PublicLayout><PostDetail /></PublicLayout>} />

        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardLayout /></ProtectedRoute>
        }>
          <Route index element={<DashboardOverview />} />
          <Route path="posts" element={<MyPosts />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="edit-post/:id" element={<EditPost />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="users" element={
            <ProtectedRoute roles={["admin"]}><ManageUsers /></ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute roles={["admin"]}><ReportsPage /></ProtectedRoute>
          } />
          <Route path="analytics" element={
            <ProtectedRoute roles={["admin"]}><AnalyticsPage /></ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={
          <PublicLayout>
            <div className="text-center py-20">
              <h1 className="text-4xl font-bold">404</h1>
              <p className="text-gray-500 mt-4">Page not found</p>
            </div>
          </PublicLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
