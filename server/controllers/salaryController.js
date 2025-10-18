import mongoose from "mongoose";
import Salary from "../models/Salary.js";
import Employee from "../models/Employee.js";
import Department from "../models/Department.js";

const addSalary = async (req, res) => {
    try {
        const {employeeId, basicSalary, allowances, deductions, payDate} = req.body

        const totalSalary = parseInt(basicSalary) + parseInt(allowances) - parseInt(deductions)

        const newSalary = new Salary({
            employeeId,
            basicSalary,
            allowances,
            deductions,
            netSalary: totalSalary,
            payDate
        })

        await newSalary.save()

        return res.status(200).json({success: true})

    } catch(error) {
        return res.status(500).json({success: false, error: "salary add server error"})
    }
}

const getSalary = async (req, res) => {
    try {
        const {id, role} = req.params;
        
        let salary
        if(role === "admin") {
            salary = await Salary.find({employeeId: id}).populate('employeeId', 'employeeId')
        } else {
            const employee = await Employee.findOne({userId: id})
            salary = await Salary.find({employeeId: employee._id}).populate('employeeId', 'employeeId')
        }
        return res.status(200).json({success: true, salary})
    } catch(error) {
        return res.status(500).json({success: false, error: "salary get server error"})
    }
}

const getPayrollSummary = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, error: "No autorizado para ver la nomina" });
    }

    const { month, department } = req.query;

    const matchStage = {};

    if (month) {
      const [year, monthValue] = month.split("-");
      if (year && monthValue) {
        const startDate = new Date(Number(year), Number(monthValue) - 1, 1);
        const endDate = new Date(Number(year), Number(monthValue), 1);
        matchStage.payDate = { $gte: startDate, $lt: endDate };
      }
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: "$employee" },
      {
        $lookup: {
          from: "users",
          localField: "employee.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "departments",
          localField: "employee.department",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: "$department" },
    ];

    if (department && department !== "all") {
      pipeline.push({
        $match: {
          "department._id": new mongoose.Types.ObjectId(department),
        },
      });
    }

    pipeline.push(
      {
        $project: {
          _id: 1,
          basicSalary: 1,
          allowances: 1,
          deductions: 1,
          netSalary: 1,
          payDate: 1,
          employeeCode: "$employee.employeeId",
          employeeName: "$user.name",
          departmentName: "$department.dep_name",
          departmentId: "$department._id",
        },
      },
      { $sort: { payDate: -1 } },
    );

    const payroll = await Salary.aggregate(pipeline);

    const totals = payroll.reduce(
      (acc, item) => {
        acc.basicSalary += Number(item.basicSalary ?? 0);
        acc.allowances += Number(item.allowances ?? 0);
        acc.deductions += Number(item.deductions ?? 0);
        acc.netSalary += Number(item.netSalary ?? 0);
        return acc;
      },
      { basicSalary: 0, allowances: 0, deductions: 0, netSalary: 0 },
    );

    const departments = await Department.find({}, "dep_name").lean();

    return res.status(200).json({
      success: true,
      payroll,
      totals,
      filters: {
        month: month ?? null,
        department: department ?? "all",
      },
      departments,
    });
  } catch (error) {
    console.error("getPayrollSummary error", error);
    return res
      .status(500)
      .json({ success: false, error: "Error al obtener la nomina" });
  }
};

export { addSalary, getSalary, getPayrollSummary };
