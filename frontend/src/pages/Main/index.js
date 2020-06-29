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