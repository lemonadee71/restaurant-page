import EventEmitter from './emitter';
import { getParams, getParamValues } from './utils';

const History = (() => {
  const $ = new EventEmitter();
  const cache = new Map();
  const history = window.history;

  const sync = () => {
    $.emit('popstate', window.location.pathname, history.state);
  };

  const onPopState = (fn, options) => {
    $.on('popstate', fn, options);
  };

  const onChangeToPath = (path, fn, options) => {
    const order = path.split('/').length - 1;
    const [pattern, paramNames] = getParams(path);

    const cb = (path, state) => {
      if (!pattern.exec(path)) return;

      const payload = {
        path,
        state,
      };

      if (paramNames.length) {
        payload.params = getParamValues(path, pattern, paramNames);
      }

      fn.call(null, payload);
    };

    cache.set(fn, cb);
    $.on('popstate', cb, { ...options, order });
  };

  const off = (fn) => {
    $.off('popstate', cache.get(fn) || fn);
  };

  const clear = () => $.clear();

  const push = (path, state) => {
    history.pushState(state, null, path);
    sync();
  };

  const replace = (path, state) => {
    history.replaceState(state, null, path);
    sync();
  };

  const forward = () => {
    history.forward();
    sync();
  };

  const back = () => {
    history.back();
    sync();
  };

  const go = (n = 0) => {
    history.go(n);
    sync();
  };

  window.addEventListener('popstate', sync);

  return {
    back,
    clear,
    forward,
    go,
    push,
    replace,
    off,
    onChangeToPath,
    onPopState,
    sync,
  };
})();

export default History;
