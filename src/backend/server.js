const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error de conexión:', err));

// Definir el esquema de la encuesta
const surveySchema = new mongoose.Schema({
  nombre: String,
  puesto: String,
  telefono: String,
  fecha: String,
  hora: String,
  seguridadGeneral: String,
  presenciaSerenazgo: String,
  frecuenciaSerenazgo: String,
  iluminacionGeneral: String,
  zonasOscuras: [String],
  camarasFuncionando: String,
  ubicacionCamaras: String,
  problemasEspecificos: [String],
  incidentesReportados: String,
  tiempoRespuesta: String,
  capacitacionSeguridad: String,
  sugerenciaMejora: String,
  calificacionGeneral: String,
  confianzaAdministracion: String,
  participacionComerciantes: String,
  comentariosAdicionales: String
}, {
  timestamps: true // Genera automáticamente createdAt y updatedAt
});
const Respuesta = mongoose.model('Respuesta', surveySchema); // Corregido: Usar surveySchema

// Esquema y modelo de usuario (administrador)
const userSchema = new mongoose.Schema({
  usuario: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // En un proyecto real, esto debería ser hasheado
  fechaRegistro: { type: Date, default: Date.now } // Corregido: Usar Date.now para fecha
});
const User = mongoose.model('User', userSchema);

// Ruta para recibir las respuestas
app.post('/api/respuestas', async (req, res) => {
  try {
    const nuevaRespuesta = new Respuesta(req.body);
    await nuevaRespuesta.save();
    res.status(201).json({ mensaje: 'Respuesta guardada correctamente' });
  } catch (err) {
    console.error('Error al guardar la respuesta:', err);
    res.status(500).json({ error: 'Error al guardar la respuesta', details: err.message });
  }
});

// Ruta para obtener todas las respuestas
app.get('/api/respuestas', async (req, res) => {
  try {
    const respuestas = await Respuesta.find({});
    res.status(200).json(respuestas);
  } catch (err) {
    console.error('Error al obtener respuestas:', err);
    res.status(500).json({ error: 'Error al obtener respuestas', details: err.message });
  }
});

// Ruta para login de administrador
app.post('/api/login', async (req, res) => {
  const { usuario, password } = req.body;
  try {
    const user = await User.findOne({ usuario });
    if (!user || user.password !== password) { // En un proyecto real, comparar hash
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }
    res.status(200).json({ mensaje: 'Login exitoso', user: { usuario: user.usuario, email: user.email } });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta para registrar nuevo administrador
app.post('/api/register', async (req, res) => {
  const { token, usuario, email, password } = req.body;

  if (token !== process.env.ADMIN_REGISTER_TOKEN) {
    return res.status(403).json({ mensaje: 'Token de autorización inválido' });
  }

  try {
    const newUser = new User({ usuario, email, password });
    await newUser.save();
    res.status(201).json({ mensaje: 'Administrador registrado exitosamente' });
  } catch (err) {
    console.error('Error al registrar administrador:', err);
    if (err.code === 11000) { // Error de duplicado
      return res.status(409).json({ mensaje: 'Usuario o email ya existen' });
    }
    res.status(500).json({ error: 'Error al registrar administrador', details: err.message });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});