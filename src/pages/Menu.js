import { html } from 'poor-man-jsx';
import Category from '../components/Category';
import History from '../history';
import Router from '../Router';
import Error from './Error';

const Menu = () => {
  let self;

  const changeToDefaultTitle = () => {
    self.textContent = 'Category';
  };

  const changeCategoryTitle = ({ params }) => {
    self.textContent = `Category ${params.name}`;
  };

  return html`
    <aside class="sidenav">
      <ul class="nav__menu sidenav__menu">
        ${new Array(5).fill('Category').map(
          (str, i) =>
            html`
              <li class="nav__item sidenav__item">
                <a
                  class="link sidenav__link"
                  ${{ onClick: () => History.push(`/menu/${i + 1}`) }}
                >
                  {% ${str} ${i + 1} %}
                </a>
              </li>
            `
        )}
      </ul>
    </aside>
    <section class="menu">
      <h1
        class="title"
        ${{
          '@mount': function () {
            self = this;

            History.onChangeToPath('/menu', changeToDefaultTitle);
            History.onChangeToPath('/menu/:name', changeCategoryTitle);
          },
          '@unmount': () => {
            History.off(changeToDefaultTitle);
            History.off(changeCategoryTitle);
          },
        }}
      >
        Category
      </h1>
      ${Router(
        [
          {
            path: '/menu/:id',
            component: Category,
          },
          {
            path: '/menu',
            component: () =>
              'This is a nested route. Choose a category from sidebar for a demo.',
          },
        ],
        Error
      )}
    </section>
  `;
};

export default Menu;
