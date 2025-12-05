// rutas/clinicasRutas.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();

const { requireAdmin } = require('../middlewares/authMiddleware');
const {
  listarClinicas,
  obtenerClinica,
  crearClinica,
  actualizarClinica,
  eliminarClinica
} = require('../controladores/clinicasControlador');

const imagenesPath = path.join(__dirname, '..', 'public', 'imagenes');
if (!fs.existsSync(imagenesPath)) {
  fs.mkdirSync(imagenesPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagenesPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});
const upload = multer({ storage });

// Rutas públicas y admin (igual que antes)
router.get('/api/clinicas', listarClinicas);
router.get('/api/clinicas/:id', obtenerClinica);

router.post('/api/clinicas', requireAdmin, upload.single('imagen'), crearClinica);
router.put('/api/clinicas/:id', requireAdmin, upload.single('imagen'), actualizarClinica);
router.delete('/api/clinicas/:id', requireAdmin, eliminarClinica);

module.exports = router;
