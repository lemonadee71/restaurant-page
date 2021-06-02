import { html } from './component';
import * as pages from './pages';
import Router from './Router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: pages.Home,
  },
  {
    path: '/menu',
    name: 'Menu',
    component: pages.Menu,
  },
  {
    path: '/contact',
    name: 'Contact',
    component: pages.Contact,
  },
];

const App = () => html`<div>
    <ul>
      ${routes.map(
        (route) => `<li><a href="#${route.path}">${route.name}</a></li>`
      )}
    </ul>
  </div>
  ${Router(routes, pages.Error)}`;

export default App;
