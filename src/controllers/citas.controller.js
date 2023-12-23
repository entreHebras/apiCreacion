import { pool } from "../Db.js";
import jwt from "jsonwebtoken";

export const citas = async function (req, res) {
  const [ro] = await pool.query("select date from tablacitas");
  res.send({
    events: [{ ro }],
  });
};

export const clientes = async function (req, res) {
  const [cliente] = await pool.query("SELECT * FROM tablaclientes");
  res.send(cliente);
};

export const eliminarClientes = async function (req, res) {
  const ClienteID = req.params.ClienteID;
  console.log(typeof ClienteID);
  await pool.query(
    "DELETE FROM tablaclientes WHERE tablaclientes.ClienteID = ?",
    [ClienteID]
  );
  res.send("exitoso0");
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

export const login = async function (req, res) {
  const { usuario, contrasenia } = req.body;
  const [e] = await pool.query(
    "SELECT *  FROM tablalogin WHERE usuario=? AND contrasenia=?",
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
