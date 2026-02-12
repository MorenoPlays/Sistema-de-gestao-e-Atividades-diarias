import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma.js";
import { errorHandler } from "./middleware/auth.js";

// Importar rotas
import authRoutes from "./routes/auth.routes.js";
import companyRoutes from "./routes/company.routes.js";
import userRoutes from "./routes/user.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import salaryRoutes from "./routes/salary.routes.js";
import employeeRoutes from "./routes/employee.routes.js";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging simples
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas de Health Check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Servidor está funcionando",
    timestamp: new Date().toISOString(),
  });
});

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/salaries", salaryRoutes);

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📝 Documentação: http://localhost:${PORT}/docs`);
  console.log(`💾 Prisma Studio: npm run prisma:studio`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Encerrando servidor...");
  server.close(async () => {
    await prisma.$disconnect();
    console.log("✅ Servidor encerrado");
    process.exit(0);
  });
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Encerrando servidor...");
  server.close(async () => {
    await prisma.$disconnect();
    console.log("✅ Servidor encerrado");
    process.exit(0);
  });
});

export default app;
