import { html } from 'poor-man-jsx';
import { GH_PATH } from '../constants';
import History from '../history';

const Home = () => html`
  <div class="banner">
    <div class="banner__column-l">
      <h1 class="banner__title title">Welcome to our Restaurant</h1>
      <p class="banner__subtext">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ipsum,
        accusamus! Lorem ipsum, dolor sit amet consectetur adipisicing elit.
        Amet, vel!
      </p>
      <div class="banner__btns">
        <button class="banner__btn">Order now</button>
        <a
          class="banner__link link"
          ${{ onClick: () => History.push(GH_PATH + '/menu') }}
        >
          See menu
        </a>
      </div>
    </div>
    <div class="banner__column-r">
      <img
        class="banner__img"
        src="https://via.placeholder.com/500x300?text=A+picture+of+food"
        alt="picture of ramen"
      />
    </div>
  </div>
`;

export default Home;
