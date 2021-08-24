import { html } from 'poor-man-jsx';
import Category from '../components/Category';
import Router from '../components/Router';
import Error from './Error';
import History from '../history';
import { GH_PATH } from '../constants';

const Menu = () => {
  let title;

  const changeToDefaultTitle = () => {
    title.textContent = 'Category';
  };

  const changeCategoryTitle = ({ params }) => {
    title.textContent = `Category ${params.id}`;
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
                  ${{ onClick: () => History.push(`${GH_PATH}/menu/${i + 1}`) }}
                >
                  {% ${str} ${i + 1} %}
                </a>
              </li>
            `
        )}
      </ul>
    </aside>
    <section class="menu">
      <h2
        class="title"
        ${{
          '@mount': function () {
            title = this;

            History.onChangeToPath(GH_PATH + '/menu', changeToDefaultTitle);
            History.onChangeToPath(GH_PATH + '/menu/:id', changeCategoryTitle);
          },
          '@unmount': () => {
            History.off(changeToDefaultTitle);
            History.off(changeCategoryTitle);
          },
        }}
      >
        Category
      </h2>
      ${Router(
        [
          {
            path: GH_PATH + '/menu/:id',
            component: Category,
          },
          {
            path: GH_PATH + '/menu',
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
