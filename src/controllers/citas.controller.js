import { pool } from "../Db.js";
import jwt from "jsonwebtoken";
export const citas = async function (req, res) {
  const [ro] = await pool.query("select Nombre from empleados");
  res.send(ro);
};

export const horariosCitas = async function (req, res) {
  const [citas] = await pool.query("select hora from tablahorarios");
  res.send(citas);
};

export const insertarServicios = async function (req, res) {
  const { nombreservicio, descripcion, duracionestimada, precio } = req.body;

  await pool.query(
    "INSERT INTO tablaservicios (NombreServicio, Descripcion, DuracionEstimada, Precio) VALUES (?,?,?,?)",
    [nombreservicio, descripcion, duracionestimada, precio]
  );
  res.send("exitoso");
};

export const creacion = async function (req, res) {
  await pool.query(
    "CREATE TABLE `empleados` (`EmpleadoID` int(11) NOT NULL,`Nombre` varchar(100) DEFAULT NULL,`Apellido` varchar(100) DEFAULT NULL,`Telefono` varchar(100) DEFAULT NULL,`CorreoElectronico` varchar(100) DEFAULT NULL,`FechaInicio` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),`idRol` int(11) NOT NULL) "
  );
  res.send("exitoso");
};

export const login = async function (req, res) {
  const { usuario, contrasenia } = req.body;
  const [e] = await pool.query(
    "SELECT idUsuario  FROM tablalogin WHERE usuario=? AND contrasenia=?",
    [usuario, contrasenia]
  );

  if (e.length <= 0) {
    res.status(401).json({ success: false, message: "Credenciales inválidas" });
  } else {
    const token = jwt.sign({ usuario }, "tu_secreto", { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });
    res.json({ success: true, token });
  }
};
