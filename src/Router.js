import { html, createState } from 'poor-man-jsx';
import { getParams, getParamValues } from './utils';
import History from './history';

// Will only render one component at a time
const Router = (routes, error, className = '', tagName = 'div') => {
  const [current, revoke] = createState({
    path: '',
    isExact: true,
    component: [],
  });

  const allRoutes = routes.map((route) => {
    const [pattern, params] = getParams(route.path, route.exact);
    return { ...route, path: pattern, params };
  });

  const changeContent = (path, state) => {
    if (!current.isExact && path.startsWith(current.path)) return;

    const route = allRoutes.find((route) => route.path.exec(path));

    if (!route || !route.component) {
      current.component = error.call();
    }

    const payload = {
      path,
      state,
    };

    if (route.params.length) {
      payload.params = getParamValues(path, paramNames);
    }

    current.component = route.component.call(null, payload);
    current.isExact = route.exact || true;
    current.path = path;
  };

  return html`
    <${tagName} ${className && `class="${className}"`} 
    ${{
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
