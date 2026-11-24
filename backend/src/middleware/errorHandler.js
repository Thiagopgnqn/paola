export const errorHandler = (err, req, res, next) => {
  console.error('[SERVER ERROR]', err.message || err);

  if (err.status || err.statusCode) {
    return res.status(err.status || err.statusCode).json({ error: err.message });
  }

  // Errores de base de datos caída o inalcanzable (Prisma / Postgres)
  if (
    ['P1000', 'P1001', 'P1002', 'P1003', 'P1008', 'P1017'].includes(err.code) ||
    (err.message && err.message.includes("Can't reach database server"))
  ) {
    return res.status(503).json({
      error: 'Base de datos no disponible. Por favor, reintentá en unos instantes.',
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'El recurso ya existe' });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Recurso no encontrado' });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ error: `Error al subir archivo: ${err.message}` });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: err.message || 'Internal server error' });
};

