import express from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import pool from './models/db.js' 
import roleRoutes from './routes/roles.js'
import permissionRoutes from './routes/permissions.js'
import rolePermissionRoutes from './routes/rolePermissions.js'
import userRoutes from './routes/user.js'
import dotenv from "dotenv";
dotenv.config();

const app = express();
const swaggerDocument = YAML.load("./swagger.yaml");


// Middleware
app.use(bodyParser.json());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Home Route
app.get("/", (req, res) => {
  res.send("RBAC API is running!");
});

app.use("/roles", roleRoutes);
app.use("/permissions",permissionRoutes)
app.use('/role-permissions',rolePermissionRoutes)
app.use("/users",userRoutes)
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/api-docs`);
});
// Test the database connection
// (async () => {
//     try {
//         const [rows] = await pool.query('SELECT 1 + 1 AS result');
//         console.log('Database connected successfully:', rows);
//     } catch (error) {
//         console.error('Database connection failed:', error);
//     }
// })();