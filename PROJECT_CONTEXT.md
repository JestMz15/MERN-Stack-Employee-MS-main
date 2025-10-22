# Contexto del Proyecto – Humana (MERN Stack Employee Management)

Este documento resume la arquitectura, módulos y flujos principales del sistema para acelerar futuras iteraciones.

## 1. Visión General

- **Objetivo**: plataforma web para administración de personal (empleados, departamentos, asistencia, permisos, nómina y documentos).
- **Roles**: `admin` (panel completo) y `employee` (panel con información personal, permisos y salario).
- **Arquitectura**: stack MERN desacoplado.
  - **Frontend**: React 18 + Vite, TailwindCSS, react-data-table-component, react-router-dom, React Context para autenticación/tema.
  - **Backend**: Express + Mongoose, JWT para autenticación, Cloudinary para archivos, Multer (memory storage) para uploads, nodemon en desarrollo.
  - **Base de datos**: MongoDB Atlas (cadena en `.env`).
  - **Almacenamiento de archivos**: Cloudinary (perfiles, expedientes y documentos).

## 2. Árbol de Carpetas Relevante

```
MERN-Stack-Employee-MS-main
├── frontend
│   ├── src
│   │   ├── components
│   │   │   ├── attendance          # Asistencia diaria e histórico
│   │   │   ├── dashboard           # Sidebar, resúmenes admin
│   │   │   ├── employee            # CRUD, vista, documentos
│   │   │   ├── leave, payroll, salary, department, etc.
│   │   ├── context                 # AuthContext, ThemeContext
│   │   ├── hooks                   # Pagination, etc.
│   │   ├── pages                   # Vistas principales (AdminDashboard, EmployeeDashboard, Login)
│   │   └── utils                   # API config, helpers, estilos tabla, rutas protegidas
│   ├── package.json                # Scripts vite/React
│   └── index.html / main.jsx / App.jsx
├── server
│   ├── controllers                 # Lógica Express por recurso
│   ├── middleware                  # authMiddleware, defaultAttendance, etc.
│   ├── models                      # Esquemas Mongoose (Employee, User, Attendance...)
│   ├── routes                      # Endpoints agrupados
│   ├── utils                       # Cloudinary, Multer, helpers
│   ├── public/uploads              # (sólo legacy, hoy usa Cloudinary)
│   ├── index.js                    # bootstrap Express + sirve frontend build
│   └── package.json
└── PROJECT_CONTEXT.md              # Este documento
```

## 3. Tecnologías Clave

| Capa       | Dependencias relevantes |
|-----------|--------------------------|
| Frontend  | React 18, Vite 5, Tailwind 3, react-data-table-component, axios, react-router-dom, styled-components (para algunos componentes heredados), react-icons |
| Backend   | Express 4, Mongoose 8, JWT, Bcrypt, Multer (memory), Cloudinary SDK, Streamifier, CORS, dotenv |
| Utilitarios | Nodemon (dev), ESLint (frontend), export-utils personalizados (CSV/PDF vía jsPDF + autoTable según implementación) |

## 4. Variables de Entorno (server/.env)

