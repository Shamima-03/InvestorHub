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
import Onboarding from "./pages/Onboarding";
import EntryFee from "./pages/EntryFee";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";
import PostForm from "./pages/PostForm";
import Profile from "./pages/Profile";
import Matches from "./pages/Matches";
import Investments from "./pages/Investments";
import PaymentResult from "./pages/PaymentResult";
import Invoice from "./pages/Invoice";
import MyReports from "./pages/MyReports";
import Chat from "./pages/Chat";
import { Users, Reports, Analytics, Listings, Payments, UserProfile, ContactMessages } from "./pages/Admin";
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
        <Route path="/onboarding" element={<PublicLayout><Onboarding /></PublicLayout>} />
        <Route path="/entry-fee" element={<PublicLayout><EntryFee /></PublicLayout>} />
        <Route path="/post/:id" element={<PublicLayout><PostDetail /></PublicLayout>} />
        <Route path="/payment/success" element={<PublicLayout><PaymentResult status="success" /></PublicLayout>} />
        <Route path="/payment/fail" element={<PublicLayout><PaymentResult status="fail" /></PublicLayout>} />
        <Route path="/payment/cancel" element={<PublicLayout><PaymentResult status="cancel" /></PublicLayout>} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="posts" element={<Posts />} />
          <Route path="create-post" element={<PostForm />} />
          <Route path="edit-post/:id" element={<PostForm />} />
          <Route path="profile" element={<Profile />} />
          <Route path="matches" element={<Matches />} />
          <Route path="investments" element={<Investments />} />
          <Route path="invoice/:id" element={<Invoice />} />
          <Route path="my-reports" element={<MyReports />} />
          <Route path="chat" element={<Chat />} />
          <Route path="users" element={<ProtectedRoute roles={["admin"]}><Users /></ProtectedRoute>} />
          <Route path="users/:id" element={<ProtectedRoute roles={["admin"]}><UserProfile /></ProtectedRoute>} />
          <Route path="listings" element={<ProtectedRoute roles={["admin"]}><Listings /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute roles={["admin"]}><Reports /></ProtectedRoute>} />
          <Route path="payments" element={<ProtectedRoute roles={["admin"]}><Payments /></ProtectedRoute>} />
          <Route path="contacts" element={<ProtectedRoute roles={["admin"]}><ContactMessages /></ProtectedRoute>} />
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
