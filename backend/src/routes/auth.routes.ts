import { Router, Response } from "express";
import { registerSchema, loginSchema } from "../validators/index.js";
import { AuthService } from "../services/auth.service.js";
import { AuthRequest, authMiddleware } from "../middleware/auth.js";

const router = Router();

// Registro (criar empresa + primeiro usuário)
router.post("/register", async (req: AuthRequest, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await AuthService.register(
      data.name,
      data.email,
      data.password,
      data.companyName,
      data.phone
    );

    res.status(201).json({
      success: true,
      message: "Empresa e conta criadas com sucesso",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao registrar",
      error: error.errors,
    });
  }
});

// Login
router.post("/login", async (req: AuthRequest, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await AuthService.login(data.email, data.password);

    res.json({
      success: true,
      message: "Login realizado com sucesso",
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || "Email ou senha inválidos",
    });
  }
});

// Verificar token
router.get("/me", authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Token não fornecido",
    });
  }

  res.json({
    success: true,
    data: req.user,
  });
});

export default router;
