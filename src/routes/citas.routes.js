import { Router } from "express";
import {
  citas,
  horariosCitas,
  insertarServicios,
  login,
} from "../controllers/citas.controller.js";

const router = Router();

router.get("/citas", citas);
router.get("/horariosCitas", horariosCitas);
router.post("/insertarServicios", insertarServicios);
router.post("/login", login);

export default router;
