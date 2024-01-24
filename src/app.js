import express from "express";
import citasCuentas from "./routes/citas.routes.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import "./config.js";
import cors from "cors";
const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const corsOption = {
  origin: "https://egtrbgtrbr.000webhostapp.com/#/",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Habilita el intercambio de cookies a través de las solicitudes
  optionsSuccessStatus: 204,
};

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(citasCuentas);
export default app;
