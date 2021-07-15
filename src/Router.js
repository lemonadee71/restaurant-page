import { html, createState } from 'poor-man-jsx';
import event from './event';

// Will only render one component at a time
const Router = (routes, error, className = '', tagName = 'div') => {
  const [currentLocation] = createState(
    window.location.hash.replace('#', '') || '/'
  );

  event.on('hashchange', (path) => {
    currentLocation.value = path;
  });

  const changeContent = (path) => {
    const route = routes.find((route) => route.path === path);

    if (!route || !route.component) {
      return error.call(null);
    }

    return route.component.call(null);
  };

  return html`
    <${tagName} ${className && `class="${className}"`} 
    ${{
      $children: currentLocation.$value(changeContent),
    }}>
    </${tagName}>
  `;
};

export default Router;
