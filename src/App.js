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
    path: 'about',
    name: 'About Us',
  },
  {
    path: '/contact',
    name: 'Contact',
    component: pages.Contact,
  },
];

const App = () => html`
  <header class="header">
    <span class="header__brand title">My Restaurant</span>
    <nav class="header__nav nav">
      <ul class="nav__menu">
        ${routes.map(
          (route) =>
            html`
              <li class="nav__item">
                <a class="nav__link" href="#${route.path}">${route.name}</a>
              </li>
            `
        )}
      </ul>
    </nav>
  </header>
  <main>${Router(routes, pages.Error)}</main>
`;

export default App;
