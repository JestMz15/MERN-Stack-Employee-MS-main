import Sidebar from "../components/EmployeeDashboard/Sidebar";
import { Outlet } from "react-router-dom";
import Navbar from "../components/dashboard/Navbar";
import DashboardLayout from "../components/layout/DashboardLayout";

const EmployeeDashboard = () => {
  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
