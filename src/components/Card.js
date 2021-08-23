import { html } from 'poor-man-jsx';

const Card = (id) =>
  html`
    <div class="card">
      <img
        class="card__img"
        src="https://via.placeholder.com/200"
        alt="placeholder"
      />
      <div class="card__body">
        <h1 class="title card__title">This is card #${id}</h1>
        <p class="card__text">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore
          officiis mollitia obcaecati officia repellat dolores.
        </p>
        <hr />
        <p class="card__subtext">Lorem ipsum dolor sit amet.</p>
      </div>
    </div>
  `;

export default Card;
