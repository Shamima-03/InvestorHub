import { useSelector } from "react-redux";
import InvestorDashboard from "./InvestorDashboard";
import BusinessmanDashboard from "./BusinessmanDashboard";
import ManageUsers from "./ManageUsers";

export default function DashboardOverview() {
  const { user } = useSelector((state) => state.auth);

  if (user?.role === "admin") return <ManageUsers />;
  if (user?.role === "businessman") return <BusinessmanDashboard />;
  return <InvestorDashboard />;
}
