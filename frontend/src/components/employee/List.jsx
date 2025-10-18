import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { columns, EmployeeButtons } from "../../utils/EmployeeHelper";
import DataTable from "react-data-table-component";
import axios from "axios";
import API_BASE_URL from "../../utils/apiConfig";
import { resolveImageUrl, FALLBACK_AVATAR } from "../../utils/imageUtils";
import { useTheme } from "../../context/ThemeContext";
import { FiSearch, FiUserPlus } from "react-icons/fi";
import getTableStyles from "../../utils/tableStyles";
import useClientPagination from "../../hooks/useClientPagination";

const List = () => {
  const { isDark } = useTheme();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [empLoading, setEmpLoading] = useState(false);
  const {
    currentPage,
    rowsPerPage,
    paginatedData,
    totalRows,
    handleChangePage,
    handleChangeRowsPerPage,
    resetToggle,
  } = useClientPagination(filteredEmployees);

  useEffect(() => {
    const fetchEmployees = async () => {
      setEmpLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/employee`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          let serial = 1;
          const mappedEmployees = response.data.employees.map((emp) => {
            const departmentName = emp?.department?.dep_name ?? "Sin departamento";
            const employeeName = emp?.userId?.name ?? "Sin nombre";
            const imageUrl = resolveImageUrl(emp?.userId?.profileImage);

            return {
              _id: emp._id,
              sno: serial++,
              dep_name: departmentName,
              name: employeeName,
              dob: new Date(emp.dob).toLocaleDateString(),
              profileImage: (
                <img
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-offset-2 ring-teal-300/60 ring-offset-white dark:ring-offset-slate-900"
                  src={imageUrl || FALLBACK_AVATAR}
                  alt={`${employeeName} profile`}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_AVATAR;
                  }}
                />
              ),
              action: <EmployeeButtons Id={emp._id} />,
            };
          });
          setEmployees(mappedEmployees);
          setFilteredEmployees(mappedEmployees);
          setSearchTerm("");
        }
      } catch (error) {
        console.log(error.message);
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      } finally {
        setEmpLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleFilter = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      setFilteredEmployees(employees);
      return;
    }

    const records = employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(normalized) ||
        emp.dep_name.toLowerCase().includes(normalized),
    );
    setFilteredEmployees(records);
  };

  const customTableStyles = useMemo(() => getTableStyles(isDark), [isDark]);

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-300">
              Empleados
            </p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Gestion de empleados
            </h1>
            <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
              Consulta, filtra y administra la informacion de tu equipo desde este panel
              moderno con soporte para modo claro y oscuro.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-teal-100 bg-teal-50 px-6 py-4 text-teal-700 shadow-md shadow-teal-100/60 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
              <p className="text-xs font-medium uppercase tracking-wide text-teal-500 dark:text-teal-200/80">
                Total de empleados
              </p>
              <p className="text-3xl font-semibold">{employees.length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <FiSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                size={18}
              />
              <input
                value={searchTerm}
                onChange={handleFilter}
                type="text"
                placeholder="Buscar por nombre o departamento..."
                className="w-full rounded-full border border-slate-200 bg-white py-3 pl-12 pr-6 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-teal-300"
              />
            </div>
            <Link
              to="/admin-dashboard/add-employee"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:from-teal-400 hover:via-teal-500 hover:to-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            >
              <FiUserPlus size={18} />
              Nuevo empleado
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
            <DataTable
              columns={columns}
              data={paginatedData}
              progressPending={empLoading}
              pagination
              paginationServer
              paginationPerPage={rowsPerPage}
              paginationRowsPerPageOptions={[5, 10, 15, 20, 30, 50]}
              paginationTotalRows={totalRows}
              paginationDefaultPage={currentPage}
              paginationResetDefaultPage={resetToggle}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              highlightOnHover
              responsive
              striped
              customStyles={customTableStyles}
              progressComponent={
                <div className="flex h-40 w-full items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-300">
                  Cargando empleados...
                </div>
              }
              noDataComponent={
                <div className="flex h-40 w-full items-center justify-center text-sm font-medium text-slate-400 dark:text-slate-300">
                  No se encontraron empleados con el criterio actual.
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;
