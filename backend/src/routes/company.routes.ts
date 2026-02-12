import { Router, Response } from "express";
import { authMiddleware, adminMiddleware, AuthRequest } from "../middleware/auth.js";
import { CompanyService } from "../services/company.service.js";
import { updateCompanySchema } from "../validators/index.js";

const router = Router();

// Aplicar auth middleware em todas as rotas
router.use(authMiddleware);

// Obter informações da empresa
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    const company = await CompanyService.getCompany(companyId);

    res.json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao buscar empresa",
    });
  }
});

// Atualizar informações da empresa (apenas admin)
router.put("/", adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    const data = updateCompanySchema.parse(req.body);
    const company = await CompanyService.updateCompany(companyId, data);

    res.json({
      success: true,
      message: "Empresa atualizada com sucesso",
      data: company,
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
      message: error.message || "Erro ao atualizar empresa",
    });
  }
});

// Obter estatísticas da empresa
router.get("/stats", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    const stats = await CompanyService.getCompanyStats(companyId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao buscar estatísticas",
    });
  }
});

// Listar usuários da empresa
router.get("/users", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    const users = await CompanyService.getCompanyUsers(companyId);

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

export default router;
