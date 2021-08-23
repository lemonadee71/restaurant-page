import { html } from 'poor-man-jsx';
import History from '../history';

const Error = () =>
  html`
    <div class="error">
      <h1 class="error__message">Page not found</h1>
      <p class="link error__link" ${{ onClick: () => History.back() }}>
        Go back
      </p>
    </div>
  `;

export default Error;
