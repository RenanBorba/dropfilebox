const Box = require('../models/Box');

class BoxController {
  async store(req, res) {
    const box = await Box.create(req.body);

    return res.json(box);
  }

  async show(req, res) {
    // Buscar por id no param. da requisição e popular com file
    const box = await Box.findById(req.params.id).populate({
      // caminho arquivos
      path: 'files',
      options: {
        // ordenação
        sort: {
          createdAt: -1
        }
      }
    });

    return res.json(box);
  };
};

module.exports = new BoxController();