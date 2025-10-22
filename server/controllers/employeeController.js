import bcrypt from "bcrypt";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import upload from "../utils/multer.js";
import { uploadBuffer, deleteAsset } from "../utils/cloudinaryUpload.js";

const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
      password,
      role,
    } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, error: "user already registered in emp" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    let profileImageData = {
      profileImage: "",
      profileImagePublicId: "",
    };

    if (req.file) {
      const uploadResult = await uploadBuffer(req.file.buffer, {
        folder: "humana/empleados/perfiles",
        public_id: `${employeeId}-${Date.now()}`,
        resource_type: "image",
      });
      profileImageData = {
        profileImage: uploadResult.secure_url,
        profileImagePublicId: uploadResult.public_id,
      };
    }

    const newUser = new User({
      name,
      email,
      password: hashPassword,
      role,
      ...profileImageData,
    });
    const savedUser = await newUser.save();

    const newEmployee = new Employee({
      userId: savedUser._id,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
    });

    await newEmployee.save();
    return res.status(200).json({ success: true, message: "employee created" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: "server error in adding employee" });
  }
};

const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("userId", { password: 0 })
      .populate("department");
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get employees server error" });
  }
};

const getEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    let employee = await Employee.findById(id)
      .populate("userId", { password: 0 })
      .populate("department");

    if (!employee) {
      employee = await Employee.findOne({ userId: id })
        .populate("userId", { password: 0 })
        .populate("department");
    }

    return res.status(200).json({ success: true, employee });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get employees server error" });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, maritalStatus, designation, department, salary } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "employee not found" });
    }
    const user = await User.findById(employee.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "user not found" });
    }

    const updateUser = await User.findByIdAndUpdate(
      employee.userId,
      { name },
      { new: true },
    );
    const updateEmployee = await Employee.findByIdAndUpdate(
      id,
      {
        maritalStatus,
        designation,
        salary,
        department,
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!updateEmployee || !updateUser) {
      return res
        .status(404)
        .json({ success: false, error: "document not found" });
    }

    return res.status(200).json({ success: true, message: "employee update" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "update employees server error" });
  }
};

const fetchEmployeesByDepId = async (req, res) => {
  const { id } = req.params;
  try {
    const employees = await Employee.find({ department: id });
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get employeesbyDepId server error" });
  }
};

const uploadExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No se recibio ningun archivo" });
    }

    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ userId: id });
    }

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Empleado no encontrado" });
    }

    if (employee.expedientePublicId) {
      await deleteAsset(employee.expedientePublicId);
    }

    const existingExpedienteDoc = employee.documents.find(
      (doc) => doc.category === "expediente",
    );
    if (existingExpedienteDoc) {
      await deleteAsset(existingExpedienteDoc.publicId);
      employee.documents = employee.documents.filter(
        (doc) => doc._id.toString() !== existingExpedienteDoc._id.toString(),
      );
    }

    const uploadResult = await uploadBuffer(req.file.buffer, {
      folder: "humana/empleados/expedientes",
      public_id: `${employee.employeeId ?? employee._id}-${Date.now()}`,
      resource_type: "raw",
    });

    employee.expedienteFile = uploadResult.secure_url;
    employee.expedientePublicId = uploadResult.public_id;
    employee.expedienteOriginalName = req.file.originalname;
    employee.expedienteUploadedAt = new Date();
    employee.updatedAt = new Date();
    employee.documents.push({
      label: "Expediente general",
      category: "expediente",
      fileUrl: uploadResult.secure_url,
      originalName: req.file.originalname,
      publicId: uploadResult.public_id,
      uploadedAt: new Date(),
    });
    await employee.save();

    return res.status(200).json({
      success: true,
      expediente: {
        fileUrl: employee.expedienteFile,
        originalName: employee.expedienteOriginalName,
        uploadedAt: employee.expedienteUploadedAt,
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: "No se pudo adjuntar el expediente" });
  }
};

const addEmployeeDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, category } = req.body;
    if (!label) {
      return res
        .status(400)
        .json({ success: false, error: "El nombre del documento es obligatorio" });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "Selecciona un archivo para subir" });
    }

    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ userId: id });
    }

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Empleado no encontrado" });
    }

    const uploadResult = await uploadBuffer(req.file.buffer, {
      folder: "humana/empleados/documentos",
      public_id: `${employee.employeeId ?? employee._id}-${Date.now()}`,
      resource_type: "raw",
    });

    const newDocument = {
      label,
      category: category || "general",
      fileUrl: uploadResult.secure_url,
      originalName: req.file.originalname,
      publicId: uploadResult.public_id,
      uploadedAt: new Date(),
    };

    employee.documents.push(newDocument);
    employee.updatedAt = new Date();
    await employee.save();

    const savedDocument =
      employee.documents[employee.documents.length - 1];

    return res.status(200).json({
      success: true,
      document: savedDocument,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "No se pudo cargar el documento" });
  }
};

const deleteEmployeeDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ userId: id });
    }
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Empleado no encontrado" });
    }

    const document = employee.documents.id(documentId);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: "Documento no encontrado" });
    }

    await deleteAsset(document.publicId);
    document.remove();
    employee.updatedAt = new Date();
    await employee.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "No se pudo eliminar el documento" });
  }
};

const updateEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, error: "Estado invalido" });
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true },
    )
      .populate("userId", { password: 0 })
      .populate("department");

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Empleado no encontrado" });
    }

    return res.status(200).json({ success: true, employee });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "No se pudo actualizar el estado" });
  }
};

export {
  addEmployee,
  upload,
  getEmployees,
  getEmployee,
  updateEmployee,
  fetchEmployeesByDepId,
  uploadExpediente,
  addEmployeeDocument,
  deleteEmployeeDocument,
  updateEmployeeStatus,
};



