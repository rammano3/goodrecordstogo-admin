import React, { Component } from 'react';

import ProcessCSV from './pages/ProcessCSV';

import logo from './logo.png';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-Container">
          <img src={logo} className="App-logo" alt="logo" />
          <div className="App-link-container">
            Expo App Link
            <a
              className="App-link"
              href="https://expo.io/@rammano3/goodrecordstogo"
            >
              goodrecordstogo
            </a>
          </div>
          <ProcessCSV />
        </div>
      </div>
    );
  }
}

export default App;
