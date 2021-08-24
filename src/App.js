import { html } from 'poor-man-jsx';
import Router from './components/Router';
import { GH_PATH, NAME } from './constants';
import History from './history';
import * as pages from './pages';

const routes = [
  {
    path: GH_PATH + '/',
    name: 'Home',
    title: `${NAME}`,
    component: pages.Home,
  },
  {
    path: GH_PATH + '/menu',
    name: 'Menu',
    title: `${NAME} | Menu`,
    exact: false,
    component: pages.Menu,
  },
  {
    path: GH_PATH + '/about',
    name: 'About',
    title: `${NAME} | About Us`,
    component: pages.About,
  },
  {
    path: GH_PATH + '/contact',
    name: 'Contact',
    title: `${NAME} | Contact`,
    component: pages.Contact,
  },
];

const App = () => html`
  <header class="header">
    <span class="header__brand title">${NAME}</span>
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
