import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../types/index.js";
import { UserRole } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token não fornecido",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido ou expirado",
    });
  }
};

// Middleware para verificar se é Admin
export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Autenticação necessária",
    });
  }

  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({
      success: false,
      message: "Acesso restrito a administradores",
    });
  }

  next();
};

// Middleware para verificar se é Admin ou Manager
export const managerMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Autenticação necessária",
    });
  }

  if (![UserRole.ADMIN, UserRole.MANAGER].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Acesso restrito a gerentes ou administradores",
    });
  }

  next();
};

// Middleware para tratamento de erros
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Erro:", err);

  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validação falhou",
      error: err.errors,
    });
  }

  res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
