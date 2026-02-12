import { prisma } from "../lib/prisma.js";
import { CreateEmployeeInput, UpdateEmployeeInput } from "../validators/index.js";

export class EmployeeService {
  static async createEmployee(companyId: string, data: CreateEmployeeInput) {
    const employee = await prisma.employee.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        position: data.position || null,
        companyId,
        userId: data.userId || null,
      },
    });

    return employee;
  }

  static async updateEmployee(employeeId: string, companyId: string, data: UpdateEmployeeInput) {
    const employee = await prisma.employee.findFirst({ where: { id: employeeId, companyId } });
    if (!employee) throw new Error("Funcionário não encontrado");

    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        name: data.name ?? employee.name,
        phone: data.phone ?? employee.phone,
        position: data.position ?? employee.position,
        userId: data.userId ?? employee.userId,
      },
    });

    return updated;
  }

  static async deleteEmployee(employeeId: string, companyId: string) {
    const employee = await prisma.employee.findFirst({ where: { id: employeeId, companyId } });
    if (!employee) throw new Error("Funcionário não encontrado");

    await prisma.employee.delete({ where: { id: employeeId } });
    return { message: "Funcionário removido com sucesso" };
  }

  static async getEmployee(employeeId: string, companyId: string) {
    const employee = await prisma.employee.findFirst({ where: { id: employeeId, companyId } });
    if (!employee) throw new Error("Funcionário não encontrado");
    return employee;
  }

  static async listCompanyEmployees(companyId: string) {
    const employees = await prisma.employee.findMany({ where: { companyId }, orderBy: { name: 'asc' } });
    return employees;
  }
}
