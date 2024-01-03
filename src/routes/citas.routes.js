import { Router } from "express";
import {
  citas,
  clientes,
  eliminarClientes,
  horariosCitas,
  insertarServicios,
  login,
  servicios,
} from "../controllers/citas.controller.js";

const router = Router();

router.get("/citas", citas);
router.get("/clientes", clientes);

router.get("/horariosCitas", horariosCitas);
router.get("/servicioOfrecido", servicios);

router.post("/insertarServicios", insertarServicios);
router.post("/login", login);

router.delete("/eliminarClientes/:ClienteID", eliminarClientes);

export default router;
