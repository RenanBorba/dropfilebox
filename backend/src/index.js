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