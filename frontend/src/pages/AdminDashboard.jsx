import AdminSidebar from "../components/dashboard/AdminSidebar";
import Navbar from "../components/dashboard/Navbar";
import { Outlet } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";

const AdminDashboard = () => {
  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </DashboardLayout>
  );
};

export default AdminDashboard;
