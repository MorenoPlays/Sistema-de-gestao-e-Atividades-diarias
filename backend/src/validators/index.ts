import { z } from "zod";
import { UserRole } from "@prisma/client";

// Auth
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  companyName: z.string().min(3, "Nome da empresa deve ter no mínimo 3 caracteres"),
  phone: z.string().optional(),
});

// Users
export const createUserSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  role: z.enum([UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] as const, {
    errorMap: () => ({ message: "Role inválido" }),
  }),
});

export const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  phone: z.string().optional(),
  role: z.enum([UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] as const).optional(),
  isActive: z.boolean().optional(),
});

// Activities
export const createActivitySchema = z.object({
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)), // Aceita YYYY-MM-DD ou ISO datetime
  description: z.string().optional(),
  hoursStart: z.string().regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:MM"),
  hoursEnd: z.string().regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:MM"),
  moneyIn: z.number().min(0, "Valor deve ser positivo"),
  moneyOut: z.number().min(0, "Valor deve ser positivo"),
  // Opcional: permitir criação de atividade para outro usuário (só será aplicada por ADMIN/MANAGER)
  userId: z.string().optional(),
});

export const updateActivitySchema = z.object({
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(), // Aceita YYYY-MM-DD ou ISO datetime
  description: z.string().optional(),
  hoursStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  hoursEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  moneyIn: z.number().min(0).optional(),
  moneyOut: z.number().min(0).optional(),
});

// Salary
export const createSalarySchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
  // Agora atrelado a `employeeId` (Employee separado de User)
  employeeId: z.string().min(1),
  baseSalary: z.number().min(0),
  deductions: z.number().min(0).optional().default(0),
});

// Employees (novo modelo)
export const createEmployeeSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  phone: z.string().optional(),
  position: z.string().optional(),
  // opcional: vincular a uma conta de usuário existente
  userId: z.string().optional(),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  userId: z.string().optional(),
});

// Company
export const updateCompanySchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  logoUrl: z.string().url().optional(),
  timezone: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type CreateSalaryInput = z.infer<typeof createSalarySchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
