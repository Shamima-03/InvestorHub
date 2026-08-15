import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getMe } from "./store";
import { PublicLayout, DashboardLayout, ProtectedRoute } from "./components/Layout";
import Home from "./pages/Home";
import FindingGoal from "./pages/FindingGoal";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pending from "./pages/Pending";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";
import PostForm from "./pages/PostForm";
import Profile from "./pages/Profile";
import Matches from "./pages/Matches";
import Chat from "./pages/Chat";
import { Users, Reports, Analytics } from "./pages/Admin";
import PostDetail from "./pages/PostDetail";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) dispatch(getMe());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/finding-goal" element={<PublicLayout><FindingGoal /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/pending" element={<PublicLayout><Pending /></PublicLayout>} />
        <Route path="/post/:id" element={<PublicLayout><PostDetail /></PublicLayout>} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="posts" element={<Posts />} />
          <Route path="create-post" element={<PostForm />} />
          <Route path="edit-post/:id" element={<PostForm />} />
          <Route path="profile" element={<Profile />} />
          <Route path="matches" element={<Matches />} />
          <Route path="chat" element={<Chat />} />
          <Route path="users" element={<ProtectedRoute roles={["admin"]}><Users /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute roles={["admin"]}><Reports /></ProtectedRoute>} />
          <Route path="analytics" element={<ProtectedRoute roles={["admin"]}><Analytics /></ProtectedRoute>} />
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
