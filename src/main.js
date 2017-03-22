import React from 'react';
import ReactDOM from 'react-dom';
import Mapboard from './components/Mapboard';

export default (config) => {
  ReactDOM.render(
    <Mapboard />,
    document.getElementById(config.el)
  );
};
