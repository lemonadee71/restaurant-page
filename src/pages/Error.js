import { html } from 'poor-man-jsx';

const Error = () =>
  html`
    <div class="error">
      <h1 class="error__message">Page not found</h1>
      <p class="link error__link" ${{ onClick: () => window.history.back() }}>
        Go back
      </p>
    </div>
  `;

export default Error;
