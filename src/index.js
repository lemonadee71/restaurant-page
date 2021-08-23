import { render } from 'poor-man-jsx';
import App from './App';
import event from './event';
import History from './history';

let formHasValue = false;

event.on('form input', (hasInput) => {
  formHasValue = hasInput;
});

window.addEventListener('beforeunload', (e) => {
  if (formHasValue && window.location.pathname === '/contact') {
    e.preventDefault();
    e.returnValue = '';
  }
});

window.addEventListener('DOMContentLoaded', () => History.push('/'));
render(App(), document.body);
