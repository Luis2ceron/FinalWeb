// Servidor HTTP simple para el juego Memorama
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Mapeo de extensiones de archivo a tipos MIME
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`Solicitud para ${req.url}`);
    
    // Normalizar la URL solicitada
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    // Obtener la extensión del archivo
    const extname = path.extname(filePath);
    
    // Determinar el tipo de contenido
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Leer el archivo
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Archivo no encontrado
                fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
                    if (err) {
                        // Error servidor
                        res.writeHead(500);
                        res.end('Error interno del servidor');
                    } else {
                        // Redirigir a index
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    }
                });
            } else {
                // Otros errores
                res.writeHead(500);
                res.end(`Error interno del servidor: ${err.code}`);
            }
        } else {
            // Éxito
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ejecutándose en http://0.0.0.0:${PORT}/`);
});