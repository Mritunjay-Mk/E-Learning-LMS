import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';
import favicon from '../images/fevilogo.png';

const faviconLink = document.querySelector("link[rel='icon']") || document.createElement('link');
faviconLink.rel = 'icon';
faviconLink.type = 'image/png';
faviconLink.href = favicon;
document.head.appendChild(faviconLink);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
