import { pool } from "../Db.js";
import jwt from "jsonwebtoken";

export const citas = async function (req, res) {
  const [events] = await pool.query("select * from tablacitas");
  res.json(events);
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
  const [citas] = await pool.query("select * from tablahorarios");
  res.send(citas);
};

export const servicios = async function (req, res) {
  const [servicios] = await pool.query("select * from tablaservicios");
  res.send(servicios);
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

export const validar = async function (req, res) {
  const { fecha } = req.body;
  console.log(typeof fecha);
  const [events] = await pool.query(
    "SELECT tablahorarios.idHorario, tablahorarios.hora, COUNT(tablacitas.horaCita) AS total_ocurrencias FROM tablahorarios  LEFT JOIN tablacitas  ON tablahorarios.idHorario = tablacitas.horaCita AND tablacitas.date =? GROUP BY tablahorarios.hora,tablahorarios.idHorario HAVING COUNT(tablacitas.horaCita) < 3;",
    [fecha]
  );

  res.json(events);
};

export const reservarCitas = async function (req, res) {
  const { Nombre, Apellido, cedula, Telefono, CorreoElectronico } = req.body;

  const [result] = await pool.execute(
    "INSERT INTO tablaclientes (Nombre, Apellido, cedula, Telefono,CorreoElectronico) VALUES (?,?,?,?,?)",
    [Nombre, Apellido, cedula, Telefono, CorreoElectronico]
  );

  const lastInsertId = result.insertId;

  res.json({ lastInsertId });
};
