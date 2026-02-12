import { prisma } from "../lib/prisma.js";
import { CreateActivityInput, UpdateActivityInput } from "../validators/index.js";
import { Decimal } from "@prisma/client/runtime/library";

export class ActivityService {
  static calculateWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  static calculateBalance(moneyIn: number, moneyOut: number): Decimal {
    return new Decimal(moneyIn - moneyOut);
  }

  static async createActivity(userId: string, companyId: string, data: CreateActivityInput) {
    const date = new Date(data.date);
    const weekNumber = this.calculateWeekNumber(date);
    const balance = this.calculateBalance(data.moneyIn, data.moneyOut);

    const activity = await prisma.activity.create({
      data: {
        date,
        description: data.description,
        weekNumber,
        hoursStart: data.hoursStart,
        hoursEnd: data.hoursEnd,
        moneyIn: new Decimal(data.moneyIn),
        moneyOut: new Decimal(data.moneyOut),
        balance,
        userId,
        companyId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return activity;
  }

  static async getActivity(activityId: string, companyId: string) {
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        companyId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!activity) {
      throw new Error("Atividade não encontrada");
    }

    return activity;
  }

  static async updateActivity(activityId: string, companyId: string, data: UpdateActivityInput) {
    // Prepare update data
    const updateData: any = { ...data };

    // Recalculate balance if moneyIn or moneyOut changed
    if (data.moneyIn !== undefined || data.moneyOut !== undefined) {
      const activity = await this.getActivity(activityId, companyId);
      const moneyIn = data.moneyIn ?? Number(activity.moneyIn);
      const moneyOut = data.moneyOut ?? Number(activity.moneyOut);
      updateData.balance = this.calculateBalance(moneyIn, moneyOut);
      updateData.moneyIn = new Decimal(moneyIn);
      updateData.moneyOut = new Decimal(moneyOut);
    }

    // Recalculate week if date changed
    if (data.date) {
      updateData.date = new Date(data.date);
      updateData.weekNumber = this.calculateWeekNumber(updateData.date);
    }

    const activity = await prisma.activity.update({
      where: { id: activityId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return activity;
  }

  static async deleteActivity(activityId: string, companyId: string) {
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        companyId,
      },
    });

    if (!activity) {
      throw new Error("Atividade não encontrada");
    }

    await prisma.activity.delete({
      where: { id: activityId },
    });

    return { message: "Atividade deletada com sucesso" };
  }

  static async listCompanyActivities(companyId: string, filters?: { startDate?: Date; endDate?: Date; userId?: string }) {
    const where: any = { companyId };

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return activities;
  }

  static async getUserActivities(userId: string, companyId: string) {
    const activities = await prisma.activity.findMany({
      where: {
        userId,
        companyId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return activities;
  }

  static async getDailyClosureReport(companyId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const activities = await prisma.activity.findMany({
      where: {
        companyId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Calculate totals
    let totalIn = new Decimal(0);
    let totalOut = new Decimal(0);
    let balance = new Decimal(0);

    activities.forEach((activity) => {
      totalIn = totalIn.plus(activity.moneyIn);
      totalOut = totalOut.plus(activity.moneyOut);
      balance = balance.plus(activity.balance);
    });

    return {
      date,
      totalActivities: activities.length,
      totalIn,
      totalOut,
      balance,
      activities,
    };
  }

  static async getMonthlyReport(companyId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const activities = await prisma.activity.findMany({
      where: {
        companyId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Group by date
    const groupedByDate: { [key: string]: any[] } = {};
    activities.forEach((activity) => {
      const dateKey = activity.date.toISOString().split("T")[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(activity);
    });

    // Calculate totals
    let totalIn = new Decimal(0);
    let totalOut = new Decimal(0);
    let balance = new Decimal(0);

    activities.forEach((activity) => {
      totalIn = totalIn.plus(activity.moneyIn);
      totalOut = totalOut.plus(activity.moneyOut);
      balance = balance.plus(activity.balance);
    });

    return {
      month,
      year,
      totalActivities: activities.length,
      totalIn,
      totalOut,
      balance,
      dailyClosures: groupedByDate,
    };
  }
}
