import { html } from '../component';

const Error = () =>
  html`
    <div class="error">
      <h1 class="error__message">Page not found</h1>
      <p class="error__link" ${{ onClick: () => window.history.back() }}>
        Go back
      </p>
    </div>
  `;

export default Error;
