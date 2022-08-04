<div align="center">

# Projeto - API Node Armazenamento Dropfilebox Files

</div>

<br>

<div align="center">

[![Generic badge](https://img.shields.io/badge/Made%20by-Renan%20Borba-purple.svg)](https://shields.io/) [![Build Status](https://img.shields.io/github/stars/RenanBorba/dropfilebox.svg)](https://github.com/RenanBorba/dropfilebox) [![Build Status](https://img.shields.io/github/forks/RenanBorba/dropfilebox.svg)](https://github.com/RenanBorba/dropfilebox) [![made-for-VSCode](https://img.shields.io/badge/Made%20for-VSCode-1f425f.svg)](https://code.visualstudio.com/) [![Open Source Love svg2](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)

</div>

<br>

API REST de dados Back-end em Node.js MVC, desenvolvida para o clone da aplicação Dropbox, voltada para serviço de armazenamento de arquivos, permitindo, assim, a atualização em tempo real dos arquivos recém enviados via WebSocket.

<br><br>

## :rocket: Tecnologias
<ul>
  <li>Nodemon</li>
  <li>MongoDB</li>
  <li>Mongoose</li>
  <li>Routes</li>
  <li>Express</li>
  <li>Multer</li>
  <li>Path</li>
  <li>Crypto</li>
  <li>Cors</li>
  <li>Socket.io WebSocket</li>
</ul>

<br><br>

## :arrow_forward: Start
<ul>
  <li>npm install</li>
  <li>npm run dev / npm dev</li>
</ul>

<br><br><br>

## :mega: ⬇ Abaixo, as principais estruturas:

<br><br><br>

## src/index.js
```js
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

// Conexão Websocket
io.on("connection", socket => {
  // Ouvir toda conexão com box via socket
  socket.on("connectRoom", box => {
    socket.join(box);
  });
});

/*
 * Database setup
 */
mongoose.connect('mongodb+srv://admin:admin@dropfilebox-60cwf.mongodb.net/test?retryWrites=true&w=majority', {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// next = seguir fluxo
app.use((req, res, next) => {
  // Disponibilizar acesso a todas as rotas
  req.io = io;

  return next();
});

// Permitir acesso de qualquer app
app.use(cors());
// Requisições com corpo no formato json
app.use(express.json());
app.use(express.urlencoded({
    extended: true
  })
);
// Liberar acesso arquivos
app.use("/files", express.static(path.resolve(__dirname, "..", "tmp")));

app.use(require("./routes"));

server.listen(3333);
```


<br><br>


## src/routes.js
```js
const express = require("express");
const multer = require("multer");
const multerConfig = require("./config/multer");

const routes = express.Router();

const BoxController = require("./controllers/BoxController");
const FileController = require("./controllers/FileController");

// Rotas HTTP
routes.get("/boxes/:id", BoxController.show);
routes.post("/boxes", BoxController.store);
routes.post(
  "/boxes/:id/files",
  multer(multerConfig).single("file"),
  FileController.store
);

module.exports = routes;
```


<br><br>


## src/config/multer.js
```js
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
```

<br><br>

## src/models/Box.js
```js
const mongoose = require('mongoose');

const Box = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  // ObjectId do file adicionado
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Box', Box);
```


<br><br>


 ## src/models/File.js
```js
const mongoose = require('mongoose');

const File = new mongoose.Schema({
  title: {
    type: String,
	  required: true
  },
  path: {
    type: String,
	  required: true
  }
}, {
  timestamps: true,
	toObject: {
	  virtuals: true
  },
  // Anexar virtuals
  toJSON: {
    virtuals: true
  },
});

// Rota virtual póstuma ao envio do arquivo
File.virtual('url').get(function () {
  const url = 'http://localhost:3333'
  return `${url}/files/${encodeURIComponent(this.path)}`;
});

module.exports = mongoose.model('File', File);
```

<br><br>

## src/controllers/BoxController.js
```js
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
```

<br><br>

## src/controllers/FileController.js
```js
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
```
