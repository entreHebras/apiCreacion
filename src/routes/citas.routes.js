import { Router } from "express";
import {
  citas,
  clientes,
  horariosCitas,
  insertarServicios,
  login,
} from "../controllers/citas.controller.js";

const router = Router();

router.get("/citas", citas);
router.get("/clientes", clientes);

router.get("/horariosCitas", horariosCitas);
router.post("/insertarServicios", insertarServicios);
router.post("/login", login);

export default router;
