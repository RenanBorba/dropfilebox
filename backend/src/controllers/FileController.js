const Box = require("../models/Box");
const File = require("../models/File");

class FileController {
  async store(req, res) {
    // Buscar por id no param. da requisição
    const box = await Box.findById(req.params.id);

    const file = await File.create({
      title: req.file.originalname,
      // hash+name
      path: req.file.key
    });

    box.files.push(file);

    await box.save();

    // Enviar requisição 'file'
    req.io.sockets.in(box._id).emit("file", file);

    return res.json(file);
  }
}

module.exports = new FileController();