```dotenv
MONGO_DB_URI=...
PORT=5000
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

> **Importante**: los documentos de empleados y expedientes suben a Cloudinary. Se exige `resource_type: "image"` para perfiles y `"raw"` para expedientes/documentos (implementado en `employeeController.js`).

## 5. Scripts Útiles

| Ubicación  | Comando            | Descripción                         |
|------------|--------------------|-------------------------------------|
| `server`   | `npm run dev`      | Arranca Express con nodemon         |
|            | `npm start`        | Express en modo producción          |
|            | `npm run seed:demo`| (Si se implementa) seed de datos demo|
| `frontend` | `npm run dev`      | Servidor Vite (frontend)            |
|            | `npm run build`    | Compila producción en `dist/`       |
|            | `npm run lint`     | ESLint usando configuración por defecto |

## 6. Rutas y Módulos Backend

`server/index.js` monta los routers bajo `/api/*`:

| Ruta base        | Responsabilidad                                        | Archivo            |
|------------------|--------------------------------------------------------|--------------------|
| `/api/auth`      | Login, verificación token                              | `routes/auth.js`   |
| `/api/department`| CRUD de departamentos                                  | `routes/department.js` |
| `/api/employee`  | CRUD y utilidades empleados, documentos Cloudinary, estado activo/inactivo | `routes/employee.js` |
| `/api/salary`    | Gestión salarios, reportes de nómina                   | `routes/salary.js` |
| `/api/leave`     | Solicitudes de permiso, aprobación por admin           | `routes/leave.js`  |
| `/api/attendance`| Asistencia diaria (defaultAttendance + actualización por empleado) y reportes| `routes/attendance.js` |
| `/api/dashboard` | Datos de resumen para tarjetas del dashboard           | `routes/dashboard.js` |
| `/api/setting`   | Configuraciones generales                              | `routes/setting.js` |

Middleware relevantes:
- `authMiddleware`: valida JWT y expone `req.user`.
- `defaultAttendance`: genera registros de asistencia por empleado cada día si no existen.

## 7. Modelos (resumen de campos)

| Modelo      | Campos principales |
|-------------|--------------------|
| `User`      | `name`, `email`, `password`, `role` (`admin/employee`), `profileImage` + `profileImagePublicId` |
| `Employee`  | Referencia a `User`, `employeeId`, `department`, `salary`, `designation`, `status` (`active/inactive`), documentos (`documents[]`) y expediente (`expedienteFile/PublicId`) |
| `Department`| `dep_name`, `description`, timestamps. *Hook `pre('deleteOne')` limpia empleados/usuarios/salarios/leaves asociados.* |
| `Salary`    | `employeeId`, `basicSalary`, `allowances`, `deductions`, `netSalary`, `payDate` |
| `Leave`     | `employeeId`, `leaveType`, `status` (`Pending/Approved/Rejected`), fechas y motivo |
| `Attendance`| `date (yyyy-mm-dd)`, `employeeId`, `status` (`Present/Absent/Sick/Leave` o `null`) |

## 8. Frontend – Páginas y Componentes Clave

- **App.jsx**: declara rutas protegidas (`PrivateRoutes`, `RoleBaseRoutes`) y dashboards separados por rol.
- **Contextos**:
  - `AuthContext`: persiste usuario mediante `/api/auth/verify`, expone `login/logout/updateUser`.
  - `ThemeContext`: toggling claro/oscuro (usado en múltiples componentes).
- **Dashboard Admin**:
  - `components/dashboard/AdminSidebar.jsx`: navegación agrupada (General, Mantenimientos, Procesos, Reportes, Configuración).
  - `components/dashboard/AdminSummary.jsx`: tarjetas resumen (departamentos, empleados, etc.).
- **Gestión Empleados**:
  - `components/employee/List.jsx`: data table con filtros, tarjetas métricas, acciones (ver, editar, salario, permisos, toggle estado).
  - `components/employee/View.jsx`: ficha del empleado con detalles personales/laborales, descarga de expediente, CRUD de documentos (Cloudinary), toggle activo/inactivo.
  - `components/employee/Add.jsx` / `Edit.jsx`: formularios para alta/edición, consumo de `/api/department` y `/api/employee`.
- **Asistencia**:
  - `components/attendance/Attendance.jsx`: panel rediseñado con tarjetas KPI, filtros por estado (chips), buscador, exportaciones CSV/PDF, resumen de sincronización.
  - `components/attendance/AttendanceReport.jsx`: histórico con filtros por fecha.
  - `utils/AttendanceHelper.jsx`: columna acciones reemplazada por selector + “Limpiar”.
- **Permisos (Leave)**:
  - Solicitudes por empleado y gestión admin (`components/leave`).
- **Payroll / Salary**:
  - `components/payroll/AdminPayroll.jsx`: resumen mensual con filtros por departamento y exportes.
  - `components/salary` (Add/View) maneja salarios individuales y consulta para empleados.
- **Configuraciones**:
  - `components/EmployeeDashboard/Setting.jsx`: configuración de usuario/contraseña.
- **Otros utilitarios**: hooks (`useClientPagination`), helpers de tablas, `exportUtils` para CSV/PDF con metadatos.

## 9. Flujos Destacados

1. **Autenticación**:
   - Login (`/api/auth/login`) devuelve token y datos de usuario.
   - `AuthContext` guarda token en `localStorage` y lo usa para verificar (`/api/auth/verify`).
   - `RoleBaseRoutes` redirige según rol (admin → `/admin-dashboard`, employee → `/employee-dashboard`).

2. **Gestión de Empleados**:
   - Alta: formulario `Add.jsx` envía `FormData` (imagen opcional). Backend crea `User` + `Employee`, sube imagen a Cloudinary.
   - Vista: `View.jsx` obtiene `/api/employee/:id`, permite subir expediente (`/api/employee/:id/expediente` con `resource_type: "raw"`) y documentos adicionales (`/documents`), además de borrar documentos.
   - Toggle estado (`active/inactive`): `PATCH /api/employee/:id/status` expuesto tanto en lista como en detalle.

3. **Documentos Cloudinary**:
   - Utiliza `multer.memoryStorage` + `uploadBuffer` (`utils/cloudinaryUpload.js`).
   - Guarda `secure_url` y `public_id` en Mongo; al reemplazar expediente elimina asset previo (`deleteAsset`).

4. **Asistencia diaria**:
   - `defaultAttendance` se ejecuta en `GET /api/attendance` para crear registros vacíos por cada empleado cada día.
   - Tabla permite marcar estado por empleado (selector). Exportes con metadatos y totales.

5. **Permisos**:
   - Empleados solicitan permisos (`components/leave/Add.jsx`); admin gestiona en `/admin-dashboard/leaves`.

6. **Nómina y Salarios**:
   - Salarios individuales (`components/salary`) y resumen mensual (`components/payroll/AdminPayroll.jsx`) con filtros + exportes.

7. **Paneles**:
   - Admin: tarjetas de métricas, listas, gráficas (si se extiende).
   - Empleado: resumen, enlaces directos a perfil/salario/leave.

## 10. Consideraciones de Desarrollo

- **Consistencia UI**: Tailwind utilitario + componentes con gradientes y sombras. Muchos contenedores usan bordes redondeados (`rounded-4xl/3xl`).
- **Paginación**: `useClientPagination` gestiona paginación client-side (mantiene `currentPage`, `rowsPerPage`, `resetToggle`).
- **DataTable**: `getTableStyles(isDark)` ajusta esquema según tema.
- **Exportes**: `exportToCSV` y `exportToPrintablePdf` aceptan metadatos y resúmenes (utilizados en asistencia, nómina, etc.).
- **Protecciones**: `PrivateRoutes` bloquea si no hay usuario; `RoleBaseRoutes` valida rol antes de renderizar.
- **Eliminaciones cascada**: eliminar un departamento borra empleados y usuarios asociados, además de leaves/salaries (ver hook en `Department.js`).
- **Cloudinary**: si faltan variables, `utils/cloudinary.js` emite error en consola (ayuda para debugging).

## 11. Próximos Pasos / Ideas

- Añadir pruebas automatizadas (Jest/React Testing Library, Supertest para API).
- Implementar paginación server-side para listados grandes.
- Mejorar logs y manejo de errores HTTP (estandarizar mensajes y `try/catch` en controladores).
- Centralizar configuración de exportes (plantillas) y traducir reportes si se requieren otros idiomas.

---

Con este documento puedes rápidamente recordar el contexto de negocio, arquitectura y puntos de extensión antes de iniciar nuevas mejoras.
