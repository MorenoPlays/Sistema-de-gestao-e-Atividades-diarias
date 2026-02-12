import { Router, Response } from "express";
import { authMiddleware, adminMiddleware, AuthRequest } from "../middleware/auth.js";
import { UserService } from "../services/user.service.js";
import { createUserSchema, updateUserSchema } from "../validators/index.js";

const router = Router();

// Aplicar auth middleware em todas as rotas
router.use(authMiddleware);

// Criar novo usuário (apenas admin)
router.post("/", adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    const data = createUserSchema.parse(req.body);
    const user = await UserService.createUser(companyId, data);

    res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso",
      data: user,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validação falhou",
        error: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Erro ao criar usuário",
    });
  }
});

// Listar todos os usuários da empresa
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    const users = await UserService.listCompanyUsers(companyId);

    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao listar usuários",
    });
  }
});

// Obter dados do usuário atual
router.get("/me", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      return res.status(400).json({
        success: false,
        message: "Dados do usuário não fornecidos",
      });
    }

    const user = await UserService.getUser(userId, companyId);

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao buscar usuário",
    });
  }
});

// Obter usuário específico (apenas admin ou o próprio usuário)
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const companyId = req.user?.companyId;
    const currentUserId = req.user?.userId;
    const currentUserRole = req.user?.role;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    // Apenas admin ou o próprio usuário podem ver os dados
    if (currentUserRole !== "ADMIN" && currentUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Acesso não permitido",
      });
    }

    const user = await UserService.getUser(userId, companyId);

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao buscar usuário",
    });
  }
});

// Atualizar usuário (apenas admin ou o próprio usuário)
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const companyId = req.user?.companyId;
    const currentUserId = req.user?.userId;
    const currentUserRole = req.user?.role;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    // Apenas admin ou o próprio usuário podem atualizar (mas não a si próprio o role)
    if (currentUserRole !== "ADMIN" && currentUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Acesso não permitido",
      });
    }

    const data = updateUserSchema.parse(req.body);

    // Usuário comum não pode mudar seu próprio role
    if (currentUserRole !== "ADMIN" && currentUserId === userId && data.role) {
      return res.status(403).json({
        success: false,
        message: "Você não pode alterar seu próprio role",
      });
    }

    const user = await UserService.updateUser(userId, companyId, data);

    res.json({
      success: true,
      message: "Usuário atualizado com sucesso",
      data: user,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validação falhou",
        error: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Erro ao atualizar usuário",
    });
  }
});

// Deletar usuário (apenas admin)
router.delete("/:id", adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    const result = await UserService.deleteUser(userId, companyId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao deletar usuário",
    });
  }
});

// Alterar senha
router.post("/:id/change-password", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const companyId = req.user?.companyId;
    const currentUserId = req.user?.userId;
    const { oldPassword, newPassword } = req.body;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    // Apenas o próprio usuário pode mudar sua senha
    if (currentUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Você só pode alterar sua própria senha",
      });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Senha atual e nova senha são obrigatórias",
      });
    }

    const result = await UserService.changePassword(userId, companyId, oldPassword, newPassword);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao alterar senha",
    });
  }
});

// Desativar usuário (apenas admin)
router.post("/:id/deactivate", adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const companyId = req.user?.companyId;
    const currentUserId = req.user?.userId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    // Não permitir desativar a si mesmo
    if (currentUserId === userId) {
      return res.status(400).json({
        success: false,
        message: "Você não pode desativar sua própria conta",
      });
    }

    const user = await UserService.deactivateUser(userId, companyId);

    res.json({
      success: true,
      message: "Usuário desativado com sucesso",
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao desativar usuário",
    });
  }
});

// Ativar usuário (apenas admin)
router.post("/:id/activate", adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    const user = await UserService.activateUser(userId, companyId);

    res.json({
      success: true,
      message: "Usuário ativado com sucesso",
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao ativar usuário",
    });
  }
});

export default router;
