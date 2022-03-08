import React from 'react';
import ReactDOM from 'react-dom';
import Dashboard from './pages/Dashboard';

import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css"


const App = () =>{
  return <Dashboard />
}

ReactDOM.render(
    <App />,
  document.getElementById('react')
);
