import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { columns, DepartmentButtons } from "../../utils/DepartmentHelper";
import axios from "axios";
import API_BASE_URL from "../../utils/apiConfig";
import { useTheme } from "../../context/ThemeContext";
import getTableStyles from "../../utils/tableStyles";
import useClientPagination from "../../hooks/useClientPagination";
import {
  FiCalendar,
  FiFileText,
  FiLayers,
  FiPlusCircle,
  FiSearch,
} from "react-icons/fi";

const DepartmentList = () => {
  const { isDark } = useTheme();
  const [departments, setDepartments] = useState([]);
  const [depLoading, setDepLoading] = useState(false);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const {
    currentPage,
    rowsPerPage,
    paginatedData,
    totalRows,
    handleChangePage,
    handleChangeRowsPerPage,
    resetToggle,
  } = useClientPagination(filteredDepartments);

  const fetchDepartments = useCallback(async () => {
    setDepLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/department`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        let serial = 1;
        const mapped = response.data.departments.map((dep) => {
          const descriptionPlain = dep.description?.trim() ?? "";
          const createdAt = dep.createdAt ? new Date(dep.createdAt) : null;
          const updatedAt = dep.updatedAt ? new Date(dep.updatedAt) : null;
          return {
            _id: dep._id,
            sno: serial++,
            dep_name: dep.dep_name,
            descriptionPlain,
            descriptionPreview:
              descriptionPlain.length > 0
                ? descriptionPlain
                : "Sin descripcion registrada",
            createdAtLabel: createdAt
              ? createdAt.toLocaleDateString()
              : "Sin registro",
            createdAtSortKey: createdAt ? createdAt.getTime() : 0,
            updatedAtLabel: updatedAt
              ? updatedAt.toLocaleDateString()
              : "Sin registro",
            action: (
              <DepartmentButtons
                Id={dep._id}
                name={dep.dep_name}
                description={descriptionPlain}
                onDepartmentDelete={fetchDepartments}
              />
            ),
          };
        });
        setDepartments(mapped);
        setFilteredDepartments(mapped);
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    } finally {
      setDepLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const filterDepartments = (event) => {
    const value = event.target.value.toLowerCase();
    if (!value.trim()) {
      setFilteredDepartments(departments);
      return;
    }
    const records = departments.filter((dep) => {
      const matchesName = dep.dep_name.toLowerCase().includes(value);
      const matchesDescription = dep.descriptionPlain
        ?.toLowerCase()
        .includes(value);
      return matchesName || matchesDescription;
    });
    setFilteredDepartments(records);
  };

  const customTableStyles = useMemo(() => getTableStyles(isDark), [isDark]);
  const departmentStats = useMemo(() => {
    if (departments.length === 0) {
      return {
        total: 0,
        withDescription: 0,
        lastUpdatedLabel: "Sin registros",
      };
    }
    const withDescription = departments.filter(
      (dep) => dep.descriptionPlain && dep.descriptionPlain.length > 0,
    ).length;
    const mostRecent = departments
      .map((dep) => ({
        label: dep.dep_name,
        sortKey: dep.createdAtSortKey,
        updatedLabel: dep.updatedAtLabel,
      }))
      .sort((a, b) => b.sortKey - a.sortKey)[0];
    return {
      total: departments.length,
      withDescription,
      lastUpdatedLabel: mostRecent?.updatedLabel ?? "Sin registros",
    };
  }, [departments]);

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-300">
              Departamentos
            </p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Gestion de departamentos
            </h1>
            <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
              Visualiza, busca y administra las areas principales de tu organizacion
              con un panel disenado para ambos temas.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50 px-6 py-4 text-teal-700 shadow-md shadow-teal-100/60 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
              <FiLayers size={22} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-teal-500 dark:text-teal-200/80">
                  Total de areas
                </p>
                <p className="text-3xl font-semibold">
                  {departmentStats.total}
                </p>
              </div>
            </div>
            <div className="hidden flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 px-6 py-4 text-slate-600 shadow-md shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 lg:flex">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                <FiFileText size={14} />
                Documentacion
              </div>
              <p className="text-sm font-medium">
                {departmentStats.withDescription} departamentos con descripcion
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Ultima actualizacion: {departmentStats.lastUpdatedLabel}
              </p>
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
                type="text"
                onChange={filterDepartments}
                placeholder="Buscar por nombre de departamento..."
                className="w-full rounded-full border border-slate-200 bg-white py-3 pl-12 pr-6 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-teal-300"
              />
            </div>
            <Link
              to="/admin-dashboard/add-department"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:from-teal-400 hover:via-teal-500 hover:to-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            >
              <FiPlusCircle size={18} />
              Nuevo departamento
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
            <DataTable
              columns={columns}
              data={paginatedData}
              progressPending={depLoading}
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
                  Cargando departamentos...
                </div>
              }
              noDataComponent={
                <div className="flex h-40 w-full items-center justify-center text-sm font-medium text-slate-400 dark:text-slate-300">
                  No se encontraron departamentos con el criterio actual.
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentList;
