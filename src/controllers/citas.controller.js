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

export const login1 = async function (req, res) {
  const [e] = await pool.query("SELECT *  FROM login ");

  res.send(e);
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

export const usuarios = async function (req, res) {
  const [er] = await pool.query("select usuario from login");

  res.send(er);
};

export const registroUsuario = async function (req, res) {
  const {
    Nombre,
    Apellido,
    Telefono,
    CorreoElectronico,
    direccion,
    contrasenia,
    CorreoElectronico2,
  } = req.body;

  const [er] = await pool.query("select usuario from login where usuario=?", [
    CorreoElectronico2,
  ]);

  if (er.length <= 0) {
    const [result] = await pool.execute(
      "INSERT INTO tablaclientes (Nombre, Apellido, Telefono,CorreoElectronico,direccion) VALUES (?,?,?,?,?)",
      [Nombre, Apellido, Telefono, CorreoElectronico, direccion]
    );

    const lastInsertId = result.insertId;

    await pool.execute(
      "insert into login(usuario,contrasena,tipo_usuario,cliente_id) VALUES(?,?,?,?) ",
      [CorreoElectronico, contrasenia, 2, lastInsertId]
    );

    try {
      await transporter.sendMail({
        from: '"entreHebras" <entrehebras06@gmail.com>', // sender address
        to: CorreoElectronico2, // list of receivers
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

export const reservaCita = async function (req, res) {
  const { ClienteID, servicioSolicitado, horaCita, date } = req.body;
  await pool.query(
    "INSERT INTO tablacitas (ClienteID, EmpleadoID, servicioSolicitado,horaCita,date) VALUES (?,?,?,?,?)",
    [ClienteID, 1, servicioSolicitado, horaCita, date]
  );
  res.send("exitoso");
};

export const recuperarContrasenia = async function (req, res) {
  const { CorreoElectronico, CorreoElectronico2 } = req.body;

  const [er] = await pool.execute(
    "select contrasena from login where usuario=? ",
    [CorreoElectronico]
  );

  console.log(CorreoElectronico2, CorreoElectronico);

  console.log(er);
  try {
    await transporter.sendMail({
      from: '"entreHebras" <entrehebras06@gmail.com>', // sender address
      to: CorreoElectronico2, // list of receivers
      subject: "Notificacion ✔", // Subject line
      html: `
    <b><center> Tu tikect </center> </b><br>
     <b>Tu codigo : ${[er.contrasena]}  </b> <br>
     

    `,
    });
  } catch (error) {
    emailStatus = error;
  }

  res.send("exitoso");
};
