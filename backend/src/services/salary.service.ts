import { prisma } from "../lib/prisma.js";
import { CreateSalaryInput } from "../validators/index.js";
import { Decimal } from "@prisma/client/runtime/library";

export class SalaryService {
  static calculateNetSalary(baseSalary: number, deductions: number): Decimal {
    return new Decimal(baseSalary - deductions);
  }

  static async createSalary(companyId: string, data: CreateSalaryInput) {
    // Verificar se funcionário existe na empresa
    const employee = await prisma.employee.findFirst({ where: { id: data.employeeId, companyId } });
    if (!employee) throw new Error("Funcionário não encontrado nesta empresa");

    // Verificar se já existe folha para este mês para o employee
    const existingSalary = await prisma.salary.findFirst({
      where: { employeeId: data.employeeId, companyId, month: data.month, year: data.year },
    });
    if (existingSalary) throw new Error("Folha de salário já existe para este mês");

    const netSalary = this.calculateNetSalary(data.baseSalary, data.deductions || 0);

    const salary = await prisma.salary.create({
      data: {
        month: data.month,
        year: data.year,
        baseSalary: new Decimal(data.baseSalary),
        deductions: new Decimal(data.deductions || 0),
        netSalary,
        employeeId: data.employeeId,
        userId: employee.userId || null,
        companyId,
      },
      include: {
        employee: { select: { id: true, name: true, position: true } },
      },
    });

    return salary;
  }

  static async getSalary(salaryId: string, companyId: string) {
    const salary = await prisma.salary.findFirst({
      where: {
        id: salaryId,
        companyId,
      },
      include: {
        employee: { select: { id: true, name: true, position: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!salary) {
      throw new Error("Folha de salário não encontrada");
    }

    return salary;
  }

  static async updateSalary(
    salaryId: string,
    companyId: string,
    data: { baseSalary?: number; deductions?: number }
  ) {
    const salary = await this.getSalary(salaryId, companyId);

    const baseSalary = data.baseSalary ?? Number(salary.baseSalary);
    const deductions = data.deductions ?? Number(salary.deductions);
    const netSalary = this.calculateNetSalary(baseSalary, deductions);

    const updatedSalary = await prisma.salary.update({
      where: { id: salaryId },
      data: {
        baseSalary: new Decimal(baseSalary),
        deductions: new Decimal(deductions),
        netSalary,
      },
      include: {
        employee: { select: { id: true, name: true, position: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return updatedSalary;
  }

  static async deleteSalary(salaryId: string, companyId: string) {
    const salary = await this.getSalary(salaryId, companyId);
    if(!salary)
      return { message: "Folha de salário não encontrada" };
    await prisma.salary.delete({
      where: { id: salaryId },
    });

    return { message: "Folha de salário deletada com sucesso" };
  }

  static async listCompanySalaries(companyId: string) {
    const salaries = await prisma.salary.findMany({
      where: { companyId },
      include: {
        employee: { select: { id: true, name: true, position: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return salaries;
  }

  static async getEmployeeSalaries(employeeId: string, companyId: string) {
    const salaries = await prisma.salary.findMany({
      where: { employeeId, companyId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return salaries;
  }

  static async getMonthlySalaryReport(companyId: string, month: number, year: number) {
    const salaries = await prisma.salary.findMany({
      where: {
        companyId,
        month,
        year,
      },
      include: {
        employee: { select: { id: true, name: true, position: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Calculate totals
    let totalBaseSalary = new Decimal(0);
    let totalDeductions = new Decimal(0);
    let totalNetSalary = new Decimal(0);

    salaries.forEach((salary) => {
      totalBaseSalary = totalBaseSalary.plus(salary.baseSalary);
      totalDeductions = totalDeductions.plus(salary.deductions);
      totalNetSalary = totalNetSalary.plus(salary.netSalary);
    });

    return {
      month,
      year,
      totalEmployees: salaries.length,
      totalBaseSalary,
      totalDeductions,
      totalNetSalary,
      salaries,
    };
  }

  static async getUserCurrentYearSalaries(userId: string, companyId: string) {
    const currentYear = new Date().getFullYear();

    const salaries = await prisma.salary.findMany({ where: { userId, companyId, year: currentYear }, orderBy: { month: "asc" } });

    return salaries;
  }
}
