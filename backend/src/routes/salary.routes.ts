import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { SalaryService } from "../services/salary.service.js";
import { createSalarySchema } from "../validators/index.js";

const router = Router();

// Aplicar auth middleware em todas as rotas
router.use(authMiddleware);

// Criar folha de salário (apenas admin/manager)
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
  const userRole = req.user?.role as string | undefined;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    // Apenas admin e manager podem criar salários
    if (!userRole || !["ADMIN", "MANAGER"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Acesso restrito a gerentes ou administradores",
      });
    }

    const data = createSalarySchema.parse(req.body);
    const salary = await SalaryService.createSalary(companyId, data);

    res.status(201).json({
      success: true,
      message: "Folha de salário criada com sucesso",
      data: salary,
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
      message: error.message || "Erro ao criar folha de salário",
    });
  }
});

// Listar folhas de salário da empresa
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    const salaries = await SalaryService.listCompanySalaries(companyId);

    res.json({
      success: true,
      data: salaries,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao listar folhas de salário",
    });
  }
});

// Obter folha de salário específica
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const salaryId = req.params.id;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    const salary = await SalaryService.getSalary(salaryId, companyId);

    res.json({
      success: true,
      data: salary,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "Folha de salário não encontrada",
    });
  }
});

// Atualizar folha de salário (apenas admin/manager)
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const salaryId = req.params.id;
    const companyId = req.user?.companyId;
  const userRole = req.user?.role as string | undefined;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    // Apenas admin e manager podem atualizar
    if (!userRole || !["ADMIN", "MANAGER"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Acesso restrito a gerentes ou administradores",
      });
    }

    const { baseSalary, deductions } = req.body;

    if (baseSalary === undefined && deductions === undefined) {
      return res.status(400).json({
        success: false,
        message: "Forneça pelo menos um campo para atualizar",
      });
    }

    const salary = await SalaryService.updateSalary(salaryId, companyId, {
      baseSalary,
      deductions,
    });

    res.json({
      success: true,
      message: "Folha de salário atualizada com sucesso",
      data: salary,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao atualizar folha de salário",
    });
  }
});

// Deletar folha de salário (apenas admin)
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const salaryId = req.params.id;
    const companyId = req.user?.companyId;
    const userRole = req.user?.role;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID não fornecido",
      });
    }

    if (userRole !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Acesso restrito a administradores",
      });
    }

    const result = await SalaryService.deleteSalary(salaryId, companyId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao deletar folha de salário",
    });
  }
});

// Obter folhas de salário do usuário
// Obter folhas de salário do funcionário (employee)
router.get("/employee/:employeeId", async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.params.employeeId;
    const companyId = req.user?.companyId;
    const currentUserId = req.user?.userId;
    const userRole = req.user?.role;

    if (!companyId) return res.status(400).json({ success: false, message: "Company ID não fornecido" });

    // Apenas admin/manager ou o próprio usuário vinculado ao funcionário pode ver
    const employee = await (await import('../services/employee.service.js')).EmployeeService.getEmployee(employeeId, companyId);
    const employeeUserId = (employee as any).userId;

    if (userRole !== "ADMIN" && userRole !== "MANAGER" && currentUserId !== employeeUserId) {
      return res.status(403).json({ success: false, message: "Acesso não permitido" });
    }

    const salaries = await SalaryService.getEmployeeSalaries(employeeId, companyId);
    res.json({ success: true, data: salaries });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Erro ao listar folhas de salário do funcionário" });
  }
});

// Obter relatório de salários do mês
router.get("/report/:month/:year", async (req: AuthRequest, res: Response) => {
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

    const report = await SalaryService.getMonthlySalaryReport(companyId, month, year);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Erro ao obter relatório de salários",
    });
  }
});

export default router;
