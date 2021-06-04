import App from './App';
import { render } from './component';
import event from './event';

window.addEventListener('hashchange', () => {
  event.emit('hashchange', window.location.hash.replace('#', ''));
});

document.body.prepend(render(App()));
