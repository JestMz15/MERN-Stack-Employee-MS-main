import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { columns, EmployeeButtons } from "../../utils/EmployeeHelper";
import DataTable from "react-data-table-component";
import axios from "axios";
import API_BASE_URL from "../../utils/apiConfig";
import { resolveImageUrl, FALLBACK_AVATAR } from "../../utils/imageUtils";
import { useTheme } from "../../context/ThemeContext";
import {
  FiActivity,
  FiLayers,
  FiSearch,
  FiUserCheck,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
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

  const fetchEmployees = useCallback(async () => {
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
          const status = (emp?.status ?? "active").toLowerCase();
          const statusLabel = status === "inactive" ? "Inactivo" : "Activo";
          const statusClass =
            status === "inactive"
              ? "bg-rose-100 text-rose-600 dark:bg-rose-400/20 dark:text-rose-200"
              : "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-200";
          const safeDob = emp?.dob ? new Date(emp.dob).toLocaleDateString() : "Sin registro";

          return {
            _id: emp._id,
            sno: serial++,
            dep_name: departmentName,
            name: employeeName,
            dob: safeDob,
            status,
            statusLabel,
            statusBadge: (
              <span
                className={`inline-flex min-w-[96px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass}`}
              >
                {statusLabel}
              </span>
            ),
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
            action: (
              <EmployeeButtons
                Id={emp._id}
                status={status}
                onStatusChange={fetchEmployees}
              />
            ),
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
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

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
        emp.dep_name.toLowerCase().includes(normalized) ||
        emp.statusLabel.toLowerCase().includes(normalized),
    );
    setFilteredEmployees(records);
  };

  const customTableStyles = useMemo(() => getTableStyles(isDark), [isDark]);
  const activeCount = useMemo(
    () => employees.filter((employee) => employee.status === "active").length,
    [employees],
  );
  const inactiveCount = useMemo(
    () => employees.filter((employee) => employee.status === "inactive").length,
    [employees],
  );
  const departmentCount = useMemo(() => {
    const uniqueDepartments = new Set(
      employees
        .map((employee) => employee.dep_name)
        .filter((depName) => depName && depName !== "Sin departamento"),
    );
    return uniqueDepartments.size;
  }, [employees]);

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-4xl border border-slate-200 bg-white/85 p-8 shadow-xl backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-500 dark:text-teal-300">
              Empleados
            </p>
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Gestion de empleados
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Visualiza a tu equipo, gestiona sus permisos y realiza seguimientos de manera clara.
                  Encontrar, editar o dar seguimiento a cada colaborador es ahora mas sencillo.
                </p>
              </div>
              <Link
                to="/admin-dashboard/add-employee"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:from-teal-400 hover:via-teal-500 hover:to-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              >
                <FiUserPlus size={18} />
                Nuevo empleado
              </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <article className="rounded-3xl border border-slate-200 bg-white/80 p-5 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-200">
                    <FiUsers size={18} />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-teal-500/80 dark:text-teal-200/80">
                    Total
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
                  {employees.length}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Colaboradores registrados
                </p>
              </article>
              <article className="rounded-3xl border border-slate-200 bg-white/80 p-5 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-200">
                    <FiUserCheck size={18} />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-emerald-500/80 dark:text-emerald-200/80">
                    Activos
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
                  {activeCount}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Operativos actualmente
                </p>
              </article>
              <article className="rounded-3xl border border-slate-200 bg-white/80 p-5 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-200">
                    <FiLayers size={18} />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-amber-500/80 dark:text-amber-200/80">
                    Departamentos
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
                  {departmentCount}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Areas cubiertas por el equipo
                </p>
              </article>
            </div>
          </div>

          <aside className="rounded-4xl border border-slate-200 bg-white/85 p-8 shadow-xl backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-teal-500/10 text-teal-600 dark:text-teal-200">
                <FiActivity size={20} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 dark:text-teal-300">
                  Panel rapido
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Ajusta filtros y acciones
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Utiliza el buscador y las acciones para encontrar y administrar facilmente al personal.
            </p>

            <div className="mt-6 space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Buscar
              </label>
              <div className="relative">
                <FiSearch
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  size={18}
                />
                <input
                  value={searchTerm}
                  onChange={handleFilter}
                  type="text"
                  placeholder="Buscar por nombre, departamento o estado..."
                  className="w-full rounded-3xl border border-slate-200 bg-white py-3 pl-12 pr-5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-teal-300"
                />
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Estados
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 dark:border-slate-700 dark:bg-slate-900/60">
                  Activos
                  <strong className="text-sm text-emerald-600 dark:text-emerald-300">
                    {activeCount}
                  </strong>
                </span>
                <span className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 dark:border-slate-700 dark:bg-slate-900/60">
                  Inactivos
                  <strong className="text-sm text-rose-600 dark:text-rose-300">
                    {inactiveCount}
                  </strong>
                </span>
              </div>
            </div>
          </aside>
        </section>

        <section className="rounded-4xl border border-slate-200 bg-white/85 p-4 shadow-xl backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-inner dark:border-slate-800 dark:bg-slate-900/70">
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
        </section>
      </div>
    </div>
  );
};

export default List;
