import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Import our custom theme instead of default Bootstrap CSS
import './styles/custom.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
// We can keep the custom.css for additional styles not related to Bootstrap theming
import App from './App.tsx';
import { Provider } from 'react-redux';
import { store } from './store/store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
