import { html } from 'poor-man-jsx';
import History from './history';
import Router from './Router';
import * as pages from './pages';

const routes = [
  {
    path: '/',
    name: 'Home',
    title: 'My Restaurant',
    component: pages.Home,
  },
  {
    path: '/menu',
    name: 'Menu',
    title: 'My Restaurant | Menu',
    exact: false,
    component: pages.Menu,
  },
  {
    path: '/about',
    name: 'About',
    title: 'My Restaurant | About Us',
    component: pages.About,
  },
  {
    path: '/contact',
    name: 'Contact',
    title: 'My Restaurant | Contact',
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
                <a
                  class="nav__link link"
                  ${{ onClick: () => History.push(route.path) }}
                >
                  ${route.name}
                </a>
              </li>
            `
        )}
      </ul>
    </nav>
  </header>
  ${Router(routes, pages.Error, 'container', 'main')}
  <footer class="footer">
    <div class="footer__links"></div>
  </footer>
`;

export default App;
