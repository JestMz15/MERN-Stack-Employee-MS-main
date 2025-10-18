import bcrypt from "bcrypt";
import connectToDatabase from "./db/db.js";
import User from "./models/User.js";
import Department from "./models/Department.js";
import Employee from "./models/Employee.js";
import Leave from "./models/Leave.js";
import Salary from "./models/Salary.js";
import Attendance from "./models/Attendance.js";

const departmentsSeed = [
  {
    dep_name: "Recursos Humanos",
    description:
      "Gestiona el talento, procesos de contratacion, capacitaciones y bienestar del personal.",
  },
  {
    dep_name: "Desarrollo de Software",
    description:
      "Equipo enfocado en el diseno, desarrollo y despliegue de soluciones tecnologicas.",
  },
  {
    dep_name: "Finanzas y Contabilidad",
    description:
      "Supervisa el flujo de caja, presupuestos, cuentas por pagar y reporteria financiera.",
  },
  {
    dep_name: "Marketing y Ventas",
    description:
      "Encargados de la estrategia comercial, campanas y gestion de clientes.",
  },
];

const employeesSeed = [
  {
    name: "Andrea Castillo",
    email: "andrea.castillo@humana.gt",
    password: "Empleado123!",
    employeeId: "EMP-001",
    dob: "1992-02-17",
    gender: "female",
    maritalStatus: "married",
    designation: "Especialista en reclutamiento",
    departmentName: "Recursos Humanos",
    salary: 7800,
  },
  {
    name: "Diego Morales",
    email: "diego.morales@humana.gt",
    password: "Empleado123!",
    employeeId: "EMP-002",
    dob: "1990-07-03",
    gender: "male",
    maritalStatus: "single",
    designation: "Desarrollador full-stack",
    departmentName: "Desarrollo de Software",
    salary: 12500,
  },
  {
    name: "Lucia Rosales",
    email: "lucia.rosales@humana.gt",
    password: "Empleado123!",
    employeeId: "EMP-003",
    dob: "1995-11-22",
    gender: "female",
    maritalStatus: "single",
    designation: "Coordinadora financiera",
    departmentName: "Finanzas y Contabilidad",
    salary: 10100,
  },
  {
    name: "Carlos Alvarez",
    email: "carlos.alvarez@humana.gt",
    password: "Empleado123!",
    employeeId: "EMP-004",
    dob: "1988-05-12",
    gender: "male",
    maritalStatus: "married",
    designation: "Lider de proyectos",
    departmentName: "Desarrollo de Software",
    salary: 13800,
  },
  {
    name: "Marta Palacios",
    email: "marta.palacios@humana.gt",
    password: "Empleado123!",
    employeeId: "EMP-005",
    dob: "1993-09-28",
    gender: "female",
    maritalStatus: "single",
    designation: "Ejecutiva de cuentas clave",
    departmentName: "Marketing y Ventas",
    salary: 8900,
  },
];

const adminSeed = [
  {
    name: "Administrador General",
    email: "admin@humana.gt",
    password: "Admin123!",
    role: "admin",
  },
  {
    name: "Coordinador RH",
    email: "rh@humana.gt",
    password: "Admin123!",
    role: "admin",
  },
];

const leaveSeed = [
  {
    employeeEmail: "andrea.castillo@humana.gt",
    leaveType: "Annual Leave",
    startDate: "2025-03-18",
    endDate: "2025-03-22",
    reason: "Vacaciones familiares",
    status: "Approved",
  },
  {
    employeeEmail: "diego.morales@humana.gt",
    leaveType: "Sick Leave",
    startDate: "2025-02-10",
    endDate: "2025-02-12",
    reason: "Tratamiento medico",
    status: "Approved",
  },
  {
    employeeEmail: "lucia.rosales@humana.gt",
    leaveType: "Casual Leave",
    startDate: "2025-04-05",
    endDate: "2025-04-06",
    reason: "Compromiso familiar",
    status: "Pending",
  },
  {
    employeeEmail: "marta.palacios@humana.gt",
    leaveType: "Casual Leave",
    startDate: "2025-01-15",
    endDate: "2025-01-15",
    reason: "Visita a cliente fuera de ciudad",
    status: "Rejected",
  },
];

