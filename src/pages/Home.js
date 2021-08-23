import { html } from 'poor-man-jsx';
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
          ${{ onClick: () => History.push('/menu') }}
        >
          See menu
        </a>
      </div>
    </div>
    <div class="banner__column-r">
      <img
        class="banner__img"
        src="./assets/images/banner_image.jpg"
        alt="picture of ramen"
      />
    </div>
  </div>
`;

export default Home;
