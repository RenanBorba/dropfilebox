const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

module.exports = {
  // Caminho do destino
  dest: path.resolve(__dirname, '..', '..', 'tmp'),
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, '..', '..', 'tmp'));
    },
    filename: (req, file, cb) => {
      // Encriptar com bytes randômicos
      crypto.randomBytes(16, (err, hash) => {
        // Repasse de erro ao multer
        if (err) cb(err);

        // Hash anexado ao índice dos nomes dos arquivos
        file.key = `${hash.toString('hex')}-${file.originalname}`;

        cb(null, file.key);
      })
    }
  })
};