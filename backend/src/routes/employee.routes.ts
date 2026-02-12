import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { EmployeeService } from "../services/employee.service.js";
import { createEmployeeSchema, updateEmployeeSchema } from "../validators/index.js";

const router = Router();
router.use(authMiddleware);

// Criar funcionário (admin/manager)
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const role = req.user?.role;

    if (!companyId) return res.status(400).json({ success: false, message: "Company ID não fornecido" });
    if (!["ADMIN", "MANAGER"].includes(role)) return res.status(403).json({ success: false, message: "Acesso restrito" });

    const data = createEmployeeSchema.parse(req.body);
    const employee = await EmployeeService.createEmployee(companyId, data);

    res.status(201).json({ success: true, message: "Funcionário criado", data: employee });
  } catch (error: any) {
    if (error.name === "ZodError") return res.status(400).json({ success: false, message: "Validação falhou", error: error.errors });
    res.status(400).json({ success: false, message: error.message || "Erro ao criar funcionário" });
  }
});

// Listar funcionários da empresa
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ success: false, message: "Company ID não fornecido" });

    const employees = await EmployeeService.listCompanyEmployees(companyId);
    res.json({ success: true, data: employees });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Erro ao listar funcionários" });
  }
});

// Obter
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const id = req.params.id;
    if (!companyId) return res.status(400).json({ success: false, message: "Company ID não fornecido" });

    const employee = await EmployeeService.getEmployee(id, companyId);
    res.json({ success: true, data: employee });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message || "Funcionário não encontrado" });
  }
});

// Atualizar
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const role = req.user?.role;
    const id = req.params.id;

    if (!companyId) return res.status(400).json({ success: false, message: "Company ID não fornecido" });
    if (!["ADMIN", "MANAGER"].includes(role)) return res.status(403).json({ success: false, message: "Acesso restrito" });

    const data = updateEmployeeSchema.parse(req.body);
    const employee = await EmployeeService.updateEmployee(id, companyId, data);

    res.json({ success: true, message: "Funcionário atualizado", data: employee });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Erro ao atualizar funcionário" });
  }
});

// Deletar (admin)
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const role = req.user?.role;
    const id = req.params.id;

    if (!companyId) return res.status(400).json({ success: false, message: "Company ID não fornecido" });
    if (role !== "ADMIN") return res.status(403).json({ success: false, message: "Acesso restrito a administradores" });

    const result = await EmployeeService.deleteEmployee(id, companyId);
    res.json({ success: true, message: result.message });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Erro ao deletar funcionário" });
  }
});

export default router;
