import { UserRole } from "@prisma/client";

export interface JWTPayload {
  userId: string;
  email: string;
  companyId: string;
  role: UserRole;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  companyName: string;
  phone?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface CreateActivityRequest {
  date: string; // ISO string
  description?: string;
  hoursStart: string; // HH:MM
  hoursEnd: string; // HH:MM
  moneyIn: number;
  moneyOut: number;
}

export interface UpdateActivityRequest {
  date?: string;
  description?: string;
  hoursStart?: string;
  hoursEnd?: string;
  moneyIn?: number;
  moneyOut?: number;
}

export interface CreateSalaryRequest {
  month: number;
  year: number;
  userId: string;
  baseSalary: number;
  deductions?: number;
}

export interface UpdateCompanyRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  logoUrl?: string;
  timezone?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
