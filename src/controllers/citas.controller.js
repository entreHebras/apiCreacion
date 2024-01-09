import { pool } from "../Db.js";
import jwt from "jsonwebtoken";
import { transporter } from "../email.js";

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

  await pool.execute("DELETE FROM tablacitas WHERE tablacitas.ClienteID = ?", [
    ClienteID,
  ]);

  await pool.query(
    "DELETE FROM tablaclientes WHERE tablaclientes.ClienteID = ?",
    [ClienteID]
  );
  res.send("exitoso0   ");
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
  const { NombreServicio, Descripcion, DuracionEstimada, Precio } = req.body;

  await pool.query(
    "INSERT INTO tablaservicios (NombreServicio, Descripcion, DuracionEstimada, Precio) VALUES (?,?,?,?)",
    [NombreServicio, Descripcion, DuracionEstimada, Precio]
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
  console.log(fecha);
  const [events] = await pool.query(
    "SELECT tablahorarios.idHorario, tablahorarios.hora, COUNT(tablacitas.horaCita) AS total_ocurrencias FROM tablahorarios  LEFT JOIN tablacitas  ON tablahorarios.idHorario = tablacitas.horaCita AND tablacitas.date =? GROUP BY tablahorarios.hora,tablahorarios.idHorario HAVING COUNT(tablacitas.horaCita) < 3;",
    [fecha]
  );

  res.json(events);
};

export const reservarCitas = async function (req, res) {
  const {
    nombre,
    apellido,
    telefono,
    correoElectronico,
    servicioSolicitado,
    horaCita,
    date,
  } = req.body;

  const [result] = await pool.execute(
    "INSERT INTO tablaclientes (Nombre, Apellido, cedula, Telefono,CorreoElectronico) VALUES (?,?,?,?,?)",
    [nombre, apellido, "1721524948", telefono, correoElectronico]
  );

  const lastInsertId = result.insertId;

  await pool.execute(
    "insert into tablacitas(ClienteID,EmpleadoID,servicioSolicitado,horaCita,date) VALUES(?,?,?,?,?) ",
    [lastInsertId, 1, servicioSolicitado, horaCita, date]
  );

  try {
    await transporter.sendMail({
      from: '"entreHebras" <entrehebras06@gmail.com>', // sender address
      to: correoElectronico, // list of receivers
      subject: "Notificacion ✔", // Subject line
      html: `
      <b><center> Tu tikect </center> </b><br>
       <b>Tu cita : ${nombre}, ${apellido}   ${date}</b> <br>
       

      `,
    });
  } catch (error) {
    emailStatus = error;
  }

  res.json({ lastInsertId });
};
