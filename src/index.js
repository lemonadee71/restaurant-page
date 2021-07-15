import App from './App';
import { render } from 'poor-man-jsx';
import event from './event';

let formHasValue = false;

event.on('form input', (hasInput) => {
  formHasValue = hasInput;
});

window.addEventListener('hashchange', () => {
  event.emit('hashchange', window.location.hash.replace('#', ''));
});

window.addEventListener('beforeunload', (e) => {
  if (formHasValue && window.location.hash.replace('#', '') === '/contact') {
    e.preventDefault();
    e.returnValue = '';
  }
});

document.body.prepend(render(App()));
