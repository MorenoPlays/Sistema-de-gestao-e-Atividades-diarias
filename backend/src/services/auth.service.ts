import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { JWTPayload } from "../types/index.js";

export class AuthService {
  static async register(
    name: string,
    email: string,
    password: string,
    companyName: string,
    phone?: string
  ) {
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email já registrado");
    }

    // Verificar se empresa já existe
    const existingCompany = await prisma.company.findUnique({
      where: { name: companyName },
    });

    if (existingCompany) {
      throw new Error("Nome da empresa já está em uso");
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar empresa
    const company = await prisma.company.create({
      data: {
        name: companyName,
        email,
        phone,
      },
    });

    // Criar usuário (primeiro usuário é admin)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        companyId: company.id,
        role: "ADMIN",
      },
      include: { company: true },
    });

    // Gerar token
    const token = this.generateToken(user.id, user.email, company.id, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: {
          id: company.id,
          name: company.name,
        },
      },
      token,
    };
  }

  static async login(email: string, password: string) {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      throw new Error("Email ou senha inválidos");
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      throw new Error("Usuário desativado");
    }

    // Verificar senha
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      throw new Error("Email ou senha inválidos");
    }

    // Gerar token
    const token = this.generateToken(user.id, user.email, user.companyId, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: {
          id: user.company.id,
          name: user.company.name,
        },
      },
      token,
    };
  }

  static generateToken(userId: string, email: string, companyId: string, role: string): string {
    const payload: JWTPayload = {
      userId,
      email,
      companyId,
      role: role as any,
    };

    return jwt.sign(payload, process.env.JWT_SECRET || "secret", {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  }

  static async verifyToken(token: string): Promise<JWTPayload> {
    return jwt.verify(token, process.env.JWT_SECRET || "secret") as JWTPayload;
  }
}
