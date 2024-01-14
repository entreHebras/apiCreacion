import { pool } from "../Db.js";
import jwt from "jsonwebtoken";
import { transporter } from "../email.js";
const crypto = require("crypto");

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
    "SELECT *  FROM login WHERE usuario=? AND contrasena=?",
    [usuario, contrasenia]
  );

  if (e.length <= 0) {
    res.status(401).json({ success: false, message: "Credenciales inválidas" });
  } else {
    const token = jwt.sign({ usuario }, "tu_secreto", { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });
    res.json({ success: true, token, e });
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
    Nombre,
    Apellido,
    Telefono,
    CorreoElectronico,
    direccion,
    contrasenia,
  } = req.body;

  const [er] = await pool.query("select usuario  from login where usuario=?", [
    CorreoElectronico,
  ]);

  if (er.length <= 0) {
    const uniqueKey = " Erctbtb"; // Reemplaza esto con tu llave única secreta
    const saltedData = `${uniqueKey}-${Nombre}-${Apellido}-${Telefono}-${CorreoElectronico}-${direccion}`;

    const encryptedData = crypto
      .createHash("md5")
      .update(saltedData)
      .digest("hex");

    req.encryptedData = {
      Nombre: Nombre,
      Apellido: Apellido,
      Telefono: Telefono,
      CorreoElectronico: CorreoElectronico,
      direccion: direccion,
      hashedData: encryptedData,
    };

    const [result] = await pool.execute(
      "INSERT INTO tablaclientes (Nombre, Apellido, Telefono,CorreoElectronico,direccion) VALUES (?,?,?,?,?)",
      [
        req.encryptedData.Nombre,
        req.encryptedData.Apellido,
        req.encryptedData.Telefono,
        req.encryptedData.CorreoElectronico,
        req.encryptedData.direccion,
      ]
    );

    const lastInsertId = result.insertId;

    await pool.execute(
      "insert into login(usuario,contrasena,tipo_usuario,cliente_id) VALUES(?,?,?,?) ",
      [CorreoElectronico, contrasenia, 2, lastInsertId]
    );

    try {
      await transporter.sendMail({
        from: '"entreHebras" <entrehebras06@gmail.com>', // sender address
        to: CorreoElectronico, // list of receivers
        subject: "Notificacion ✔", // Subject line
        html: `
      <b><center> Tu tikect </center> </b><br>
       <b>Tu cita : ${Nombre}, ${Apellido}  </b> <br>
       

      `,
      });
    } catch (error) {
      emailStatus = error;
    }

    res.json({ lastInsertId });
  } else {
    console.log("correo electronico ya registrado");
    res.status(404).json({ mesanje: "correo electronico ya registradonpm" });
  }
};

export const informacionCliente = async function (req, res) {
  const { id } = req.body;

  const [er] = await pool.query(
    "select *  from tablaclientes where ClienteID=?",
    [id]
  );
  res.send(er);
};
export const citasCliente = async function (req, res) {
  const { id } = req.body;

  const [er] = await pool.query(
    "select empleados.Nombre, empleados.Apellido,tablaservicios.NombreServicio,tablaservicios.Precio,tablaservicios.DuracionEstimada,tablahorarios.hora,date from tablacitas INNER JOIN empleados ON tablacitas.EmpleadoID = empleados.EmpleadoID INNER JOIN tablaservicios ON tablacitas.servicioSolicitado=tablaservicios.ServicioID INNER JOIN tablahorarios ON tablacitas.horaCita=tablahorarios.idHorario where  tablacitas.ClienteID=?",
    [id]
  );
  res.send(er);
};
