import { pool } from "../Db.js";
import jwt from "jsonwebtoken";
import { transporter } from "../email.js";

export const infromesGuardar = async function (req, res) {
  const pdfData = req.file.buffer;
  await pool.query("INSERT INTO  tablaInformes (infrome) VALUES(?)", [pdfData]);
  res.send("exitoso");
};

export const seleccionarInformes = async function (req, res) {
  const [informes] = await pool.query("select * from tablaInformes ");

  // Agregar el enlace al PDF en cada informe
  const informesConEnlace = informes.map((informe) => ({
    id: informe.InformesID,
    date: informe.date,
    pdfLink: `/obtenerInforme?id=${informe.InformesID}`, // Reemplaza con la ruta correcta para obtener el PDF
  }));

  // Enviar respuesta como objeto JSON
  res.json({ informes: informesConEnlace });
};

export const obtenerPDFDesdeBaseDeDatos = async function (req, res) {
  const { id } = req.query;

  try {
    const [informe] = await pool.query(
      "SELECT infrome FROM tablaInformes WHERE InformesID = ?",
      [id]
    );

    if (!informe || informe.length === 0) {
      return res.status(404).json({ error: "Informe no encontrado" });
    }

    const pdfBlob = informe[0].infrome;

    // Configurar el tipo de contenido en el encabezado de la respuesta
    res.setHeader("Content-Type", "application/pdf");

    // Enviar el blob como respuesta
    res.status(200).end(pdfBlob, "binary");
  } catch (error) {
    console.error("Error al obtener el PDF desde la base de datos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const citas = async function (req, res) {
  const [events] = await pool.query(
    "SELECT tablaclientes.Nombre AS NombreCliente, tablaclientes.Apellido AS ApellidoCliente,empleados.Nombre,empleados.Apellido,tablaservicios.NombreServicio,tablahorarios.hora,date,estado FROM tablacitas INNER JOIN tablaclientes on tablacitas.ClienteID =tablaclientes.ClienteID INNER JOIN empleados on tablacitas.EmpleadoID=empleados.EmpleadoID INNER JOIN tablaservicios on tablacitas.servicioSolicitado=tablaservicios.ServicioID INNER JOIN tablahorarios on tablacitas.horaCita=tablahorarios.idHorario"
  );
  res.json(events);
};

export const clientes = async function (req, res) {
  const [cliente] = await pool.query("SELECT * FROM tablaclientes");
  res.send(cliente);
};

export const eliminarClientes = async function (req, res) {
  const ClienteID = req.params.ClienteID;

  await pool.execute("DELETE FROM login WHERE cliente_id = ?", [ClienteID]);

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

export const eliminarServicios = async function (req, res) {
  const ServicioID = req.params.ServicioID;

  await pool.query(
    "DELETE FROM tablaservicios WHERE tablaservicios.ServicioID = ?",
    [ServicioID]
  );
  res.send("exitoso0   ");
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

  console.log(er[0].contrasena);
  try {
    await transporter.sendMail({
      from: '"entreHebras" <entrehebras06@gmail.com>', // sender address
      to: CorreoElectronico2, // list of receivers
      subject: "Notificacion ✔", // Subject line
      html: `
    <b><center> Tu tikect </center> </b><br>
     <b>Tu codigo : ${er[0].contrasena}  </b> <br>
     

    `,
    });
  } catch (error) {
    emailStatus = error;
  }

  res.send("exitoso");
};
