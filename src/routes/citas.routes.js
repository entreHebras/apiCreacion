import { Router } from "express";
import {
  citas,
  citasCliente,
  clientes,
  eliminarClientes,
  horariosCitas,
  informacionCliente,
  insertarServicios,
  login,
  login1,
  reservarCitas,
  servicios,
  validar,
} from "../controllers/citas.controller.js";

const router = Router();

router.get("/citas", citas);
router.get("/clientes", clientes);
router.get("/horariosCitas", horariosCitas);
router.get("/servicioOfrecido", servicios);
router.get("/login", login1);

router.post("/citasCliente", citasCliente);
router.post("/informacionCliente", informacionCliente);
router.post("/validar", validar);
router.post("/insertarServicios", insertarServicios);
router.post("/login", login);
router.post("/reservarCita", reservarCitas);

router.delete("/eliminarClientes/:ClienteID", eliminarClientes);

export default router;
