import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { ActivityService } from "../services/activity.service.js";
import { createActivitySchema, updateActivitySchema } from "../validators/index.js";

const router = Router();

// Aplicar auth middleware em todas as rotas
router.use(authMiddleware);

// Criar atividade
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    // Por padrão a atividade pertence ao usuário autenticado
    const requesterUserId = req.user?.userId;
    const companyId = req.user?.companyId;

    if (!requesterUserId || !companyId) {
      return res.status(400).json({
        success: false,
        message: "User ID ou Company ID não fornecido",
      });
    }

    const data = createActivitySchema.parse(req.body) as any;

    // Se `userId` for informado no body, só permitimos quando o requester for ADMIN ou MANAGER
    let effectiveUserId = requesterUserId as string;
    const requestedForUserId = data.userId as string | undefined;
    const requesterRole = req.user?.role;

    if (requestedForUserId && requestedForUserId !== requesterUserId) {
      if (requesterRole !== "ADMIN" && requesterRole !== "MANAGER") {
        return res.status(403).json({ success: false, message: "Sem permissão para criar atividade para outro usuário" });
      }
      effectiveUserId = requestedForUserId;
    }

    const activity = await ActivityService.createActivity(effectiveUserId, companyId, data);

    res.status(201).json({
      success: true,
      message: "Atividade criada com sucesso",
      data: activity,
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
      message: error.message || "Erro ao criar atividade",
    });
  }
});

// Listar atividades da empresa com filtros opcionais
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { startDate, endDate, userId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (userId) filters.userId = userId as string;

    const activities = await ActivityService.listCompanyActivities(companyId, filters);

    res.json({
      success: true,
      data: activities,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao listar atividades",
    });
  }
});

// Obter atividade específica
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const activityId = req.params.id;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    const activity = await ActivityService.getActivity(activityId, companyId);

    res.json({
      success: true,
      data: activity,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "Atividade não encontrada",
    });
  }
});

// Atualizar atividade
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const activityId = req.params.id;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    const data = updateActivitySchema.parse(req.body);
    const activity = await ActivityService.updateActivity(activityId, companyId, data);

    res.json({
      success: true,
      message: "Atividade atualizada com sucesso",
      data: activity,
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
      message: error.message || "Erro ao atualizar atividade",
    });
  }
});

// Deletar atividade
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const activityId = req.params.id;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    const result = await ActivityService.deleteActivity(activityId, companyId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao deletar atividade",
    });
  }
});

// Obter atividades do usuário
router.get("/user/:userId", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    const activities = await ActivityService.getUserActivities(userId, companyId);

    res.json({
      success: true,
      data: activities,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao listar atividades do usuário",
    });
  }
});

// Obter fecho diário
router.get("/daily-closure/:date", async (req: AuthRequest, res: Response) => {
  try {
    const date = new Date(req.params.date);
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Data inválida",
      });
    }

    const report = await ActivityService.getDailyClosureReport(companyId, date);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao obter fecho diário",
    });
  }
});

// Obter relatório mensal
router.get("/monthly-report/:month/:year", async (req: AuthRequest, res: Response) => {
  try {
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({
        success: false,
        message: "Mês ou ano inválido",
      });
    }

    const report = await ActivityService.getMonthlyReport(companyId, month, year);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao obter relatório mensal",
    });
  }
});

export default router;
