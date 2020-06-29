<div align="center">

# Projeto - Aplicação Dropfilebox Web ReactJS

</div>

<br>

<div align="center">

[![Generic badge](https://img.shields.io/badge/Made%20by-Renan%20Borba-purple.svg)](https://shields.io/) [![Build Status](https://img.shields.io/github/stars/RenanBorba/dropfilebox.svg)](https://github.com/RenanBorba/dropfilebox) [![Build Status](https://img.shields.io/github/forks/RenanBorba/dropfilebox.svg)](https://github.com/RenanBorba/dropfilebox) [![made-for-VSCode](https://img.shields.io/badge/Made%20for-VSCode-1f425f.svg)](https://code.visualstudio.com/) [![Open Source Love svg2](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)

</div>

<br>

Aplicação Front-end desenvolvida em ReactJS  para o clone da versão web responsiva do Dropbox, voltada para serviço de armazenamento de arquivos, permitindo, assim, a atualização em tempo real dos arquivos recém enviados via WebSocket.

<br><br>

![000](https://user-images.githubusercontent.com/48495838/80150541-f3c75a80-858e-11ea-9045-a4630a821c96.jpg)
<br><br>

## :rocket: Tecnologias
<ul> 
  <li>Components</li>  
  <li>Routes</li> 
  <li>react-router-dom</li>
  <li>Axios</li> 
  <li>Services API</li>
  <li>date-fns</li>
  <li>react-dropzone</li>
  <li>States</li>
  <li>socket.io-client WebSocket</li>
  <li>Favicon</li>
  <li>CSS</li>
  <li>react-icons</li> 
</ul> 

<br><br>

## :arrow_forward: Start
<ul> 
  <li>npm install</li>
  <li>npm run start / npm start</li>
</ul>

<br><br><br>

## :mega: Segue abaixo as principais estruturas e interfaces:
<br><br><br>

## src/routes.js
```js
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Main from './pages/Main';
import Box from './pages/Box';

const Routes = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/" exact component={ Main }/>
      <Route path="/box/:id" component={ Box }/>
    </Switch>
  </BrowserRouter>
);

export default Routes;
```


<br><br>


## src/services/api.js
```js
import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:3333"
});

export default api;
```


<br><br>


## src/pages/Box/index.js
```js
import React, { Component } from "react";
import api from "../../services/api";
import { formatDistance, parseISO } from "date-fns";
import pt from "date-fns/locale/pt";
import DropZone from "react-dropzone";
import socket from "socket.io-client";
import { MdInsertDriveFile } from "react-icons/md";
import logo from "../../assets/logo.png";
import "./styles.css";

export default class Box extends Component {
  state = {
    // inicialização estado
    box: {}
  };

  async componentDidMount() {
    this.subscribeToNewFiles();

    const box = this.props.match.params.id;
    // Obter box da rota boxes
    const response = await api.get(`/boxes/${box}`);

    this.setState({ box: response.data });
  }

  subscribeToNewFiles = () => {
    const box = this.props.match.params.id;
    // Conexão Websocket
    const io = socket("http://localhost:3333");

    // Enviar req 'connectRoom'
    io.emit("connectRoom", box);
    // Ouvir req 'file'
    io.on("file", data => {
      this.setState({
        box: { ...this.state.box, files: [data, ...this.state.box.files] }
      });
    });
  };

  // onDropAccepted (envio aceito)
  handleUpload = files => {
    files.forEach(file => {
      const data = new FormData();
      const box = this.props.match.params.id;

      data.append("file", file);

      // Enviar param. box id na rota files da rota boxes da api
      api.post(`/boxes/${box}/files`, data);
    });
  };

  render() {
    return (
      <div id="box-container">
        <header>
          <img src={ logo } alt="" />
          <h1>{ this.state.box.title }</h1>
        </header>

        <DropZone onDropAccepted={ this.handleUpload }>
          {({ getRootProps, getInputProps }) => (
            <div className="upload" {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Arraste arquivos ou clique aqui.</p>
            </div>
          )}
        </DropZone>

        <ul>
          { this.state.box.files &&
          // Mapear arquivos do box
            this.state.box.files.map(file => (
              <li key={ file._id }>
                <a
                  href={ file.url }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fileInfo"
                >
                  <MdInsertDriveFile size={24} color="#A5CFFF" />
                  <strong>{ file.title }</strong>
                </a>

                <span>
                  há{" "}
                  {/* a partir do índice de ordenação da api */}
                  {formatDistance(parseISO(file.createdAt), new Date(), {
                    locale: pt
                  })}
                </span>
              </li>
            ))}
        </ul>
      </div>
    );
  }
};
```


<br><br>


## src/pages/Main/index.js
```js
import React, { Component } from 'react';
import api from '../../services/api';
import logo from '../../assets/logo.png';
import './styles.css';

export default class Main extends Component {
  state = {
    // inicialização estado
    newBox: '',
  };

  // No envio do formulário
  handleSubmit = async (e) => {
    // Prevenir com o comportamento padrão
    e.preventDefault();

    // Enviar param. title do newBox na rota boxes
    const response = await api.post('/boxes', {
      title: this.state.newBox,
    });

    // navigation props (navegar para rota do novo id enviado)
    this.props.history.push(`/box/${response.data._id}`);
  };

  handleInputChange = (e) => {
    // Setar estado com valor referente ao newBox
    this.setState({ newBox: e.target.value });
  };

  render() {
    return (
      <div id="main-container">
        <form onSubmit={ this.handleSubmit }>
          <img src={ logo } alt="" />
          <input placeholder="Criar um Box.."
            value={ this.state.newBox }
            onChange={ this.handleInputChange }/>
          <button type="submit">Criar</button>
        </form>
      </div>
    );
  };
};
```


<br><br>



## Interface inicial
![00](https://user-images.githubusercontent.com/48495838/78931545-7c68d580-7a7c-11ea-94b4-9adfcfd3061c.JPG)
<br><br><br>


## Cadastrando o Box

![01](https://user-images.githubusercontent.com/48495838/78931556-7e329900-7a7c-11ea-9bc5-35c657cfa862.JPG)
<br><br><br>


## Interface após redirecionamento ao Box

![02](https://user-images.githubusercontent.com/48495838/75583934-67486200-5a4d-11ea-8254-b6703db0be5c.JPG)
<br><br><br>


## Interface após a seleção de arquivo

![03](https://user-images.githubusercontent.com/48495838/75583937-67486200-5a4d-11ea-841f-fb3f50ebaa10.JPG)
<br><br><br>


## Interface após o envio do arquivo

![04](https://user-images.githubusercontent.com/48495838/75583939-67e0f880-5a4d-11ea-94cc-d594b006fa5e.JPG)
<br><br><br>


### Interface após o envio de mais arquivos, mostrando há quanto tempo cada file foi enviado ao box

![05](https://user-images.githubusercontent.com/48495838/75583943-68798f00-5a4d-11ea-9186-630e4939f784.JPG)
<br><br><br>


## Interface após redirecionamento da url da imagem

![100](https://user-images.githubusercontent.com/48495838/78931553-7d9a0280-7a7c-11ea-8265-d580753c8928.JPG)
