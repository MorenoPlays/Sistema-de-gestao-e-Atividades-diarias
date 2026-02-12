import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { CreateUserInput, UpdateUserInput } from "../validators/index.js";
import { UserRole } from "@prisma/client";

export class UserService {
  static async createUser(companyId: string, data: CreateUserInput) {
    // Verificar se email já existe nesta empresa
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        companyId,
      },
    });

    if (existingUser) {
      throw new Error("Email já registrado nesta empresa");
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        companyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  static async getUser(userId: string, companyId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    return user;
  }

  static async updateUser(userId: string, companyId: string, data: UpdateUserInput) {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async deleteUser(userId: string, companyId: string) {
    // Verificar que o usuário pertence à empresa
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Não permitir deletar se é o único admin
    if (user.role === UserRole.ADMIN) {
      const adminCount = await prisma.user.count({
        where: {
          companyId,
          role: UserRole.ADMIN,
        },
      });

      if (adminCount === 1) {
        throw new Error("Não pode deletar o único administrador da empresa");
      }
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: "Usuário deletado com sucesso" };
  }

  static async listCompanyUsers(companyId: string) {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  }

  static async changePassword(userId: string, companyId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Verificar senha antiga
    const passwordValid = await bcrypt.compare(oldPassword, user.password);
    if (!passwordValid) {
      throw new Error("Senha atual inválida");
    }

    // Hash nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return { message: "Senha alterada com sucesso" };
  }

  static async deactivateUser(userId: string, companyId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    return updatedUser;
  }

  static async activateUser(userId: string, companyId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    return updatedUser;
  }
}
