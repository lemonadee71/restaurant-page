import { html, createState } from 'poor-man-jsx';
import { getParams, getParamValues } from '../utils';
import History from '../history';

// Will only render one component at a time
const Router = (routes, error, className = '', tagName = 'div') => {
  const [current, revoke] = createState({
    path: '',
    isExact: true,
    component: [],
  });

  const _routes = routes.map((route) => {
    const [pattern, params] = getParams(route.path, route.exact);
    return { ...route, path: pattern, params };
  });

  const changeContent = (path, state) => {
    if (
      (!current.isExact && path.startsWith(current.path)) ||
      current.path === path
    )
      return;
    const route = _routes.find((route) => route.path.exec(path));

    if (route && route.component) {
      const payload = {
        path,
        state,
      };

      if (route.params.length) {
        payload.params = getParamValues(path, route.path, route.params);
      }

      if (route.title) {
        document.title = route.title;
      }

      current.component = route.component.call(null, payload);
    } else {
      current.component = error.call();
    }

    current.isExact = route?.exact ?? true;
    current.path = path;
  };

  return html`
    <${tagName} ${className && `class="${className}"`} 
    ${{
      '@mount': () =>
        changeContent(window.location.pathname, window.history.state),
      '@create': () => History.onPopState(changeContent),
      '@destroy': () => {
        revoke();
        History.off(changeContent);
      },
      $children: current.$component,
    }}>
    </${tagName}>
  `;
};

export default Router;
