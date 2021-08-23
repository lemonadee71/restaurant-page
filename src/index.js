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

render(App(), document.body);
