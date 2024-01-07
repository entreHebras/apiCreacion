import { Router } from "express";
import {
  citas,
  clientes,
  eliminarClientes,
  horariosCitas,
  insertarServicios,
  login,
  reservarCitas,
  servicios,
  validar,
} from "../controllers/citas.controller.js";

const router = Router();

router.use((req, res, next) => {
  console.log(`r:${req.url}`);
});

router.get("/citas", citas);
router.get("/clientes", clientes);

router.get("/horariosCitas", horariosCitas);
router.get("/servicioOfrecido", servicios);
router.post("/validar", validar);

router.post("/insertarServicios", insertarServicios);
router.post("/login", login);
router.post("/reservarCita", reservarCitas);

router.delete("/eliminarClientes/:ClienteID", eliminarClientes);

export default router;
