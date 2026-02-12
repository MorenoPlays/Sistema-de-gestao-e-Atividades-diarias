import { prisma } from "../lib/prisma.js";
import { UpdateCompanyInput } from "../validators/index.js";

export class CompanyService {
  static async getCompany(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!company) {
      throw new Error("Empresa não encontrada");
    }

    return company;
  }

  static async updateCompany(companyId: string, data: UpdateCompanyInput) {
    const company = await prisma.company.update({
      where: { id: companyId },
      data,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    return company;
  }

  static async getCompanyStats(companyId: string) {
    const [totalUsers, totalActivities, totalMoney] = await Promise.all([
      prisma.user.count({
        where: { companyId },
      }),
      prisma.activity.count({
        where: { companyId },
      }),
      prisma.activity.aggregate({
        where: { companyId },
        _sum: {
          balance: true,
        },
      }),
    ]);

    return {
      totalUsers,
      totalActivities,
      totalBalance: totalMoney._sum.balance || 0,
    };
  }

  static async getCompanyUsers(companyId: string) {
    const users = await prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return users;
  }
}