const salarySeedTemplate = [
  {
    month: 0,
    basicSalaryFactor: 1,
    allowances: 1200,
    deductions: 300,
  },
  {
    month: 1,
    basicSalaryFactor: 1,
    allowances: 950,
    deductions: 450,
  },
  {
    month: 2,
    basicSalaryFactor: 1.05,
    allowances: 1100,
    deductions: 320,
  },
];

const attendanceStatuses = ["Present", "Present", "Absent", "Sick", "Leave"];

const seed = async () => {
  await connectToDatabase();
  try {
    console.log("Limpiando colecciones...");
    await Attendance.deleteMany({});
    await Salary.deleteMany({});
    await Leave.deleteMany({});
    await Employee.deleteMany({});
    await Department.deleteMany({});
    await User.deleteMany({});

    console.log("Creando usuarios administradores...");
    const adminUsers = await Promise.all(
      adminSeed.map(async (admin) => {
        const hashed = await bcrypt.hash(admin.password, 10);
        return User.create({
          name: admin.name,
          email: admin.email,
          password: hashed,
          role: admin.role,
        });
      }),
    );

    console.log("Creando departamentos...");
    const departmentDocs = await Department.insertMany(departmentsSeed);
    const departmentMap = departmentDocs.reduce((map, dep) => {
      map.set(dep.dep_name, dep);
      return map;
    }, new Map());

    console.log("Creando usuarios y empleados...");
    const employeeDocs = [];
    for (const employee of employeesSeed) {
      const hashedPassword = await bcrypt.hash(employee.password, 10);
      const userDoc = await User.create({
        name: employee.name,
        email: employee.email,
        password: hashedPassword,
        role: "employee",
      });

      const department = departmentMap.get(employee.departmentName);
      const employeeDoc = await Employee.create({
        userId: userDoc._id,
        employeeId: employee.employeeId,
        dob: new Date(employee.dob),
        gender: employee.gender,
        maritalStatus: employee.maritalStatus,
        designation: employee.designation,
        department: department?._id,
        salary: employee.salary,
      });

      employeeDocs.push({
        ...employee,
        userId: userDoc._id,
        employeeDoc,
      });
    }

    console.log("Generando registros salariales...");
    for (const employee of employeeDocs) {
      const baseSalary = employee.salary;
      for (const template of salarySeedTemplate) {
        const payDate = new Date();
        payDate.setMonth(payDate.getMonth() - template.month);
        const basicSalary = Math.round(baseSalary * template.basicSalaryFactor);
        const allowances = template.allowances;
        const deductions = template.deductions;
        const netSalary = basicSalary + allowances - deductions;

        await Salary.create({
          employeeId: employee.employeeDoc._id,
          basicSalary,
          allowances,
          deductions,
          netSalary,
          payDate,
        });
      }
    }

    console.log("Creando solicitudes de permisos...");
    for (const leave of leaveSeed) {
      const employee = employeeDocs.find((item) => item.email === leave.employeeEmail);
      if (!employee) continue;
      await Leave.create({
        employeeId: employee.employeeDoc._id,
        leaveType: leave.leaveType,
        startDate: new Date(leave.startDate),
        endDate: new Date(leave.endDate),
        reason: leave.reason,
        status: leave.status,
      });
    }

    console.log("Generando registros de asistencia recientes...");
    const today = new Date();
    for (let dayOffset = 0; dayOffset < attendanceStatuses.length; dayOffset++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() - dayOffset);
      const dateKey = currentDate.toISOString().split("T")[0];

      for (const employee of employeeDocs) {
        const status = attendanceStatuses[dayOffset % attendanceStatuses.length];
        await Attendance.create({
          date: dateKey,
          employeeId: employee.employeeDoc._id,
          status,
        });
      }
    }

    console.log("Datos demo generados correctamente.");
    console.table(
      employeeDocs.map((emp) => ({
        nombre: emp.name,
        correo: emp.email,
        usuario: emp.email,
        contrasena: emp.password,
        departamento: emp.departmentName,
      })),
    );
    console.log("Usuarios administradores creados:");
    console.table(
      adminUsers.map((admin) => ({
        nombre: admin.name,
        correo: admin.email,
        contrasena: "Admin123!",
      })),
    );
  } catch (error) {
    console.error("Ocurrio un error al sembrar la base de datos:", error);
  } finally {
    process.exit(0);
  }
};

seed();

