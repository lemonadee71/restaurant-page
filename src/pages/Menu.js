import { html } from 'poor-man-jsx';
import Card from '../components/Card';

const Menu = () =>
  html`
    <aside class="sidenav">
      <ul class="nav__menu sidenav__menu">
        ${new Array(5).fill('Category').map(
          (str, i) =>
            html`<li class="nav__item sidenav__item">
              <a class="link sidenav__link" href="#/">${str} ${i + 1}</a>
            </li>`
        )}
      </ul>
    </aside>
    <section class="menu">
      <h1 class="title">Category title</h1>
      ${new Array(10).fill(Card())}
    </section>
  `;

export default Menu;
