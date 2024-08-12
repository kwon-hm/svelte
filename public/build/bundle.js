
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.31.2 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (209:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (202:0) {#if componentParams}
    function create_if_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(202:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap$1(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		window.history.replaceState(undefined, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, hrefVar) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, hrefVar || node.getAttribute("href"));

    	return {
    		update(updated) {
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, href) {
    	// Destination must start with '/'
    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	// Add # to the href attribute
    	node.setAttribute("href", "#" + href);

    	node.addEventListener("click", scrollstateHistoryHandler);
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {HTMLElementEventMap} event - an onclick event attached to an anchor tag
     */
    function scrollstateHistoryHandler(event) {
    	// Prevent default anchor onclick behaviour
    	event.preventDefault();

    	const href = event.currentTarget.getAttribute("href");

    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument - strings must start with / or *");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == "string") {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || "/";
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	if (restoreScrollState) {
    		window.addEventListener("popstate", event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		});

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.scrollX, previousScrollState.scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		tick,
    		_wrap: wrap,
    		wrap: wrap$1,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		scrollstateHistoryHandler,
    		createEventDispatcher,
    		afterUpdate,
    		regexparam,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		lastLoc,
    		componentObj
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			 history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var bind$1 = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind$1(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
      var defaultToConfig2Keys = [
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
        'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
      ];
      var directMergeKeys = ['validateStatus'];

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      }

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      utils.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys)
        .concat(directMergeKeys);

      var otherKeys = Object
        .keys(config1)
        .concat(Object.keys(config2))
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, mergeDeepProperties);

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return (typeof payload === 'object') && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind$1(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios_1;

    // Factory for creating new instances
    axios.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios.Cancel = Cancel_1;
    axios.CancelToken = CancelToken_1;
    axios.isCancel = isCancel;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;

    // Expose isAxiosError
    axios.isAxiosError = isAxiosError;

    var axios_1 = axios;

    // Allow use of default import syntax in TypeScript
    var _default = axios;
    axios_1.default = _default;

    var axios$1 = axios_1;

    const host = {
      API_URL: "http://localhost:8090/graphql"
    };

    var api = {
      login: async (id, pw)=>{
        try {
          const result = await axios$1.post(host.API_URL,{
            query: `
              mutation{
                login(userId:"${id}",password:"${pw}"){
                  token
                  user{
                    no
                    corpId
                    company
                    userId
                    userName
                  }
                }
              }
            `
          });
          return result.data.data.login
        } catch (err) {
          throw new Error("login Error: ", err)
        }
      },

      getPost: async (company, curPage, searchValue, pageSize)=>{
        try {
          const result = await axios$1.post(host.API_URL,{
            query:`
            query{
              getPostsByCorpPaging(category:"${company}", curPage:${curPage}, search:"${searchValue}", pageSize:${pageSize}){
                post{
                  no
                  num
                  title
                  contents
                  writer
                  createdDate
                  modifiedDate
                }
                paging{
                  curPage
                  page_list_size
                  page_size
                  totalPage
                  startPage
                  endPage
                  no
                  totalCount
                }
              }
            }
        `
          });
          return result.data.data.getPostsByCorpPaging
        } catch (err) {
          throw new Error("get post Error: ", err)
        }
      },

      savePost: async (title, contents, uId, uName, cp)=>{
        try{
          const result = await axios$1.post(host.API_URL,{
            query:`
            query{
                insertPost(
                    userId: "${uId}"
                    title: "${title}"
                    contents: "${contents}"
                    files: null
                    writer: "${uName}"
                    counter: null
                    category: "${cp}")
                    {
                    resultCount
                }
            }
        `
          });
          return result.data.data.insertPost.resultCount
        } catch (err) {
          throw new Error("savePost Error: ", err)
        }
      },

      detailPost: async (id)=>{
        try {
          const result = await axios$1.post(host.API_URL,{
            query:`
            query{
              readPost(no: ${id}){
                post{
                  title
                  userId
                  writer
                  contents
                  category
                  createdDate
                  modifiedDate
                }
                coments{
                  no
                  coment
                  userId
                  writer
                  createdDate
                  modifiedDate
                }
              }
            }
        `
          });
          return result.data.data.readPost
        } catch (err) {
          throw new Error("detailPost Error: ", err)
        }
      },

      updatePost: async (No, Title, Contents, uId)=>{
        try {
          const result = await axios$1.post(host.API_URL,{
            query:`
            query{
              updatePost(
                no: "${No}"
                title: "${Title}"
                contents: "${Contents}"
                uid: "${uId}"
                ){
                resultCount
              }
            }
        `
          });
          return result.data.data.updatePost.resultCount
        } catch (err) {
          throw new Error("updatePost Error: ", err)
        }
      },

      getDecodeUser: async (token)=>{
        try {
          const result = await axios$1.post(host.API_URL,{
            query:`
            mutation{
                getDecodeToken(token:"`+token+`"){
                    no
                    userName
                    company
                    userEmail
                    userMobile
                    userId
                }
            }
        `
          });
          return result.data.data.getDecodeToken
        } catch (err) {
          throw new Error("getDecodeUser Error: ", err)
        }
      },

      updateUser: async (no, name, email, id, phone, password)=>{
        try {
          const result = await axios$1.post(host.API_URL,{
            query: `
          mutation{
              updateUser(
                  no:${no}
                  userName:"${name}"
                  userEmail:"${email}"
                  userMobile:"${phone}"
                  userPW:"${password}"
                  userId:"${id}"
              ){
                  resultCount
              }
          }
        `
          });
          return result.data.data.updateUser.resultCount
        } catch (err) {
          throw new Error("updateUser Error: ", err);
        }
      },

      saveComent: async (no, comentVal, uId, writer)=>{
        try {
          const result = await axios$1.post(host.API_URL,{
            query: `
          mutation{
            insertComent(
                postId: "${no}"
                coment: "${comentVal}"
                uId: "${uId}"
                writer: "${writer}"
              ){
                  resultCount
              }
          }
        `
          });
          return result.data.data.insertComent.resultCount
        } catch (err) {
          throw new Error("insertComent Error: ", err);
        }
      },

      deletePost: async (no)=>{
        try {
          const result = await axios$1.post(host.API_URL,{
            query: `
          query{
            deletePost(
                no: ${no}
              ){
                  resultCount
              }
          }
        `
          });
          return result.data.data.deletePost.resultCount
        } catch (err) {
          throw new Error("deletePost Error: ", err);
        }
      },

      deleteComent: async (no)=>{
        try {
          const result = await axios$1.post(host.API_URL,{
            query: `
          mutation{
            deleteComent(
                no: ${no}
              ){
                  resultCount
              }
          }
        `
          });
          return result.data.data.deleteComent.resultCount
        } catch (err) {
          throw new Error("deleteComent Error: ", err)
        }
      }

      
    };

    const store_token = sessionStorage.getItem("tk");
    const store_company = sessionStorage.getItem("cp");
    const store_userNo = sessionStorage.getItem("uNo");
    const store_userName = sessionStorage.getItem("uName");
    const store_uId = sessionStorage.getItem("uId");
    const store_no = sessionStorage.getItem("no");

    const tk = writable(store_token);
    const cp = writable(store_company);
    const uNo = writable(store_userNo);
    const uName = writable(store_userName);
    const uId = writable(store_uId);
    const post_no = writable(store_no);

    tk.subscribe(value => {
      sessionStorage.setItem("tk", value);
    });
    cp.subscribe(value => {
      sessionStorage.setItem("cp", value);
    });
    uNo.subscribe(value => {
      sessionStorage.setItem("uNo", value);
    });
    uName.subscribe(value => {
      sessionStorage.setItem("uName", value);
    });
    uId.subscribe(value => {
      sessionStorage.setItem("uId", value);
    });
    post_no.subscribe(value => {
      sessionStorage.setItem("post_no", value);
    });


    const search = writable("");
    const offset = writable(0);
    const pageSize = writable(5);

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    function ie(n){return l=>{const o=Object.keys(n.$$.callbacks),i=[];return o.forEach(o=>i.push(listen(l,o,e=>bubble(n,e)))),{destroy:()=>{i.forEach(e=>e());}}}}function se(){return "undefined"!=typeof window&&!(window.CSS&&window.CSS.supports&&window.CSS.supports("(--foo: red)"))}function re(e){var t;return "r"===e.charAt(0)?e=(t=(t=e).match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i))&&4===t.length?"#"+("0"+parseInt(t[1],10).toString(16)).slice(-2)+("0"+parseInt(t[2],10).toString(16)).slice(-2)+("0"+parseInt(t[3],10).toString(16)).slice(-2):"":"transparent"===e.toLowerCase()&&(e="#00000000"),e}const{document:ae}=globals;function ce(e){let t;return {c(){t=element("div"),attr(t,"class","ripple svelte-po4fcb");},m(n,l){insert(n,t,l),e[5](t);},p:noop,i:noop,o:noop,d(n){n&&detach(t),e[5](null);}}}function de(e,t){e.style.transform=t,e.style.webkitTransform=t;}function ue(e,t){e.style.opacity=t.toString();}const pe=function(e,t){const n=["touchcancel","mouseleave","dragstart"];let l=t.currentTarget||t.target;if(l&&!l.classList.contains("ripple")&&(l=l.querySelector(".ripple")),!l)return;const o=l.dataset.event;if(o&&o!==e)return;l.dataset.event=e;const i=document.createElement("span"),{radius:s,scale:r,x:a,y:c,centerX:d,centerY:u}=((e,t)=>{const n=t.getBoundingClientRect(),l=function(e){return "TouchEvent"===e.constructor.name}(e)?e.touches[e.touches.length-1]:e,o=l.clientX-n.left,i=l.clientY-n.top;let s=0,r=.3;const a=t.dataset.center;t.dataset.circle?(r=.15,s=t.clientWidth/2,s=a?s:s+Math.sqrt((o-s)**2+(i-s)**2)/4):s=Math.sqrt(t.clientWidth**2+t.clientHeight**2)/2;const c=(t.clientWidth-2*s)/2+"px",d=(t.clientHeight-2*s)/2+"px";return {radius:s,scale:r,x:a?c:o-s+"px",y:a?d:i-s+"px",centerX:c,centerY:d}})(t,l),p=l.dataset.color,f=2*s+"px";i.className="animation",i.style.width=f,i.style.height=f,i.style.background=p,i.classList.add("animation--enter"),i.classList.add("animation--visible"),de(i,`translate(${a}, ${c}) scale3d(${r},${r},${r})`),ue(i,0),i.dataset.activated=String(performance.now()),l.appendChild(i),setTimeout(()=>{i.classList.remove("animation--enter"),i.classList.add("animation--in"),de(i,`translate(${d}, ${u}) scale3d(1,1,1)`),ue(i,.25);},0);const v="mousedown"===e?"mouseup":"touchend",h=function(){document.removeEventListener(v,h),n.forEach(e=>{document.removeEventListener(e,h);});const e=performance.now()-Number(i.dataset.activated),t=Math.max(250-e,0);setTimeout(()=>{i.classList.remove("animation--in"),i.classList.add("animation--out"),ue(i,0),setTimeout(()=>{i&&l.removeChild(i),0===l.children.length&&delete l.dataset.event;},300);},t);};document.addEventListener(v,h),n.forEach(e=>{document.addEventListener(e,h,{passive:!0});});},fe=function(e){0===e.button&&pe(e.type,e);},ve=function(e){if(e.changedTouches)for(let t=0;t<e.changedTouches.length;++t)pe(e.type,e.changedTouches[t]);};function he(e,t,n){let l,o,{center:i=!1}=t,{circle:s=!1}=t,{color:r="currentColor"}=t;return onMount(async()=>{await tick();try{i&&n(0,l.dataset.center="true",l),s&&n(0,l.dataset.circle="true",l),n(0,l.dataset.color=r,l),o=l.parentElement;}catch(e){}if(!o)return void console.error("Ripple: Trigger element not found.");let e=window.getComputedStyle(o);0!==e.position.length&&"static"!==e.position||(o.style.position="relative"),o.addEventListener("touchstart",ve,{passive:!0}),o.addEventListener("mousedown",fe,{passive:!0});}),onDestroy(()=>{o&&(o.removeEventListener("mousedown",fe),o.removeEventListener("touchstart",ve));}),e.$set=e=>{"center"in e&&n(1,i=e.center),"circle"in e&&n(2,s=e.circle),"color"in e&&n(3,r=e.color);},[l,i,s,r,o,function(e){binding_callbacks[e?"unshift":"push"](()=>{n(0,l=e);});}]}class ge extends SvelteComponent{constructor(e){var t;super(),ae.getElementById("svelte-po4fcb-style")||((t=element("style")).id="svelte-po4fcb-style",t.textContent=".ripple.svelte-po4fcb{display:block;position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;border-radius:inherit;color:inherit;pointer-events:none;z-index:0;contain:strict}.ripple.svelte-po4fcb .animation{color:inherit;position:absolute;top:0;left:0;border-radius:50%;opacity:0;pointer-events:none;overflow:hidden;will-change:transform, opacity}.ripple.svelte-po4fcb .animation--enter{transition:none}.ripple.svelte-po4fcb .animation--in{transition:opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1);transition:transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),\n\t\t\topacity 0.1s cubic-bezier(0.4, 0, 0.2, 1)}.ripple.svelte-po4fcb .animation--out{transition:opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)}",append(ae.head,t)),init(this,e,he,ce,safe_not_equal,{center:1,circle:2,color:3});}}function me(e){let t;const n=new ge({props:{center:e[3],circle:e[3]}});return {c(){create_component(n.$$.fragment);},m(e,l){mount_component(n,e,l),t=!0;},p(e,t){const l={};8&t&&(l.center=e[3]),8&t&&(l.circle=e[3]),n.$set(l);},i(e){t||(transition_in(n.$$.fragment,e),t=!0);},o(e){transition_out(n.$$.fragment,e),t=!1;},d(e){destroy_component(n,e);}}}function be(t){let n,l,i,a;const d=t[22].default,p=create_slot(d,t,t[21],null);let v=t[10]&&me(t),h=[{class:t[1]},{style:t[2]},t[14]],b={};for(let e=0;e<h.length;e+=1)b=assign(b,h[e]);return {c(){n=element("button"),p&&p.c(),l=space(),v&&v.c(),set_attributes(n,b),toggle_class(n,"raised",t[6]),toggle_class(n,"outlined",t[8]&&!(t[6]||t[7])),toggle_class(n,"shaped",t[9]&&!t[3]),toggle_class(n,"dense",t[5]),toggle_class(n,"fab",t[4]&&t[3]),toggle_class(n,"icon-button",t[3]),toggle_class(n,"toggle",t[11]),toggle_class(n,"active",t[11]&&t[0]),toggle_class(n,"full-width",t[12]&&!t[3]),toggle_class(n,"svelte-6bcb3a",!0);},m(s,d){insert(s,n,d),p&&p.m(n,null),append(n,l),v&&v.m(n,null),t[23](n),i=!0,a=[listen(n,"click",t[16]),action_destroyer(t[15].call(null,n))];},p(e,[t]){p&&p.p&&2097152&t&&p.p(get_slot_context(d,e,e[21],null),get_slot_changes(d,e[21],t,null)),e[10]?v?(v.p(e,t),transition_in(v,1)):(v=me(e),v.c(),transition_in(v,1),v.m(n,null)):v&&(group_outros(),transition_out(v,1,1,()=>{v=null;}),check_outros()),set_attributes(n,get_spread_update(h,[2&t&&{class:e[1]},4&t&&{style:e[2]},16384&t&&e[14]])),toggle_class(n,"raised",e[6]),toggle_class(n,"outlined",e[8]&&!(e[6]||e[7])),toggle_class(n,"shaped",e[9]&&!e[3]),toggle_class(n,"dense",e[5]),toggle_class(n,"fab",e[4]&&e[3]),toggle_class(n,"icon-button",e[3]),toggle_class(n,"toggle",e[11]),toggle_class(n,"active",e[11]&&e[0]),toggle_class(n,"full-width",e[12]&&!e[3]),toggle_class(n,"svelte-6bcb3a",!0);},i(e){i||(transition_in(p,e),transition_in(v),i=!0);},o(e){transition_out(p,e),transition_out(v),i=!1;},d(e){e&&detach(n),p&&p.d(e),v&&v.d(),t[23](null),run_all(a);}}}function ye(e,t,n){const l=createEventDispatcher(),o=ie(current_component);let i,{class:s=""}=t,{style:r=null}=t,{icon:a=!1}=t,{fab:c=!1}=t,{dense:d=!1}=t,{raised:u=!1}=t,{unelevated:f=!1}=t,{outlined:v=!1}=t,{shaped:h=!1}=t,{color:g=null}=t,{ripple:m=!0}=t,{toggle:b=!1}=t,{active:x=!1}=t,{fullWidth:w=!1}=t,$={};beforeUpdate(()=>{if(!i)return;let e=i.getElementsByTagName("svg"),t=e.length;for(let n=0;n<t;n++)e[n].setAttribute("width",z+(b&&!a?2:0)),e[n].setAttribute("height",z+(b&&!a?2:0));n(13,i.style.backgroundColor=u||f?g:"transparent",i);let l=getComputedStyle(i).getPropertyValue("background-color");n(13,i.style.color=u||f?function(e="#ffffff"){let t,n,l,o,i,s;if(0===e.length&&(e="#ffffff"),e=re(e),e=String(e).replace(/[^0-9a-f]/gi,""),!new RegExp(/^(?:[0-9a-f]{3}){1,2}$/i).test(e))throw new Error("Invalid HEX color!");e.length<6&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]);const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t=parseInt(r[1],16)/255,n=parseInt(r[2],16)/255,l=parseInt(r[3],16)/255,o=t<=.03928?t/12.92:Math.pow((t+.055)/1.055,2.4),i=n<=.03928?n/12.92:Math.pow((n+.055)/1.055,2.4),s=l<=.03928?l/12.92:Math.pow((l+.055)/1.055,2.4),.2126*o+.7152*i+.0722*s}(l)>.5?"#000":"#fff":g,i);});let z,{$$slots:k={},$$scope:D}=t;return e.$set=e=>{n(20,t=assign(assign({},t),exclude_internal_props(e))),"class"in e&&n(1,s=e.class),"style"in e&&n(2,r=e.style),"icon"in e&&n(3,a=e.icon),"fab"in e&&n(4,c=e.fab),"dense"in e&&n(5,d=e.dense),"raised"in e&&n(6,u=e.raised),"unelevated"in e&&n(7,f=e.unelevated),"outlined"in e&&n(8,v=e.outlined),"shaped"in e&&n(9,h=e.shaped),"color"in e&&n(17,g=e.color),"ripple"in e&&n(10,m=e.ripple),"toggle"in e&&n(11,b=e.toggle),"active"in e&&n(0,x=e.active),"fullWidth"in e&&n(12,w=e.fullWidth),"$$scope"in e&&n(21,D=e.$$scope);},e.$$.update=()=>{{const{style:e,icon:l,fab:o,dense:i,raised:s,unelevated:r,outlined:a,shaped:c,color:d,ripple:u,toggle:p,active:f,fullWidth:v,...h}=t;!h.disabled&&delete h.disabled,delete h.class,n(14,$=h);}56&e.$$.dirty&&(z=a?c?24:d?20:24:d?16:18),139264&e.$$.dirty&&("primary"===g?n(17,g=se()?"#1976d2":"var(--primary, #1976d2)"):"accent"==g?n(17,g=se()?"#f50057":"var(--accent, #f50057)"):!g&&i&&n(17,g=i.style.color||i.parentElement.style.color||(se()?"#333":"var(--color, #333)")));},t=exclude_internal_props(t),[x,s,r,a,c,d,u,f,v,h,m,b,w,i,$,o,function(e){b&&(n(0,x=!x),l("change",x));},g,z,l,t,D,k,function(e){binding_callbacks[e?"unshift":"push"](()=>{n(13,i=e);});}]}class xe extends SvelteComponent{constructor(e){var t;super(),document.getElementById("svelte-6bcb3a-style")||((t=element("style")).id="svelte-6bcb3a-style",t.textContent="button.svelte-6bcb3a:disabled{cursor:default}button.svelte-6bcb3a{cursor:pointer;font-family:Roboto, Helvetica, sans-serif;font-family:var(--button-font-family, Roboto, Helvetica, sans-serif);font-size:0.875rem;font-weight:500;letter-spacing:0.75px;text-decoration:none;text-transform:uppercase;will-change:transform, opacity;margin:0;padding:0 16px;display:-ms-inline-flexbox;display:inline-flex;position:relative;align-items:center;justify-content:center;box-sizing:border-box;height:36px;border:none;outline:none;line-height:inherit;user-select:none;overflow:hidden;vertical-align:middle;border-radius:4px}button.svelte-6bcb3a::-moz-focus-inner{border:0}button.svelte-6bcb3a:-moz-focusring{outline:none}button.svelte-6bcb3a:before{box-sizing:inherit;border-radius:inherit;color:inherit;bottom:0;content:'';left:0;opacity:0;pointer-events:none;position:absolute;right:0;top:0;transition:0.2s cubic-bezier(0.25, 0.8, 0.5, 1);will-change:background-color, opacity}.toggle.svelte-6bcb3a:before{box-sizing:content-box}.active.svelte-6bcb3a:before{background-color:currentColor;opacity:0.3}.raised.svelte-6bcb3a{box-shadow:0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),\n\t\t\t0 1px 5px 0 rgba(0, 0, 0, 0.12)}.outlined.svelte-6bcb3a{padding:0 14px;border-style:solid;border-width:2px}.shaped.svelte-6bcb3a{border-radius:18px}.dense.svelte-6bcb3a{height:32px}.icon-button.svelte-6bcb3a{line-height:0.5;border-radius:50%;padding:8px;width:40px;height:40px;vertical-align:middle}.icon-button.outlined.svelte-6bcb3a{padding:6px}.icon-button.fab.svelte-6bcb3a{border:none;width:56px;height:56px;box-shadow:0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14),\n\t\t\t0 1px 18px 0 rgba(0, 0, 0, 0.12)}.icon-button.dense.svelte-6bcb3a{width:36px;height:36px}.icon-button.fab.dense.svelte-6bcb3a{width:40px;height:40px}.outlined.svelte-6bcb3a:not(.shaped) .ripple{border-radius:0 !important}.full-width.svelte-6bcb3a{width:100%}@media(hover: hover){button.svelte-6bcb3a:hover:not(.toggle):not([disabled]):not(.disabled):before{background-color:currentColor;opacity:0.15}button.focus-visible.svelte-6bcb3a:focus:not(.toggle):not([disabled]):not(.disabled):before{background-color:currentColor;opacity:0.3}button.focus-visible.toggle.svelte-6bcb3a:focus:not(.active):not([disabled]):not(.disabled):before{background-color:currentColor;opacity:0.15}}",append(document.head,t)),init(this,e,ye,be,safe_not_equal,{class:1,style:2,icon:3,fab:4,dense:5,raised:6,unelevated:7,outlined:8,shaped:9,color:17,ripple:10,toggle:11,active:0,fullWidth:12});}}function Oe(e){let t;return {c(){t=element("span"),t.textContent="*",attr(t,"class","required svelte-1dzu4e7");},m(e,n){insert(e,t,n);},d(e){e&&detach(t);}}}function Pe(e){let t,n,l;return {c(){t=element("div"),n=space(),l=element("div"),attr(t,"class","input-line svelte-1dzu4e7"),attr(l,"class","focus-line svelte-1dzu4e7");},m(e,o){insert(e,t,o),insert(e,n,o),insert(e,l,o);},d(e){e&&detach(t),e&&detach(n),e&&detach(l);}}}function We(e){let t,n,l,o=(e[11]||e[10])+"";return {c(){t=element("div"),n=element("div"),l=text(o),attr(n,"class","message"),attr(t,"class","help svelte-1dzu4e7"),toggle_class(t,"persist",e[9]),toggle_class(t,"error",e[11]);},m(e,o){insert(e,t,o),append(t,n),append(n,l);},p(e,n){3072&n&&o!==(o=(e[11]||e[10])+"")&&set_data(l,o),512&n&&toggle_class(t,"persist",e[9]),2048&n&&toggle_class(t,"error",e[11]);},d(e){e&&detach(t);}}}function Xe(t){let n,l,i,p,f,v,h,g,m,b,k,D,C=[{class:"input"},t[12]],M={};for(let e=0;e<C.length;e+=1)M=assign(M,C[e]);let Y=t[2]&&!t[0].length&&Oe(),j=(!t[7]||t[8])&&Pe(),A=(!!t[10]||!!t[11])&&We(t);return {c(){n=element("div"),l=element("input"),i=space(),p=element("div"),f=space(),v=element("div"),h=text(t[6]),g=space(),Y&&Y.c(),m=space(),j&&j.c(),b=space(),A&&A.c(),set_attributes(l,M),toggle_class(l,"svelte-1dzu4e7",!0),attr(p,"class","focus-ring svelte-1dzu4e7"),attr(v,"class","label svelte-1dzu4e7"),attr(n,"class",k=null_to_empty(`text-field ${t[7]&&!t[8]?"outlined":"baseline"} ${t[3]}`)+" svelte-1dzu4e7"),attr(n,"style",t[4]),attr(n,"title",t[5]),toggle_class(n,"filled",t[8]),toggle_class(n,"dirty",t[13]),toggle_class(n,"disabled",t[1]);},m(s,a){insert(s,n,a),append(n,l),set_input_value(l,t[0]),append(n,i),append(n,p),append(n,f),append(n,v),append(v,h),append(v,g),Y&&Y.m(v,null),append(n,m),j&&j.m(n,null),append(n,b),A&&A.m(n,null),D=[listen(l,"input",t[19]),action_destroyer(t[14].call(null,l))];},p(e,[t]){set_attributes(l,get_spread_update(C,[{class:"input"},4096&t&&e[12]])),1&t&&l.value!==e[0]&&set_input_value(l,e[0]),toggle_class(l,"svelte-1dzu4e7",!0),64&t&&set_data(h,e[6]),e[2]&&!e[0].length?Y||(Y=Oe(),Y.c(),Y.m(v,null)):Y&&(Y.d(1),Y=null),!e[7]||e[8]?j||(j=Pe(),j.c(),j.m(n,b)):j&&(j.d(1),j=null),e[10]||e[11]?A?A.p(e,t):(A=We(e),A.c(),A.m(n,null)):A&&(A.d(1),A=null),392&t&&k!==(k=null_to_empty(`text-field ${e[7]&&!e[8]?"outlined":"baseline"} ${e[3]}`)+" svelte-1dzu4e7")&&attr(n,"class",k),16&t&&attr(n,"style",e[4]),32&t&&attr(n,"title",e[5]),392&t&&toggle_class(n,"filled",e[8]),8584&t&&toggle_class(n,"dirty",e[13]),394&t&&toggle_class(n,"disabled",e[1]);},i:noop,o:noop,d(e){e&&detach(n),Y&&Y.d(),j&&j.d(),A&&A.d(),run_all(D);}}}function Ve(e,t,n){const l=ie(current_component);let o,{value:i=""}=t,{disabled:s=!1}=t,{required:r=!1}=t,{class:a=""}=t,{style:c=null}=t,{title:d=null}=t,{label:u=""}=t,{outlined:p=!1}=t,{filled:f=!1}=t,{messagePersist:v=!1}=t,{message:h=""}=t,{error:g=""}=t,m={};const b=["date","datetime-local","email","month","number","password","search","tel","text","time","url","week"],x=["date","datetime-local","month","time","week"];let w;return e.$set=e=>{n(18,t=assign(assign({},t),exclude_internal_props(e))),"value"in e&&n(0,i=e.value),"disabled"in e&&n(1,s=e.disabled),"required"in e&&n(2,r=e.required),"class"in e&&n(3,a=e.class),"style"in e&&n(4,c=e.style),"title"in e&&n(5,d=e.title),"label"in e&&n(6,u=e.label),"outlined"in e&&n(7,p=e.outlined),"filled"in e&&n(8,f=e.filled),"messagePersist"in e&&n(9,v=e.messagePersist),"message"in e&&n(10,h=e.message),"error"in e&&n(11,g=e.error);},e.$$.update=()=>{{const{value:e,style:l,title:i,label:s,outlined:r,filled:a,messagePersist:c,message:d,error:u,...p}=t;!p.readonly&&delete p.readonly,!p.disabled&&delete p.disabled,delete p.class,p.type=b.indexOf(p.type)<0?"text":p.type,n(15,o=p.placeholder),n(12,m=p);}36865&e.$$.dirty&&n(13,w="string"==typeof i&&i.length>0||"number"==typeof i||o||x.indexOf(m.type)>=0);},t=exclude_internal_props(t),[i,s,r,a,c,d,u,p,f,v,h,g,m,w,l,o,b,x,t,function(){i=this.value,n(0,i);}]}class Re extends SvelteComponent{constructor(e){var t;super(),document.getElementById("svelte-1dzu4e7-style")||((t=element("style")).id="svelte-1dzu4e7-style",t.textContent=".text-field.svelte-1dzu4e7.svelte-1dzu4e7{font-family:Roboto, 'Segoe UI', sans-serif;font-weight:400;font-size:inherit;text-decoration:inherit;text-transform:inherit;box-sizing:border-box;margin:0 0 20px;position:relative;width:100%;background-color:inherit;will-change:opacity, transform, color}.outlined.svelte-1dzu4e7.svelte-1dzu4e7{margin-top:12px}.required.svelte-1dzu4e7.svelte-1dzu4e7{position:relative;top:0.175em;left:0.125em;color:#ff5252}.input.svelte-1dzu4e7.svelte-1dzu4e7{box-sizing:border-box;font:inherit;width:100%;min-height:32px;background:none;text-align:left;color:#333;color:var(--color, #333);caret-color:#1976d2;caret-color:var(--primary, #1976d2);border:none;margin:0;padding:2px 0 0;outline:none}.input.svelte-1dzu4e7.svelte-1dzu4e7::placeholder{color:rgba(0, 0, 0, 0.3755);color:var(--label, rgba(0, 0, 0, 0.3755));font-weight:100}.input.svelte-1dzu4e7.svelte-1dzu4e7::-moz-focus-inner{padding:0;border:0}.input.svelte-1dzu4e7.svelte-1dzu4e7:-moz-focusring{outline:none}.input.svelte-1dzu4e7.svelte-1dzu4e7:required{box-shadow:none}.input.svelte-1dzu4e7.svelte-1dzu4e7:invalid{box-shadow:none}.input.svelte-1dzu4e7.svelte-1dzu4e7:active{outline:none}.input:hover~.input-line.svelte-1dzu4e7.svelte-1dzu4e7{background:#333;background:var(--color, #333)}.label.svelte-1dzu4e7.svelte-1dzu4e7{font:inherit;display:inline-flex;position:absolute;left:0;top:28px;padding-right:0.2em;color:rgba(0, 0, 0, 0.3755);color:var(--label, rgba(0, 0, 0, 0.3755));background-color:inherit;pointer-events:none;-webkit-backface-visibility:hidden;backface-visibility:hidden;overflow:hidden;max-width:90%;white-space:nowrap;transform-origin:left top;transition:0.18s cubic-bezier(0.25, 0.8, 0.5, 1)}.focus-ring.svelte-1dzu4e7.svelte-1dzu4e7{pointer-events:none;margin:0;padding:0;border:2px solid transparent;border-radius:4px;position:absolute;left:0;top:0;right:0;bottom:0}.input-line.svelte-1dzu4e7.svelte-1dzu4e7{position:absolute;left:0;right:0;bottom:0;margin:0;height:1px;background:rgba(0, 0, 0, 0.3755);background:var(--label, rgba(0, 0, 0, 0.3755))}.focus-line.svelte-1dzu4e7.svelte-1dzu4e7{position:absolute;bottom:0;left:0;right:0;height:2px;-webkit-transform:scaleX(0);transform:scaleX(0);transition:transform 0.18s cubic-bezier(0.4, 0, 0.2, 1),\n\t\t\topacity 0.18s cubic-bezier(0.4, 0, 0.2, 1),\n\t\t\t-webkit-transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);transition:transform 0.18s cubic-bezier(0.4, 0, 0.2, 1),\n\t\t\topacity 0.18s cubic-bezier(0.4, 0, 0.2, 1);opacity:0;z-index:2;background:#1976d2;background:var(--primary, #1976d2)}.help.svelte-1dzu4e7.svelte-1dzu4e7{position:absolute;left:0;right:0;bottom:-18px;display:flex;justify-content:space-between;font-size:12px;line-height:normal;letter-spacing:0.4px;color:rgba(0, 0, 0, 0.3755);color:var(--label, rgba(0, 0, 0, 0.3755));opacity:0;overflow:hidden;max-width:90%;white-space:nowrap}.persist.svelte-1dzu4e7.svelte-1dzu4e7,.error.svelte-1dzu4e7.svelte-1dzu4e7,.input:focus~.help.svelte-1dzu4e7.svelte-1dzu4e7{opacity:1}.error.svelte-1dzu4e7.svelte-1dzu4e7{color:#ff5252}.baseline.dirty.svelte-1dzu4e7 .label.svelte-1dzu4e7{letter-spacing:0.4px;top:6px;bottom:unset;font-size:13px}.baseline .input:focus~.label.svelte-1dzu4e7.svelte-1dzu4e7{letter-spacing:0.4px;top:6px;bottom:unset;font-size:13px;color:#1976d2;color:var(--primary, #1976d2)}.baseline .input:focus~.focus-line.svelte-1dzu4e7.svelte-1dzu4e7{transform:scaleX(1);opacity:1}.baseline.svelte-1dzu4e7 .input.svelte-1dzu4e7{height:52px;padding-top:22px}.baseline.filled.svelte-1dzu4e7.svelte-1dzu4e7{background:rgba(0, 0, 0, 0.0555);background:var(--bg-input-filled, rgba(0, 0, 0, 0.0555));border-radius:4px 4px 0 0}.baseline.filled.svelte-1dzu4e7 .label.svelte-1dzu4e7{background:none}.baseline.filled.svelte-1dzu4e7 .input.svelte-1dzu4e7,.baseline.filled.svelte-1dzu4e7 .label.svelte-1dzu4e7{padding-left:8px;padding-right:8px}.baseline.filled .input:focus~.label.svelte-1dzu4e7.svelte-1dzu4e7{top:6px}.baseline.filled.svelte-1dzu4e7 .help.svelte-1dzu4e7{padding-left:8px}.filled.svelte-1dzu4e7 .input.svelte-1dzu4e7:hover,.filled.svelte-1dzu4e7 .input.svelte-1dzu4e7:focus{background:rgba(0, 0, 0, 0.0555);background:var(--bg-input-filled, rgba(0, 0, 0, 0.0555))}.outlined.svelte-1dzu4e7 .help.svelte-1dzu4e7{left:18px}.outlined.svelte-1dzu4e7 .input.svelte-1dzu4e7{padding:11px 16px 9px;border-radius:4px;border:1px solid;border-color:rgba(0, 0, 0, 0.3755);border-color:var(--label, rgba(0, 0, 0, 0.3755))}.outlined.svelte-1dzu4e7 .label.svelte-1dzu4e7{top:12px;bottom:unset;left:17px}.outlined.dirty.svelte-1dzu4e7 .label.svelte-1dzu4e7{top:-6px;bottom:unset;font-size:12px;letter-spacing:0.4px;padding:0 4px;left:13px}.outlined.svelte-1dzu4e7 .input.svelte-1dzu4e7:hover{border-color:#333;border-color:var(--color, #333)}.outlined .input:focus~.label.svelte-1dzu4e7.svelte-1dzu4e7{top:-6px;bottom:unset;font-size:12px;letter-spacing:0.4px;padding:0 4px;left:13px;color:#1976d2;color:var(--primary, #1976d2)}.outlined .input:focus~.focus-ring.svelte-1dzu4e7.svelte-1dzu4e7,.outlined .input.focus-visible~.focus-ring.svelte-1dzu4e7.svelte-1dzu4e7{border-color:#1976d2;border-color:var(--primary, #1976d2)}",append(document.head,t)),init(this,e,Ve,Xe,safe_not_equal,{value:0,disabled:1,required:2,class:3,style:4,title:5,label:6,outlined:7,filled:8,messagePersist:9,message:10,error:11});}}function Ze(e,t){if("Tab"!==e.key&&9!==e.keyCode)return;let n=function(e=document){return Array.prototype.slice.call(e.querySelectorAll('button, [href], select, textarea, input:not([type="hidden"]), [tabindex]:not([tabindex="-1"])')).filter((function(e){const t=window.getComputedStyle(e);return !e.disabled&&!e.getAttribute("disabled")&&!e.classList.contains("disabled")&&"none"!==t.display&&"hidden"!==t.visibility&&t.opacity>0}))}(t);if(0===n.length)return void e.preventDefault();let l=document.activeElement,o=n.indexOf(l);e.shiftKey?o<=0&&(n[n.length-1].focus(),e.preventDefault()):o>=n.length-1&&(n[0].focus(),e.preventDefault());}function on(e){let t="hidden"===document.body.style.overflow;if(e&&t){let e=Math.abs(parseInt(document.body.style.top));document.body.style.cssText=null,document.body.removeAttribute("style"),window.scrollTo(0,e);}else e||t||(document.body.style.top="-"+Math.max(document.body.scrollTop,document.documentElement&&document.documentElement.scrollTop||0)+"px",document.body.style.position="fixed",document.body.style.width="100%",document.body.style.overflow="hidden");}const{window:Hn}=globals;function On(t){let n,l,o,i;return {c(){n=element("div"),attr(n,"class","overlay svelte-1o2jp7l");},m(l,s){insert(l,n,s),o=!0,i=listen(n,"click",t[4]);},p:noop,i(e){o||(add_render_callback(()=>{l||(l=create_bidirectional_transition(n,fade,{duration:300},!0)),l.run(1);}),o=!0);},o(e){l||(l=create_bidirectional_transition(n,fade,{duration:300},!1)),l.run(0),o=!1;},d(e){e&&detach(n),e&&l&&l.end(),i();}}}function Pn(t){let n,l,o,r,d,p=t[0]&&On(t);const v=t[14].default,h=create_slot(v,t,t[13],null);return {c(){n=space(),p&&p.c(),l=space(),o=element("aside"),h&&h.c(),attr(o,"class","side-panel svelte-1o2jp7l"),attr(o,"tabindex","-1"),toggle_class(o,"left",!t[1]),toggle_class(o,"right",t[1]),toggle_class(o,"visible",t[0]);},m(s,a){insert(s,n,a),p&&p.m(s,a),insert(s,l,a),insert(s,o,a),h&&h.m(o,null),t[15](o),r=!0,d=[listen(Hn,"keydown",t[8]),listen(document.body,"touchstart",t[6]),listen(document.body,"touchend",t[7]),listen(o,"transitionend",t[5]),action_destroyer(t[3].call(null,o))];},p(e,[t]){e[0]?p?(p.p(e,t),transition_in(p,1)):(p=On(e),p.c(),transition_in(p,1),p.m(l.parentNode,l)):p&&(group_outros(),transition_out(p,1,1,()=>{p=null;}),check_outros()),h&&h.p&&8192&t&&h.p(get_slot_context(v,e,e[13],null),get_slot_changes(v,e[13],t,null)),2&t&&toggle_class(o,"left",!e[1]),2&t&&toggle_class(o,"right",e[1]),1&t&&toggle_class(o,"visible",e[0]);},i(e){r||(transition_in(p),transition_in(h,e),r=!0);},o(e){transition_out(p),transition_out(h,e),r=!1;},d(e){e&&detach(n),p&&p.d(e),e&&detach(l),e&&detach(o),h&&h.d(e),t[15](null),run_all(d);}}}let Wn=!1;function Xn(e,t,n){const l=ie(current_component);let o,{right:i=!1}=t,{visible:s=!1}=t,{disableScroll:r=!1}=t,a={x:null,y:null},c=!1;function d(){n(0,s=!1),setTimeout(()=>{Wn=!1;},20);}function u(){n(0,s=!0);}onMount(async()=>{await tick(),n(11,c=!0);});let{$$slots:f={},$$scope:v}=t;return e.$set=e=>{"right"in e&&n(1,i=e.right),"visible"in e&&n(0,s=e.visible),"disableScroll"in e&&n(9,r=e.disableScroll),"$$scope"in e&&n(13,v=e.$$scope);},e.$$.update=()=>{2561&e.$$.dirty&&(s?(Wn=!0,c&&r&&on(!1)):(c&&on(!0),d()));},[s,i,o,l,d,function(e){s&&"visibility"===e.propertyName&&o.focus();},function(e){a.x=e.changedTouches[0].clientX,a.y=e.changedTouches[0].clientY;},function(e){const t=e.changedTouches[0].clientX-a.x,n=e.changedTouches[0].clientY-a.y;if(Math.abs(t)>50){if(Math.abs(n)<100)if(s)(t>0&&i||t<0&&!i)&&d();else {if(Wn)return;t>0&&a.x<=20?i||u():a.x>=window.innerWidth-20&&i&&u();}}},function(e){s&&(27!==e.keyCode&&"Escape"!==e.key&&"Escape"!==e.code||d(),s&&Ze(e,o));},r,a,c,u,v,f,function(e){binding_callbacks[e?"unshift":"push"](()=>{n(2,o=e);});}]}class Vn extends SvelteComponent{constructor(e){var t;super(),document.getElementById("svelte-1o2jp7l-style")||((t=element("style")).id="svelte-1o2jp7l-style",t.textContent=".side-panel.svelte-1o2jp7l{background:#fbfbfb;background:var(--bg-color, #fbfbfb);position:fixed;visibility:hidden;width:256px;top:0;height:100%;box-shadow:0 0 10px rgba(0, 0, 0, 0.2);z-index:40;overflow-x:hidden;overflow-y:auto;transform-style:preserve-3d;will-change:transform, visibility;transition-duration:0.2s;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transition-property:transform, visibility}.side-panel.svelte-1o2jp7l:focus{outline:none}.side-panel.svelte-1o2jp7l::-moz-focus-inner{border:0}.side-panel.svelte-1o2jp7l:-moz-focusring{outline:none}.left.svelte-1o2jp7l{left:0;transform:translateX(-256px)}.right.svelte-1o2jp7l{left:auto;right:0;transform:translateX(256px)}.visible.svelte-1o2jp7l{visibility:visible;transform:translateX(0)}.overlay.svelte-1o2jp7l{background-color:rgba(0, 0, 0, 0.5);cursor:pointer;position:fixed;left:0;top:0;right:0;bottom:0;z-index:30}",append(document.head,t)),init(this,e,Xn,Pn,safe_not_equal,{right:1,visible:0,disableScroll:9});}}const Rn=e=>({}),Zn=e=>({});function Un(e){let t,n,l,o,i,d,y,w,C,M;const L=e[9].default,E=create_slot(L,e,e[11],null),Y=e[9].action,j=create_slot(Y,e,e[11],Zn),A=new xe({props:{color:"#f50057",$$slots:{default:[Gn]},$$scope:{ctx:e}}});return A.$on("click",e[10]),{c(){t=element("div"),n=element("div"),E&&E.c(),l=space(),o=element("div"),j||create_component(A.$$.fragment),j&&j.c(),attr(n,"class","message svelte-1ftyf0y"),attr(o,"class","action svelte-1ftyf0y"),attr(t,"class",i=null_to_empty("snackbar "+e[1])+" svelte-1ftyf0y"),attr(t,"style",d=`color: ${e[5]};background: ${e[4]};${e[2]}`),toggle_class(t,"top",!e[3]),toggle_class(t,"bottom",e[3]);},m(i,s){insert(i,t,s),append(t,n),E&&E.m(n,null),append(t,l),append(t,o),j||mount_component(A,o,null),j&&j.m(o,null),C=!0,M=action_destroyer(e[6].call(null,t));},p(e,n){if(E&&E.p&&2048&n&&E.p(get_slot_context(L,e,e[11],null),get_slot_changes(L,e[11],n,null)),!j){const t={};2048&n&&(t.$$scope={dirty:n,ctx:e}),A.$set(t);}j&&j.p&&2048&n&&j.p(get_slot_context(Y,e,e[11],Zn),get_slot_changes(Y,e[11],n,Rn)),(!C||2&n&&i!==(i=null_to_empty("snackbar "+e[1])+" svelte-1ftyf0y"))&&attr(t,"class",i),(!C||52&n&&d!==(d=`color: ${e[5]};background: ${e[4]};${e[2]}`))&&attr(t,"style",d),10&n&&toggle_class(t,"top",!e[3]),10&n&&toggle_class(t,"bottom",e[3]);},i(n){C||(transition_in(E,n),transition_in(A.$$.fragment,n),transition_in(j,n),add_render_callback(()=>{w&&w.end(1),y||(y=create_in_transition(t,fly,{y:e[3]?48:-48,duration:350})),y.start();}),C=!0);},o(n){transition_out(E,n),transition_out(A.$$.fragment,n),transition_out(j,n),y&&y.invalidate(),w=create_out_transition(t,fly,{y:e[3]?48:-48,duration:350}),C=!1;},d(e){e&&detach(t),E&&E.d(e),j||destroy_component(A),j&&j.d(e),e&&w&&w.end(),M();}}}function Gn(e){let t;return {c(){t=text("Close");},m(e,n){insert(e,t,n);},d(e){e&&detach(t);}}}function Kn(e){let t,n,l=e[0]&&Un(e);return {c(){l&&l.c(),t=empty();},m(e,o){l&&l.m(e,o),insert(e,t,o),n=!0;},p(e,[n]){e[0]?l?(l.p(e,n),transition_in(l,1)):(l=Un(e),l.c(),transition_in(l,1),l.m(t.parentNode,t)):l&&(group_outros(),transition_out(l,1,1,()=>{l=null;}),check_outros());},i(e){n||(transition_in(l),n=!0);},o(e){transition_out(l),n=!1;},d(e){l&&l.d(e),e&&detach(t);}}}function Jn(e,t,n){const l=ie(current_component);let o,{visible:i=!1}=t,{class:s=""}=t,{style:r=""}=t,{bottom:a=!1}=t,{bg:c="rgba(0,0,0,.87)"}=t,{color:d="#fff"}=t,{timeout:u=5}=t;onDestroy(()=>{clearTimeout(o),n(8,o=void 0);});let{$$slots:p={},$$scope:f}=t;return e.$set=e=>{"visible"in e&&n(0,i=e.visible),"class"in e&&n(1,s=e.class),"style"in e&&n(2,r=e.style),"bottom"in e&&n(3,a=e.bottom),"bg"in e&&n(4,c=e.bg),"color"in e&&n(5,d=e.color),"timeout"in e&&n(7,u=e.timeout),"$$scope"in e&&n(11,f=e.$$scope);},e.$$.update=()=>{385&e.$$.dirty&&!0===i&&(clearTimeout(o),n(8,o=void 0),u>0&&n(8,o=setTimeout(()=>{n(0,i=!1),n(8,o=void 0);},1e3*u)));},[i,s,r,a,c,d,l,u,o,p,()=>n(0,i=!1),f]}class Qn extends SvelteComponent{constructor(e){var t;super(),document.getElementById("svelte-1ftyf0y-style")||((t=element("style")).id="svelte-1ftyf0y-style",t.textContent=".snackbar.svelte-1ftyf0y{display:flex;align-items:center;border-radius:0 0 2px 2px;padding:6px 16px;min-height:48px;min-width:288px;max-width:568px;position:fixed;flex-wrap:nowrap;z-index:50;box-shadow:0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14),\n\t\t\t0 1px 18px 0 rgba(0, 0, 0, 0.12)}.action.svelte-1ftyf0y{margin-right:-16px;padding:0 8px;margin-left:auto}.message.svelte-1ftyf0y{padding:8px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.top.svelte-1ftyf0y{top:0;left:50%;transform:translate3d(-50%, 0, 0)}.bottom.svelte-1ftyf0y{bottom:0;left:50%;border-radius:2px 2px 0 0;transform:translate3d(-50%, 0, 0)}@media only screen and (max-width: 600px){.snackbar.svelte-1ftyf0y{max-width:100%;left:0;right:0;transform:translate3d(0, 0, 0)}}",append(document.head,t)),init(this,e,Jn,Kn,safe_not_equal,{visible:0,class:1,style:2,bottom:3,bg:4,color:5,timeout:7});}}

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z = "";
    styleInject(css_248z);

    /* src\components\Login.svelte generated by Svelte v3.31.2 */
    const file = "src\\components\\Login.svelte";

    // (20:2) <Button raised color="#ff3e00" title="Simple button" on:click={login}>
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Login");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(20:2) <Button raised color=\\\"#ff3e00\\\" title=\\\"Simple button\\\" on:click={login}>",
    		ctx
    	});

    	return block;
    }

    // (21:2) <Button raised on:click={reset}>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("초기화");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(21:2) <Button raised on:click={reset}>",
    		ctx
    	});

    	return block;
    }

    // (27:3) <Button color="#ff0" on:click={()=>{visible = false}}>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Close");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(27:3) <Button color=\\\"#ff0\\\" on:click={()=>{visible = false}}>",
    		ctx
    	});

    	return block;
    }

    // (26:1) <span slot="action">
    function create_action_slot(ctx) {
    	let span;
    	let button;
    	let current;

    	button = new xe({
    			props: {
    				color: "#ff0",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[12]);

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(button.$$.fragment);
    			attr_dev(span, "slot", "action");
    			add_location(span, file, 25, 1, 580);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(button, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_action_slot.name,
    		type: "slot",
    		source: "(26:1) <span slot=\\\"action\\\">",
    		ctx
    	});

    	return block;
    }

    // (24:0) <Snackbar bind:visible  timeout="3">
    function create_default_slot(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(/*snackbar_message*/ ctx[3]);
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			set_data_dev(t0, /*snackbar_message*/ ctx[3]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(24:0) <Snackbar bind:visible  timeout=\\\"3\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let br0;
    	let t1;
    	let input0;
    	let t2;
    	let br1;
    	let t3;
    	let input1;
    	let t4;
    	let br2;
    	let t5;
    	let button0;
    	let t6;
    	let button1;
    	let t7;
    	let snackbar;
    	let updating_visible;
    	let current;
    	let mounted;
    	let dispose;

    	button0 = new xe({
    			props: {
    				raised: true,
    				color: "#ff3e00",
    				title: "Simple button",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*login*/ ctx[6]);

    	button1 = new xe({
    			props: {
    				raised: true,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*reset*/ ctx[7]);

    	function snackbar_visible_binding(value) {
    		/*snackbar_visible_binding*/ ctx[13].call(null, value);
    	}

    	let snackbar_props = {
    		timeout: "3",
    		$$slots: {
    			default: [create_default_slot],
    			action: [create_action_slot]
    		},
    		$$scope: { ctx }
    	};

    	if (/*visible*/ ctx[4] !== void 0) {
    		snackbar_props.visible = /*visible*/ ctx[4];
    	}

    	snackbar = new Qn({ props: snackbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(snackbar, "visible", snackbar_visible_binding));

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			br1 = element("br");
    			t3 = space();
    			input1 = element("input");
    			t4 = space();
    			br2 = element("br");
    			t5 = space();
    			create_component(button0.$$.fragment);
    			t6 = space();
    			create_component(button1.$$.fragment);
    			t7 = space();
    			create_component(snackbar.$$.fragment);
    			attr_dev(img, "class", "logo svelte-1lhwy57");
    			if (img.src !== (img_src_value = /*src*/ ctx[5])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			add_location(img, file, 3, 3, 52);
    			add_location(div0, file, 2, 2, 42);
    			add_location(br0, file, 4, 8, 97);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "User ID");
    			add_location(input0, file, 5, 2, 105);
    			add_location(br1, file, 11, 2, 211);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			add_location(input1, file, 12, 2, 219);
    			add_location(br2, file, 18, 2, 361);
    			attr_dev(div1, "class", "box svelte-1lhwy57");
    			add_location(div1, file, 1, 1, 21);
    			attr_dev(div2, "class", "main svelte-1lhwy57");
    			add_location(div2, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div1, br0);
    			append_dev(div1, t1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*id*/ ctx[0]);
    			/*input0_binding*/ ctx[9](input0);
    			append_dev(div1, t2);
    			append_dev(div1, br1);
    			append_dev(div1, t3);
    			append_dev(div1, input1);
    			set_input_value(input1, /*pw*/ ctx[1]);
    			append_dev(div1, t4);
    			append_dev(div1, br2);
    			append_dev(div1, t5);
    			mount_component(button0, div1, null);
    			append_dev(div1, t6);
    			mount_component(button1, div1, null);
    			insert_dev(target, t7, anchor);
    			mount_component(snackbar, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[10]),
    					listen_dev(input1, "keydown", /*keydown_handler*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 1 && input0.value !== /*id*/ ctx[0]) {
    				set_input_value(input0, /*id*/ ctx[0]);
    			}

    			if (dirty & /*pw*/ 2 && input1.value !== /*pw*/ ctx[1]) {
    				set_input_value(input1, /*pw*/ ctx[1]);
    			}

    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const snackbar_changes = {};

    			if (dirty & /*$$scope, visible, snackbar_message*/ 1048600) {
    				snackbar_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty & /*visible*/ 16) {
    				updating_visible = true;
    				snackbar_changes.visible = /*visible*/ ctx[4];
    				add_flush_callback(() => updating_visible = false);
    			}

    			snackbar.$set(snackbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(snackbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(snackbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			/*input0_binding*/ ctx[9](null);
    			destroy_component(button0);
    			destroy_component(button1);
    			if (detaching) detach_dev(t7);
    			destroy_component(snackbar, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $tk;
    	let $uNo;
    	let $uId;
    	let $uName;
    	let $cp;
    	validate_store(tk, "tk");
    	component_subscribe($$self, tk, $$value => $$invalidate(14, $tk = $$value));
    	validate_store(uNo, "uNo");
    	component_subscribe($$self, uNo, $$value => $$invalidate(15, $uNo = $$value));
    	validate_store(uId, "uId");
    	component_subscribe($$self, uId, $$value => $$invalidate(16, $uId = $$value));
    	validate_store(uName, "uName");
    	component_subscribe($$self, uName, $$value => $$invalidate(17, $uName = $$value));
    	validate_store(cp, "cp");
    	component_subscribe($$self, cp, $$value => $$invalidate(18, $cp = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Login", slots, []);
    	let id, pw, idInput, snackbar_message = "";
    	let src = "/img/svelte-logo.png";
    	let visible = false;

    	const login = async () => {
    		if (id === "" || id === undefined || pw === "" || pw === undefined) {
    			show_snackbar("ID or PW is null");
    			return;
    		}

    		const res = await api.login(id, pw);

    		if (res === null) {
    			show_snackbar("Data is null");
    			reset();
    			idInput.focus();
    			return;
    		}

    		set_store_value(tk, $tk = res.token, $tk);
    		set_store_value(uNo, $uNo = res.user.no, $uNo);
    		set_store_value(uId, $uId = res.user.userId, $uId);
    		set_store_value(uName, $uName = res.user.userName, $uName);
    		set_store_value(cp, $cp = res.user.company, $cp);
    		push("/posts");
    	};

    	const reset = () => {
    		$$invalidate(0, id = "");
    		$$invalidate(1, pw = "");
    		idInput.focus();
    	};

    	onMount(() => {
    		idInput.focus();
    	});

    	const show_snackbar = msg => {
    		$$invalidate(3, snackbar_message = msg);
    		$$invalidate(4, visible = true);
    		idInput.focus();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		id = this.value;
    		$$invalidate(0, id);
    	}

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			idInput = $$value;
    			$$invalidate(2, idInput);
    		});
    	}

    	function input1_input_handler() {
    		pw = this.value;
    		$$invalidate(1, pw);
    	}

    	const keydown_handler = e => {
    		e.key === "Enter" && login();
    	};

    	const click_handler = () => {
    		$$invalidate(4, visible = false);
    	};

    	function snackbar_visible_binding(value) {
    		visible = value;
    		$$invalidate(4, visible);
    	}

    	$$self.$capture_state = () => ({
    		api,
    		push,
    		tk,
    		cp,
    		uName,
    		uNo,
    		uId,
    		onMount,
    		Snackbar: Qn,
    		Button: xe,
    		id,
    		pw,
    		idInput,
    		snackbar_message,
    		src,
    		visible,
    		login,
    		reset,
    		show_snackbar,
    		$tk,
    		$uNo,
    		$uId,
    		$uName,
    		$cp
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("pw" in $$props) $$invalidate(1, pw = $$props.pw);
    		if ("idInput" in $$props) $$invalidate(2, idInput = $$props.idInput);
    		if ("snackbar_message" in $$props) $$invalidate(3, snackbar_message = $$props.snackbar_message);
    		if ("src" in $$props) $$invalidate(5, src = $$props.src);
    		if ("visible" in $$props) $$invalidate(4, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		id,
    		pw,
    		idInput,
    		snackbar_message,
    		visible,
    		src,
    		login,
    		reset,
    		input0_input_handler,
    		input0_binding,
    		input1_input_handler,
    		keydown_handler,
    		click_handler,
    		snackbar_visible_binding
    	];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    var css_248z$1 = "";
    styleInject(css_248z$1);

    /* src\components\Header.svelte generated by Svelte v3.31.2 */

    const { Object: Object_1$1, console: console_1$1 } = globals;
    const file$1 = "src\\components\\Header.svelte";

    // (16:8) <Button            unelevated            color="#ff3e00"            active={justify.justify}            on:change={(e) => {                onjustify('justify', e.detail);            }}            on:click={()=>{rightVisible = true}}          >
    function create_default_slot_1$1(ctx) {
    	let i;
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			i = element("i");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "class", "asdf");
    			attr_dev(path, "d", "M 3 21 h 18 v -2 H 3 v 2 Z m 0 -4 h 18 v -2 H 3 v 2 Z m 0 -4 h 18 v -2 H 3 v 2 Z m 0 -4 h 18 V 7 H 3 v 2 Z m 0 -6 v 2 h 18 V 3 H 3 Z");
    			add_location(path, file$1, 26, 12, 626);
    			attr_dev(svg, "class", "asdf svelte-12irch8");
    			add_location(svg, file$1, 25, 10, 594);
    			attr_dev(i, "class", "asdf");
    			add_location(i, file$1, 24, 8, 566);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			append_dev(i, svg);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(16:8) <Button            unelevated            color=\\\"#ff3e00\\\"            active={justify.justify}            on:change={(e) => {                onjustify('justify', e.detail);            }}            on:click={()=>{rightVisible = true}}          >",
    		ctx
    	});

    	return block;
    }

    // (36:0) <Sidepanel right bind:visible={rightVisible}>
    function create_default_slot$1(ctx) {
    	let div0;
    	let t1;
    	let div1;
    	let ul0;
    	let li0;
    	let t3;
    	let li1;
    	let t5;
    	let ul1;
    	let li2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Menu";
    			t1 = space();
    			div1 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			li0.textContent = "Home";
    			t3 = space();
    			li1 = element("li");
    			li1.textContent = "MYPAGE";
    			t5 = space();
    			ul1 = element("ul");
    			li2 = element("li");
    			li2.textContent = "LOGOUT";
    			attr_dev(div0, "class", "rightVisible");
    			add_location(div0, file$1, 36, 2, 930);
    			add_location(li0, file$1, 39, 6, 1010);
    			add_location(li1, file$1, 40, 6, 1050);
    			attr_dev(ul0, "class", "right_ul");
    			add_location(ul0, file$1, 38, 4, 981);
    			add_location(li2, file$1, 43, 6, 1183);
    			attr_dev(ul1, "class", "right_ul");
    			set_style(ul1, "position", "absolute");
    			set_style(ul1, "bottom", "0");
    			add_location(ul1, file$1, 42, 4, 1115);
    			add_location(div1, file$1, 37, 2, 970);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, ul0);
    			append_dev(ul0, li0);
    			append_dev(ul0, t3);
    			append_dev(ul0, li1);
    			append_dev(div1, t5);
    			append_dev(div1, ul1);
    			append_dev(ul1, li2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(li0, "click", /*push_to*/ ctx[4], false, false, false),
    					listen_dev(li1, "click", /*click_handler_2*/ ctx[11], false, false, false),
    					listen_dev(li2, "click", /*logout*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(36:0) <Sidepanel right bind:visible={rightVisible}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div3;
    	let div0;
    	let h1;
    	let t0_value = (/*$cp*/ ctx[3] === null ? "" : /*$cp*/ ctx[3]) + "";
    	let t0;
    	let t1;
    	let div1;
    	let canvas_1;
    	let t2;
    	let div2;
    	let ul;
    	let li;
    	let button;
    	let t3;
    	let sidepanel;
    	let updating_visible;
    	let current;
    	let mounted;
    	let dispose;

    	button = new xe({
    			props: {
    				unelevated: true,
    				color: "#ff3e00",
    				active: /*justify*/ ctx[2].justify,
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("change", /*change_handler*/ ctx[9]);
    	button.$on("click", /*click_handler_1*/ ctx[10]);

    	function sidepanel_visible_binding(value) {
    		/*sidepanel_visible_binding*/ ctx[12].call(null, value);
    	}

    	let sidepanel_props = {
    		right: true,
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*rightVisible*/ ctx[0] !== void 0) {
    		sidepanel_props.visible = /*rightVisible*/ ctx[0];
    	}

    	sidepanel = new Vn({ props: sidepanel_props, $$inline: true });
    	binding_callbacks.push(() => bind(sidepanel, "visible", sidepanel_visible_binding));

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			canvas_1 = element("canvas");
    			t2 = space();
    			div2 = element("div");
    			ul = element("ul");
    			li = element("li");
    			create_component(button.$$.fragment);
    			t3 = space();
    			create_component(sidepanel.$$.fragment);
    			add_location(h1, file$1, 2, 4, 46);
    			attr_dev(div0, "class", "h1");
    			add_location(div0, file$1, 1, 2, 24);
    			attr_dev(canvas_1, "width", 32);
    			attr_dev(canvas_1, "height", 32);
    			attr_dev(canvas_1, "class", "svelte-12irch8");
    			add_location(canvas_1, file$1, 5, 4, 120);
    			attr_dev(div1, "class", "canvas");
    			add_location(div1, file$1, 4, 2, 94);
    			add_location(li, file$1, 14, 6, 299);
    			attr_dev(ul, "class", "ul");
    			add_location(ul, file$1, 13, 4, 276);
    			attr_dev(div2, "class", "ul-li");
    			add_location(div2, file$1, 12, 2, 251);
    			attr_dev(div3, "class", "header");
    			add_location(div3, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, canvas_1);
    			/*canvas_1_binding*/ ctx[7](canvas_1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, ul);
    			append_dev(ul, li);
    			mount_component(button, li, null);
    			insert_dev(target, t3, anchor);
    			mount_component(sidepanel, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(canvas_1, "click", /*click_handler*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$cp*/ 8) && t0_value !== (t0_value = (/*$cp*/ ctx[3] === null ? "" : /*$cp*/ ctx[3]) + "")) set_data_dev(t0, t0_value);
    			const button_changes = {};
    			if (dirty & /*justify*/ 4) button_changes.active = /*justify*/ ctx[2].justify;

    			if (dirty & /*$$scope*/ 65536) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    			const sidepanel_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				sidepanel_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty & /*rightVisible*/ 1) {
    				updating_visible = true;
    				sidepanel_changes.visible = /*rightVisible*/ ctx[0];
    				add_flush_callback(() => updating_visible = false);
    			}

    			sidepanel.$set(sidepanel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			transition_in(sidepanel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(sidepanel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			/*canvas_1_binding*/ ctx[7](null);
    			destroy_component(button);
    			if (detaching) detach_dev(t3);
    			destroy_component(sidepanel, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $tk;
    	let $cp;
    	let $uName;
    	let $uNo;
    	validate_store(tk, "tk");
    	component_subscribe($$self, tk, $$value => $$invalidate(13, $tk = $$value));
    	validate_store(cp, "cp");
    	component_subscribe($$self, cp, $$value => $$invalidate(3, $cp = $$value));
    	validate_store(uName, "uName");
    	component_subscribe($$self, uName, $$value => $$invalidate(14, $uName = $$value));
    	validate_store(uNo, "uNo");
    	component_subscribe($$self, uNo, $$value => $$invalidate(15, $uNo = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	let canvas;
    	let justify = { justify: false };
    	let { rightVisible = false } = $$props;

    	const push_to = () => {
    		let param = window.location.hash.split("/").pop();

    		if (param === "posts") {
    			$$invalidate(0, rightVisible = false);
    		} else {
    			push("/posts");
    		}
    	};

    	const onjustify = (param, value) => {
    		Object.keys(justify).map(key => {
    			$$invalidate(2, justify[key] = key === param ? value : false, justify);
    		});
    	};

    	const logout = () => {
    		set_store_value(tk, $tk = "null", $tk);
    		set_store_value(cp, $cp = "", $cp);
    		set_store_value(uName, $uName = "", $uName);
    		set_store_value(uNo, $uNo = "", $uNo);
    		push("/");
    	};

    	onMount(() => {
    		/**
     * loop logo
     */
    		const ctx = canvas.getContext("2d");

    		let frame;

    		(function loop() {
    			frame = requestAnimationFrame(loop);
    			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    			for (let p = 0; p < imageData.data.length; p += 4) {
    				const i = p / 4;
    				const x = i % canvas.width;
    				const y = i / canvas.height >>> 0;
    				const t = window.performance.now();
    				const r = 64 + 128 * x / canvas.width + 64 * Math.sin(t / 1000);
    				const g = 64 + 128 * y / canvas.height + 64 * Math.cos(t / 1400);
    				const b = 128;
    				imageData.data[p + 0] = r;
    				imageData.data[p + 1] = g;
    				imageData.data[p + 2] = b;
    				imageData.data[p + 3] = 255;
    			}

    			ctx.putImageData(imageData, 0, 0);
    		})();

    		return () => {
    			cancelAnimationFrame(frame);
    		};
    	});

    	onMount(async () => {
    		const result = await api.getDecodeUser($tk);

    		if (result == null) {
    			console.log(result);
    			alert("Please login");
    			set_store_value(tk, $tk = "null", $tk);
    			set_store_value(cp, $cp = "", $cp);
    			set_store_value(uName, $uName = "", $uName);
    			set_store_value(uNo, $uNo = "", $uNo);
    			push("/");
    		}
    	});

    	const writable_props = ["rightVisible"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			canvas = $$value;
    			$$invalidate(1, canvas);
    		});
    	}

    	const click_handler = () => {
    		push("/posts");
    	};

    	const change_handler = e => {
    		onjustify("justify", e.detail);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, rightVisible = true);
    	};

    	const click_handler_2 = () => {
    		push("/mypage");
    	};

    	function sidepanel_visible_binding(value) {
    		rightVisible = value;
    		$$invalidate(0, rightVisible);
    	}

    	$$self.$$set = $$props => {
    		if ("rightVisible" in $$props) $$invalidate(0, rightVisible = $$props.rightVisible);
    	};

    	$$self.$capture_state = () => ({
    		push,
    		tk,
    		cp,
    		uName,
    		uNo,
    		onMount,
    		Sidepanel: Vn,
    		Button: xe,
    		api,
    		canvas,
    		justify,
    		rightVisible,
    		push_to,
    		onjustify,
    		logout,
    		$tk,
    		$cp,
    		$uName,
    		$uNo
    	});

    	$$self.$inject_state = $$props => {
    		if ("canvas" in $$props) $$invalidate(1, canvas = $$props.canvas);
    		if ("justify" in $$props) $$invalidate(2, justify = $$props.justify);
    		if ("rightVisible" in $$props) $$invalidate(0, rightVisible = $$props.rightVisible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		rightVisible,
    		canvas,
    		justify,
    		$cp,
    		push_to,
    		onjustify,
    		logout,
    		canvas_1_binding,
    		click_handler,
    		change_handler,
    		click_handler_1,
    		click_handler_2,
    		sidepanel_visible_binding
    	];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { rightVisible: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get rightVisible() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rightVisible(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$2 = ".header{text-align:center;width:80%;margin:auto}.canvas{display:inline;cursor:pointer}.ul-li{display:inline;color:#ff3e00;float:right}.ul{list-style:none}.h1{float:left;display:inline}.rightVisible{text-align:center;font-size:xxx-large;background-color:#bbbbc9}.right_ul{list-style:none;padding:0;width:100%;text-align:center}.right_ul li{padding:10px 0;cursor:pointer}.right_ul li:hover{background-color:#fc531b}.createpost-main{width:80%;margin:auto;border-top-style:solid;border-top-color:#bbbbc9}.post-main table{text-align-last:center}.post-table{width:100%;cursor:pointer}.post-Head{background-color:#bbbbc9}.create-box{width:50%;margin:auto;text-align:center}.create-main{width:80%;margin:auto;border-top-style:solid;border-top-color:#bbbbc9}.detail-main,.post_paging{margin:auto;text-align:center}.detail-main{width:80%;border-top-style:solid;border-top-color:#bbbbc9}.detail-box{margin:auto;width:80%;padding:10px 0}.detail-ul ul li{float:left;list-style-type:none}.detail-ul ul{padding:0}.mypage{width:30%;margin:auto}.coment{width:80%;height:30%;background-color:#f5f1f1;margin:auto}.coment-main{height:100%}.coment-border{border-bottom:1px solid #bbbbc9;width:80%;margin:auto}.coment-p{text-align:left;padding:10px 0 0 40px}.coment-area{padding:10px;box-sizing:border-box;border:1px solid #bbbbc9;resize:none;width:90%}.coment-ul ul{list-style-type:none;text-align:left}.mdc-data-table__content{font-family:Roboto,sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:.875rem;line-height:1.25rem;font-weight:400;letter-spacing:.01786em;text-decoration:inherit;text-transform:inherit}.mdc-data-table{background-color:#fff;background-color:var(--mdc-theme-surface,#fff);border-radius:4px;border:1px solid rgba(0,0,0,.12);-webkit-overflow-scrolling:touch;display:inline-flex;flex-direction:column;box-sizing:border-box;overflow-x:auto}.mdc-data-table__header-row,.mdc-data-table__row{background-color:inherit}.mdc-data-table__row--selected{background-color:rgba(98,0,238,.04)}.mdc-data-table__row{border-top-color:rgba(0,0,0,.12);border-top-width:1px;border-top-style:solid}.mdc-data-table__row:not(.mdc-data-table__row--selected):hover{background-color:rgba(0,0,0,.04)}.mdc-data-table__cell,.mdc-data-table__header-cell{color:rgba(0,0,0,.87)}.mdc-data-table__cell{height:52px}.mdc-data-table__header-cell{height:56px}.mdc-data-table__cell,.mdc-data-table__header-cell{padding-right:16px;padding-left:16px}.mdc-data-table__cell--checkbox,.mdc-data-table__header-cell--checkbox{padding-left:16px;padding-right:0}.mdc-data-table__cell--checkbox[dir=rtl],.mdc-data-table__header-cell--checkbox[dir=rtl],[dir=rtl] .mdc-data-table__cell--checkbox,[dir=rtl] .mdc-data-table__header-cell--checkbox{padding-left:0;padding-right:16px}.mdc-data-table__table{min-width:100%;border:0;white-space:nowrap;border-collapse:collapse;table-layout:fixed}.mdc-data-table__cell{font-family:Roboto,sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:.875rem;line-height:1.25rem;font-weight:400;letter-spacing:.01786em;text-decoration:inherit;text-transform:inherit;box-sizing:border-box;text-overflow:ellipsis;overflow:hidden}.mdc-data-table__cell--numeric{text-align:right}.mdc-data-table__cell--numeric[dir=rtl],[dir=rtl] .mdc-data-table__cell--numeric{text-align:left}.mdc-data-table__header-cell{font-family:Roboto,sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:.875rem;line-height:1.375rem;font-weight:500;letter-spacing:.00714em;text-decoration:inherit;text-transform:inherit;box-sizing:border-box;text-align:left;text-overflow:ellipsis;overflow:hidden}.mdc-data-table__header-cell--numeric,.mdc-data-table__header-cell[dir=rtl],[dir=rtl] .mdc-data-table__header-cell{text-align:right}.mdc-data-table__header-cell--numeric[dir=rtl],[dir=rtl] .mdc-data-table__header-cell--numeric{text-align:left}.mdc-data-table__header-row-checkbox .mdc-checkbox__native-control:checked~.mdc-checkbox__background:before,.mdc-data-table__header-row-checkbox .mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background:before,.mdc-data-table__row-checkbox .mdc-checkbox__native-control:checked~.mdc-checkbox__background:before,.mdc-data-table__row-checkbox .mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background:before{background-color:#6200ee}@supports not (-ms-ime-align:auto){.mdc-data-table__header-row-checkbox .mdc-checkbox__native-control:checked~.mdc-checkbox__background:before,.mdc-data-table__header-row-checkbox .mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background:before,.mdc-data-table__row-checkbox .mdc-checkbox__native-control:checked~.mdc-checkbox__background:before,.mdc-data-table__row-checkbox .mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background:before{background-color:var(--mdc-theme-primary,#6200ee)}}.mdc-data-table__header-row-checkbox.mdc-checkbox--selected .mdc-checkbox__ripple:after,.mdc-data-table__header-row-checkbox.mdc-checkbox--selected .mdc-checkbox__ripple:before,.mdc-data-table__row-checkbox.mdc-checkbox--selected .mdc-checkbox__ripple:after,.mdc-data-table__row-checkbox.mdc-checkbox--selected .mdc-checkbox__ripple:before{background-color:#6200ee}@supports not (-ms-ime-align:auto){.mdc-data-table__header-row-checkbox.mdc-checkbox--selected .mdc-checkbox__ripple:after,.mdc-data-table__header-row-checkbox.mdc-checkbox--selected .mdc-checkbox__ripple:before,.mdc-data-table__row-checkbox.mdc-checkbox--selected .mdc-checkbox__ripple:after,.mdc-data-table__row-checkbox.mdc-checkbox--selected .mdc-checkbox__ripple:before{background-color:var(--mdc-theme-primary,#6200ee)}}.mdc-data-table__header-row-checkbox.mdc-checkbox--selected:hover .mdc-checkbox__ripple:before,.mdc-data-table__row-checkbox.mdc-checkbox--selected:hover .mdc-checkbox__ripple:before{opacity:.04}.mdc-data-table__header-row-checkbox.mdc-checkbox--selected.mdc-ripple-upgraded--background-focused .mdc-checkbox__ripple:before,.mdc-data-table__header-row-checkbox.mdc-checkbox--selected:not(.mdc-ripple-upgraded):focus .mdc-checkbox__ripple:before,.mdc-data-table__row-checkbox.mdc-checkbox--selected.mdc-ripple-upgraded--background-focused .mdc-checkbox__ripple:before,.mdc-data-table__row-checkbox.mdc-checkbox--selected:not(.mdc-ripple-upgraded):focus .mdc-checkbox__ripple:before{transition-duration:75ms;opacity:.12}.mdc-data-table__header-row-checkbox.mdc-checkbox--selected:not(.mdc-ripple-upgraded) .mdc-checkbox__ripple:after,.mdc-data-table__row-checkbox.mdc-checkbox--selected:not(.mdc-ripple-upgraded) .mdc-checkbox__ripple:after{transition:opacity .15s linear}.mdc-data-table__header-row-checkbox.mdc-checkbox--selected:not(.mdc-ripple-upgraded):active .mdc-checkbox__ripple:after,.mdc-data-table__row-checkbox.mdc-checkbox--selected:not(.mdc-ripple-upgraded):active .mdc-checkbox__ripple:after{transition-duration:75ms;opacity:.12}.mdc-data-table__header-row-checkbox.mdc-checkbox--selected.mdc-ripple-upgraded,.mdc-data-table__row-checkbox.mdc-checkbox--selected.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:0.12}.mdc-data-table__header-row-checkbox.mdc-ripple-upgraded--background-focused.mdc-checkbox--selected .mdc-checkbox__ripple:after,.mdc-data-table__header-row-checkbox.mdc-ripple-upgraded--background-focused.mdc-checkbox--selected .mdc-checkbox__ripple:before,.mdc-data-table__row-checkbox.mdc-ripple-upgraded--background-focused.mdc-checkbox--selected .mdc-checkbox__ripple:after,.mdc-data-table__row-checkbox.mdc-ripple-upgraded--background-focused.mdc-checkbox--selected .mdc-checkbox__ripple:before{background-color:#6200ee}@supports not (-ms-ime-align:auto){.mdc-data-table__header-row-checkbox.mdc-ripple-upgraded--background-focused.mdc-checkbox--selected .mdc-checkbox__ripple:after,.mdc-data-table__header-row-checkbox.mdc-ripple-upgraded--background-focused.mdc-checkbox--selected .mdc-checkbox__ripple:before,.mdc-data-table__row-checkbox.mdc-ripple-upgraded--background-focused.mdc-checkbox--selected .mdc-checkbox__ripple:after,.mdc-data-table__row-checkbox.mdc-ripple-upgraded--background-focused.mdc-checkbox--selected .mdc-checkbox__ripple:before{background-color:var(--mdc-theme-primary,#6200ee)}}.mdc-data-table__header-row-checkbox .mdc-checkbox__native-control:enabled:not(:checked):not(:indeterminate)~.mdc-checkbox__background,.mdc-data-table__row-checkbox .mdc-checkbox__native-control:enabled:not(:checked):not(:indeterminate)~.mdc-checkbox__background{border-color:rgba(0,0,0,.54);background-color:transparent}.mdc-data-table__header-row-checkbox .mdc-checkbox__native-control:enabled:checked~.mdc-checkbox__background,.mdc-data-table__header-row-checkbox .mdc-checkbox__native-control:enabled:indeterminate~.mdc-checkbox__background,.mdc-data-table__row-checkbox .mdc-checkbox__native-control:enabled:checked~.mdc-checkbox__background,.mdc-data-table__row-checkbox .mdc-checkbox__native-control:enabled:indeterminate~.mdc-checkbox__background{border-color:#6200ee;border-color:var(--mdc-theme-primary,#6200ee);background-color:#6200ee;background-color:var(--mdc-theme-primary,#6200ee)}@keyframes mdc-checkbox-fade-in-background-u1300a661{0%{border-color:rgba(0,0,0,.54);background-color:transparent}50%{border-color:#6200ee;border-color:var(--mdc-theme-primary,#6200ee);background-color:#6200ee;background-color:var(--mdc-theme-primary,#6200ee)}}@keyframes mdc-checkbox-fade-out-background-u1300a661{0%,80%{border-color:#6200ee;border-color:var(--mdc-theme-primary,#6200ee);background-color:#6200ee;background-color:var(--mdc-theme-primary,#6200ee)}to{border-color:rgba(0,0,0,.54);background-color:transparent}}.mdc-data-table__header-row-checkbox.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background,.mdc-data-table__header-row-checkbox.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__native-control:enabled~.mdc-checkbox__background,.mdc-data-table__row-checkbox.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background,.mdc-data-table__row-checkbox.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__native-control:enabled~.mdc-checkbox__background{animation-name:mdc-checkbox-fade-in-background-u1300a661}.mdc-data-table__header-row-checkbox.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background,.mdc-data-table__header-row-checkbox.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background,.mdc-data-table__row-checkbox.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background,.mdc-data-table__row-checkbox.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background{animation-name:mdc-checkbox-fade-out-background-u1300a661}.mdc-touch-target-wrapper{display:inline}@keyframes mdc-checkbox-unchecked-checked-checkmark-path{0%,50%{stroke-dashoffset:29.78334}50%{animation-timing-function:cubic-bezier(0,0,.2,1)}to{stroke-dashoffset:0}}@keyframes mdc-checkbox-unchecked-indeterminate-mixedmark{0%,68.2%{transform:scaleX(0)}68.2%{animation-timing-function:cubic-bezier(0,0,0,1)}to{transform:scaleX(1)}}@keyframes mdc-checkbox-checked-unchecked-checkmark-path{0%{animation-timing-function:cubic-bezier(.4,0,1,1);opacity:1;stroke-dashoffset:0}to{opacity:0;stroke-dashoffset:-29.78334}}@keyframes mdc-checkbox-checked-indeterminate-checkmark{0%{animation-timing-function:cubic-bezier(0,0,.2,1);transform:rotate(0deg);opacity:1}to{transform:rotate(45deg);opacity:0}}@keyframes mdc-checkbox-indeterminate-checked-checkmark{0%{animation-timing-function:cubic-bezier(.14,0,0,1);transform:rotate(45deg);opacity:0}to{transform:rotate(1turn);opacity:1}}@keyframes mdc-checkbox-checked-indeterminate-mixedmark{0%{animation-timing-function:mdc-animation-deceleration-curve-timing-function;transform:rotate(-45deg);opacity:0}to{transform:rotate(0deg);opacity:1}}@keyframes mdc-checkbox-indeterminate-checked-mixedmark{0%{animation-timing-function:cubic-bezier(.14,0,0,1);transform:rotate(0deg);opacity:1}to{transform:rotate(315deg);opacity:0}}@keyframes mdc-checkbox-indeterminate-unchecked-mixedmark{0%{animation-timing-function:linear;transform:scaleX(1);opacity:1}32.8%,to{transform:scaleX(0);opacity:0}}.mdc-checkbox{display:inline-block;position:relative;flex:0 0 18px;box-sizing:content-box;width:18px;height:18px;line-height:0;white-space:nowrap;cursor:pointer;vertical-align:bottom;padding:11px}.mdc-checkbox .mdc-checkbox__native-control:checked~.mdc-checkbox__background:before,.mdc-checkbox .mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background:before{background-color:#018786}@supports not (-ms-ime-align:auto){.mdc-checkbox .mdc-checkbox__native-control:checked~.mdc-checkbox__background:before,.mdc-checkbox .mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background:before{background-color:var(--mdc-theme-secondary,#018786)}}.mdc-checkbox.mdc-checkbox--selected .mdc-checkbox__ripple:after,.mdc-checkbox.mdc-checkbox--selected .mdc-checkbox__ripple:before{background-color:#018786}@supports not (-ms-ime-align:auto){.mdc-checkbox.mdc-checkbox--selected .mdc-checkbox__ripple:after,.mdc-checkbox.mdc-checkbox--selected .mdc-checkbox__ripple:before{background-color:var(--mdc-theme-secondary,#018786)}}.mdc-checkbox.mdc-checkbox--selected:hover .mdc-checkbox__ripple:before{opacity:.04}.mdc-checkbox.mdc-checkbox--selected.mdc-ripple-upgraded--background-focused .mdc-checkbox__ripple:before,.mdc-checkbox.mdc-checkbox--selected:not(.mdc-ripple-upgraded):focus .mdc-checkbox__ripple:before{transition-duration:75ms;opacity:.12}.mdc-checkbox.mdc-checkbox--selected:not(.mdc-ripple-upgraded) .mdc-checkbox__ripple:after{transition:opacity .15s linear}.mdc-checkbox.mdc-checkbox--selected:not(.mdc-ripple-upgraded):active .mdc-checkbox__ripple:after{transition-duration:75ms;opacity:.12}.mdc-checkbox.mdc-checkbox--selected.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:0.12}.mdc-checkbox.mdc-ripple-upgraded--background-focused.mdc-checkbox--selected .mdc-checkbox__ripple:after,.mdc-checkbox.mdc-ripple-upgraded--background-focused.mdc-checkbox--selected .mdc-checkbox__ripple:before{background-color:#018786}@supports not (-ms-ime-align:auto){.mdc-checkbox.mdc-ripple-upgraded--background-focused.mdc-checkbox--selected .mdc-checkbox__ripple:after,.mdc-checkbox.mdc-ripple-upgraded--background-focused.mdc-checkbox--selected .mdc-checkbox__ripple:before{background-color:var(--mdc-theme-secondary,#018786)}}.mdc-checkbox .mdc-checkbox__background{top:11px;left:11px}.mdc-checkbox .mdc-checkbox__background:before{top:-13px;left:-13px;width:40px;height:40px}.mdc-checkbox .mdc-checkbox__native-control{top:0;right:0;left:0;width:40px;height:40px}.mdc-checkbox__native-control:enabled:not(:checked):not(:indeterminate)~.mdc-checkbox__background{border-color:rgba(0,0,0,.54);background-color:transparent}.mdc-checkbox__native-control:enabled:checked~.mdc-checkbox__background,.mdc-checkbox__native-control:enabled:indeterminate~.mdc-checkbox__background{border-color:#018786;border-color:var(--mdc-theme-secondary,#018786);background-color:#018786;background-color:var(--mdc-theme-secondary,#018786)}@keyframes mdc-checkbox-fade-in-background-ude834b4b{0%{border-color:rgba(0,0,0,.54);background-color:transparent}50%{border-color:#018786;border-color:var(--mdc-theme-secondary,#018786);background-color:#018786;background-color:var(--mdc-theme-secondary,#018786)}}@keyframes mdc-checkbox-fade-out-background-ude834b4b{0%,80%{border-color:#018786;border-color:var(--mdc-theme-secondary,#018786);background-color:#018786;background-color:var(--mdc-theme-secondary,#018786)}to{border-color:rgba(0,0,0,.54);background-color:transparent}}.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background,.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__native-control:enabled~.mdc-checkbox__background{animation-name:mdc-checkbox-fade-in-background-ude834b4b}.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background,.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background{animation-name:mdc-checkbox-fade-out-background-ude834b4b}.mdc-checkbox__native-control[disabled]:not(:checked):not(:indeterminate)~.mdc-checkbox__background{border-color:rgba(0,0,0,.26);background-color:transparent}.mdc-checkbox__native-control[disabled]:checked~.mdc-checkbox__background,.mdc-checkbox__native-control[disabled]:indeterminate~.mdc-checkbox__background{border-color:transparent;background-color:rgba(0,0,0,.26)}.mdc-checkbox__native-control:enabled~.mdc-checkbox__background .mdc-checkbox__checkmark{color:#fff}.mdc-checkbox__native-control:enabled~.mdc-checkbox__background .mdc-checkbox__mixedmark{border-color:#fff}.mdc-checkbox__native-control:disabled~.mdc-checkbox__background .mdc-checkbox__checkmark{color:#fff}.mdc-checkbox__native-control:disabled~.mdc-checkbox__background .mdc-checkbox__mixedmark{border-color:#fff}@media screen and (-ms-high-contrast:active){.mdc-checkbox__mixedmark{margin:0 1px}}.mdc-checkbox--disabled{cursor:default;pointer-events:none}.mdc-checkbox__background{display:inline-flex;position:absolute;align-items:center;justify-content:center;box-sizing:border-box;width:18px;height:18px;border:2px solid;border-radius:2px;background-color:transparent;pointer-events:none;will-change:background-color,border-color;transition:background-color 90ms cubic-bezier(.4,0,.6,1) 0ms,border-color 90ms cubic-bezier(.4,0,.6,1) 0ms}.mdc-checkbox__background .mdc-checkbox__background:before{background-color:#000}@supports not (-ms-ime-align:auto){.mdc-checkbox__background .mdc-checkbox__background:before{background-color:var(--mdc-theme-on-surface,#000)}}.mdc-checkbox__checkmark{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;opacity:0;transition:opacity .18s cubic-bezier(.4,0,.6,1) 0ms}.mdc-checkbox--upgraded .mdc-checkbox__checkmark{opacity:1}.mdc-checkbox__checkmark-path{transition:stroke-dashoffset .18s cubic-bezier(.4,0,.6,1) 0ms;stroke:currentColor;stroke-width:3.12px;stroke-dashoffset:29.78334;stroke-dasharray:29.78334}.mdc-checkbox__mixedmark{width:100%;height:0;transform:scaleX(0) rotate(0deg);border-width:1px;border-style:solid;opacity:0;transition:opacity 90ms cubic-bezier(.4,0,.6,1) 0ms,transform 90ms cubic-bezier(.4,0,.6,1) 0ms}.mdc-checkbox--upgraded .mdc-checkbox__background,.mdc-checkbox--upgraded .mdc-checkbox__checkmark,.mdc-checkbox--upgraded .mdc-checkbox__checkmark-path,.mdc-checkbox--upgraded .mdc-checkbox__mixedmark{transition:none!important}.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__background,.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__background,.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__background,.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__background{animation-duration:.18s;animation-timing-function:linear}.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__checkmark-path{animation:mdc-checkbox-unchecked-checked-checkmark-path .18s linear 0s;transition:none}.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__mixedmark{animation:mdc-checkbox-unchecked-indeterminate-mixedmark 90ms linear 0s;transition:none}.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__checkmark-path{animation:mdc-checkbox-checked-unchecked-checkmark-path 90ms linear 0s;transition:none}.mdc-checkbox--anim-checked-indeterminate .mdc-checkbox__checkmark{animation:mdc-checkbox-checked-indeterminate-checkmark 90ms linear 0s;transition:none}.mdc-checkbox--anim-checked-indeterminate .mdc-checkbox__mixedmark{animation:mdc-checkbox-checked-indeterminate-mixedmark 90ms linear 0s;transition:none}.mdc-checkbox--anim-indeterminate-checked .mdc-checkbox__checkmark{animation:mdc-checkbox-indeterminate-checked-checkmark .5s linear 0s;transition:none}.mdc-checkbox--anim-indeterminate-checked .mdc-checkbox__mixedmark{animation:mdc-checkbox-indeterminate-checked-mixedmark .5s linear 0s;transition:none}.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__mixedmark{animation:mdc-checkbox-indeterminate-unchecked-mixedmark .3s linear 0s;transition:none}.mdc-checkbox__native-control:checked~.mdc-checkbox__background,.mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background{transition:border-color 90ms cubic-bezier(0,0,.2,1) 0ms,background-color 90ms cubic-bezier(0,0,.2,1) 0ms}.mdc-checkbox__native-control:checked~.mdc-checkbox__background .mdc-checkbox__checkmark-path,.mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background .mdc-checkbox__checkmark-path{stroke-dashoffset:0}.mdc-checkbox__background:before{position:absolute;transform:scale(0);border-radius:50%;opacity:0;pointer-events:none;content:\"\";will-change:opacity,transform;transition:opacity 90ms cubic-bezier(.4,0,.6,1) 0ms,transform 90ms cubic-bezier(.4,0,.6,1) 0ms}.mdc-checkbox__native-control:focus~.mdc-checkbox__background:before{transform:scale(1);opacity:.12;transition:opacity 80ms cubic-bezier(0,0,.2,1) 0ms,transform 80ms cubic-bezier(0,0,.2,1) 0ms}.mdc-checkbox__native-control{position:absolute;margin:0;padding:0;opacity:0;cursor:inherit}.mdc-checkbox__native-control:disabled{cursor:default;pointer-events:none}.mdc-checkbox--touch{margin:4px}.mdc-checkbox--touch .mdc-checkbox__native-control{top:-4px;right:-4px;left:-4px;width:48px;height:48px}.mdc-checkbox__native-control:checked~.mdc-checkbox__background .mdc-checkbox__checkmark{transition:opacity .18s cubic-bezier(0,0,.2,1) 0ms,transform .18s cubic-bezier(0,0,.2,1) 0ms;opacity:1}.mdc-checkbox__native-control:checked~.mdc-checkbox__background .mdc-checkbox__mixedmark{transform:scaleX(1) rotate(-45deg)}.mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background .mdc-checkbox__checkmark{transform:rotate(45deg);opacity:0;transition:opacity 90ms cubic-bezier(.4,0,.6,1) 0ms,transform 90ms cubic-bezier(.4,0,.6,1) 0ms}.mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background .mdc-checkbox__mixedmark{transform:scaleX(1) rotate(0deg);opacity:1}@keyframes mdc-ripple-fg-radius-in{0%{animation-timing-function:cubic-bezier(.4,0,.2,1);transform:translate(var(--mdc-ripple-fg-translate-start,0)) scale(1)}to{transform:translate(var(--mdc-ripple-fg-translate-end,0)) scale(var(--mdc-ripple-fg-scale,1))}}@keyframes mdc-ripple-fg-opacity-in{0%{animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity,0)}}@keyframes mdc-ripple-fg-opacity-out{0%{animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity,0)}to{opacity:0}}.mdc-ripple-surface--test-edge-var-bug{--mdc-ripple-surface-test-edge-var:1px solid #000;visibility:hidden}.mdc-ripple-surface--test-edge-var-bug:before{border:var(--mdc-ripple-surface-test-edge-var)}.mdc-checkbox{--mdc-ripple-fg-size:0;--mdc-ripple-left:0;--mdc-ripple-top:0;--mdc-ripple-fg-scale:1;--mdc-ripple-fg-translate-end:0;--mdc-ripple-fg-translate-start:0;-webkit-tap-highlight-color:rgba(0,0,0,0)}.mdc-checkbox .mdc-checkbox__ripple:after,.mdc-checkbox .mdc-checkbox__ripple:before{position:absolute;border-radius:50%;opacity:0;pointer-events:none;content:\"\"}.mdc-checkbox .mdc-checkbox__ripple:before{transition:opacity 15ms linear,background-color 15ms linear;z-index:1}.mdc-checkbox.mdc-ripple-upgraded .mdc-checkbox__ripple:before{transform:scale(var(--mdc-ripple-fg-scale,1))}.mdc-checkbox.mdc-ripple-upgraded .mdc-checkbox__ripple:after{top:0;left:0;transform:scale(0);transform-origin:center center}.mdc-checkbox.mdc-ripple-upgraded--unbounded .mdc-checkbox__ripple:after{top:var(--mdc-ripple-top,0);left:var(--mdc-ripple-left,0)}.mdc-checkbox.mdc-ripple-upgraded--foreground-activation .mdc-checkbox__ripple:after{animation:mdc-ripple-fg-radius-in 225ms forwards,mdc-ripple-fg-opacity-in 75ms forwards}.mdc-checkbox.mdc-ripple-upgraded--foreground-deactivation .mdc-checkbox__ripple:after{animation:mdc-ripple-fg-opacity-out .15s;transform:translate(var(--mdc-ripple-fg-translate-end,0)) scale(var(--mdc-ripple-fg-scale,1))}.mdc-checkbox .mdc-checkbox__ripple:after,.mdc-checkbox .mdc-checkbox__ripple:before{background-color:#000}@supports not (-ms-ime-align:auto){.mdc-checkbox .mdc-checkbox__ripple:after,.mdc-checkbox .mdc-checkbox__ripple:before{background-color:var(--mdc-theme-on-surface,#000)}}.mdc-checkbox:hover .mdc-checkbox__ripple:before{opacity:.04}.mdc-checkbox.mdc-ripple-upgraded--background-focused .mdc-checkbox__ripple:before,.mdc-checkbox:not(.mdc-ripple-upgraded):focus .mdc-checkbox__ripple:before{transition-duration:75ms;opacity:.12}.mdc-checkbox:not(.mdc-ripple-upgraded) .mdc-checkbox__ripple:after{transition:opacity .15s linear}.mdc-checkbox:not(.mdc-ripple-upgraded):active .mdc-checkbox__ripple:after{transition-duration:75ms;opacity:.12}.mdc-checkbox.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:0.12}.mdc-checkbox .mdc-checkbox__ripple:after,.mdc-checkbox .mdc-checkbox__ripple:before{top:0;left:0;width:100%;height:100%}.mdc-checkbox.mdc-ripple-upgraded .mdc-checkbox__ripple:after,.mdc-checkbox.mdc-ripple-upgraded .mdc-checkbox__ripple:before{top:var(--mdc-ripple-top,0);left:var(--mdc-ripple-left,0);width:var(--mdc-ripple-fg-size,100%);height:var(--mdc-ripple-fg-size,100%)}.mdc-checkbox.mdc-ripple-upgraded .mdc-checkbox__ripple:after{width:var(--mdc-ripple-fg-size,100%);height:var(--mdc-ripple-fg-size,100%)}.mdc-checkbox__ripple{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}.mdc-ripple-upgraded--background-focused .mdc-checkbox__background:before{content:none}";
    styleInject(css_248z$2);

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCFoundation = /** @class */ (function () {
        function MDCFoundation(adapter) {
            if (adapter === void 0) { adapter = {}; }
            this.adapter_ = adapter;
        }
        Object.defineProperty(MDCFoundation, "cssClasses", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports every
                // CSS class the foundation class needs as a property. e.g. {ACTIVE: 'mdc-component--active'}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "strings", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports all
                // semantic strings as constants. e.g. {ARIA_ROLE: 'tablist'}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "numbers", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports all
                // of its semantic numbers as constants. e.g. {ANIMATION_DELAY_MS: 350}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "defaultAdapter", {
            get: function () {
                // Classes extending MDCFoundation may choose to implement this getter in order to provide a convenient
                // way of viewing the necessary methods of an adapter. In the future, this could also be used for adapter
                // validation.
                return {};
            },
            enumerable: true,
            configurable: true
        });
        MDCFoundation.prototype.init = function () {
            // Subclasses should override this method to perform initialization routines (registering events, etc.)
        };
        MDCFoundation.prototype.destroy = function () {
            // Subclasses should override this method to perform de-initialization routines (de-registering events, etc.)
        };
        return MDCFoundation;
    }());

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCComponent = /** @class */ (function () {
        function MDCComponent(root, foundation) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            this.root_ = root;
            this.initialize.apply(this, __spread(args));
            // Note that we initialize foundation here and not within the constructor's default param so that
            // this.root_ is defined and can be used within the foundation class.
            this.foundation_ = foundation === undefined ? this.getDefaultFoundation() : foundation;
            this.foundation_.init();
            this.initialSyncWithDOM();
        }
        MDCComponent.attachTo = function (root) {
            // Subclasses which extend MDCBase should provide an attachTo() method that takes a root element and
            // returns an instantiated component with its root set to that element. Also note that in the cases of
            // subclasses, an explicit foundation class will not have to be passed in; it will simply be initialized
            // from getDefaultFoundation().
            return new MDCComponent(root, new MDCFoundation({}));
        };
        /* istanbul ignore next: method param only exists for typing purposes; it does not need to be unit tested */
        MDCComponent.prototype.initialize = function () {
            var _args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _args[_i] = arguments[_i];
            }
            // Subclasses can override this to do any additional setup work that would be considered part of a
            // "constructor". Essentially, it is a hook into the parent constructor before the foundation is
            // initialized. Any additional arguments besides root and foundation will be passed in here.
        };
        MDCComponent.prototype.getDefaultFoundation = function () {
            // Subclasses must override this method to return a properly configured foundation class for the
            // component.
            throw new Error('Subclasses must override getDefaultFoundation to return a properly configured ' +
                'foundation class');
        };
        MDCComponent.prototype.initialSyncWithDOM = function () {
            // Subclasses should override this method if they need to perform work to synchronize with a host DOM
            // object. An example of this would be a form control wrapper that needs to synchronize its internal state
            // to some property or attribute of the host DOM. Please note: this is *not* the place to perform DOM
            // reads/writes that would cause layout / paint, as this is called synchronously from within the constructor.
        };
        MDCComponent.prototype.destroy = function () {
            // Subclasses may implement this method to release any resources / deregister any listeners they have
            // attached. An example of this might be deregistering a resize event from the window object.
            this.foundation_.destroy();
        };
        MDCComponent.prototype.listen = function (evtType, handler, options) {
            this.root_.addEventListener(evtType, handler, options);
        };
        MDCComponent.prototype.unlisten = function (evtType, handler, options) {
            this.root_.removeEventListener(evtType, handler, options);
        };
        /**
         * Fires a cross-browser-compatible custom event from the component root of the given type, with the given data.
         */
        MDCComponent.prototype.emit = function (evtType, evtData, shouldBubble) {
            if (shouldBubble === void 0) { shouldBubble = false; }
            var evt;
            if (typeof CustomEvent === 'function') {
                evt = new CustomEvent(evtType, {
                    bubbles: shouldBubble,
                    detail: evtData,
                });
            }
            else {
                evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(evtType, shouldBubble, false, evtData);
            }
            this.root_.dispatchEvent(evt);
        };
        return MDCComponent;
    }());

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var jsEventTypeMap = {
        animationend: {
            cssProperty: 'animation',
            prefixed: 'webkitAnimationEnd',
            standard: 'animationend',
        },
        animationiteration: {
            cssProperty: 'animation',
            prefixed: 'webkitAnimationIteration',
            standard: 'animationiteration',
        },
        animationstart: {
            cssProperty: 'animation',
            prefixed: 'webkitAnimationStart',
            standard: 'animationstart',
        },
        transitionend: {
            cssProperty: 'transition',
            prefixed: 'webkitTransitionEnd',
            standard: 'transitionend',
        },
    };
    function isWindow(windowObj) {
        return Boolean(windowObj.document) && typeof windowObj.document.createElement === 'function';
    }
    function getCorrectEventName(windowObj, eventType) {
        if (isWindow(windowObj) && eventType in jsEventTypeMap) {
            var el = windowObj.document.createElement('div');
            var _a = jsEventTypeMap[eventType], standard = _a.standard, prefixed = _a.prefixed, cssProperty = _a.cssProperty;
            var isStandard = cssProperty in el.style;
            return isStandard ? standard : prefixed;
        }
        return eventType;
    }

    /**
     * @license
     * Copyright 2019 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * Stores result from applyPassive to avoid redundant processing to detect
     * passive event listener support.
     */
    var supportsPassive_;
    /**
     * Determine whether the current browser supports passive event listeners, and
     * if so, use them.
     */
    function applyPassive(globalObj, forceRefresh) {
        if (globalObj === void 0) { globalObj = window; }
        if (forceRefresh === void 0) { forceRefresh = false; }
        if (supportsPassive_ === undefined || forceRefresh) {
            var isSupported_1 = false;
            try {
                globalObj.document.addEventListener('test', function () { return undefined; }, {
                    get passive() {
                        isSupported_1 = true;
                        return isSupported_1;
                    },
                });
            }
            catch (e) {
            } // tslint:disable-line:no-empty cannot throw error due to tests. tslint also disables console.log.
            supportsPassive_ = isSupported_1;
        }
        return supportsPassive_ ? { passive: true } : false;
    }

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * @fileoverview A "ponyfill" is a polyfill that doesn't modify the global prototype chain.
     * This makes ponyfills safer than traditional polyfills, especially for libraries like MDC.
     */
    function closest(element, selector) {
        if (element.closest) {
            return element.closest(selector);
        }
        var el = element;
        while (el) {
            if (matches(el, selector)) {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }
    function matches(element, selector) {
        var nativeMatches = element.matches
            || element.webkitMatchesSelector
            || element.msMatchesSelector;
        return nativeMatches.call(element, selector);
    }

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses = {
        // Ripple is a special case where the "root" component is really a "mixin" of sorts,
        // given that it's an 'upgrade' to an existing component. That being said it is the root
        // CSS class that all other CSS classes derive from.
        BG_FOCUSED: 'mdc-ripple-upgraded--background-focused',
        FG_ACTIVATION: 'mdc-ripple-upgraded--foreground-activation',
        FG_DEACTIVATION: 'mdc-ripple-upgraded--foreground-deactivation',
        ROOT: 'mdc-ripple-upgraded',
        UNBOUNDED: 'mdc-ripple-upgraded--unbounded',
    };
    var strings = {
        VAR_FG_SCALE: '--mdc-ripple-fg-scale',
        VAR_FG_SIZE: '--mdc-ripple-fg-size',
        VAR_FG_TRANSLATE_END: '--mdc-ripple-fg-translate-end',
        VAR_FG_TRANSLATE_START: '--mdc-ripple-fg-translate-start',
        VAR_LEFT: '--mdc-ripple-left',
        VAR_TOP: '--mdc-ripple-top',
    };
    var numbers = {
        DEACTIVATION_TIMEOUT_MS: 225,
        FG_DEACTIVATION_MS: 150,
        INITIAL_ORIGIN_SCALE: 0.6,
        PADDING: 10,
        TAP_DELAY_MS: 300,
    };

    /**
     * Stores result from supportsCssVariables to avoid redundant processing to
     * detect CSS custom variable support.
     */
    var supportsCssVariables_;
    function detectEdgePseudoVarBug(windowObj) {
        // Detect versions of Edge with buggy var() support
        // See: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11495448/
        var document = windowObj.document;
        var node = document.createElement('div');
        node.className = 'mdc-ripple-surface--test-edge-var-bug';
        // Append to head instead of body because this script might be invoked in the
        // head, in which case the body doesn't exist yet. The probe works either way.
        document.head.appendChild(node);
        // The bug exists if ::before style ends up propagating to the parent element.
        // Additionally, getComputedStyle returns null in iframes with display: "none" in Firefox,
        // but Firefox is known to support CSS custom properties correctly.
        // See: https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        var computedStyle = windowObj.getComputedStyle(node);
        var hasPseudoVarBug = computedStyle !== null && computedStyle.borderTopStyle === 'solid';
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        return hasPseudoVarBug;
    }
    function supportsCssVariables(windowObj, forceRefresh) {
        if (forceRefresh === void 0) { forceRefresh = false; }
        var CSS = windowObj.CSS;
        var supportsCssVars = supportsCssVariables_;
        if (typeof supportsCssVariables_ === 'boolean' && !forceRefresh) {
            return supportsCssVariables_;
        }
        var supportsFunctionPresent = CSS && typeof CSS.supports === 'function';
        if (!supportsFunctionPresent) {
            return false;
        }
        var explicitlySupportsCssVars = CSS.supports('--css-vars', 'yes');
        // See: https://bugs.webkit.org/show_bug.cgi?id=154669
        // See: README section on Safari
        var weAreFeatureDetectingSafari10plus = (CSS.supports('(--css-vars: yes)') &&
            CSS.supports('color', '#00000000'));
        if (explicitlySupportsCssVars || weAreFeatureDetectingSafari10plus) {
            supportsCssVars = !detectEdgePseudoVarBug(windowObj);
        }
        else {
            supportsCssVars = false;
        }
        if (!forceRefresh) {
            supportsCssVariables_ = supportsCssVars;
        }
        return supportsCssVars;
    }
    function getNormalizedEventCoords(evt, pageOffset, clientRect) {
        if (!evt) {
            return { x: 0, y: 0 };
        }
        var x = pageOffset.x, y = pageOffset.y;
        var documentX = x + clientRect.left;
        var documentY = y + clientRect.top;
        var normalizedX;
        var normalizedY;
        // Determine touch point relative to the ripple container.
        if (evt.type === 'touchstart') {
            var touchEvent = evt;
            normalizedX = touchEvent.changedTouches[0].pageX - documentX;
            normalizedY = touchEvent.changedTouches[0].pageY - documentY;
        }
        else {
            var mouseEvent = evt;
            normalizedX = mouseEvent.pageX - documentX;
            normalizedY = mouseEvent.pageY - documentY;
        }
        return { x: normalizedX, y: normalizedY };
    }

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    // Activation events registered on the root element of each instance for activation
    var ACTIVATION_EVENT_TYPES = [
        'touchstart', 'pointerdown', 'mousedown', 'keydown',
    ];
    // Deactivation events registered on documentElement when a pointer-related down event occurs
    var POINTER_DEACTIVATION_EVENT_TYPES = [
        'touchend', 'pointerup', 'mouseup', 'contextmenu',
    ];
    // simultaneous nested activations
    var activatedTargets = [];
    var MDCRippleFoundation = /** @class */ (function (_super) {
        __extends(MDCRippleFoundation, _super);
        function MDCRippleFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCRippleFoundation.defaultAdapter, adapter)) || this;
            _this.activationAnimationHasEnded_ = false;
            _this.activationTimer_ = 0;
            _this.fgDeactivationRemovalTimer_ = 0;
            _this.fgScale_ = '0';
            _this.frame_ = { width: 0, height: 0 };
            _this.initialSize_ = 0;
            _this.layoutFrame_ = 0;
            _this.maxRadius_ = 0;
            _this.unboundedCoords_ = { left: 0, top: 0 };
            _this.activationState_ = _this.defaultActivationState_();
            _this.activationTimerCallback_ = function () {
                _this.activationAnimationHasEnded_ = true;
                _this.runDeactivationUXLogicIfReady_();
            };
            _this.activateHandler_ = function (e) { return _this.activate_(e); };
            _this.deactivateHandler_ = function () { return _this.deactivate_(); };
            _this.focusHandler_ = function () { return _this.handleFocus(); };
            _this.blurHandler_ = function () { return _this.handleBlur(); };
            _this.resizeHandler_ = function () { return _this.layout(); };
            return _this;
        }
        Object.defineProperty(MDCRippleFoundation, "cssClasses", {
            get: function () {
                return cssClasses;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "strings", {
            get: function () {
                return strings;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "numbers", {
            get: function () {
                return numbers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClass: function () { return undefined; },
                    browserSupportsCssVars: function () { return true; },
                    computeBoundingRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    containsEventTarget: function () { return true; },
                    deregisterDocumentInteractionHandler: function () { return undefined; },
                    deregisterInteractionHandler: function () { return undefined; },
                    deregisterResizeHandler: function () { return undefined; },
                    getWindowPageOffset: function () { return ({ x: 0, y: 0 }); },
                    isSurfaceActive: function () { return true; },
                    isSurfaceDisabled: function () { return true; },
                    isUnbounded: function () { return true; },
                    registerDocumentInteractionHandler: function () { return undefined; },
                    registerInteractionHandler: function () { return undefined; },
                    registerResizeHandler: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    updateCssVariable: function () { return undefined; },
                };
            },
            enumerable: true,
            configurable: true
        });
        MDCRippleFoundation.prototype.init = function () {
            var _this = this;
            var supportsPressRipple = this.supportsPressRipple_();
            this.registerRootHandlers_(supportsPressRipple);
            if (supportsPressRipple) {
                var _a = MDCRippleFoundation.cssClasses, ROOT_1 = _a.ROOT, UNBOUNDED_1 = _a.UNBOUNDED;
                requestAnimationFrame(function () {
                    _this.adapter_.addClass(ROOT_1);
                    if (_this.adapter_.isUnbounded()) {
                        _this.adapter_.addClass(UNBOUNDED_1);
                        // Unbounded ripples need layout logic applied immediately to set coordinates for both shade and ripple
                        _this.layoutInternal_();
                    }
                });
            }
        };
        MDCRippleFoundation.prototype.destroy = function () {
            var _this = this;
            if (this.supportsPressRipple_()) {
                if (this.activationTimer_) {
                    clearTimeout(this.activationTimer_);
                    this.activationTimer_ = 0;
                    this.adapter_.removeClass(MDCRippleFoundation.cssClasses.FG_ACTIVATION);
                }
                if (this.fgDeactivationRemovalTimer_) {
                    clearTimeout(this.fgDeactivationRemovalTimer_);
                    this.fgDeactivationRemovalTimer_ = 0;
                    this.adapter_.removeClass(MDCRippleFoundation.cssClasses.FG_DEACTIVATION);
                }
                var _a = MDCRippleFoundation.cssClasses, ROOT_2 = _a.ROOT, UNBOUNDED_2 = _a.UNBOUNDED;
                requestAnimationFrame(function () {
                    _this.adapter_.removeClass(ROOT_2);
                    _this.adapter_.removeClass(UNBOUNDED_2);
                    _this.removeCssVars_();
                });
            }
            this.deregisterRootHandlers_();
            this.deregisterDeactivationHandlers_();
        };
        /**
         * @param evt Optional event containing position information.
         */
        MDCRippleFoundation.prototype.activate = function (evt) {
            this.activate_(evt);
        };
        MDCRippleFoundation.prototype.deactivate = function () {
            this.deactivate_();
        };
        MDCRippleFoundation.prototype.layout = function () {
            var _this = this;
            if (this.layoutFrame_) {
                cancelAnimationFrame(this.layoutFrame_);
            }
            this.layoutFrame_ = requestAnimationFrame(function () {
                _this.layoutInternal_();
                _this.layoutFrame_ = 0;
            });
        };
        MDCRippleFoundation.prototype.setUnbounded = function (unbounded) {
            var UNBOUNDED = MDCRippleFoundation.cssClasses.UNBOUNDED;
            if (unbounded) {
                this.adapter_.addClass(UNBOUNDED);
            }
            else {
                this.adapter_.removeClass(UNBOUNDED);
            }
        };
        MDCRippleFoundation.prototype.handleFocus = function () {
            var _this = this;
            requestAnimationFrame(function () {
                return _this.adapter_.addClass(MDCRippleFoundation.cssClasses.BG_FOCUSED);
            });
        };
        MDCRippleFoundation.prototype.handleBlur = function () {
            var _this = this;
            requestAnimationFrame(function () {
                return _this.adapter_.removeClass(MDCRippleFoundation.cssClasses.BG_FOCUSED);
            });
        };
        /**
         * We compute this property so that we are not querying information about the client
         * until the point in time where the foundation requests it. This prevents scenarios where
         * client-side feature-detection may happen too early, such as when components are rendered on the server
         * and then initialized at mount time on the client.
         */
        MDCRippleFoundation.prototype.supportsPressRipple_ = function () {
            return this.adapter_.browserSupportsCssVars();
        };
        MDCRippleFoundation.prototype.defaultActivationState_ = function () {
            return {
                activationEvent: undefined,
                hasDeactivationUXRun: false,
                isActivated: false,
                isProgrammatic: false,
                wasActivatedByPointer: false,
                wasElementMadeActive: false,
            };
        };
        /**
         * supportsPressRipple Passed from init to save a redundant function call
         */
        MDCRippleFoundation.prototype.registerRootHandlers_ = function (supportsPressRipple) {
            var _this = this;
            if (supportsPressRipple) {
                ACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                    _this.adapter_.registerInteractionHandler(evtType, _this.activateHandler_);
                });
                if (this.adapter_.isUnbounded()) {
                    this.adapter_.registerResizeHandler(this.resizeHandler_);
                }
            }
            this.adapter_.registerInteractionHandler('focus', this.focusHandler_);
            this.adapter_.registerInteractionHandler('blur', this.blurHandler_);
        };
        MDCRippleFoundation.prototype.registerDeactivationHandlers_ = function (evt) {
            var _this = this;
            if (evt.type === 'keydown') {
                this.adapter_.registerInteractionHandler('keyup', this.deactivateHandler_);
            }
            else {
                POINTER_DEACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                    _this.adapter_.registerDocumentInteractionHandler(evtType, _this.deactivateHandler_);
                });
            }
        };
        MDCRippleFoundation.prototype.deregisterRootHandlers_ = function () {
            var _this = this;
            ACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                _this.adapter_.deregisterInteractionHandler(evtType, _this.activateHandler_);
            });
            this.adapter_.deregisterInteractionHandler('focus', this.focusHandler_);
            this.adapter_.deregisterInteractionHandler('blur', this.blurHandler_);
            if (this.adapter_.isUnbounded()) {
                this.adapter_.deregisterResizeHandler(this.resizeHandler_);
            }
        };
        MDCRippleFoundation.prototype.deregisterDeactivationHandlers_ = function () {
            var _this = this;
            this.adapter_.deregisterInteractionHandler('keyup', this.deactivateHandler_);
            POINTER_DEACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                _this.adapter_.deregisterDocumentInteractionHandler(evtType, _this.deactivateHandler_);
            });
        };
        MDCRippleFoundation.prototype.removeCssVars_ = function () {
            var _this = this;
            var rippleStrings = MDCRippleFoundation.strings;
            var keys = Object.keys(rippleStrings);
            keys.forEach(function (key) {
                if (key.indexOf('VAR_') === 0) {
                    _this.adapter_.updateCssVariable(rippleStrings[key], null);
                }
            });
        };
        MDCRippleFoundation.prototype.activate_ = function (evt) {
            var _this = this;
            if (this.adapter_.isSurfaceDisabled()) {
                return;
            }
            var activationState = this.activationState_;
            if (activationState.isActivated) {
                return;
            }
            // Avoid reacting to follow-on events fired by touch device after an already-processed user interaction
            var previousActivationEvent = this.previousActivationEvent_;
            var isSameInteraction = previousActivationEvent && evt !== undefined && previousActivationEvent.type !== evt.type;
            if (isSameInteraction) {
                return;
            }
            activationState.isActivated = true;
            activationState.isProgrammatic = evt === undefined;
            activationState.activationEvent = evt;
            activationState.wasActivatedByPointer = activationState.isProgrammatic ? false : evt !== undefined && (evt.type === 'mousedown' || evt.type === 'touchstart' || evt.type === 'pointerdown');
            var hasActivatedChild = evt !== undefined && activatedTargets.length > 0 && activatedTargets.some(function (target) { return _this.adapter_.containsEventTarget(target); });
            if (hasActivatedChild) {
                // Immediately reset activation state, while preserving logic that prevents touch follow-on events
                this.resetActivationState_();
                return;
            }
            if (evt !== undefined) {
                activatedTargets.push(evt.target);
                this.registerDeactivationHandlers_(evt);
            }
            activationState.wasElementMadeActive = this.checkElementMadeActive_(evt);
            if (activationState.wasElementMadeActive) {
                this.animateActivation_();
            }
            requestAnimationFrame(function () {
                // Reset array on next frame after the current event has had a chance to bubble to prevent ancestor ripples
                activatedTargets = [];
                if (!activationState.wasElementMadeActive
                    && evt !== undefined
                    && (evt.key === ' ' || evt.keyCode === 32)) {
                    // If space was pressed, try again within an rAF call to detect :active, because different UAs report
                    // active states inconsistently when they're called within event handling code:
                    // - https://bugs.chromium.org/p/chromium/issues/detail?id=635971
                    // - https://bugzilla.mozilla.org/show_bug.cgi?id=1293741
                    // We try first outside rAF to support Edge, which does not exhibit this problem, but will crash if a CSS
                    // variable is set within a rAF callback for a submit button interaction (#2241).
                    activationState.wasElementMadeActive = _this.checkElementMadeActive_(evt);
                    if (activationState.wasElementMadeActive) {
                        _this.animateActivation_();
                    }
                }
                if (!activationState.wasElementMadeActive) {
                    // Reset activation state immediately if element was not made active.
                    _this.activationState_ = _this.defaultActivationState_();
                }
            });
        };
        MDCRippleFoundation.prototype.checkElementMadeActive_ = function (evt) {
            return (evt !== undefined && evt.type === 'keydown') ? this.adapter_.isSurfaceActive() : true;
        };
        MDCRippleFoundation.prototype.animateActivation_ = function () {
            var _this = this;
            var _a = MDCRippleFoundation.strings, VAR_FG_TRANSLATE_START = _a.VAR_FG_TRANSLATE_START, VAR_FG_TRANSLATE_END = _a.VAR_FG_TRANSLATE_END;
            var _b = MDCRippleFoundation.cssClasses, FG_DEACTIVATION = _b.FG_DEACTIVATION, FG_ACTIVATION = _b.FG_ACTIVATION;
            var DEACTIVATION_TIMEOUT_MS = MDCRippleFoundation.numbers.DEACTIVATION_TIMEOUT_MS;
            this.layoutInternal_();
            var translateStart = '';
            var translateEnd = '';
            if (!this.adapter_.isUnbounded()) {
                var _c = this.getFgTranslationCoordinates_(), startPoint = _c.startPoint, endPoint = _c.endPoint;
                translateStart = startPoint.x + "px, " + startPoint.y + "px";
                translateEnd = endPoint.x + "px, " + endPoint.y + "px";
            }
            this.adapter_.updateCssVariable(VAR_FG_TRANSLATE_START, translateStart);
            this.adapter_.updateCssVariable(VAR_FG_TRANSLATE_END, translateEnd);
            // Cancel any ongoing activation/deactivation animations
            clearTimeout(this.activationTimer_);
            clearTimeout(this.fgDeactivationRemovalTimer_);
            this.rmBoundedActivationClasses_();
            this.adapter_.removeClass(FG_DEACTIVATION);
            // Force layout in order to re-trigger the animation.
            this.adapter_.computeBoundingRect();
            this.adapter_.addClass(FG_ACTIVATION);
            this.activationTimer_ = setTimeout(function () { return _this.activationTimerCallback_(); }, DEACTIVATION_TIMEOUT_MS);
        };
        MDCRippleFoundation.prototype.getFgTranslationCoordinates_ = function () {
            var _a = this.activationState_, activationEvent = _a.activationEvent, wasActivatedByPointer = _a.wasActivatedByPointer;
            var startPoint;
            if (wasActivatedByPointer) {
                startPoint = getNormalizedEventCoords(activationEvent, this.adapter_.getWindowPageOffset(), this.adapter_.computeBoundingRect());
            }
            else {
                startPoint = {
                    x: this.frame_.width / 2,
                    y: this.frame_.height / 2,
                };
            }
            // Center the element around the start point.
            startPoint = {
                x: startPoint.x - (this.initialSize_ / 2),
                y: startPoint.y - (this.initialSize_ / 2),
            };
            var endPoint = {
                x: (this.frame_.width / 2) - (this.initialSize_ / 2),
                y: (this.frame_.height / 2) - (this.initialSize_ / 2),
            };
            return { startPoint: startPoint, endPoint: endPoint };
        };
        MDCRippleFoundation.prototype.runDeactivationUXLogicIfReady_ = function () {
            var _this = this;
            // This method is called both when a pointing device is released, and when the activation animation ends.
            // The deactivation animation should only run after both of those occur.
            var FG_DEACTIVATION = MDCRippleFoundation.cssClasses.FG_DEACTIVATION;
            var _a = this.activationState_, hasDeactivationUXRun = _a.hasDeactivationUXRun, isActivated = _a.isActivated;
            var activationHasEnded = hasDeactivationUXRun || !isActivated;
            if (activationHasEnded && this.activationAnimationHasEnded_) {
                this.rmBoundedActivationClasses_();
                this.adapter_.addClass(FG_DEACTIVATION);
                this.fgDeactivationRemovalTimer_ = setTimeout(function () {
                    _this.adapter_.removeClass(FG_DEACTIVATION);
                }, numbers.FG_DEACTIVATION_MS);
            }
        };
        MDCRippleFoundation.prototype.rmBoundedActivationClasses_ = function () {
            var FG_ACTIVATION = MDCRippleFoundation.cssClasses.FG_ACTIVATION;
            this.adapter_.removeClass(FG_ACTIVATION);
            this.activationAnimationHasEnded_ = false;
            this.adapter_.computeBoundingRect();
        };
        MDCRippleFoundation.prototype.resetActivationState_ = function () {
            var _this = this;
            this.previousActivationEvent_ = this.activationState_.activationEvent;
            this.activationState_ = this.defaultActivationState_();
            // Touch devices may fire additional events for the same interaction within a short time.
            // Store the previous event until it's safe to assume that subsequent events are for new interactions.
            setTimeout(function () { return _this.previousActivationEvent_ = undefined; }, MDCRippleFoundation.numbers.TAP_DELAY_MS);
        };
        MDCRippleFoundation.prototype.deactivate_ = function () {
            var _this = this;
            var activationState = this.activationState_;
            // This can happen in scenarios such as when you have a keyup event that blurs the element.
            if (!activationState.isActivated) {
                return;
            }
            var state = __assign({}, activationState);
            if (activationState.isProgrammatic) {
                requestAnimationFrame(function () { return _this.animateDeactivation_(state); });
                this.resetActivationState_();
            }
            else {
                this.deregisterDeactivationHandlers_();
                requestAnimationFrame(function () {
                    _this.activationState_.hasDeactivationUXRun = true;
                    _this.animateDeactivation_(state);
                    _this.resetActivationState_();
                });
            }
        };
        MDCRippleFoundation.prototype.animateDeactivation_ = function (_a) {
            var wasActivatedByPointer = _a.wasActivatedByPointer, wasElementMadeActive = _a.wasElementMadeActive;
            if (wasActivatedByPointer || wasElementMadeActive) {
                this.runDeactivationUXLogicIfReady_();
            }
        };
        MDCRippleFoundation.prototype.layoutInternal_ = function () {
            var _this = this;
            this.frame_ = this.adapter_.computeBoundingRect();
            var maxDim = Math.max(this.frame_.height, this.frame_.width);
            // Surface diameter is treated differently for unbounded vs. bounded ripples.
            // Unbounded ripple diameter is calculated smaller since the surface is expected to already be padded appropriately
            // to extend the hitbox, and the ripple is expected to meet the edges of the padded hitbox (which is typically
            // square). Bounded ripples, on the other hand, are fully expected to expand beyond the surface's longest diameter
            // (calculated based on the diagonal plus a constant padding), and are clipped at the surface's border via
            // `overflow: hidden`.
            var getBoundedRadius = function () {
                var hypotenuse = Math.sqrt(Math.pow(_this.frame_.width, 2) + Math.pow(_this.frame_.height, 2));
                return hypotenuse + MDCRippleFoundation.numbers.PADDING;
            };
            this.maxRadius_ = this.adapter_.isUnbounded() ? maxDim : getBoundedRadius();
            // Ripple is sized as a fraction of the largest dimension of the surface, then scales up using a CSS scale transform
            var initialSize = Math.floor(maxDim * MDCRippleFoundation.numbers.INITIAL_ORIGIN_SCALE);
            // Unbounded ripple size should always be even number to equally center align.
            if (this.adapter_.isUnbounded() && initialSize % 2 !== 0) {
                this.initialSize_ = initialSize - 1;
            }
            else {
                this.initialSize_ = initialSize;
            }
            this.fgScale_ = "" + this.maxRadius_ / this.initialSize_;
            this.updateLayoutCssVars_();
        };
        MDCRippleFoundation.prototype.updateLayoutCssVars_ = function () {
            var _a = MDCRippleFoundation.strings, VAR_FG_SIZE = _a.VAR_FG_SIZE, VAR_LEFT = _a.VAR_LEFT, VAR_TOP = _a.VAR_TOP, VAR_FG_SCALE = _a.VAR_FG_SCALE;
            this.adapter_.updateCssVariable(VAR_FG_SIZE, this.initialSize_ + "px");
            this.adapter_.updateCssVariable(VAR_FG_SCALE, this.fgScale_);
            if (this.adapter_.isUnbounded()) {
                this.unboundedCoords_ = {
                    left: Math.round((this.frame_.width / 2) - (this.initialSize_ / 2)),
                    top: Math.round((this.frame_.height / 2) - (this.initialSize_ / 2)),
                };
                this.adapter_.updateCssVariable(VAR_LEFT, this.unboundedCoords_.left + "px");
                this.adapter_.updateCssVariable(VAR_TOP, this.unboundedCoords_.top + "px");
            }
        };
        return MDCRippleFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCRipple = /** @class */ (function (_super) {
        __extends(MDCRipple, _super);
        function MDCRipple() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.disabled = false;
            return _this;
        }
        MDCRipple.attachTo = function (root, opts) {
            if (opts === void 0) { opts = { isUnbounded: undefined }; }
            var ripple = new MDCRipple(root);
            // Only override unbounded behavior if option is explicitly specified
            if (opts.isUnbounded !== undefined) {
                ripple.unbounded = opts.isUnbounded;
            }
            return ripple;
        };
        MDCRipple.createAdapter = function (instance) {
            return {
                addClass: function (className) { return instance.root_.classList.add(className); },
                browserSupportsCssVars: function () { return supportsCssVariables(window); },
                computeBoundingRect: function () { return instance.root_.getBoundingClientRect(); },
                containsEventTarget: function (target) { return instance.root_.contains(target); },
                deregisterDocumentInteractionHandler: function (evtType, handler) {
                    return document.documentElement.removeEventListener(evtType, handler, applyPassive());
                },
                deregisterInteractionHandler: function (evtType, handler) {
                    return instance.root_.removeEventListener(evtType, handler, applyPassive());
                },
                deregisterResizeHandler: function (handler) { return window.removeEventListener('resize', handler); },
                getWindowPageOffset: function () { return ({ x: window.pageXOffset, y: window.pageYOffset }); },
                isSurfaceActive: function () { return matches(instance.root_, ':active'); },
                isSurfaceDisabled: function () { return Boolean(instance.disabled); },
                isUnbounded: function () { return Boolean(instance.unbounded); },
                registerDocumentInteractionHandler: function (evtType, handler) {
                    return document.documentElement.addEventListener(evtType, handler, applyPassive());
                },
                registerInteractionHandler: function (evtType, handler) {
                    return instance.root_.addEventListener(evtType, handler, applyPassive());
                },
                registerResizeHandler: function (handler) { return window.addEventListener('resize', handler); },
                removeClass: function (className) { return instance.root_.classList.remove(className); },
                updateCssVariable: function (varName, value) { return instance.root_.style.setProperty(varName, value); },
            };
        };
        Object.defineProperty(MDCRipple.prototype, "unbounded", {
            get: function () {
                return Boolean(this.unbounded_);
            },
            set: function (unbounded) {
                this.unbounded_ = Boolean(unbounded);
                this.setUnbounded_();
            },
            enumerable: true,
            configurable: true
        });
        MDCRipple.prototype.activate = function () {
            this.foundation_.activate();
        };
        MDCRipple.prototype.deactivate = function () {
            this.foundation_.deactivate();
        };
        MDCRipple.prototype.layout = function () {
            this.foundation_.layout();
        };
        MDCRipple.prototype.getDefaultFoundation = function () {
            return new MDCRippleFoundation(MDCRipple.createAdapter(this));
        };
        MDCRipple.prototype.initialSyncWithDOM = function () {
            var root = this.root_;
            this.unbounded = 'mdcRippleIsUnbounded' in root.dataset;
        };
        /**
         * Closure Compiler throws an access control error when directly accessing a
         * protected or private property inside a getter/setter, like unbounded above.
         * By accessing the protected property inside a method, we solve that problem.
         * That's why this function exists.
         */
        MDCRipple.prototype.setUnbounded_ = function () {
            this.foundation_.setUnbounded(Boolean(this.unbounded_));
        };
        return MDCRipple;
    }(MDCComponent));

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$1 = {
        ANIM_CHECKED_INDETERMINATE: 'mdc-checkbox--anim-checked-indeterminate',
        ANIM_CHECKED_UNCHECKED: 'mdc-checkbox--anim-checked-unchecked',
        ANIM_INDETERMINATE_CHECKED: 'mdc-checkbox--anim-indeterminate-checked',
        ANIM_INDETERMINATE_UNCHECKED: 'mdc-checkbox--anim-indeterminate-unchecked',
        ANIM_UNCHECKED_CHECKED: 'mdc-checkbox--anim-unchecked-checked',
        ANIM_UNCHECKED_INDETERMINATE: 'mdc-checkbox--anim-unchecked-indeterminate',
        BACKGROUND: 'mdc-checkbox__background',
        CHECKED: 'mdc-checkbox--checked',
        CHECKMARK: 'mdc-checkbox__checkmark',
        CHECKMARK_PATH: 'mdc-checkbox__checkmark-path',
        DISABLED: 'mdc-checkbox--disabled',
        INDETERMINATE: 'mdc-checkbox--indeterminate',
        MIXEDMARK: 'mdc-checkbox__mixedmark',
        NATIVE_CONTROL: 'mdc-checkbox__native-control',
        ROOT: 'mdc-checkbox',
        SELECTED: 'mdc-checkbox--selected',
        UPGRADED: 'mdc-checkbox--upgraded',
    };
    var strings$1 = {
        ARIA_CHECKED_ATTR: 'aria-checked',
        ARIA_CHECKED_INDETERMINATE_VALUE: 'mixed',
        NATIVE_CONTROL_SELECTOR: '.mdc-checkbox__native-control',
        TRANSITION_STATE_CHECKED: 'checked',
        TRANSITION_STATE_INDETERMINATE: 'indeterminate',
        TRANSITION_STATE_INIT: 'init',
        TRANSITION_STATE_UNCHECKED: 'unchecked',
    };
    var numbers$1 = {
        ANIM_END_LATCH_MS: 250,
    };

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCCheckboxFoundation = /** @class */ (function (_super) {
        __extends(MDCCheckboxFoundation, _super);
        function MDCCheckboxFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCCheckboxFoundation.defaultAdapter, adapter)) || this;
            _this.currentCheckState_ = strings$1.TRANSITION_STATE_INIT;
            _this.currentAnimationClass_ = '';
            _this.animEndLatchTimer_ = 0;
            _this.enableAnimationEndHandler_ = false;
            return _this;
        }
        Object.defineProperty(MDCCheckboxFoundation, "cssClasses", {
            get: function () {
                return cssClasses$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCCheckboxFoundation, "strings", {
            get: function () {
                return strings$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCCheckboxFoundation, "numbers", {
            get: function () {
                return numbers$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCCheckboxFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClass: function () { return undefined; },
                    forceLayout: function () { return undefined; },
                    hasNativeControl: function () { return false; },
                    isAttachedToDOM: function () { return false; },
                    isChecked: function () { return false; },
                    isIndeterminate: function () { return false; },
                    removeClass: function () { return undefined; },
                    removeNativeControlAttr: function () { return undefined; },
                    setNativeControlAttr: function () { return undefined; },
                    setNativeControlDisabled: function () { return undefined; },
                };
            },
            enumerable: true,
            configurable: true
        });
        MDCCheckboxFoundation.prototype.init = function () {
            this.currentCheckState_ = this.determineCheckState_();
            this.updateAriaChecked_();
            this.adapter_.addClass(cssClasses$1.UPGRADED);
        };
        MDCCheckboxFoundation.prototype.destroy = function () {
            clearTimeout(this.animEndLatchTimer_);
        };
        MDCCheckboxFoundation.prototype.setDisabled = function (disabled) {
            this.adapter_.setNativeControlDisabled(disabled);
            if (disabled) {
                this.adapter_.addClass(cssClasses$1.DISABLED);
            }
            else {
                this.adapter_.removeClass(cssClasses$1.DISABLED);
            }
        };
        /**
         * Handles the animationend event for the checkbox
         */
        MDCCheckboxFoundation.prototype.handleAnimationEnd = function () {
            var _this = this;
            if (!this.enableAnimationEndHandler_) {
                return;
            }
            clearTimeout(this.animEndLatchTimer_);
            this.animEndLatchTimer_ = setTimeout(function () {
                _this.adapter_.removeClass(_this.currentAnimationClass_);
                _this.enableAnimationEndHandler_ = false;
            }, numbers$1.ANIM_END_LATCH_MS);
        };
        /**
         * Handles the change event for the checkbox
         */
        MDCCheckboxFoundation.prototype.handleChange = function () {
            this.transitionCheckState_();
        };
        MDCCheckboxFoundation.prototype.transitionCheckState_ = function () {
            if (!this.adapter_.hasNativeControl()) {
                return;
            }
            var oldState = this.currentCheckState_;
            var newState = this.determineCheckState_();
            if (oldState === newState) {
                return;
            }
            this.updateAriaChecked_();
            var TRANSITION_STATE_UNCHECKED = strings$1.TRANSITION_STATE_UNCHECKED;
            var SELECTED = cssClasses$1.SELECTED;
            if (newState === TRANSITION_STATE_UNCHECKED) {
                this.adapter_.removeClass(SELECTED);
            }
            else {
                this.adapter_.addClass(SELECTED);
            }
            // Check to ensure that there isn't a previously existing animation class, in case for example
            // the user interacted with the checkbox before the animation was finished.
            if (this.currentAnimationClass_.length > 0) {
                clearTimeout(this.animEndLatchTimer_);
                this.adapter_.forceLayout();
                this.adapter_.removeClass(this.currentAnimationClass_);
            }
            this.currentAnimationClass_ = this.getTransitionAnimationClass_(oldState, newState);
            this.currentCheckState_ = newState;
            // Check for parentNode so that animations are only run when the element is attached
            // to the DOM.
            if (this.adapter_.isAttachedToDOM() && this.currentAnimationClass_.length > 0) {
                this.adapter_.addClass(this.currentAnimationClass_);
                this.enableAnimationEndHandler_ = true;
            }
        };
        MDCCheckboxFoundation.prototype.determineCheckState_ = function () {
            var TRANSITION_STATE_INDETERMINATE = strings$1.TRANSITION_STATE_INDETERMINATE, TRANSITION_STATE_CHECKED = strings$1.TRANSITION_STATE_CHECKED, TRANSITION_STATE_UNCHECKED = strings$1.TRANSITION_STATE_UNCHECKED;
            if (this.adapter_.isIndeterminate()) {
                return TRANSITION_STATE_INDETERMINATE;
            }
            return this.adapter_.isChecked() ? TRANSITION_STATE_CHECKED : TRANSITION_STATE_UNCHECKED;
        };
        MDCCheckboxFoundation.prototype.getTransitionAnimationClass_ = function (oldState, newState) {
            var TRANSITION_STATE_INIT = strings$1.TRANSITION_STATE_INIT, TRANSITION_STATE_CHECKED = strings$1.TRANSITION_STATE_CHECKED, TRANSITION_STATE_UNCHECKED = strings$1.TRANSITION_STATE_UNCHECKED;
            var _a = MDCCheckboxFoundation.cssClasses, ANIM_UNCHECKED_CHECKED = _a.ANIM_UNCHECKED_CHECKED, ANIM_UNCHECKED_INDETERMINATE = _a.ANIM_UNCHECKED_INDETERMINATE, ANIM_CHECKED_UNCHECKED = _a.ANIM_CHECKED_UNCHECKED, ANIM_CHECKED_INDETERMINATE = _a.ANIM_CHECKED_INDETERMINATE, ANIM_INDETERMINATE_CHECKED = _a.ANIM_INDETERMINATE_CHECKED, ANIM_INDETERMINATE_UNCHECKED = _a.ANIM_INDETERMINATE_UNCHECKED;
            switch (oldState) {
                case TRANSITION_STATE_INIT:
                    if (newState === TRANSITION_STATE_UNCHECKED) {
                        return '';
                    }
                    return newState === TRANSITION_STATE_CHECKED ? ANIM_INDETERMINATE_CHECKED : ANIM_INDETERMINATE_UNCHECKED;
                case TRANSITION_STATE_UNCHECKED:
                    return newState === TRANSITION_STATE_CHECKED ? ANIM_UNCHECKED_CHECKED : ANIM_UNCHECKED_INDETERMINATE;
                case TRANSITION_STATE_CHECKED:
                    return newState === TRANSITION_STATE_UNCHECKED ? ANIM_CHECKED_UNCHECKED : ANIM_CHECKED_INDETERMINATE;
                default: // TRANSITION_STATE_INDETERMINATE
                    return newState === TRANSITION_STATE_CHECKED ? ANIM_INDETERMINATE_CHECKED : ANIM_INDETERMINATE_UNCHECKED;
            }
        };
        MDCCheckboxFoundation.prototype.updateAriaChecked_ = function () {
            // Ensure aria-checked is set to mixed if checkbox is in indeterminate state.
            if (this.adapter_.isIndeterminate()) {
                this.adapter_.setNativeControlAttr(strings$1.ARIA_CHECKED_ATTR, strings$1.ARIA_CHECKED_INDETERMINATE_VALUE);
            }
            else {
                // The on/off state does not need to keep track of aria-checked, since
                // the screenreader uses the checked property on the checkbox element.
                this.adapter_.removeNativeControlAttr(strings$1.ARIA_CHECKED_ATTR);
            }
        };
        return MDCCheckboxFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var CB_PROTO_PROPS = ['checked', 'indeterminate'];
    var MDCCheckbox = /** @class */ (function (_super) {
        __extends(MDCCheckbox, _super);
        function MDCCheckbox() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.ripple_ = _this.createRipple_();
            return _this;
        }
        MDCCheckbox.attachTo = function (root) {
            return new MDCCheckbox(root);
        };
        Object.defineProperty(MDCCheckbox.prototype, "ripple", {
            get: function () {
                return this.ripple_;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCCheckbox.prototype, "checked", {
            get: function () {
                return this.nativeControl_.checked;
            },
            set: function (checked) {
                this.nativeControl_.checked = checked;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCCheckbox.prototype, "indeterminate", {
            get: function () {
                return this.nativeControl_.indeterminate;
            },
            set: function (indeterminate) {
                this.nativeControl_.indeterminate = indeterminate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCCheckbox.prototype, "disabled", {
            get: function () {
                return this.nativeControl_.disabled;
            },
            set: function (disabled) {
                this.foundation_.setDisabled(disabled);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCCheckbox.prototype, "value", {
            get: function () {
                return this.nativeControl_.value;
            },
            set: function (value) {
                this.nativeControl_.value = value;
            },
            enumerable: true,
            configurable: true
        });
        MDCCheckbox.prototype.initialSyncWithDOM = function () {
            var _this = this;
            this.handleChange_ = function () { return _this.foundation_.handleChange(); };
            this.handleAnimationEnd_ = function () { return _this.foundation_.handleAnimationEnd(); };
            this.nativeControl_.addEventListener('change', this.handleChange_);
            this.listen(getCorrectEventName(window, 'animationend'), this.handleAnimationEnd_);
            this.installPropertyChangeHooks_();
        };
        MDCCheckbox.prototype.destroy = function () {
            this.ripple_.destroy();
            this.nativeControl_.removeEventListener('change', this.handleChange_);
            this.unlisten(getCorrectEventName(window, 'animationend'), this.handleAnimationEnd_);
            this.uninstallPropertyChangeHooks_();
            _super.prototype.destroy.call(this);
        };
        MDCCheckbox.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            var adapter = {
                addClass: function (className) { return _this.root_.classList.add(className); },
                forceLayout: function () { return _this.root_.offsetWidth; },
                hasNativeControl: function () { return !!_this.nativeControl_; },
                isAttachedToDOM: function () { return Boolean(_this.root_.parentNode); },
                isChecked: function () { return _this.checked; },
                isIndeterminate: function () { return _this.indeterminate; },
                removeClass: function (className) { return _this.root_.classList.remove(className); },
                removeNativeControlAttr: function (attr) { return _this.nativeControl_.removeAttribute(attr); },
                setNativeControlAttr: function (attr, value) { return _this.nativeControl_.setAttribute(attr, value); },
                setNativeControlDisabled: function (disabled) { return _this.nativeControl_.disabled = disabled; },
            };
            return new MDCCheckboxFoundation(adapter);
        };
        MDCCheckbox.prototype.createRipple_ = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            var adapter = __assign({}, MDCRipple.createAdapter(this), { deregisterInteractionHandler: function (evtType, handler) { return _this.nativeControl_.removeEventListener(evtType, handler, applyPassive()); }, isSurfaceActive: function () { return matches(_this.nativeControl_, ':active'); }, isUnbounded: function () { return true; }, registerInteractionHandler: function (evtType, handler) { return _this.nativeControl_.addEventListener(evtType, handler, applyPassive()); } });
            return new MDCRipple(this.root_, new MDCRippleFoundation(adapter));
        };
        MDCCheckbox.prototype.installPropertyChangeHooks_ = function () {
            var _this = this;
            var nativeCb = this.nativeControl_;
            var cbProto = Object.getPrototypeOf(nativeCb);
            CB_PROTO_PROPS.forEach(function (controlState) {
                var desc = Object.getOwnPropertyDescriptor(cbProto, controlState);
                // We have to check for this descriptor, since some browsers (Safari) don't support its return.
                // See: https://bugs.webkit.org/show_bug.cgi?id=49739
                if (!validDescriptor(desc)) {
                    return;
                }
                // Type cast is needed for compatibility with Closure Compiler.
                var nativeGetter = desc.get;
                var nativeCbDesc = {
                    configurable: desc.configurable,
                    enumerable: desc.enumerable,
                    get: nativeGetter,
                    set: function (state) {
                        desc.set.call(nativeCb, state);
                        _this.foundation_.handleChange();
                    },
                };
                Object.defineProperty(nativeCb, controlState, nativeCbDesc);
            });
        };
        MDCCheckbox.prototype.uninstallPropertyChangeHooks_ = function () {
            var nativeCb = this.nativeControl_;
            var cbProto = Object.getPrototypeOf(nativeCb);
            CB_PROTO_PROPS.forEach(function (controlState) {
                var desc = Object.getOwnPropertyDescriptor(cbProto, controlState);
                if (!validDescriptor(desc)) {
                    return;
                }
                Object.defineProperty(nativeCb, controlState, desc);
            });
        };
        Object.defineProperty(MDCCheckbox.prototype, "nativeControl_", {
            get: function () {
                var NATIVE_CONTROL_SELECTOR = MDCCheckboxFoundation.strings.NATIVE_CONTROL_SELECTOR;
                var el = this.root_.querySelector(NATIVE_CONTROL_SELECTOR);
                if (!el) {
                    throw new Error("Checkbox component requires a " + NATIVE_CONTROL_SELECTOR + " element");
                }
                return el;
            },
            enumerable: true,
            configurable: true
        });
        return MDCCheckbox;
    }(MDCComponent));
    function validDescriptor(inputPropDesc) {
        return !!inputPropDesc && typeof inputPropDesc.set === 'function';
    }

    /**
     * @license
     * Copyright 2019 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$2 = {
        CELL: 'mdc-data-table__cell',
        CELL_NUMERIC: 'mdc-data-table__cell--numeric',
        CONTENT: 'mdc-data-table__content',
        HEADER_ROW: 'mdc-data-table__header-row',
        HEADER_ROW_CHECKBOX: 'mdc-data-table__header-row-checkbox',
        ROOT: 'mdc-data-table',
        ROW: 'mdc-data-table__row',
        ROW_CHECKBOX: 'mdc-data-table__row-checkbox',
        ROW_SELECTED: 'mdc-data-table__row--selected',
    };
    var strings$2 = {
        ARIA_SELECTED: 'aria-selected',
        DATA_ROW_ID_ATTR: 'data-row-id',
        HEADER_ROW_CHECKBOX_SELECTOR: "." + cssClasses$2.HEADER_ROW_CHECKBOX,
        ROW_CHECKBOX_SELECTOR: "." + cssClasses$2.ROW_CHECKBOX,
        ROW_SELECTED_SELECTOR: "." + cssClasses$2.ROW_SELECTED,
        ROW_SELECTOR: "." + cssClasses$2.ROW,
    };
    var events = {
        ROW_SELECTION_CHANGED: 'MDCDataTable:rowSelectionChanged',
        SELECTED_ALL: 'MDCDataTable:selectedAll',
        UNSELECTED_ALL: 'MDCDataTable:unselectedAll',
    };

    /**
     * @license
     * Copyright 2019 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCDataTableFoundation = /** @class */ (function (_super) {
        __extends(MDCDataTableFoundation, _super);
        function MDCDataTableFoundation(adapter) {
            return _super.call(this, __assign({}, MDCDataTableFoundation.defaultAdapter, adapter)) || this;
        }
        Object.defineProperty(MDCDataTableFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClassAtRowIndex: function () { return undefined; },
                    getRowCount: function () { return 0; },
                    getRowElements: function () { return []; },
                    getRowIdAtIndex: function () { return ''; },
                    getRowIndexByChildElement: function () { return 0; },
                    getSelectedRowCount: function () { return 0; },
                    isCheckboxAtRowIndexChecked: function () { return false; },
                    isHeaderRowCheckboxChecked: function () { return false; },
                    isRowsSelectable: function () { return false; },
                    notifyRowSelectionChanged: function () { return undefined; },
                    notifySelectedAll: function () { return undefined; },
                    notifyUnselectedAll: function () { return undefined; },
                    registerHeaderRowCheckbox: function () { return undefined; },
                    registerRowCheckboxes: function () { return undefined; },
                    removeClassAtRowIndex: function () { return undefined; },
                    setAttributeAtRowIndex: function () { return undefined; },
                    setHeaderRowCheckboxChecked: function () { return undefined; },
                    setHeaderRowCheckboxIndeterminate: function () { return undefined; },
                    setRowCheckboxCheckedAtIndex: function () { return undefined; },
                };
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Re-initializes header row checkbox and row checkboxes when selectable rows are added or removed from table.
         * Use this if registering checkbox is synchronous.
         */
        MDCDataTableFoundation.prototype.layout = function () {
            if (this.adapter_.isRowsSelectable()) {
                this.adapter_.registerHeaderRowCheckbox();
                this.adapter_.registerRowCheckboxes();
                this.setHeaderRowCheckboxState_();
            }
        };
        /**
         * Re-initializes header row checkbox and row checkboxes when selectable rows are added or removed from table.
         * Use this if registering checkbox is asynchronous.
         */
        MDCDataTableFoundation.prototype.layoutAsync = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.adapter_.isRowsSelectable()) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.adapter_.registerHeaderRowCheckbox()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.adapter_.registerRowCheckboxes()];
                        case 2:
                            _a.sent();
                            this.setHeaderRowCheckboxState_();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * @return Returns array of row elements.
         */
        MDCDataTableFoundation.prototype.getRows = function () {
            return this.adapter_.getRowElements();
        };
        /**
         * Sets selected row ids. Overwrites previously selected rows.
         * @param rowIds Array of row ids that needs to be selected.
         */
        MDCDataTableFoundation.prototype.setSelectedRowIds = function (rowIds) {
            for (var rowIndex = 0; rowIndex < this.adapter_.getRowCount(); rowIndex++) {
                var rowId = this.adapter_.getRowIdAtIndex(rowIndex);
                var isSelected = false;
                if (rowId && rowIds.indexOf(rowId) >= 0) {
                    isSelected = true;
                }
                this.adapter_.setRowCheckboxCheckedAtIndex(rowIndex, isSelected);
                this.selectRowAtIndex_(rowIndex, isSelected);
            }
            this.setHeaderRowCheckboxState_();
        };
        /**
         * @return Returns array of selected row ids.
         */
        MDCDataTableFoundation.prototype.getSelectedRowIds = function () {
            var selectedRowIds = [];
            for (var rowIndex = 0; rowIndex < this.adapter_.getRowCount(); rowIndex++) {
                if (this.adapter_.isCheckboxAtRowIndexChecked(rowIndex)) {
                    selectedRowIds.push(this.adapter_.getRowIdAtIndex(rowIndex));
                }
            }
            return selectedRowIds;
        };
        /**
         * Handles header row checkbox change event.
         */
        MDCDataTableFoundation.prototype.handleHeaderRowCheckboxChange = function () {
            var isHeaderChecked = this.adapter_.isHeaderRowCheckboxChecked();
            for (var rowIndex = 0; rowIndex < this.adapter_.getRowCount(); rowIndex++) {
                this.adapter_.setRowCheckboxCheckedAtIndex(rowIndex, isHeaderChecked);
                this.selectRowAtIndex_(rowIndex, isHeaderChecked);
            }
            if (isHeaderChecked) {
                this.adapter_.notifySelectedAll();
            }
            else {
                this.adapter_.notifyUnselectedAll();
            }
        };
        /**
         * Handles change event originated from row checkboxes.
         */
        MDCDataTableFoundation.prototype.handleRowCheckboxChange = function (event) {
            var rowIndex = this.adapter_.getRowIndexByChildElement(event.target);
            if (rowIndex === -1) {
                return;
            }
            var selected = this.adapter_.isCheckboxAtRowIndexChecked(rowIndex);
            this.selectRowAtIndex_(rowIndex, selected);
            this.setHeaderRowCheckboxState_();
            var rowId = this.adapter_.getRowIdAtIndex(rowIndex);
            this.adapter_.notifyRowSelectionChanged({ rowId: rowId, rowIndex: rowIndex, selected: selected });
        };
        /**
         * Updates header row checkbox state based on number of rows selected.
         */
        MDCDataTableFoundation.prototype.setHeaderRowCheckboxState_ = function () {
            if (this.adapter_.getSelectedRowCount() === this.adapter_.getRowCount()) {
                this.adapter_.setHeaderRowCheckboxChecked(true);
                this.adapter_.setHeaderRowCheckboxIndeterminate(false);
            }
            else if (this.adapter_.getSelectedRowCount() === 0) {
                this.adapter_.setHeaderRowCheckboxIndeterminate(false);
                this.adapter_.setHeaderRowCheckboxChecked(false);
            }
            else {
                this.adapter_.setHeaderRowCheckboxIndeterminate(true);
                this.adapter_.setHeaderRowCheckboxChecked(false);
            }
        };
        /**
         * Sets the attributes of row element based on selection state.
         */
        MDCDataTableFoundation.prototype.selectRowAtIndex_ = function (rowIndex, selected) {
            if (selected) {
                this.adapter_.addClassAtRowIndex(rowIndex, cssClasses$2.ROW_SELECTED);
                this.adapter_.setAttributeAtRowIndex(rowIndex, strings$2.ARIA_SELECTED, 'true');
            }
            else {
                this.adapter_.removeClassAtRowIndex(rowIndex, cssClasses$2.ROW_SELECTED);
                this.adapter_.setAttributeAtRowIndex(rowIndex, strings$2.ARIA_SELECTED, 'false');
            }
        };
        return MDCDataTableFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2019 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCDataTable = /** @class */ (function (_super) {
        __extends(MDCDataTable, _super);
        function MDCDataTable() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCDataTable.attachTo = function (root) {
            return new MDCDataTable(root);
        };
        MDCDataTable.prototype.initialize = function (checkboxFactory) {
            if (checkboxFactory === void 0) { checkboxFactory = function (el) { return new MDCCheckbox(el); }; }
            this.checkboxFactory_ = checkboxFactory;
        };
        MDCDataTable.prototype.initialSyncWithDOM = function () {
            var _this = this;
            this.headerRow_ = this.root_.querySelector("." + cssClasses$2.HEADER_ROW);
            this.handleHeaderRowCheckboxChange_ = function () { return _this.foundation_.handleHeaderRowCheckboxChange(); };
            this.headerRow_.addEventListener('change', this.handleHeaderRowCheckboxChange_);
            this.content_ = this.root_.querySelector("." + cssClasses$2.CONTENT);
            this.handleRowCheckboxChange_ = function (event) { return _this.foundation_.handleRowCheckboxChange(event); };
            this.content_.addEventListener('change', this.handleRowCheckboxChange_);
            this.layout();
        };
        /**
         * Re-initializes header row checkbox and row checkboxes when selectable rows are added or removed from table.
         */
        MDCDataTable.prototype.layout = function () {
            this.foundation_.layout();
        };
        /**
         * @return Returns array of row elements.
         */
        MDCDataTable.prototype.getRows = function () {
            return this.foundation_.getRows();
        };
        /**
         * @return Returns array of selected row ids.
         */
        MDCDataTable.prototype.getSelectedRowIds = function () {
            return this.foundation_.getSelectedRowIds();
        };
        /**
         * Sets selected row ids. Overwrites previously selected rows.
         * @param rowIds Array of row ids that needs to be selected.
         */
        MDCDataTable.prototype.setSelectedRowIds = function (rowIds) {
            this.foundation_.setSelectedRowIds(rowIds);
        };
        MDCDataTable.prototype.destroy = function () {
            this.headerRow_.removeEventListener('change', this.handleHeaderRowCheckboxChange_);
            this.content_.removeEventListener('change', this.handleRowCheckboxChange_);
            this.headerRowCheckbox_.destroy();
            this.rowCheckboxList_.forEach(function (checkbox) { return checkbox.destroy(); });
        };
        MDCDataTable.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            var adapter = {
                addClassAtRowIndex: function (rowIndex, className) { return _this.getRows()[rowIndex].classList.add(className); },
                getRowCount: function () { return _this.getRows().length; },
                getRowElements: function () { return [].slice.call(_this.root_.querySelectorAll(strings$2.ROW_SELECTOR)); },
                getRowIdAtIndex: function (rowIndex) { return _this.getRows()[rowIndex].getAttribute(strings$2.DATA_ROW_ID_ATTR); },
                getRowIndexByChildElement: function (el) {
                    return _this.getRows().indexOf(closest(el, strings$2.ROW_SELECTOR));
                },
                getSelectedRowCount: function () { return _this.root_.querySelectorAll(strings$2.ROW_SELECTED_SELECTOR).length; },
                isCheckboxAtRowIndexChecked: function (rowIndex) { return _this.rowCheckboxList_[rowIndex].checked; },
                isHeaderRowCheckboxChecked: function () { return _this.headerRowCheckbox_.checked; },
                isRowsSelectable: function () { return !!_this.root_.querySelector(strings$2.ROW_CHECKBOX_SELECTOR); },
                notifyRowSelectionChanged: function (data) {
                    _this.emit(events.ROW_SELECTION_CHANGED, {
                        row: _this.getRowByIndex_(data.rowIndex),
                        rowId: _this.getRowIdByIndex_(data.rowIndex),
                        rowIndex: data.rowIndex,
                        selected: data.selected,
                    }, 
                    /** shouldBubble */ true);
                },
                notifySelectedAll: function () { return _this.emit(events.SELECTED_ALL, {}, /** shouldBubble */ true); },
                notifyUnselectedAll: function () { return _this.emit(events.UNSELECTED_ALL, {}, /** shouldBubble */ true); },
                registerHeaderRowCheckbox: function () {
                    if (_this.headerRowCheckbox_) {
                        _this.headerRowCheckbox_.destroy();
                    }
                    var checkboxEl = _this.root_.querySelector(strings$2.HEADER_ROW_CHECKBOX_SELECTOR);
                    _this.headerRowCheckbox_ = _this.checkboxFactory_(checkboxEl);
                },
                registerRowCheckboxes: function () {
                    if (_this.rowCheckboxList_) {
                        _this.rowCheckboxList_.forEach(function (checkbox) { return checkbox.destroy(); });
                    }
                    _this.rowCheckboxList_ = [];
                    _this.getRows().forEach(function (rowEl) {
                        var checkbox = _this.checkboxFactory_(rowEl.querySelector(strings$2.ROW_CHECKBOX_SELECTOR));
                        _this.rowCheckboxList_.push(checkbox);
                    });
                },
                removeClassAtRowIndex: function (rowIndex, className) {
                    _this.getRows()[rowIndex].classList.remove(className);
                },
                setAttributeAtRowIndex: function (rowIndex, attr, value) {
                    _this.getRows()[rowIndex].setAttribute(attr, value);
                },
                setHeaderRowCheckboxChecked: function (checked) {
                    _this.headerRowCheckbox_.checked = checked;
                },
                setHeaderRowCheckboxIndeterminate: function (indeterminate) {
                    _this.headerRowCheckbox_.indeterminate = indeterminate;
                },
                setRowCheckboxCheckedAtIndex: function (rowIndex, checked) {
                    _this.rowCheckboxList_[rowIndex].checked = checked;
                },
            };
            return new MDCDataTableFoundation(adapter);
        };
        MDCDataTable.prototype.getRowByIndex_ = function (index) {
            return this.getRows()[index];
        };
        MDCDataTable.prototype.getRowIdByIndex_ = function (index) {
            return this.getRowByIndex_(index).getAttribute(strings$2.DATA_ROW_ID_ATTR);
        };
        return MDCDataTable;
    }(MDCComponent));

    function forwardEventsBuilder(component, additionalEvents = []) {
      const events = [
        'focus', 'blur',
        'fullscreenchange', 'fullscreenerror', 'scroll',
        'cut', 'copy', 'paste',
        'keydown', 'keypress', 'keyup',
        'auxclick', 'click', 'contextmenu', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseover', 'mouseout', 'mouseup', 'pointerlockchange', 'pointerlockerror', 'select', 'wheel',
        'drag', 'dragend', 'dragenter', 'dragstart', 'dragleave', 'dragover', 'drop',
        'touchcancel', 'touchend', 'touchmove', 'touchstart',
        'pointerover', 'pointerenter', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'pointerout', 'pointerleave', 'gotpointercapture', 'lostpointercapture',
        ...additionalEvents
      ];

      function forward(e) {
        bubble(component, e);
      }

      return node => {
        const destructors = [];

        for (let i = 0; i < events.length; i++) {
          destructors.push(listen(node, events[i], forward));
        }

        return {
          destroy: () => {
            for (let i = 0; i < destructors.length; i++) {
              destructors[i]();
            }
          }
        }
      };
    }

    function exclude(obj, keys) {
      let names = Object.getOwnPropertyNames(obj);
      const newObj = {};

      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const cashIndex = name.indexOf('$');
        if (cashIndex !== -1 && keys.indexOf(name.substring(0, cashIndex + 1)) !== -1) {
          continue;
        }
        if (keys.indexOf(name) !== -1) {
          continue;
        }
        newObj[name] = obj[name];
      }

      return newObj;
    }

    function prefixFilter(obj, prefix) {
      let names = Object.getOwnPropertyNames(obj);
      const newObj = {};

      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        if (name.substring(0, prefix.length) === prefix) {
          newObj[name.substring(prefix.length)] = obj[name];
        }
      }

      return newObj;
    }

    function useActions(node, actions) {
      let objects = [];

      if (actions) {
        for (let i = 0; i < actions.length; i++) {
          const isArray = Array.isArray(actions[i]);
          const action = isArray ? actions[i][0] : actions[i];
          if (isArray && actions[i].length > 1) {
            objects.push(action(node, actions[i][1]));
          } else {
            objects.push(action(node));
          }
        }
      }

      return {
        update(actions) {
          if ((actions && actions.length || 0) != objects.length) {
            throw new Error('You must not change the length of an actions array.');
          }

          if (actions) {
            for (let i = 0; i < actions.length; i++) {
              if (objects[i] && 'update' in objects[i]) {
                const isArray = Array.isArray(actions[i]);
                if (isArray && actions[i].length > 1) {
                  objects[i].update(actions[i][1]);
                } else {
                  objects[i].update();
                }
              }
            }
          }
        },

        destroy() {
          for (let i = 0; i < objects.length; i++) {
            if (objects[i] && 'destroy' in objects[i]) {
              objects[i].destroy();
            }
          }
        }
      }
    }

    /* node_modules\@smui\data-table\DataTable.svelte generated by Svelte v3.31.2 */

    const { Error: Error_1$1 } = globals;
    const file$2 = "node_modules\\@smui\\data-table\\DataTable.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let table;
    	let table_class_value;
    	let useActions_action;
    	let div_class_value;
    	let useActions_action_1;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	let table_levels = [
    		{
    			class: table_class_value = "mdc-data-table__table " + /*table$class*/ ctx[3]
    		},
    		prefixFilter(/*$$props*/ ctx[7], "table$")
    	];

    	let table_data = {};

    	for (let i = 0; i < table_levels.length; i += 1) {
    		table_data = assign(table_data, table_levels[i]);
    	}

    	let div_levels = [
    		{
    			class: div_class_value = "mdc-data-table " + /*className*/ ctx[1]
    		},
    		exclude(/*$$props*/ ctx[7], ["use", "class", "table$"])
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			table = element("table");
    			if (default_slot) default_slot.c();
    			set_attributes(table, table_data);
    			add_location(table, file$2, 10, 2, 308);
    			set_attributes(div, div_data);
    			add_location(div, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, table);

    			if (default_slot) {
    				default_slot.m(table, null);
    			}

    			/*div_binding*/ ctx[14](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, table, /*table$use*/ ctx[2])),
    					action_destroyer(useActions_action_1 = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[5].call(null, div)),
    					listen_dev(div, "MDCDataTable:rowSelectionChanged", /*handleChange*/ ctx[6], false, false, false),
    					listen_dev(div, "MDCDataTable:selectedAll", /*handleChange*/ ctx[6], false, false, false),
    					listen_dev(div, "MDCDataTable:unselectedAll", /*handleChange*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}

    			set_attributes(table, table_data = get_spread_update(table_levels, [
    				(!current || dirty & /*table$class*/ 8 && table_class_value !== (table_class_value = "mdc-data-table__table " + /*table$class*/ ctx[3])) && { class: table_class_value },
    				dirty & /*$$props*/ 128 && prefixFilter(/*$$props*/ ctx[7], "table$")
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*table$use*/ 4) useActions_action.update.call(null, /*table$use*/ ctx[2]);

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*className*/ 2 && div_class_value !== (div_class_value = "mdc-data-table " + /*className*/ ctx[1])) && { class: div_class_value },
    				dirty & /*$$props*/ 128 && exclude(/*$$props*/ ctx[7], ["use", "class", "table$"])
    			]));

    			if (useActions_action_1 && is_function(useActions_action_1.update) && dirty & /*use*/ 1) useActions_action_1.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[14](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DataTable", slots, ['default']);

    	if (events.ROW_SELECTION_CHANGED !== "MDCDataTable:rowSelectionChanged" || events.SELECTED_ALL !== "MDCDataTable:selectedAll" || events.UNSELECTED_ALL !== "MDCDataTable:unselectedAll") {
    		throw new Error("MDC API has changed!");
    	}

    	const forwardEvents = forwardEventsBuilder(get_current_component(), [
    		"MDCDataTable:rowSelectionChanged",
    		"MDCDataTable:selectedAll",
    		"MDCDataTable:unselectedAll"
    	]);

    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { table$use = [] } = $$props;
    	let { table$class = "" } = $$props;
    	let element;
    	let dataTable;
    	let changeHandlers = [];
    	let checkBoxHeaderPromiseResolve;
    	let checkBoxHeaderPromise = new Promise(resolve => checkBoxHeaderPromiseResolve = resolve);
    	let checkBoxListPromiseResolve;
    	let checkBoxListPromise = new Promise(resolve => checkBoxListPromiseResolve = resolve);
    	let addLayoutListener = getContext("SMUI:addLayoutListener");
    	let removeLayoutListener;
    	setContext("SMUI:generic:input:addChangeHandler", addChangeHandler);
    	setContext("SMUI:checkbox:context", "data-table");
    	setContext("SMUI:checkbox:instantiate", false);
    	setContext("SMUI:checkbox:getInstance", getCheckboxInstancePromise);

    	if (addLayoutListener) {
    		removeLayoutListener = addLayoutListener(layout);
    	}

    	onMount(async () => {
    		dataTable = new MDCDataTable(element);
    		checkBoxHeaderPromiseResolve(dataTable.headerRowCheckbox_);
    		checkBoxListPromiseResolve(dataTable.rowCheckboxList_);

    		// Workaround for a bug in MDC DataTable where a table with no checkboxes
    		// calls destroy on them anyway.
    		if (!dataTable.headerRowCheckbox_) {
    			dataTable.headerRowCheckbox_ = {
    				destroy() {
    					
    				}
    			};
    		}

    		if (!dataTable.rowCheckboxList_) {
    			dataTable.rowCheckboxList_ = [];
    		}
    	});

    	onDestroy(() => {
    		dataTable && dataTable.destroy();

    		if (removeLayoutListener) {
    			removeLayoutListener();
    		}
    	});

    	function getCheckboxInstancePromise(header) {
    		return header ? checkBoxHeaderPromise : checkBoxListPromise;
    	}

    	function handleChange() {
    		for (let i = 0; i < changeHandlers.length; i++) {
    			changeHandlers[i]();
    		}
    	}

    	function addChangeHandler(handler) {
    		changeHandlers.push(handler);
    	}

    	function layout(...args) {
    		return dataTable.layout(...args);
    	}

    	function getRows(...args) {
    		return dataTable.getRows(...args);
    	}

    	function getSelectedRowIds(...args) {
    		return dataTable.getSelectedRowIds(...args);
    	}

    	function setSelectedRowIds(...args) {
    		return dataTable.setSelectedRowIds(...args);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(4, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("table$use" in $$new_props) $$invalidate(2, table$use = $$new_props.table$use);
    		if ("table$class" in $$new_props) $$invalidate(3, table$class = $$new_props.table$class);
    		if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCDataTable,
    		events,
    		onMount,
    		onDestroy,
    		getContext,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		prefixFilter,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		table$use,
    		table$class,
    		element,
    		dataTable,
    		changeHandlers,
    		checkBoxHeaderPromiseResolve,
    		checkBoxHeaderPromise,
    		checkBoxListPromiseResolve,
    		checkBoxListPromise,
    		addLayoutListener,
    		removeLayoutListener,
    		getCheckboxInstancePromise,
    		handleChange,
    		addChangeHandler,
    		layout,
    		getRows,
    		getSelectedRowIds,
    		setSelectedRowIds
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("table$use" in $$props) $$invalidate(2, table$use = $$new_props.table$use);
    		if ("table$class" in $$props) $$invalidate(3, table$class = $$new_props.table$class);
    		if ("element" in $$props) $$invalidate(4, element = $$new_props.element);
    		if ("dataTable" in $$props) dataTable = $$new_props.dataTable;
    		if ("changeHandlers" in $$props) changeHandlers = $$new_props.changeHandlers;
    		if ("checkBoxHeaderPromiseResolve" in $$props) checkBoxHeaderPromiseResolve = $$new_props.checkBoxHeaderPromiseResolve;
    		if ("checkBoxHeaderPromise" in $$props) checkBoxHeaderPromise = $$new_props.checkBoxHeaderPromise;
    		if ("checkBoxListPromiseResolve" in $$props) checkBoxListPromiseResolve = $$new_props.checkBoxListPromiseResolve;
    		if ("checkBoxListPromise" in $$props) checkBoxListPromise = $$new_props.checkBoxListPromise;
    		if ("addLayoutListener" in $$props) addLayoutListener = $$new_props.addLayoutListener;
    		if ("removeLayoutListener" in $$props) removeLayoutListener = $$new_props.removeLayoutListener;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		table$use,
    		table$class,
    		element,
    		forwardEvents,
    		handleChange,
    		$$props,
    		layout,
    		getRows,
    		getSelectedRowIds,
    		setSelectedRowIds,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class DataTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			use: 0,
    			class: 1,
    			table$use: 2,
    			table$class: 3,
    			layout: 8,
    			getRows: 9,
    			getSelectedRowIds: 10,
    			setSelectedRowIds: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DataTable",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get use() {
    		throw new Error_1$1("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error_1$1("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error_1$1("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error_1$1("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get table$use() {
    		throw new Error_1$1("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set table$use(value) {
    		throw new Error_1$1("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get table$class() {
    		throw new Error_1$1("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set table$class(value) {
    		throw new Error_1$1("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		return this.$$.ctx[8];
    	}

    	set layout(value) {
    		throw new Error_1$1("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getRows() {
    		return this.$$.ctx[9];
    	}

    	set getRows(value) {
    		throw new Error_1$1("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSelectedRowIds() {
    		return this.$$.ctx[10];
    	}

    	set getSelectedRowIds(value) {
    		throw new Error_1$1("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setSelectedRowIds() {
    		return this.$$.ctx[11];
    	}

    	set setSelectedRowIds(value) {
    		throw new Error_1$1("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\data-table\Head.svelte generated by Svelte v3.31.2 */
    const file$3 = "node_modules\\@smui\\data-table\\Head.svelte";

    function create_fragment$4(ctx) {
    	let thead;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let thead_levels = [exclude(/*$$props*/ ctx[2], ["use"])];
    	let thead_data = {};

    	for (let i = 0; i < thead_levels.length; i += 1) {
    		thead_data = assign(thead_data, thead_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			if (default_slot) default_slot.c();
    			set_attributes(thead, thead_data);
    			add_location(thead, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, thead, anchor);

    			if (default_slot) {
    				default_slot.m(thead, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, thead, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[1].call(null, thead))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			set_attributes(thead, thead_data = get_spread_update(thead_levels, [dirty & /*$$props*/ 4 && exclude(/*$$props*/ ctx[2], ["use"])]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Head", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	setContext("SMUI:data-table:row:header", true);

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("$$scope" in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [use, forwardEvents, $$props, $$scope, slots];
    }

    class Head extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { use: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Head",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get use() {
    		throw new Error("<Head>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Head>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\data-table\Body.svelte generated by Svelte v3.31.2 */
    const file$4 = "node_modules\\@smui\\data-table\\Body.svelte";

    function create_fragment$5(ctx) {
    	let tbody;
    	let tbody_class_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	let tbody_levels = [
    		{
    			class: tbody_class_value = "mdc-data-table__content " + /*className*/ ctx[1]
    		},
    		exclude(/*$$props*/ ctx[3], ["use", "class"])
    	];

    	let tbody_data = {};

    	for (let i = 0; i < tbody_levels.length; i += 1) {
    		tbody_data = assign(tbody_data, tbody_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			tbody = element("tbody");
    			if (default_slot) default_slot.c();
    			set_attributes(tbody, tbody_data);
    			add_location(tbody, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tbody, anchor);

    			if (default_slot) {
    				default_slot.m(tbody, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, tbody, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[2].call(null, tbody))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			set_attributes(tbody, tbody_data = get_spread_update(tbody_levels, [
    				(!current || dirty & /*className*/ 2 && tbody_class_value !== (tbody_class_value = "mdc-data-table__content " + /*className*/ ctx[1])) && { class: tbody_class_value },
    				dirty & /*$$props*/ 8 && exclude(/*$$props*/ ctx[3], ["use", "class"])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tbody);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Body", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	setContext("SMUI:data-table:row:header", false);

    	$$self.$$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("$$scope" in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use,
    		className
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [use, className, forwardEvents, $$props, $$scope, slots];
    }

    class Body extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { use: 0, class: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Body",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get use() {
    		throw new Error("<Body>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Body>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Body>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Body>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\data-table\Row.svelte generated by Svelte v3.31.2 */
    const file$5 = "node_modules\\@smui\\data-table\\Row.svelte";

    function create_fragment$6(ctx) {
    	let tr;
    	let tr_class_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	let tr_levels = [
    		{
    			class: tr_class_value = "\n    " + /*className*/ ctx[1] + "\n    " + (/*header*/ ctx[5] ? "mdc-data-table__header-row" : "") + "\n    " + (!/*header*/ ctx[5] ? "mdc-data-table__row" : "") + "\n    " + (!/*header*/ ctx[5] && /*selected*/ ctx[3]
    			? "mdc-data-table__row--selected"
    			: "") + "\n  "
    		},
    		/*selected*/ ctx[3] !== undefined
    		? {
    				"aria-selected": /*selected*/ ctx[3] ? "true" : "false"
    			}
    		: {},
    		exclude(/*$$props*/ ctx[6], ["use", "class"])
    	];

    	let tr_data = {};

    	for (let i = 0; i < tr_levels.length; i += 1) {
    		tr_data = assign(tr_data, tr_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			if (default_slot) default_slot.c();
    			set_attributes(tr, tr_data);
    			add_location(tr, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			if (default_slot) {
    				default_slot.m(tr, null);
    			}

    			/*tr_binding*/ ctx[9](tr);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, tr, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[4].call(null, tr))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
    				}
    			}

    			set_attributes(tr, tr_data = get_spread_update(tr_levels, [
    				(!current || dirty & /*className, selected*/ 10 && tr_class_value !== (tr_class_value = "\n    " + /*className*/ ctx[1] + "\n    " + (/*header*/ ctx[5] ? "mdc-data-table__header-row" : "") + "\n    " + (!/*header*/ ctx[5] ? "mdc-data-table__row" : "") + "\n    " + (!/*header*/ ctx[5] && /*selected*/ ctx[3]
    				? "mdc-data-table__row--selected"
    				: "") + "\n  ")) && { class: tr_class_value },
    				dirty & /*selected*/ 8 && (/*selected*/ ctx[3] !== undefined
    				? {
    						"aria-selected": /*selected*/ ctx[3] ? "true" : "false"
    					}
    				: {}),
    				dirty & /*$$props*/ 64 && exclude(/*$$props*/ ctx[6], ["use", "class"])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (default_slot) default_slot.d(detaching);
    			/*tr_binding*/ ctx[9](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Row", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let element;
    	let header = getContext("SMUI:data-table:row:header");
    	let selected = undefined;
    	setContext("SMUI:data-table:row:getIndex", getIndex);
    	setContext("SMUI:generic:input:setChecked", setChecked);

    	function setChecked(checked) {
    		$$invalidate(3, selected = checked);
    	}

    	function getIndex() {
    		let i = 0;

    		if (element) {
    			let el = element;

    			while (el.previousSibling) {
    				el = el.previousSibling;

    				if (el.nodeType === 1) {
    					i++;
    				}
    			}
    		}

    		return i;
    	}

    	function tr_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(2, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("$$scope" in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		element,
    		header,
    		selected,
    		setChecked,
    		getIndex
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("element" in $$props) $$invalidate(2, element = $$new_props.element);
    		if ("header" in $$props) $$invalidate(5, header = $$new_props.header);
    		if ("selected" in $$props) $$invalidate(3, selected = $$new_props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		element,
    		selected,
    		forwardEvents,
    		header,
    		$$props,
    		$$scope,
    		slots,
    		tr_binding
    	];
    }

    class Row extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { use: 0, class: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Row",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get use() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\data-table\Cell.svelte generated by Svelte v3.31.2 */
    const file$6 = "node_modules\\@smui\\data-table\\Cell.svelte";

    // (14:0) {:else}
    function create_else_block$1(ctx) {
    	let td;
    	let td_class_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	let td_levels = [
    		{
    			class: td_class_value = "\n      mdc-data-table__cell\n      " + /*className*/ ctx[1] + "\n      " + (/*numeric*/ ctx[2]
    			? "mdc-data-table__cell--numeric"
    			: "") + "\n      " + (/*checkbox*/ ctx[3]
    			? "mdc-data-table__cell--checkbox"
    			: "") + "\n    "
    		},
    		/*roleProp*/ ctx[5],
    		/*scopeProp*/ ctx[6],
    		/*props*/ ctx[4]
    	];

    	let td_data = {};

    	for (let i = 0; i < td_levels.length; i += 1) {
    		td_data = assign(td_data, td_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			if (default_slot) default_slot.c();
    			set_attributes(td, td_data);
    			add_location(td, file$6, 14, 2, 284);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);

    			if (default_slot) {
    				default_slot.m(td, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, td, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[7].call(null, td))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			}

    			set_attributes(td, td_data = get_spread_update(td_levels, [
    				(!current || dirty & /*className, numeric, checkbox*/ 14 && td_class_value !== (td_class_value = "\n      mdc-data-table__cell\n      " + /*className*/ ctx[1] + "\n      " + (/*numeric*/ ctx[2]
    				? "mdc-data-table__cell--numeric"
    				: "") + "\n      " + (/*checkbox*/ ctx[3]
    				? "mdc-data-table__cell--checkbox"
    				: "") + "\n    ")) && { class: td_class_value },
    				dirty & /*roleProp*/ 32 && /*roleProp*/ ctx[5],
    				dirty & /*scopeProp*/ 64 && /*scopeProp*/ ctx[6],
    				dirty & /*props*/ 16 && /*props*/ ctx[4]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(14:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1:0) {#if header}
    function create_if_block$1(ctx) {
    	let th;
    	let th_class_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	let th_levels = [
    		{
    			class: th_class_value = "\n      mdc-data-table__header-cell\n      " + /*className*/ ctx[1] + "\n      " + (/*checkbox*/ ctx[3]
    			? "mdc-data-table__header-cell--checkbox"
    			: "") + "\n    "
    		},
    		/*roleProp*/ ctx[5],
    		/*scopeProp*/ ctx[6],
    		/*props*/ ctx[4]
    	];

    	let th_data = {};

    	for (let i = 0; i < th_levels.length; i += 1) {
    		th_data = assign(th_data, th_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			th = element("th");
    			if (default_slot) default_slot.c();
    			set_attributes(th, th_data);
    			add_location(th, file$6, 1, 2, 15);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);

    			if (default_slot) {
    				default_slot.m(th, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, th, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[7].call(null, th))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			}

    			set_attributes(th, th_data = get_spread_update(th_levels, [
    				(!current || dirty & /*className, checkbox*/ 10 && th_class_value !== (th_class_value = "\n      mdc-data-table__header-cell\n      " + /*className*/ ctx[1] + "\n      " + (/*checkbox*/ ctx[3]
    				? "mdc-data-table__header-cell--checkbox"
    				: "") + "\n    ")) && { class: th_class_value },
    				dirty & /*roleProp*/ 32 && /*roleProp*/ ctx[5],
    				dirty & /*scopeProp*/ 64 && /*scopeProp*/ ctx[6],
    				dirty & /*props*/ 16 && /*props*/ ctx[4]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(1:0) {#if header}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*header*/ ctx[8]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let props;
    	let roleProp;
    	let scopeProp;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Cell", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let header = getContext("SMUI:data-table:row:header");
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { role = header ? "columnheader" : undefined } = $$props;
    	let { scope = header ? "col" : undefined } = $$props;
    	let { numeric = false } = $$props;
    	let { checkbox = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("role" in $$new_props) $$invalidate(9, role = $$new_props.role);
    		if ("scope" in $$new_props) $$invalidate(10, scope = $$new_props.scope);
    		if ("numeric" in $$new_props) $$invalidate(2, numeric = $$new_props.numeric);
    		if ("checkbox" in $$new_props) $$invalidate(3, checkbox = $$new_props.checkbox);
    		if ("$$scope" in $$new_props) $$invalidate(11, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		header,
    		use,
    		className,
    		role,
    		scope,
    		numeric,
    		checkbox,
    		props,
    		roleProp,
    		scopeProp
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("header" in $$props) $$invalidate(8, header = $$new_props.header);
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("role" in $$props) $$invalidate(9, role = $$new_props.role);
    		if ("scope" in $$props) $$invalidate(10, scope = $$new_props.scope);
    		if ("numeric" in $$props) $$invalidate(2, numeric = $$new_props.numeric);
    		if ("checkbox" in $$props) $$invalidate(3, checkbox = $$new_props.checkbox);
    		if ("props" in $$props) $$invalidate(4, props = $$new_props.props);
    		if ("roleProp" in $$props) $$invalidate(5, roleProp = $$new_props.roleProp);
    		if ("scopeProp" in $$props) $$invalidate(6, scopeProp = $$new_props.scopeProp);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(4, props = exclude($$props, ["use", "class", "numeric", "checkbox"]));

    		if ($$self.$$.dirty & /*role*/ 512) {
    			 $$invalidate(5, roleProp = role ? { role } : {});
    		}

    		if ($$self.$$.dirty & /*scope*/ 1024) {
    			 $$invalidate(6, scopeProp = scope ? { scope } : {});
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		numeric,
    		checkbox,
    		props,
    		roleProp,
    		scopeProp,
    		forwardEvents,
    		header,
    		role,
    		scope,
    		$$scope,
    		slots
    	];
    }

    class Cell extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			use: 0,
    			class: 1,
    			role: 9,
    			scope: 10,
    			numeric: 2,
    			checkbox: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cell",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get use() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get role() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set role(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scope() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scope(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get numeric() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set numeric(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checkbox() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checkbox(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$3 = "";
    styleInject(css_248z$3);

    /* node_modules\svelte-atoms\Typography.svelte generated by Svelte v3.31.2 */

    const file$7 = "node_modules\\svelte-atoms\\Typography.svelte";

    function create_fragment$8(ctx) {
    	let span;
    	let span_class_value;
    	let span_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block_1 = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", span_class_value = "" + (null_to_empty(`aa-typography ${/*type*/ ctx[0].toLowerCase()} ${/*$$props*/ ctx[2].class || ""}`) + " svelte-jezrns"));
    			attr_dev(span, "style", span_style_value = /*$$props*/ ctx[2].style || "");
    			toggle_class(span, "block", /*block*/ ctx[1]);
    			add_location(span, file$7, 5, 0, 77);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*type, $$props*/ 5 && span_class_value !== (span_class_value = "" + (null_to_empty(`aa-typography ${/*type*/ ctx[0].toLowerCase()} ${/*$$props*/ ctx[2].class || ""}`) + " svelte-jezrns"))) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (!current || dirty & /*$$props*/ 4 && span_style_value !== (span_style_value = /*$$props*/ ctx[2].style || "")) {
    				attr_dev(span, "style", span_style_value);
    			}

    			if (dirty & /*type, $$props, block*/ 7) {
    				toggle_class(span, "block", /*block*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Typography", slots, ['default']);
    	let { type = "body1" } = $$props;
    	let { block = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("type" in $$new_props) $$invalidate(0, type = $$new_props.type);
    		if ("block" in $$new_props) $$invalidate(1, block = $$new_props.block);
    		if ("$$scope" in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ type, block });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("type" in $$props) $$invalidate(0, type = $$new_props.type);
    		if ("block" in $$props) $$invalidate(1, block = $$new_props.block);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [type, block, $$props, $$scope, slots];
    }

    class Typography extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { type: 0, block: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Typography",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get type() {
    		throw new Error("<Typography>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Typography>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Typography>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Typography>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var arrowDown = "M9 12.268l2.293-2.235a1.02 1.02 0 011.414 0c.39.38.39.998 0 1.379L8 16l-4.707-4.588a.957.957 0 010-1.379 1.02 1.02 0 011.414 0L7 12.268V.975A.988.988 0 018 0c.552 0 1 .436 1 .975v11.293z";

    var arrowLeft = "M5.977 9H13a1 1 0 100-2H5.977l2.726-2.448a.845.845 0 000-1.286 1.095 1.095 0 00-1.431 0L2 8l5.272 4.734a1.095 1.095 0 001.431 0 .845.845 0 000-1.286L5.977 9z";

    var arrowRight = "M10.023 9H3a1 1 0 110-2h7.023L7.297 4.552a.845.845 0 010-1.286 1.095 1.095 0 011.431 0L14 8l-5.272 4.734a1.095 1.095 0 01-1.431 0 .845.845 0 010-1.286L10.023 9z";

    var arrowUp = "M9 3.732l2.293 2.235c.39.38 1.024.38 1.414 0a.957.957 0 000-1.379L8 0 3.293 4.588a.957.957 0 000 1.379c.39.38 1.024.38 1.414 0L7 3.732v11.293c0 .539.448.975 1 .975s1-.436 1-.975V3.732z";

    var arrowsUpdown = "M8 2.646l-3.293 3.08a1.05 1.05 0 01-1.414 0 .893.893 0 010-1.323L8 0l4.707 4.403c.39.365.39.958 0 1.323a1.05 1.05 0 01-1.414 0L8 2.646zm0 10.708l3.293-3.08a1.05 1.05 0 011.414 0c.39.365.39.958 0 1.323L8 16l-4.707-4.403a.893.893 0 010-1.323 1.05 1.05 0 011.414 0L8 13.354z";

    var attention = "M6 9V2a2 2 0 114 0v7a2 2 0 11-4 0zm2 7a2 2 0 110-4 2 2 0 010 4z";

    var burger = "M1 5a1 1 0 110-2h13.986a1 1 0 010 2H1zm0 4a1 1 0 110-2h13.986a1 1 0 010 2H1zm0 4a1 1 0 010-2h13.986a1 1 0 010 2H1z";

    var calendar = "M4 2V0h2v2h4V0h2v2h1c1.657 0 3 1.373 3 3.067v7.866C16 14.627 14.657 16 13 16H3c-1.657 0-3-1.373-3-3.067V5.067C0 3.373 1.343 2 3 2h1zm0 0zm2 0zm4 0zm2 0zM3 4c-.552 0-1 .462-1 1.032v7.936C2 13.538 2.448 14 3 14h10c.552 0 1-.462 1-1.032V5.032C14 4.462 13.552 4 13 4H3zm1 9v-2h2v2H4zm3 0v-2h2v2H7zm3 0v-2h2v2h-2zm-6-3V8h2v2H4zm3 0V8h2v2H7zm0-3V5h2v2H7zm3 3V8h2v2h-2zm0-3V5h2v2h-2z";

    var cashbox = "M9 8V6H7a1 1 0 01-1-1V1a1 1 0 011-1h8a1 1 0 011 1v4a1 1 0 01-1 1h-2v2h2a1 1 0 011 1v6a1 1 0 01-1 1H1a1 1 0 01-1-1V9a1 1 0 011-1h8zm0-4h5V2H8v2h1zm-7 6v4h12v-4H2z";

    var cashbox2 = "M4 5V1.5A1.5 1.5 0 015.5 0h3.293a1.5 1.5 0 011.06.44l1.708 1.706A1.5 1.5 0 0112 3.207V5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zm2 0h4V3.414L8.586 2H6v3zm-.5 3h5a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-5a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5zM4 7v7h8V7H4z";

    var catalog = "M9 4.711v6.727a10.236 10.236 0 015-.234V4.337A6.481 6.481 0 0011.969 4c-.97 0-1.955.232-2.969.711zm-2 .06C5.994 4.25 5.022 4 4.061 4c-.65 0-1.337.115-2.061.351v6.85a10.063 10.063 0 015 .26V4.77zM7.93 3h.015c1.341-.667 2.683-1 4.024-1 1.344 0 2.687.335 4.031 1.004v11C14.656 13.334 13.312 13 11.969 13c-1.344 0-2.688.335-4.031 1.004C6.643 13.334 5.332 13 4 13c-1.332 0-2.665.335-4 1.004v-11C1.411 2.334 2.765 2 4.061 2c1.294 0 2.584.333 3.87 1z";

    var check = "M14.138 2.322a1.085 1.085 0 011.542 0c.427.43.427 1.126 0 1.555L6 13.602.32 7.877a1.106 1.106 0 010-1.555 1.085 1.085 0 011.542 0L6 10.492l8.138-8.17z";

    var chevronDown = "M8 10.657l6.364-6.364a1 1 0 011.414 1.414l-7.07 7.071a1 1 0 01-1.415 0L.222 5.708a1 1 0 011.414-1.415L8 10.657z";

    var chevronLeft = "M5.225 8.016l6.364-6.364A1 1 0 1010.174.237l-7.07 7.071a1 1 0 000 1.415l7.07 7.07a1 1 0 001.415-1.413L5.225 8.016z";

    var chevronRight = "M10.538 8.016L4.174 1.652A1 1 0 115.59.237l7.07 7.071a1 1 0 010 1.415l-7.07 7.07a1 1 0 01-1.415-1.413l6.364-6.364z";

    var chevronUp = "M8 5.343l6.364 6.364a1 1 0 001.414-1.414l-7.07-7.071a1 1 0 00-1.415 0l-7.071 7.07a1 1 0 001.414 1.415L8 5.343z";

    var clear = "M10.347 12.186l3.863.028c.511.009.933.43.942.942a.888.888 0 01-.91.91H7.754a.767.767 0 01-.252-.048l-5.837-.04C.193 12.507.152 10.162 1.573 8.74L7.74 2.573c1.422-1.42 3.767-1.38 5.238.092l.78.78c1.472 1.472 1.513 3.817.092 5.238l-3.503 3.503zm-.056-2.609L6.866 6.113l-3.96 3.96c-.55.549-.662 1.374-.345 2.06l5.14.035 2.59-2.59zm1.287-1.287l.94-.94c.71-.71.69-1.882-.046-2.618l-.78-.78c-.736-.736-1.909-.757-2.62-.046l-.92.92 3.426 3.464z";

    var close = "M8.047 9.555L8 9.602l-.047-.047-4.09 4.123c-.427.43-1.117.43-1.543 0a1.106 1.106 0 010-1.555L6.41 8 2.32 3.877a1.106 1.106 0 010-1.555 1.085 1.085 0 011.542 0l4.091 4.123L8 6.398l.047.047 4.09-4.123a1.085 1.085 0 011.543 0c.427.43.427 1.126 0 1.555L9.59 8l4.09 4.123c.427.43.427 1.126 0 1.555-.426.43-1.116.43-1.542 0L8.047 9.555z";

    var column = "M9 1a1 1 0 112 0v14a1 1 0 11-2 0V1zm4 0a1 1 0 112 0v14a1 1 0 11-2 0V1zM5 1a1 1 0 112 0v14a1 1 0 11-2 0V1zM1 1a1 1 0 112 0v14a1 1 0 11-2 0V1z";

    var copy = "M10 12H4V6H2v8h8v-2zm0 0V6H4v6h6zM4 4V1a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1h-3v3a1 1 0 01-1 1H1a1 1 0 01-1-1V5a1 1 0 011-1h3zm2 0h5a1 1 0 011 1v5h2V2H6v2z";

    var cycle = "M4.912 11.5a4.667 4.667 0 007.36-1.62 1.167 1.167 0 012.136.941A7 7 0 013.333 13.22v.614a1.167 1.167 0 11-2.333 0V9.167h4.667a1.167 1.167 0 110 2.333h-.755zm6.176-7a4.668 4.668 0 00-7.37 1.641 1.167 1.167 0 01-2.14-.93 7 7 0 0111.089-2.43v-.614a1.167 1.167 0 112.333 0v4.666h-4.667a1.167 1.167 0 010-2.333h.755z";

    var visible = "M8 5c-1.9 0-3.707.955-5.464 3C4.293 10.045 6.101 11 8 11c1.9 0 3.707-.955 5.464-3C11.707 5.955 9.899 5 8 5zm0 8c-2.946 0-5.612-1.667-8-5 2.388-3.333 5.054-5 8-5 2.946 0 5.612 1.667 8 5-2.388 3.333-5.054 5-8 5zm0-3a2 2 0 110-4 2 2 0 010 4z";

    var edit = "M4.204 10.126l1.724 1.748 5.994-6.034-1.73-1.743-5.988 6.029zm-.892 1.23l-.737 2.155 2.242-.63-1.505-1.525zm7.793-8.177l1.729 1.743.747-.752-1.73-1.741-.746.75zM6.207 14.442a1.004 1.004 0 01-.441.259l-4.489 1.26A1.004 1.004 0 01.056 14.67L1.66 9.98c.05-.144.13-.274.238-.382l9.24-9.302a1.004 1.004 0 011.425 0l3.145 3.166a1.004 1.004 0 010 1.415l-9.501 9.565z";

    var favorite = "M10.776 11.127a3.075 3.075 0 01.813-2.614l1.434-1.48-1.992-.315c-.918-.145-1.712-.748-2.128-1.616L8 3.22l-.903 1.882a2.873 2.873 0 01-2.128 1.616l-1.992.316 1.434 1.479c.661.682.964 1.657.813 2.614l-.328 2.077 1.789-.968a2.752 2.752 0 012.63 0l1.79.968-.329-2.077zm-3.215 2.88l-3.477 1.881a.934.934 0 01-1.286-.427 1.036 1.036 0 01-.094-.62l.638-4.038c.05-.32-.05-.644-.271-.872L.284 7.056a1.029 1.029 0 01-.009-1.41.94.94 0 01.536-.285l3.872-.614a.958.958 0 00.71-.538L7.146.55a.936.936 0 011.28-.444.976.976 0 01.425.444l1.756 3.659c.139.29.403.49.71.538l3.871.614c.521.083.88.591.8 1.135-.03.213-.127.41-.273.56L12.93 9.931a1.03 1.03 0 00-.271.872l.638 4.038c.085.543-.266 1.056-.786 1.145a.918.918 0 01-.594-.098l-3.478-1.882a.917.917 0 00-.877 0z";

    var favoriteFill = "M7.561 14.006l-3.477 1.882a.934.934 0 01-1.286-.427 1.036 1.036 0 01-.094-.62l.638-4.038c.05-.32-.05-.644-.271-.872L.284 7.056a1.029 1.029 0 01-.009-1.41.94.94 0 01.536-.285l3.872-.614a.958.958 0 00.71-.538L7.146.55a.936.936 0 011.28-.444.976.976 0 01.425.444l1.756 3.659c.139.29.403.49.71.538l3.871.614c.521.083.88.591.8 1.135-.03.213-.127.41-.273.56L12.93 9.931a1.03 1.03 0 00-.271.872l.638 4.038c.085.543-.266 1.056-.786 1.145a.918.918 0 01-.594-.098l-3.478-1.882a.917.917 0 00-.877 0z";

    var file$8 = "M4 0h5.158a2 2 0 011.422.593l2.842 2.872A2 2 0 0114 4.87V14a2 2 0 01-2 2H4a2 2 0 01-2-2V2a2 2 0 012-2zm0 2v12h8V4.871L9.158 2H4z";

    var filter = "M3.437 2l3.33 3.287A1 1 0 017.064 6v7.363l1.919-.986V6a1 1 0 01.294-.709L12.58 2H3.437zm1.627 4.417L.297 1.712C-.339 1.084.106 0 1 0h14c.892 0 1.338 1.079.706 1.708l-4.723 4.706v6.573a1 1 0 01-.543.89L6.52 15.89A1 1 0 015.064 15V6.417z";

    var history$1 = "M6.027 12H4.923C4.413 12 4 11.552 4 11s.413-1 .923-1h1.333c.126-.356.295-.691.502-1H4.923C4.413 9 4 8.552 4 8s.413-1 .923-1h5.154a.86.86 0 01.128.01A4.568 4.568 0 0112 7.256V5.392L8.583 2H4a1 1 0 00-1 1v10a1 1 0 001 1h2.758a4.474 4.474 0 01-.73-2zm6.945 3.26A2.985 2.985 0 0111 16H4a3 3 0 01-3-3V3a3 3 0 013-3h4.995l.704.29 4.005 3.976.296.71V8.67c.625.773 1 1.757 1 2.829a4.496 4.496 0 01-4.5 4.5l2.472-.74zM10.5 14a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM4.923 6C4.413 6 4 5.552 4 5s.413-1 .923-1h3.154C8.587 4 9 4.448 9 5s-.413 1-.923 1H4.923zm6.577 5a.5.5 0 110 1H10v-1.5a.5.5 0 111 0v.5h.5z";

    var inputCalendar = "M4 2V0h2v2h4V0h2v2h1c1.657 0 3 1.373 3 3.067v7.866C16 14.627 14.657 16 13 16H3c-1.657 0-3-1.373-3-3.067V5.067C0 3.373 1.343 2 3 2h1zm0 0zm2 0zm4 0zm2 0zM3 4c-.552 0-1 .462-1 1.032v7.936C2 13.538 2.448 14 3 14h10c.552 0 1-.462 1-1.032V5.032C14 4.462 13.552 4 13 4H3zm1 9v-2h2v2H4zm3 0v-2h2v2H7zm3 0v-2h2v2h-2zm-6-3V8h2v2H4zm3 0V8h2v2H7zm0-3V5h2v2H7zm3 3V8h2v2h-2zm0-3V5h2v2h-2z";

    var invisible = "M3.85 9.32l-1.416 1.417C1.593 10.003.782 9.091 0 8c2.388-3.333 5.054-5 8-5a7.54 7.54 0 011.924.247L8.17 5.003A5.634 5.634 0 008 5c-1.9 0-3.707.955-5.464 3 .435.506.873.946 1.315 1.32zm3.981 1.677C7.887 11 7.944 11 8 11c1.9 0 3.707-.955 5.464-3a11.837 11.837 0 00-1.315-1.32l1.417-1.417C14.407 5.997 15.218 6.909 16 8c-2.388 3.333-5.054 5-8 5a7.54 7.54 0 01-1.924-.247l1.755-1.756zm5.826-8.654a1 1 0 010 1.414l-9.9 9.9a1 1 0 01-1.414-1.414l9.9-9.9a1 1 0 011.414 0z";

    var key = "M6.166 6.283a5 5 0 113.579 3.558l-1.304.874-.795 2.905-2.576.31L4 16H0v-3.605l6.166-6.112zM11 8a3 3 0 100-6 3 3 0 000 6zm1-3a1 1 0 110-2 1 1 0 010 2zM2 13.229V14h.782l.997-1.929 2.293-.276.637-2.327 1-.67-.662-.572L2 13.23z";

    var list3 = "M1 5a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm4-8a1 1 0 110-2h9.986a1 1 0 010 2H5zm0 4a1 1 0 110-2h9.986a1 1 0 010 2H5zm0 4a1 1 0 010-2h9.986a1 1 0 010 2H5z";

    var loader = "M8 0a1 1 0 110 2 6 6 0 106 6 1 1 0 012 0 8 8 0 11-8-8z";

    var market = "M1.25 8.033A1.75 1.75 0 01-.046 5.768l1.334-4.005A.75.75 0 012 1.25h12a.75.75 0 01.712.513l1.334 4.005a1.75 1.75 0 01-1.296 2.265V10H15a1 1 0 011 1v4a1 1 0 01-1 1H1a1 1 0 01-1-1v-4a1 1 0 011-1h.25V8.033zm1.5-.17V10h10.5V7.863A7.4 7.4 0 0012 7.756c-.7 0-1.01.093-1.666.418-.845.42-1.367.576-2.334.576-.967 0-1.49-.156-2.334-.576C5.011 7.85 4.7 7.756 4 7.756a7.4 7.4 0 00-1.25.107zM1.5 11.5v3h13v-3h-13zm1.04-8.75L1.378 6.242a.25.25 0 00.3.32A9.043 9.043 0 014 6.257c.967 0 1.49.155 2.334.575.655.326.967.419 1.666.419.7 0 1.01-.093 1.666-.419.845-.42 1.367-.575 2.334-.575.775 0 1.55.102 2.322.307a.25.25 0 00.301-.321L13.46 2.75H2.541z";

    var message = "M3 2c-.552 0-1 .462-1 1.032v6.936C2 10.538 2.448 11 3 11h5l2.786 1.683L11.39 11H13c.552 0 1-.462 1-1.032V3.032C14 2.462 13.552 2 13 2H3zm0-2h10c1.657 0 3 1.373 3 3.067v6.866C16 11.627 14.657 13 13 13l-1.048 3-4.866-3H3c-1.657 0-3-1.373-3-3.067V3.067C0 1.373 1.343 0 3 0zm2 4h6a1 1 0 010 2H5a1 1 0 110-2zm0 3h6a1 1 0 010 2H5a1 1 0 110-2z";

    var minus = "M1 7h14c.554 0 1 .446 1 1s-.446 1-1 1H1c-.554 0-1-.446-1-1s.446-1 1-1z";

    var moreHorizontal = "M14 10a2 2 0 110-4 2 2 0 010 4zm-6 0a2 2 0 110-4 2 2 0 010 4zm-6 0a2 2 0 110-4 2 2 0 010 4z";

    var moreVertical = "M8 16a2 2 0 110-4 2 2 0 010 4zm0-6a2 2 0 110-4 2 2 0 010 4zm0-6a2 2 0 110-4 2 2 0 010 4z";

    var phone = "M3.55.124c.243.092.475.227.727.405.064.046.127.093.197.146l.128.1c.366.258.665.52 1.154.988l.265.252c.388.388.553.571.746.872.616.973.46 1.622-.27 2.731a6.218 6.218 0 01-.432.544l-.05.058-.151.172a17.881 17.881 0 00.56.867c.31.437.677.858 1.083 1.245.381.363.834.714 1.374 1.067a16.235 16.235 0 00.885.555l.235-.234c.031-.031.068-.07.116-.125l.15-.171c.487-.55.866-.824 1.475-.847.439-.014.855.168 1.34.498.154.103.31.22.484.358.097.077.593.487.692.56 1.166.892 1.668 1.456 1.74 2.474.028.69-.319 1.29-.88 1.886-2.462 2.69-5.943 1.46-10.044-1.748C1.591 10.052-.41 7.003.071 3.701.303 2.164 1.21.577 2.408.116c.247-.123.52-.139.78-.09.122.02.242.053.361.098zM1.601 3.926c-.38 2.605 1.338 5.222 4.429 7.64 3.478 2.72 6.299 3.718 7.95 1.913.307-.326.477-.62.472-.754-.027-.38-.332-.722-1.128-1.33-.128-.095-.657-.531-.725-.585a6.527 6.527 0 00-.39-.29c-.232-.158-.4-.232-.414-.231-.043.002-.146.076-.367.326-.073.083-.122.14-.153.173a4.344 4.344 0 01-.18.192l-.599.599a.778.778 0 01-.615.233.98.98 0 01-.246-.043 1.948 1.948 0 01-.286-.117 7.39 7.39 0 01-.544-.301 16.939 16.939 0 01-.8-.51 10.927 10.927 0 01-1.57-1.224c-.477-.454-.909-.95-1.274-1.466a19.05 19.05 0 01-.515-.785 7.814 7.814 0 01-.3-.516 2.04 2.04 0 01-.117-.264.976.976 0 01-.051-.22c-.022-.198.008-.396.204-.638.114-.124.288-.316.46-.515l.046-.054a5.3 5.3 0 00.316-.39c.428-.65.451-.747.255-1.056-.11-.173-.224-.299-.522-.596l-.253-.243c-.438-.417-.693-.64-1.004-.861l-.15-.115a5.675 5.675 0 00-.155-.115A1.807 1.807 0 003 1.564a.502.502 0 00-.035-.011c-.616.299-1.211 1.367-1.364 2.373z";

    var plus = "M7.036 7V1.036a1 1 0 112 0V7H15a1 1 0 010 2H9.036v5.964a1 1 0 01-2 0V9H1.07a1 1 0 010-2h5.965z";

    var print = "M2 12H1a1 1 0 01-1-1V5a1 1 0 011-1h1V2a2 2 0 012-2h8a2 2 0 012 2v2h1a1 1 0 011 1v6a1 1 0 01-1 1h-1v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm2-1v3h8V7H4v4zm0-7h8V2H4v2zm2 6a1 1 0 110-2h4a1 1 0 010 2H6zm0 3a1 1 0 010-2h4a1 1 0 010 2H6z";

    var question = "M8.5 16a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0-16C10.981 0 13 2.05 13 4.571c0 2.127-1.436 3.918-3.375 4.427v1.86c0 .63-.504 1.142-1.125 1.142a1.134 1.134 0 01-1.125-1.143V8c0-.631.504-1.143 1.125-1.143 1.24 0 2.25-1.025 2.25-2.286 0-1.26-1.01-2.285-2.25-2.285S6.25 3.31 6.25 4.57c0 .632-.504 1.143-1.125 1.143A1.134 1.134 0 014 4.571C4 2.051 6.019 0 8.5 0z";

    var rouble = "M4 11V9h-.995A1.002 1.002 0 012 8c0-.552.45-1 1.005-1H4V1a1 1 0 011-1h4.5a4.5 4.5 0 110 9H6v2h4.995c.555 0 1.005.448 1.005 1s-.45 1-1.005 1H6v2a1 1 0 01-2 0v-2h-.995A1.002 1.002 0 012 12c0-.552.45-1 1.005-1H4zm2-9v5h3.5a2.5 2.5 0 100-5H6z";

    var save = "M11 2.414V4a2 2 0 01-2 2H6a2 2 0 01-2-2V2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5.828a1 1 0 00-.293-.707L11 2.414zM3 0h7.172a3 3 0 012.12.879l2.83 2.828A3 3 0 0116 5.828V13a3 3 0 01-3 3H3a3 3 0 01-3-3V3a3 3 0 013-3zm3 2v2h3V2H6zM5 9v2h6V9H5zm0-2h6a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z";

    var set = "M13.962 10.33a3.494 3.494 0 010-4.516l-.128-.31A3.492 3.492 0 0110.64 2.31l-.31-.128a3.492 3.492 0 01-4.516 0l-.31.128A3.492 3.492 0 012.31 5.504l-.128.31a3.492 3.492 0 010 4.517l.128.31a3.492 3.492 0 013.194 3.193l.31.128a3.494 3.494 0 014.516 0l.31-.128a3.492 3.492 0 011.01-2.184 3.494 3.494 0 012.184-1.01l.128-.31zm-3.329 3.964l.013.257.109-.006.079-.07-.172-.191a3.479 3.479 0 00-.03-.034l.001.044zm-5.15-.01l-.172.19.079.071.108.006.013-.257.002-.044-.03.034zm-3.633-3.65l-.257.012.006.109.071.079.19-.173.034-.03-.044.002zm.01-5.151l-.19-.172-.071.078-.006.109.257.013.044.002-.033-.03zM5.512 1.85l-.013-.257-.109.006-.079.071.173.19.03.034-.002-.044zm5.15.01l.173-.19-.08-.071-.108-.006-.013.257-.002.044.03-.033zm3.633 3.651l.257-.013-.006-.109-.071-.078-.19.171-.034.031.044-.002zm-.01 5.15l.19.173.071-.08.006-.108-.257-.013-.044-.002.034.03zm.165 1.983l-.257-.013a1.493 1.493 0 00-1.128.433 1.492 1.492 0 00-.434 1.128l.014.257a1 1 0 01-.616.975l-1.553.644a1 1 0 01-1.126-.254l-.172-.19a1.493 1.493 0 00-1.105-.491c-.42 0-.824.18-1.105.491l-.172.19a1 1 0 01-1.125.254l-1.554-.644a1 1 0 01-.615-.975l.013-.257a1.491 1.491 0 00-1.562-1.562l-.257.014a1 1 0 01-.974-.616l-.645-1.553A1 1 0 01.33 9.349l.19-.172a1.492 1.492 0 000-2.21l-.19-.172A1 1 0 01.076 5.67l.645-1.554a1 1 0 01.974-.615l.257.013a1.492 1.492 0 001.561-1.561l-.012-.257A1 1 0 014.116.72L5.67.076A1 1 0 016.795.33l.172.19a1.492 1.492 0 002.21 0l.172-.19a1 1 0 011.125-.254l1.554.645a1 1 0 01.616.974l-.014.257a1.491 1.491 0 001.561 1.561l.258-.012a1 1 0 01.974.615l.645 1.554a1 1 0 01-.254 1.125l-.19.172a1.493 1.493 0 00-.491 1.105c0 .42.179.824.49 1.105l.191.172a1 1 0 01.254 1.125l-.644 1.554a1 1 0 01-.975.616zM8 10a2 2 0 100-4 2 2 0 000 4zm0 2a4 4 0 110-8 4 4 0 010 8z";

    var settings = "M9 10.732V15a1 1 0 01-2 0v-4.268a2 2 0 112 0zm3.031-7.482A1.002 1.002 0 0112 3V1a1 1 0 012 0v2c0 .086-.01.17-.031.25a2 2 0 11-1.938 0zm-10 0A1.002 1.002 0 012 3V1a1 1 0 112 0v2c0 .086-.01.17-.031.25a2 2 0 11-1.938 0zM2 10a1 1 0 112 0v5a1 1 0 01-2 0v-5zm10 0a1 1 0 012 0v5a1 1 0 01-2 0v-5zM7 1a1 1 0 112 0v3a1 1 0 11-2 0V1z";

    var sort = "M7 1v14a1 1 0 01-2 0V3.414L2.707 5.707a1 1 0 01-1.414-1.414l4-4A1 1 0 017 1zm2 14V1a1 1 0 112 0v11.586l2.293-2.293a1 1 0 011.414 1.414l-4 4A1 1 0 019 15z";

    var sortDown = ["M9 15V1a1 1 0 112 0v11.586l2.293-2.293a1 1 0 011.414 1.414l-4 4A1 1 0 019 15z",{path:"M7 1v14a1 1 0 01-2 0V3.414L2.707 5.707a1 1 0 01-1.414-1.414l4-4A1 1 0 017 1z",color:"var(--palette-noactive-3)"}];

    var sortUp = ["M7 1v14a1 1 0 11-2 0V3.414L2.707 5.707a1 1 0 01-1.414-1.414l4-4A1 1 0 017 1z",{path:"M9 15V1a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 1.414l-4 4A1 1 0 019 15z",color:"var(--palette-noactive-3)"}];

    var trash = "M2 5h12V4h-3a1 1 0 01-1-1V2H6v1a1 1 0 01-1 1H2v1zm12 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V7H1a1 1 0 01-1-1V3a1 1 0 011-1h3V1a1 1 0 011-1h6a1 1 0 011 1v1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1zm-2 0H4v7h8V7zM5 9a1 1 0 112 0v3a1 1 0 01-2 0V9zm4 0a1 1 0 112 0v3a1 1 0 01-2 0V9z";

    var upload = "M14 14v-4a1 1 0 012 0v6H0v-6a1 1 0 112 0v4h12zM7 3.828L4.207 6.621a1 1 0 11-1.414-1.414L8 0l5.207 5.207a1 1 0 11-1.414 1.414L9 3.828V11a1 1 0 01-2 0V3.828z";

    var download = "M14 14v-4a1 1 0 012 0v6H0v-6a1 1 0 112 0v4h12zM7 8.172V1a1 1 0 112 0v7.172l2.793-2.793a1 1 0 011.414 1.414L8 12 2.793 6.793a1 1 0 011.414-1.414L7 8.172z";

    var cashCheck = "M11.002 15.132l-1.587.785a1 1 0 01-.897-.005l-1.52-.774-1.519.774a1 1 0 01-.897.005l-2.026-1.005A1 1 0 012 14.016V1a1 1 0 011-1h10.033a1 1 0 011 1v14.02a1 1 0 01-1.444.897l-1.587-.785zM4 13.396l1.02.506 1.525-.777a1 1 0 01.907 0l1.526.777 1.581-.782a1 1 0 01.887 0l.587.29V2H4v11.396zM6 3h4a1 1 0 010 2H6a1 1 0 110-2zm0 3h4a1 1 0 010 2H6a1 1 0 110-2zm0 3h4a1 1 0 010 2H6a1 1 0 010-2z";

    var move = "M5.65 7.063L3.292 4.707a1 1 0 011.414-1.414l2.356 2.356A1 1 0 019 6v2a.999.999 0 01-1 1H6a1 1 0 01-.35-1.937zM3 0h6a3 3 0 013 3v6a3 3 0 01-3 3H3a3 3 0 01-3-3V3a3 3 0 013-3zm0 2a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1H3zm10 2a3 3 0 013 3v6a3 3 0 01-3 3H7a3 3 0 01-3-3h2a1 1 0 001 1h6a1 1 0 001-1V7a1 1 0 00-1-1V4z";

    var tree = "M7 9h4a1 1 0 010 2H6a1 1 0 01-1-1V6H2v7h13a1 1 0 010 2H1a.997.997 0 01-1-1V1a1 1 0 112 0v3h13a1 1 0 010 2H7v3zm8 0a1 1 0 110 2 1 1 0 010-2z";

    var list4 = "M14.986 3a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100-2 1 1 0 000 2zm-4-12a1 1 0 100-2H1a1 1 0 000 2h9.986zm0 4a1 1 0 100-2H1a1 1 0 000 2h9.986zm0 4a1 1 0 000-2H1a1 1 0 000 2h9.986zm0 4a1 1 0 000-2H1a1 1 0 000 2h9.986z";

    var ok = "M13.462 6.304a7 7 0 11-2.621-3.157L9.62 4.74a5 5 0 102.328 3.541l1.513-1.978zm-6.755-.011L8.4 7.985 14.206.393a1 1 0 111.588 1.214l-6.5 8.5a1 1 0 01-1.501.1l-2.5-2.5a1 1 0 011.414-1.414z";

    var monitor = "M9 12v2h3a1 1 0 010 2H4a1 1 0 010-2h3v-2H2a2 2 0 01-2-2V2a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H9zM2 2v8h12V2H2z";

    var toggleOff = "M6 2h4a6 6 0 110 12H6A6 6 0 116 2zm4 9a3 3 0 100-6 3 3 0 000 6z";

    var toggleOn = "M6 2h4a6 6 0 110 12H6A6 6 0 116 2zm0 2a4 4 0 100 8h4a4 4 0 100-8H6zm0 7a3 3 0 110-6 3 3 0 010 6z";

    var mail = "M15.994 3.846a.94.94 0 01.006.187V12a2 2 0 01-2 2H2a2 2 0 01-2-2V4a2 2 0 012-2h12a2 2 0 011.994 1.846zM2.77 4l5.238 3.618L13.236 4H2.77zM14 5.854L8.009 10 2 5.849V12h12V5.854z";

    var mailFull = "M15.535 2.718l-7.56 5.068-7.54-5.03C.8 2.296 1.364 2 2 2h12c.617 0 1.168.28 1.535.718zM16 4.814V12a2 2 0 01-2 2H2a2 2 0 01-2-2V4.87l7.978 5.322L16 4.814z";

    var mailOk = "M16 6.033v7.149C16 14.73 14.778 16 13.25 16H2.75C1.222 16 0 14.73 0 13.182V6a.944.944 0 01.186-.593.996.996 0 01.521-.364L8.007 0l7.286 5.043a.99.99 0 01.52.363.944.944 0 01.187.627zM2 7.85v5.332c0 .46.345.818.75.818h10.5c.405 0 .75-.358.75-.818v-5.33L8.007 12 2 7.85zM2.768 6l5.238 3.618L13.234 6 8.006 2.382 2.768 6z";

    var fullscreen = "M2 0h12a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm0 2v12h12V2H2zm3 3v2a1 1 0 11-2 0V4a1 1 0 011-1h3a1 1 0 110 2H5zm6 6V9a1 1 0 012 0v3a1 1 0 01-1 1H9a1 1 0 010-2h2z";

    var smallscreen = "M2 0h12a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm0 2v12h12V2H2zm4 4V4a1 1 0 112 0v3a1 1 0 01-1 1H4a1 1 0 110-2h2zm4 4v2a1 1 0 01-2 0V9a1 1 0 011-1h3a1 1 0 010 2h-2z";

    var cart = "M5.542 3h9.353C15.505 3 16 3.448 16 4c0 .045-.003.09-.01.133.024.174.005.357-.064.532l-1.773 5.01A2.073 2.073 0 0112.23 11H7.45a2.076 2.076 0 01-1.969-1.447L3.395 3.105H1.036A1.045 1.045 0 010 2.053C0 1.47.464 1 1.036 1h2.359c.895 0 1.689.584 1.968 1.447l.18.553zm.648 2l1.26 3.895h4.778L13.607 5H6.19zm.31 10a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z";

    var notifyNot = "M11.584 12.998A1.524 1.524 0 0111.5 13h-10a1.5 1.5 0 010-3H3V5c0-.188.01-.373.03-.555L.293 1.707A1 1 0 111.707.293l14 14a1 1 0 01-1.414 1.414l-2.71-2.71zM4.678 1.263A5 5 0 0113 5v4.586L4.678 1.263zM10 14a2 2 0 11-4 0h4z";

    var notify = "M13 10h1.5a1.5 1.5 0 010 3h-13a1.5 1.5 0 010-3H3V5a5 5 0 1110 0v5zm-3 4a2 2 0 11-4 0h4z";

    var monitorNot = "M2 3.414V10h6.586L2 3.414zM10.586 12H9v2h2a1 1 0 010 2H4a1 1 0 010-2h3v-2H2a2 2 0 01-2-2V2a2 2 0 01.088-.589A1 1 0 011.708.293l14 14a1 1 0 01-1.415 1.414L10.586 12zM3.414 0H14a2 2 0 012 2v8c0 .702-.362 1.32-.91 1.677L13.415 10H14V2H5.414l-2-2z";

    var start = "M8 16A8 8 0 118 0a8 8 0 010 16zm0-2A6 6 0 108 2a6 6 0 000 12zm-.972-9.297l4.156 2.434a1 1 0 010 1.726l-4.156 2.434a1 1 0 01-1.506-.862v-4.87a1 1 0 011.506-.862z";

    var image = "M14 4.692V2H2v10.577l4.437-4.426 2.395 1.979 5.12-5.483.048.045zm0 2.834L9.009 12.87l-2.446-2.02L3.406 14H14V7.526zM2 0h12a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm3 7a2 2 0 110-4 2 2 0 010 4z";

    var hub = "M5 13.688l9-2.25V4.562l-9 2.25v6.876zm-2-.424V6.736l-1-.503v6.53l1 .5zM4 5l12-3v11L4 16l-4-2V2.99L4 5zm8-5l2 .938L16 2l-2.505.629L12 2 2.567 4.28 0 2.99 12 0zM8 7.234l.837-.257v4.766L8 12V7.234zM12.744 6v.943l-.008.002v3.743l-2.783.754v-.944l1.85-.5v-.944l-1.85.501V6.756L12.744 6zm-1.858 1.447v.912l.918-.249v-.912l-.918.249z";

    var profile = "M10.635 7.01a3 3 0 012.256 1.326L15 11.5a2.894 2.894 0 01-2.408 4.5H3.408A2.894 2.894 0 011 11.5l2.11-3.164A3 3 0 015.364 7.01a4 4 0 115.27 0zM8 6a2 2 0 100-4 2 2 0 000 4zM5.606 9a1 1 0 00-.832.445l-2.11 3.164A.894.894 0 003.408 14h9.184a.894.894 0 00.744-1.39l-2.11-3.165A1 1 0 0010.394 9H5.606z";

    var time = "M9 7h3a1 1 0 010 2H8a1 1 0 01-1-1V4a1 1 0 112 0v3zm-1 9A8 8 0 118 0a8 8 0 010 16zm0-2A6 6 0 108 2a6 6 0 000 12z";

    var pin = "M7.698 16S3 7.761 3 5a5 5 0 1110 0c0 2.761-5.302 11-5.302 11zm-.552-5.342c.214.437.434.876.658 1.314.27-.467.537-.936.794-1.402.27-.492.526-.97.762-1.43C10.392 7.133 11 5.555 11 5a3 3 0 10-6 0c0 .6.543 2.191 1.47 4.226.209.46.435.939.676 1.432zM8 6.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z";

    var mark = "M2 0h12a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm0 2v12h12V2H2zm2 2h2v2H4zm0 2h2v2H4zm4-2h2v2H8zm0 4h2v2H8zM6 6h2v2H6zm4 0h2v2h-2zm0 2h2v2h-2zM6 8h2v2H6zm-2 2h2v2H4zm2 0h2v2H6zm4 0h2v2h-2z";

    var copyLink = "M8.597 7.539c.78.766.78 2.005 0 2.77l-2.354 2.314c-.784.77-2.057.77-2.84 0a1.934 1.934 0 010-2.77.894.894 0 00.005-1.274.916.916 0 00-1.286-.005 3.72 3.72 0 000 5.326 3.866 3.866 0 005.401 0l2.355-2.313a3.72 3.72 0 000-5.326.916.916 0 00-1.286.005.894.894 0 00.005 1.273zm-1.194.922a1.934 1.934 0 010-2.77l2.354-2.314a2.035 2.035 0 012.84 0c.78.766.78 2.005 0 2.77a.894.894 0 00-.005 1.274.916.916 0 001.286.005 3.72 3.72 0 000-5.326 3.866 3.866 0 00-5.401 0L6.122 4.413a3.72 3.72 0 000 5.326.916.916 0 001.286-.005.894.894 0 00-.005-1.273z";

    var document$1 = "M4 0a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4.87a2 2 0 00-.578-1.405L10.58.594A2 2 0 009.158 0H4zm0 2h5.158L12 4.871V14H4V2zm2 2a1 1 0 100 2h3.002a1 1 0 100-2H6zm0 3a1 1 0 100 2h4a1 1 0 100-2H6zm0 3a1 1 0 100 2h4a1 1 0 100-2H6z";

    var tire = "M9.88 16l-3.68-.016c-.135 0-.903-.064-1.025-.064a.203.203 0 01-.037-.004 4.826 4.826 0 01-1.01-.32c-.132-.056-.28-.28-.096-.272.58-.06 1.188-.12 1.276-.158.1-.044-1.55-.236-1.942-.29-.026-.017-.418-.007-.586-.135-.297-.225-.232-.177-.506-.462-.107-.113-.132-.36.057-.369.188-.009 1.206-.052 1.294-.09.107-.047-1.799-.515-1.93-.54-.068-.013-.283-.127-.331-.199-.233-.34-.142-.224-.336-.606-.096-.19-.118-.452.092-.462.159-.006 1.163-.174 1.25-.212.107-.047-1.568-.645-1.7-.684a.462.462 0 01-.3-.282c-.133-.427-.138-.51-.211-.956-.03-.178.001-.396.25-.402.11-.004 1.182-.12 1.269-.157.106-.047-1.08-.556-1.31-.652-.17-.07-.35-.262-.357-.438a12.41 12.41 0 01-.007-.364c0-.34-.014-.34.017-.671.017-.177.118-.283.272-.285.154-.002 1.176-.215 1.374-.205.119.006-1.048-.686-1.202-.763a.376.376 0 01-.187-.427c.102-.435.13-.592.289-1.004.062-.163.202-.17.378-.17s.963-.145 1.37-.116c-.36-.263-.952-.51-1.077-.565-.125-.056-.132-.317-.05-.462.208-.367.234-.478.486-.791.101-.127.238-.14.497-.119.262.022 1.332-.044 1.42-.083.103-.045-.665-.493-.823-.557-.165-.068-.136-.285-.022-.385.287-.253.191-.21.5-.406.12-.077.408-.061.615-.048.52.031 1.35.059 1.413.031.077-.034-.55-.224-.715-.282-.149-.052-.078-.298.14-.375.332-.116.57-.147.917-.18.133-.008.867.02 1.039 0h3.002L9.666 0H10l-.013.003c.192.005.367.012.433.023a4.98 4.98 0 011.051.257c.135.05.215.233.176.408 0 .004-.004.005-.007.01l.143.061s.559-.07.688.01c.32.197.628.432.92.699.114.106.142.312.059.46-.003.006-.008.003-.011.009.137.138.255.266.289.314.002-.005.376-.019.475.11.25.326.48.682.684 1.058.08.15.051.355-.065.46l-.01.004c.092.187.238.492.238.492s.31.069.368.236c.15.416.275.85.368 1.291.037.176-.045.358-.181.405l-.01.001c.039.216.066.436.089.658l.011-.008c.156-.012.266.118.279.3a10.398 10.398 0 01-.065 2.103c-.022.16-.13.273-.254.273a.225.225 0 01-.044-.004c-.003-.001-.003-.006-.007-.007a9.326 9.326 0 01-.13.647c.003 0 .005-.002.007-.001.133.062.203.251.156.423a9.2 9.2 0 01-.447 1.249c-.049.106-.133.167-.222.167-.044 0-.156.011-.159.008-.093.191-.169.31-.272.489.004.004.009.001.013.006.11.116.124.323.035.464a7.347 7.347 0 01-.748.984.223.223 0 01-.167.08 3.18 3.18 0 01-.307-.025c-.137.138-.166.168-.31.29 0 .004.004.004.006.008.073.156.034.36-.087.452-.307.236-.63.439-.96.603a.21.21 0 01-.092.022c-.104 0-.605.02-.605.02s-.276.367-.415.401a3.17 3.17 0 01-.725.087l-.302-.001zM8.666.37c-.177.06-.34.124-.476.192-.54.033-1.916.25-1.843.28.077.031.54-.007 1.05-.001.089.001.247.026.052.145-.219.134-.416.296-.626.447-.245.176-.432.22-.566.25-.614.135-1.635.479-1.57.504.07.03.471-.001.933-.001.122 0 .325.031.141.266-.187.24-.385.476-.565.728a1.248 1.248 0 01-.633.483c-.6.218-1.243.542-1.187.565.06.024.366.007.741.001.148-.003.44.05.297.368-.158.351-.266.724-.393 1.096a.695.695 0 01-.357.422c-.486.261-.99.578-.939.6.052.02.405.005.754-.01.113-.005.318.055.278.354a7.26 7.26 0 00-.057.983c0 .099.015.197.007.295-.03.346-.193.395-.295.46-.38.248-.726.519-.68.538.052.022.402.018.747.009a.353.353 0 01.366.29c.072.404.19.793.297 1.178.074.267-.05.398-.128.455-.338.246-.674.523-.628.542.06.024.492.001.873.006.243.004.35.135.385.204.17.332.36.65.57.953.065.094.157.299-.07.458-.26.184-.528.379-.482.398.064.026.572.011.973.005a.577.577 0 01.441.168c.229.23.47.445.726.643.076.06.22.176.062.29-.136.097-.245.197-.195.218.062.025.334.03.65.008a.685.685 0 01.372.077c.255.137.555.261.868.372a7.916 7.916 0 01-1.12-.64c.294-.128-.456-.609-.519-.39a7.678 7.678 0 01-1.05-1.04c.41-.076-.31-.83-.452-.6a7.818 7.818 0 01-.714-1.305c.536-.134-.061-.98-.291-.788a8.996 8.996 0 01-.35-1.666c.504-.009.32-.984-.059-.849a9.904 9.904 0 01.088-1.655c.352.154.536-.913.146-.791.133-.58.32-1.126.553-1.635.296.33.8-.84.382-.734a7.92 7.92 0 01.967-1.315c.14.427.997-.496.536-.533.283-.255.582-.487.896-.695-.083.38 1.003-.269.523-.318.186-.103.377-.198.571-.286zm1.544 2.548c-1.973 0-3.572 2.276-3.572 5.084 0 2.807 1.6 5.083 3.572 5.083 1.973 0 3.571-2.277 3.571-5.083 0-2.808-1.598-5.084-3.571-5.084z";

    var tShirt = "M14.983 3.158a.355.355 0 00-.167-.211l-2.67-1.417a11.585 11.585 0 00-1.73-.523.278.278 0 00-.06-.007c-.145 0-.275.115-.307.283C9.836 2.363 9.004 3.17 8 3.17s-1.836-.808-2.049-1.887C5.918 1.115 5.79 1 5.645 1a.26.26 0 00-.061.007c-.584.128-1.163.302-1.732.523L1.184 2.947a.348.348 0 00-.166.21.407.407 0 00.017.285L2.193 6.07c.055.125.165.2.282.2.03 0 .06-.005.09-.015l1.287-.439v8.82c0 .2.143.364.317.364h7.662c.174 0 .316-.163.316-.364v-8.82l1.288.439c.03.01.06.015.09.015a.314.314 0 00.282-.2l1.159-2.628a.415.415 0 00.017-.284z";

    var cigarette = "M14 12v4H0v-4h14zm2 0v4h-1v-4h1zM14.779 1C15.472 2.06 16 2.96 16 5.072c0 2.11-1.172 2.937-1.221 4.928C13.965 9.289 13 8.646 13 6.379 13 4.6 14.8 3.012 14.779 1zm-1.593-1c.462.471.814.871.814 1.81 0 .938-.781 1.305-.814 2.19C12.643 3.684 12 3.398 12 2.39 12 1.6 13.2.895 13.186 0z";

    var shoes = "M0 8.123l16 3.972c-.624 1.006-1.39 1.698-2.098 1.532L.93 10.59C.223 10.424-.033 9.267 0 8.123zm1.746-5.684a.719.719 0 01.828-.418.534.534 0 01.41.476l.02.265c.068.921.719 1.676 1.656 1.924 1.335.352 2.84-.406 3.353-1.69l.156-.39a.894.894 0 011.03-.518.69.69 0 01.41.29l.91 1.74-1.866.347.556.606 1.84-.364.454.51-1.863.345.549.582 1.716-.362.398.483-1.513.406.537.556 1.482-.391c.53.722.91 1.164 1.874 1.544l.521.26c.968.433.766 1.341.796 2.297L0 6.993z";

    var bike = "M8.058 3.306c.263-.233 1.105-.646 1.796.213.335.418.36 1.01.155 1.48l.075.673 1.687-.691c.344-.143.733.05.863.43.13.382-.047.805-.394.947l-.153.063.47 2.554c.077-.006.154-.013.233-.013 1.77 0 3.21 1.579 3.21 3.519C16 14.42 14.56 16 12.79 16s-3.21-1.579-3.21-3.52c0-.506.1-.988.278-1.424l-.62-.41-.955 1.715a.925.925 0 01-.803.493.875.875 0 01-.488-.15c-.443-.297-.583-.93-.313-1.416l1.048-1.882-1.962-.873h-.578l-.356.915c.949.612 1.59 1.74 1.59 3.033C6.42 14.42 4.98 16 3.21 16S0 14.421 0 12.48c0-1.94 1.44-3.518 3.21-3.518.306 0 .6.05.881.138l.221-.567c-.295-.002-.534-.264-.534-.588 0-.31.22-.556.496-.58a1.12 1.12 0 01.05-.584c.059-.155.149-.283.257-.387zM3.21 9.845c-1.326 0-2.405 1.182-2.405 2.636 0 1.454 1.08 2.636 2.405 2.636 1.189 0 2.172-.951 2.364-2.195H3.88a.771.771 0 01-.67.42c-.433 0-.785-.386-.785-.861 0-.435.296-.791.678-.849l.667-1.708a2.19 2.19 0 00-.56-.08zm9.58 0l-.072.008.334 1.82a.856.856 0 01.523.808c0 .475-.352.86-.785.86-.433 0-.785-.385-.785-.86v-.003l-1.448-.96a2.83 2.83 0 00-.172.963c0 1.454 1.079 2.636 2.405 2.636 1.326 0 2.405-1.182 2.405-2.636 0-1.454-1.079-2.636-2.405-2.636zm-8.28.424l-.666 1.709.036.062h1.694a2.652 2.652 0 00-1.064-1.77zm7.418-.242a2.417 2.417 0 00-.95.74l1.237.818zm-3.13-3.774l-1.056.937 1.715.764a.999.999 0 01.54.631c.086.287.053.601-.091.859l-.25.448.619.41a3.238 3.238 0 011.492-1.153l-.444-2.415-1.566.642a.62.62 0 01-.583-.06.743.743 0 01-.318-.539l-.059-.524zM9.207.74a1.5 1.5 0 112.585 1.52A1.5 1.5 0 019.207.74z";

    var pulse = "M8.991 0v9.46l1.643-2.451 5.366.04-.015 1.981-4.293-.032L7.002 16V5.42L3.946 9.022H0V7.041h3.023z";

    var exit = "M9.03 0a2 2 0 012 1.997V5h-2l-.001-3H3.05l2.16 1.674a3 3 0 011.817 2.752l.025 4.572L5.72 11h3.314l-.001-2h2l.001 2.008a2 2 0 01-2 1.992H7.026v.765a2 2 0 01-2.894 1.79l-3.026-3.01A2 2 0 010 10.753l.023-8.756a2 2 0 012-1.997H9.03zM2.018 3.649L2 10.756l3.026 3.01V11h.027l-.025-4.57a1 1 0 00-.606-.918L2.02 3.65zm11.474 1.015l1.843 1.843a.697.697 0 010 .986l-1.843 1.843a.697.697 0 11-.986-.985l.351-.352L9.888 8C9.399 8 9 7.552 9 7s.398-1 .889-1h2.968l-.35-.35a.697.697 0 01.986-.986z";

    var zoomIn = "M6 0a6 6 0 014.891 9.476l4.816 4.817a1 1 0 01-1.414 1.414l-4.817-4.816A6 6 0 116 0zm0 2a4 4 0 100 8 4 4 0 000-8zm0 1a1 1 0 011 1v1h1a1 1 0 110 2H7v1a1 1 0 11-2 0V7H4a1 1 0 110-2h1V4a1 1 0 011-1z";

    var zoomOut = "M6 0a6 6 0 014.891 9.476l4.816 4.817a1 1 0 01-1.414 1.414l-4.817-4.816A6 6 0 116 0zm0 2a4 4 0 100 8 4 4 0 000-8zm2 3a1 1 0 110 2H4a1 1 0 110-2h4z";

    var search$1 = "M6 0a6 6 0 014.891 9.476l4.816 4.817a1 1 0 01-1.414 1.414l-4.817-4.816A6 6 0 116 0zm0 2a4 4 0 100 8 4 4 0 000-8z";

    var flash = "M11.784.089l.07.057 4 4a.501.501 0 01.057.638l-.057.07L12.707 8l.147.146a.501.501 0 01.057.638l-.057.07-5.965 5.964a4.062 4.062 0 01-2.626 1.175L4.036 16a4.009 4.009 0 01-2.854-1.182A4.006 4.006 0 010 11.964a4.06 4.06 0 011.026-2.687l.156-.166 5.964-5.965a.501.501 0 01.638-.057l.07.057.146.147L11.146.146a.501.501 0 01.638-.057zM3.293 11.293a1 1 0 101.416 1.414 1 1 0 00-1.416-1.414zM11.5 1.207L8.707 4l1.011 1.011 1.463-1.463 1.362 1.362-1.464 1.462.921.921.007-.007L14.793 4.5 11.5 1.207z";

    var questionInvert = "M8 0a8 8 0 110 16A8 8 0 018 0zm0 12a1 1 0 100 2 1 1 0 000-2zM8 2C5.794 2 4 3.73 4 5.857c0 .533.448.964 1 .964s1-.431 1-.964c0-1.063.897-1.928 2-1.928s2 .865 2 1.928c0 1.064-.897 1.929-2 1.929-.552 0-1 .431-1 .964v1.286l.007.112c.057.48.48.852.993.852.552 0 1-.432 1-.964v-.444l.19-.052C10.816 9.05 12 7.585 12 5.857 12 3.73 10.206 2 8 2z";

    var info = "M8 0a8 8 0 110 16A8 8 0 018 0zm0 2a6 6 0 100 12A6 6 0 008 2zm0 5a1 1 0 011 1v3a1 1 0 01-2 0V8a1 1 0 011-1zm0-3a1 1 0 110 2 1 1 0 010-2z";

    const icons = {
      "arrow-down": arrowDown,
      "arrow-left": arrowLeft,
      "arrow-right": arrowRight,
      "arrow-up": arrowUp,
      "arrows-updown": arrowsUpdown,
      attention,
      burger,
      calendar,
      cashbox,
      cashbox2,
      catalog,
      check,
      "chevron-down": chevronDown,
      "chevron-left": chevronLeft,
      "chevron-right": chevronRight,
      "chevron-up": chevronUp,
      clear,
      close,
      column,
      copy,
      cycle,
      visible,
      edit,
      favorite,
      "favorite-fill": favoriteFill,
      file: file$8,
      filter,
      history: history$1,
      "input-calendar": inputCalendar,
      invisible,
      key,
      list3,
      loader,
      market,
      message,
      minus,
      "more-horizontal": moreHorizontal,
      "more-vertical": moreVertical,
      phone,
      plus,
      print,
      question,
      rouble,
      save,
      set,
      settings,
      sort,
      "sort-down": sortDown,
      "sort-up": sortUp,
      trash,
      upload,
      download,
      "cash-check": cashCheck,
      move,
      tree,
      list4,
      ok,
      monitor,
      "toggle-off": toggleOff,
      "toggle-on": toggleOn,
      mail,
      "mail-full": mailFull,
      "mail-ok": mailOk,
      fullscreen,
      smallscreen,
      cart,
      "notify-not": notifyNot,
      notify,
      "monitor-not": monitorNot,
      start,
      image,
      hub,
      profile,
      time,
      pin,
      mark,
      "copy-link": copyLink,
      document: document$1,
      tire,
      cigarette,
      "t-shirt": tShirt,
      shoes,
      bike,
      pulse,
      exit,
      "zoom-in": zoomIn,
      "zoom-out": zoomOut,
      search: search$1,
      flash,
      "question-invert": questionInvert,
      info,
    };

    function getEventsAction(component) {
      return (node) => {
        const events = Object.keys(component.$$.callbacks);
        const listeners = [];

        events.forEach((event) =>
          listeners.push(listen(node, event, (e) => bubble(component, e)))
        );

        return {
          destroy: () => {
            listeners.forEach((listener) => listener());
          },
        };
      };
    }


    function getSVGIconObjet(input) {
      const iconObject = { viewbox: 16, pathes:[] };

      let raw = (icons[input]) ? icons[input] : input;

      if(typeof raw === 'string' && raw.startsWith("M")) return (iconObject.pathes.push({path:raw}),iconObject);

      if (Array.isArray(raw)) iconObject.pathes = raw;
      if( typeof raw === 'object'){
        if(raw.viewbox) iconObject.viewbox = raw.viewbox;
        if(raw.pathes) iconObject.pathes = Array.isArray(raw.pathes) ? raw.pathes : [raw.pathes];
      }

      iconObject.pathes = iconObject.pathes.map(p => {
        if(typeof p === 'string' && p.startsWith("M")) return {path:p};
        if(typeof p === 'object' && p.path) return p;
        return {};
      }).filter(p=>!!p.path);

      return iconObject;
    }

    var css_248z$4 = "";
    styleInject(css_248z$4);

    /* node_modules\svelte-atoms\Icon.svelte generated by Svelte v3.31.2 */
    const file$9 = "node_modules\\svelte-atoms\\Icon.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i].path;
    	child_ctx[6] = list[i].color;
    	return child_ctx;
    }

    // (19:4) {#each iconObject.pathes as { path, color }}
    function create_each_block(ctx) {
    	let path;
    	let path_style_value;
    	let path_d_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "style", path_style_value = /*color*/ ctx[6] ? `fill: ${/*color*/ ctx[6]}` : null);
    			attr_dev(path, "d", path_d_value = /*path*/ ctx[5]);
    			add_location(path, file$9, 19, 6, 425);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*iconObject*/ 4 && path_style_value !== (path_style_value = /*color*/ ctx[6] ? `fill: ${/*color*/ ctx[6]}` : null)) {
    				attr_dev(path, "style", path_style_value);
    			}

    			if (dirty & /*iconObject*/ 4 && path_d_value !== (path_d_value = /*path*/ ctx[5])) {
    				attr_dev(path, "d", path_d_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(19:4) {#each iconObject.pathes as { path, color }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let svg;
    	let g;
    	let svg_viewBox_value;
    	let svg_class_value;
    	let svg_style_value;
    	let each_value = /*iconObject*/ ctx[2].pathes;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(g, file$9, 17, 2, 366);
    			attr_dev(svg, "width", /*size*/ ctx[0]);
    			attr_dev(svg, "height", /*size*/ ctx[0]);
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*iconObject*/ ctx[2].viewbox + "\n  " + /*iconObject*/ ctx[2].viewbox);
    			attr_dev(svg, "class", svg_class_value = "" + (null_to_empty(`aa-icon ${/*status*/ ctx[1]} ${/*$$props*/ ctx[3].class || ""}`) + " svelte-1g6tgxb"));
    			attr_dev(svg, "style", svg_style_value = /*$$props*/ ctx[3].style || null);
    			add_location(svg, file$9, 10, 0, 182);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*iconObject*/ 4) {
    				each_value = /*iconObject*/ ctx[2].pathes;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*size*/ 1) {
    				attr_dev(svg, "width", /*size*/ ctx[0]);
    			}

    			if (dirty & /*size*/ 1) {
    				attr_dev(svg, "height", /*size*/ ctx[0]);
    			}

    			if (dirty & /*iconObject*/ 4 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*iconObject*/ ctx[2].viewbox + "\n  " + /*iconObject*/ ctx[2].viewbox)) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (dirty & /*status, $$props*/ 10 && svg_class_value !== (svg_class_value = "" + (null_to_empty(`aa-icon ${/*status*/ ctx[1]} ${/*$$props*/ ctx[3].class || ""}`) + " svelte-1g6tgxb"))) {
    				attr_dev(svg, "class", svg_class_value);
    			}

    			if (dirty & /*$$props*/ 8 && svg_style_value !== (svg_style_value = /*$$props*/ ctx[3].style || null)) {
    				attr_dev(svg, "style", svg_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let iconObject;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Icon", slots, []);
    	let { icon = "" } = $$props;
    	let { size = 16 } = $$props;
    	let { status = "" } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("icon" in $$new_props) $$invalidate(4, icon = $$new_props.icon);
    		if ("size" in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ("status" in $$new_props) $$invalidate(1, status = $$new_props.status);
    	};

    	$$self.$capture_state = () => ({
    		getSVGIconObjet,
    		icon,
    		size,
    		status,
    		iconObject
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    		if ("icon" in $$props) $$invalidate(4, icon = $$new_props.icon);
    		if ("size" in $$props) $$invalidate(0, size = $$new_props.size);
    		if ("status" in $$props) $$invalidate(1, status = $$new_props.status);
    		if ("iconObject" in $$props) $$invalidate(2, iconObject = $$new_props.iconObject);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 16) {
    			 $$invalidate(2, iconObject = getSVGIconObjet(icon));
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [size, status, iconObject, $$props, icon];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { icon: 4, size: 0, status: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get icon() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get status() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set status(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$5 = "";
    styleInject(css_248z$5);

    /* node_modules\svelte-atoms\Loader.svelte generated by Svelte v3.31.2 */
    const file$a = "node_modules\\svelte-atoms\\Loader.svelte";

    // (20:2) <Typography>
    function create_default_slot$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(20:2) <Typography>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let svg;
    	let circle;
    	let circle_class_value;
    	let t;
    	let typography;
    	let div_class_value;
    	let div_style_value;
    	let current;

    	typography = new Typography({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			t = space();
    			create_component(typography.$$.fragment);
    			attr_dev(circle, "class", circle_class_value = "" + (null_to_empty(`path ${/*status*/ ctx[1]}`) + " svelte-1p20few"));
    			attr_dev(circle, "cx", "50");
    			attr_dev(circle, "cy", "50");
    			attr_dev(circle, "r", "20");
    			attr_dev(circle, "fill", "none");
    			attr_dev(circle, "stroke-width", "6");
    			attr_dev(circle, "stroke-miter-limit", "10");
    			add_location(circle, file$a, 10, 4, 314);
    			attr_dev(svg, "class", "icon svelte-1p20few");
    			attr_dev(svg, "width", /*size*/ ctx[0]);
    			attr_dev(svg, "height", /*size*/ ctx[0]);
    			attr_dev(svg, "viewBox", "25 25 50 50");
    			add_location(svg, file$a, 9, 2, 242);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`aa-loader ${/*$$props*/ ctx[2].class || ""}`) + " svelte-1p20few"));
    			attr_dev(div, "style", div_style_value = /*$$props*/ ctx[2].style || "");
    			add_location(div, file$a, 8, 0, 163);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, circle);
    			append_dev(div, t);
    			mount_component(typography, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*status*/ 2 && circle_class_value !== (circle_class_value = "" + (null_to_empty(`path ${/*status*/ ctx[1]}`) + " svelte-1p20few"))) {
    				attr_dev(circle, "class", circle_class_value);
    			}

    			if (!current || dirty & /*size*/ 1) {
    				attr_dev(svg, "width", /*size*/ ctx[0]);
    			}

    			if (!current || dirty & /*size*/ 1) {
    				attr_dev(svg, "height", /*size*/ ctx[0]);
    			}

    			const typography_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				typography_changes.$$scope = { dirty, ctx };
    			}

    			typography.$set(typography_changes);

    			if (!current || dirty & /*$$props*/ 4 && div_class_value !== (div_class_value = "" + (null_to_empty(`aa-loader ${/*$$props*/ ctx[2].class || ""}`) + " svelte-1p20few"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*$$props*/ 4 && div_style_value !== (div_style_value = /*$$props*/ ctx[2].style || "")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(typography.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(typography.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(typography);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Loader", slots, ['default']);
    	let { size = 40 } = $$props;
    	let { status = "noactive" } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("size" in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ("status" in $$new_props) $$invalidate(1, status = $$new_props.status);
    		if ("$$scope" in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Icon, Typography, size, status });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("size" in $$props) $$invalidate(0, size = $$new_props.size);
    		if ("status" in $$props) $$invalidate(1, status = $$new_props.status);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [size, status, $$props, slots, $$scope];
    }

    class Loader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { size: 0, status: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loader",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get size() {
    		throw new Error("<Loader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Loader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get status() {
    		throw new Error("<Loader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set status(value) {
    		throw new Error("<Loader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$6 = "";
    styleInject(css_248z$6);

    /* node_modules\svelte-atoms\Button.svelte generated by Svelte v3.31.2 */
    const file$b = "node_modules\\svelte-atoms\\Button.svelte";

    // (27:4) {:else}
    function create_else_block$2(ctx) {
    	let t0;
    	let span;
    	let t1;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*iconLeft*/ ctx[4] && create_if_block_2(ctx);
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);
    	let if_block1 = /*iconRight*/ ctx[5] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			span = element("span");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(span, "class", "contentText svelte-rvh4cn");
    			add_location(span, file$b, 30, 6, 945);
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*iconLeft*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*iconLeft*/ 16) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 512) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, null, null);
    				}
    			}

    			if (/*iconRight*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*iconRight*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(default_slot, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(27:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (25:4) {#if isLoading}
    function create_if_block$2(ctx) {
    	let loader;
    	let current;

    	loader = new Loader({
    			props: {
    				size: 28,
    				status: /*type*/ ctx[0] === "filled"
    				? "white"
    				: /*status*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(loader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loader, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const loader_changes = {};

    			if (dirty & /*type, status*/ 5) loader_changes.status = /*type*/ ctx[0] === "filled"
    			? "white"
    			: /*status*/ ctx[2];

    			loader.$set(loader_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(25:4) {#if isLoading}",
    		ctx
    	});

    	return block;
    }

    // (28:6) {#if iconLeft}
    function create_if_block_2(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				icon: /*iconLeft*/ ctx[4],
    				status: /*iconStatus*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*iconLeft*/ 16) icon_changes.icon = /*iconLeft*/ ctx[4];
    			if (dirty & /*iconStatus*/ 64) icon_changes.status = /*iconStatus*/ ctx[6];
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(28:6) {#if iconLeft}",
    		ctx
    	});

    	return block;
    }

    // (34:6) {#if iconRight}
    function create_if_block_1(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				icon: /*iconRight*/ ctx[5],
    				status: /*iconStatus*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*iconRight*/ 32) icon_changes.icon = /*iconRight*/ ctx[5];
    			if (dirty & /*iconStatus*/ 64) icon_changes.status = /*iconStatus*/ ctx[6];
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(34:6) {#if iconRight}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let button;
    	let span;
    	let current_block_type_index;
    	let if_block;
    	let button_disabled_value;
    	let button_class_value;
    	let button_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isLoading*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			if_block.c();
    			attr_dev(span, "class", "content svelte-rvh4cn");
    			add_location(span, file$b, 23, 2, 725);
    			button.disabled = button_disabled_value = /*disabled*/ ctx[1] || /*isLoading*/ ctx[3];
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(`aa-button ${/*type*/ ctx[0]} ${/*disabled*/ ctx[1] ? "disabled" : /*status*/ ctx[2]} ${/*isLoading*/ ctx[3] ? "loading" : ""} ${/*$$props*/ ctx[8].class || ""}`) + " svelte-rvh4cn"));
    			attr_dev(button, "style", button_style_value = /*$$props*/ ctx[8].style || "");
    			add_location(button, file$b, 18, 0, 519);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);
    			if_blocks[current_block_type_index].m(span, null);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(/*events*/ ctx[7].call(null, button));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(span, null);
    			}

    			if (!current || dirty & /*disabled, isLoading*/ 10 && button_disabled_value !== (button_disabled_value = /*disabled*/ ctx[1] || /*isLoading*/ ctx[3])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}

    			if (!current || dirty & /*type, disabled, status, isLoading, $$props*/ 271 && button_class_value !== (button_class_value = "" + (null_to_empty(`aa-button ${/*type*/ ctx[0]} ${/*disabled*/ ctx[1] ? "disabled" : /*status*/ ctx[2]} ${/*isLoading*/ ctx[3] ? "loading" : ""} ${/*$$props*/ ctx[8].class || ""}`) + " svelte-rvh4cn"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (!current || dirty & /*$$props*/ 256 && button_style_value !== (button_style_value = /*$$props*/ ctx[8].style || "")) {
    				attr_dev(button, "style", button_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let iconStatus;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { type = "filled" } = $$props;
    	let { disabled = false } = $$props;
    	let { status = "primary" } = $$props;
    	let { isLoading = false } = $$props;
    	let { iconLeft = null } = $$props;
    	let { iconRight = null } = $$props;
    	const events = getEventsAction(current_component);

    	$$self.$$set = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("type" in $$new_props) $$invalidate(0, type = $$new_props.type);
    		if ("disabled" in $$new_props) $$invalidate(1, disabled = $$new_props.disabled);
    		if ("status" in $$new_props) $$invalidate(2, status = $$new_props.status);
    		if ("isLoading" in $$new_props) $$invalidate(3, isLoading = $$new_props.isLoading);
    		if ("iconLeft" in $$new_props) $$invalidate(4, iconLeft = $$new_props.iconLeft);
    		if ("iconRight" in $$new_props) $$invalidate(5, iconRight = $$new_props.iconRight);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getEventsAction,
    		current_component,
    		Loader,
    		Icon,
    		type,
    		disabled,
    		status,
    		isLoading,
    		iconLeft,
    		iconRight,
    		events,
    		iconStatus
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), $$new_props));
    		if ("type" in $$props) $$invalidate(0, type = $$new_props.type);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$new_props.disabled);
    		if ("status" in $$props) $$invalidate(2, status = $$new_props.status);
    		if ("isLoading" in $$props) $$invalidate(3, isLoading = $$new_props.isLoading);
    		if ("iconLeft" in $$props) $$invalidate(4, iconLeft = $$new_props.iconLeft);
    		if ("iconRight" in $$props) $$invalidate(5, iconRight = $$new_props.iconRight);
    		if ("iconStatus" in $$props) $$invalidate(6, iconStatus = $$new_props.iconStatus);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*disabled, type, status*/ 7) {
    			 $$invalidate(6, iconStatus = disabled
    			? "noactive"
    			: type === "filled" ? "white" : status);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		type,
    		disabled,
    		status,
    		isLoading,
    		iconLeft,
    		iconRight,
    		iconStatus,
    		events,
    		$$props,
    		$$scope,
    		slots
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			type: 0,
    			disabled: 1,
    			status: 2,
    			isLoading: 3,
    			iconLeft: 4,
    			iconRight: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get status() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set status(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isLoading() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isLoading(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconLeft() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconLeft(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconRight() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconRight(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$7 = "";
    styleInject(css_248z$7);

    /* node_modules\svelte-atoms\Dropdown.svelte generated by Svelte v3.31.2 */
    const file$c = "node_modules\\svelte-atoms\\Dropdown.svelte";
    const get_dropdown_slot_changes = dirty => ({});
    const get_dropdown_slot_context = ctx => ({});

    // (55:4) {#if isOpen}
    function create_if_block$3(ctx) {
    	let div1;
    	let div0;
    	let div0_style_value;
    	let div1_style_value;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const dropdown_slot_template = /*#slots*/ ctx[14].dropdown;
    	const dropdown_slot = create_slot(dropdown_slot_template, ctx, /*$$scope*/ ctx[13], get_dropdown_slot_context);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (dropdown_slot) dropdown_slot.c();

    			attr_dev(div0, "style", div0_style_value = /*maxHeight*/ ctx[5]
    			? `max-height:${/*maxHeight*/ ctx[5]}px; `
    			: "");

    			add_location(div0, file$c, 59, 8, 1613);
    			attr_dev(div1, "style", div1_style_value = `top:${/*dropdownTop*/ ctx[7]}; left:${/*dropdownLeft*/ ctx[8]}`);
    			attr_dev(div1, "class", "aa-dropdown svelte-spfp8g");
    			add_location(div1, file$c, 55, 6, 1461);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (dropdown_slot) {
    				dropdown_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[16](div0);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					div0,
    					"click",
    					stop_propagation(function () {
    						if (is_function(/*closeOnClick*/ ctx[0] ? /*close*/ ctx[10] : undefined)) (/*closeOnClick*/ ctx[0] ? /*close*/ ctx[10] : undefined).apply(this, arguments);
    					}),
    					false,
    					false,
    					true
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dropdown_slot) {
    				if (dropdown_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(dropdown_slot, dropdown_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_dropdown_slot_changes, get_dropdown_slot_context);
    				}
    			}

    			if (!current || dirty & /*maxHeight*/ 32 && div0_style_value !== (div0_style_value = /*maxHeight*/ ctx[5]
    			? `max-height:${/*maxHeight*/ ctx[5]}px; `
    			: "")) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			if (!current || dirty & /*dropdownTop, dropdownLeft*/ 384 && div1_style_value !== (div1_style_value = `top:${/*dropdownTop*/ ctx[7]}; left:${/*dropdownLeft*/ ctx[8]}`)) {
    				attr_dev(div1, "style", div1_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dropdown_slot, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, { duration: 200 }, true);
    					div1_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dropdown_slot, local);

    			if (local) {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, { duration: 200 }, false);
    				div1_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (dropdown_slot) dropdown_slot.d(detaching);
    			/*div0_binding*/ ctx[16](null);
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(55:4) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let div1_class_value;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[15]);
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);
    	let if_block = /*isOpen*/ ctx[6] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t1 = space();
    			attr_dev(div0, "class", "dropdownContainer svelte-spfp8g");
    			add_location(div0, file$c, 53, 2, 1406);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(`host ${/*$$props*/ ctx[11].class || ""}`) + " svelte-spfp8g"));
    			add_location(div1, file$c, 48, 0, 1281);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			/*div1_binding*/ ctx[18](div1);
    			insert_dev(target, t1, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "resize", /*onwindowresize*/ ctx[15]),
    					listen_dev(div1, "click", stop_propagation(/*click_handler*/ ctx[17]), false, false, true),
    					listen_dev(document.body, "click", /*close*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, null, null);
    				}
    			}

    			if (/*isOpen*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isOpen*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$$props*/ 2048 && div1_class_value !== (div1_class_value = "" + (null_to_empty(`host ${/*$$props*/ ctx[11].class || ""}`) + " svelte-spfp8g"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block) if_block.d();
    			/*div1_binding*/ ctx[18](null);
    			if (detaching) detach_dev(t1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Dropdown", slots, ['default','dropdown']);
    	let { closeOnClick = false } = $$props;
    	let { disabled = false } = $$props;
    	let isOpen = false;
    	let dropdownRef;
    	let hostRef;
    	let innerHeight;
    	let innerWidth;
    	let maxHeight = "auto";
    	let dropdownTop = "calc(100% + 4px)";
    	let dropdownLeft = "0px";
    	const dispatch = createEventDispatcher();

    	const toggle = (state = !isOpen) => {
    		$$invalidate(6, isOpen = disabled ? false : state);
    		dispatch(isOpen ? "open" : "close", null);
    	};

    	const close = () => {
    		if (isOpen) toggle(false);
    	};

    	function onwindowresize() {
    		$$invalidate(3, innerHeight = window.innerHeight);
    		$$invalidate(4, innerWidth = window.innerWidth);
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			dropdownRef = $$value;
    			$$invalidate(1, dropdownRef);
    		});
    	}

    	const click_handler = () => toggle();

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hostRef = $$value;
    			$$invalidate(2, hostRef);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("closeOnClick" in $$new_props) $$invalidate(0, closeOnClick = $$new_props.closeOnClick);
    		if ("disabled" in $$new_props) $$invalidate(12, disabled = $$new_props.disabled);
    		if ("$$scope" in $$new_props) $$invalidate(13, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		slide,
    		createEventDispatcher,
    		closeOnClick,
    		disabled,
    		isOpen,
    		dropdownRef,
    		hostRef,
    		innerHeight,
    		innerWidth,
    		maxHeight,
    		dropdownTop,
    		dropdownLeft,
    		dispatch,
    		toggle,
    		close
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ("closeOnClick" in $$props) $$invalidate(0, closeOnClick = $$new_props.closeOnClick);
    		if ("disabled" in $$props) $$invalidate(12, disabled = $$new_props.disabled);
    		if ("isOpen" in $$props) $$invalidate(6, isOpen = $$new_props.isOpen);
    		if ("dropdownRef" in $$props) $$invalidate(1, dropdownRef = $$new_props.dropdownRef);
    		if ("hostRef" in $$props) $$invalidate(2, hostRef = $$new_props.hostRef);
    		if ("innerHeight" in $$props) $$invalidate(3, innerHeight = $$new_props.innerHeight);
    		if ("innerWidth" in $$props) $$invalidate(4, innerWidth = $$new_props.innerWidth);
    		if ("maxHeight" in $$props) $$invalidate(5, maxHeight = $$new_props.maxHeight);
    		if ("dropdownTop" in $$props) $$invalidate(7, dropdownTop = $$new_props.dropdownTop);
    		if ("dropdownLeft" in $$props) $$invalidate(8, dropdownLeft = $$new_props.dropdownLeft);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*dropdownRef, hostRef, innerHeight, maxHeight, innerWidth*/ 62) {
    			 {
    				if (dropdownRef && hostRef) {
    					const { height, width } = dropdownRef.getBoundingClientRect();
    					const { top, left, height: hostHeight } = hostRef.getBoundingClientRect();
    					$$invalidate(5, maxHeight = height > innerHeight ? innerHeight : height);

    					if (top + hostHeight + maxHeight > innerHeight) {
    						$$invalidate(7, dropdownTop = `${innerHeight - maxHeight - top}px`);
    					} else if (top + hostHeight + height < innerHeight) {
    						$$invalidate(7, dropdownTop = "calc(100% + 4px)");
    					}

    					if (left + width > innerWidth) {
    						$$invalidate(8, dropdownLeft = `${innerWidth - left - width}px`);
    					} else if (left + width < innerWidth) {
    						$$invalidate(8, dropdownLeft = "0px");
    					}
    				}
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		closeOnClick,
    		dropdownRef,
    		hostRef,
    		innerHeight,
    		innerWidth,
    		maxHeight,
    		isOpen,
    		dropdownTop,
    		dropdownLeft,
    		toggle,
    		close,
    		$$props,
    		disabled,
    		$$scope,
    		slots,
    		onwindowresize,
    		div0_binding,
    		click_handler,
    		div1_binding
    	];
    }

    class Dropdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { closeOnClick: 0, disabled: 12 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dropdown",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get closeOnClick() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnClick(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$8 = "";
    styleInject(css_248z$8);

    /* node_modules\svelte-atoms\Pagination.svelte generated by Svelte v3.31.2 */
    const file$d = "node_modules\\svelte-atoms\\Pagination.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    // (45:4) <Typography>
    function create_default_slot_6(ctx) {
    	let t0;
    	let t1;
    	let b;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text(/*totalRecordText*/ ctx[5]);
    			t1 = space();
    			b = element("b");
    			t2 = text(/*totalRecords*/ ctx[1]);
    			add_location(b, file$d, 46, 6, 1208);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, b, anchor);
    			append_dev(b, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*totalRecordText*/ 32) set_data_dev(t0, /*totalRecordText*/ ctx[5]);
    			if (dirty & /*totalRecords*/ 2) set_data_dev(t2, /*totalRecords*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(b);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(45:4) <Typography>",
    		ctx
    	});

    	return block;
    }

    // (51:2) {#if totalRecords > 0}
    function create_if_block_1$1(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let current;
    	let if_block0 = /*currentPage*/ ctx[8] !== 1 && create_if_block_4(ctx);
    	let if_block1 = /*pageQnty*/ ctx[9] > 1 && create_if_block_3(ctx);
    	let if_block2 = /*currentPage*/ ctx[8] !== /*pageQnty*/ ctx[9] && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div, "class", "controls svelte-hnrb8x");
    			add_location(div, file$d, 51, 4, 1287);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*currentPage*/ ctx[8] !== 1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*currentPage*/ 256) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*pageQnty*/ ctx[9] > 1) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*pageQnty*/ 512) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*currentPage*/ ctx[8] !== /*pageQnty*/ ctx[9]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*currentPage, pageQnty*/ 768) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_2$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(51:2) {#if totalRecords > 0}",
    		ctx
    	});

    	return block;
    }

    // (53:6) {#if currentPage !== 1}
    function create_if_block_4(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				iconLeft: "arrow-left",
    				type: "flat",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[14]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope, backButtonText*/ 67108880) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(53:6) {#if currentPage !== 1}",
    		ctx
    	});

    	return block;
    }

    // (54:8) <Button           iconLeft="arrow-left"           type="flat"           on:click={() => pageChange((currentPage - 2) * pageSize)}>
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*backButtonText*/ ctx[4]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*backButtonText*/ 16) set_data_dev(t, /*backButtonText*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(54:8) <Button           iconLeft=\\\"arrow-left\\\"           type=\\\"flat\\\"           on:click={() => pageChange((currentPage - 2) * pageSize)}>",
    		ctx
    	});

    	return block;
    }

    // (61:6) {#if pageQnty > 1}
    function create_if_block_3(ctx) {
    	let div;
    	let current;
    	let each_value_1 = /*pages*/ ctx[7];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "pager svelte-hnrb8x");
    			add_location(div, file$d, 61, 8, 1569);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pageChange, pages, pageSize, currentPage*/ 1409) {
    				each_value_1 = /*pages*/ ctx[7];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(61:6) {#if pageQnty > 1}",
    		ctx
    	});

    	return block;
    }

    // (68:14) <Typography type={currentPage === pageNumber ? 'body2' : 'link'}>
    function create_default_slot_4(ctx) {
    	let t_value = /*pageNumber*/ ctx[23] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pages*/ 128 && t_value !== (t_value = /*pageNumber*/ ctx[23] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(68:14) <Typography type={currentPage === pageNumber ? 'body2' : 'link'}>",
    		ctx
    	});

    	return block;
    }

    // (63:10) {#each pages as pageNumber}
    function create_each_block_1(ctx) {
    	let button;
    	let typography;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	typography = new Typography({
    			props: {
    				type: /*currentPage*/ ctx[8] === /*pageNumber*/ ctx[23]
    				? "body2"
    				: "link",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[15](/*pageNumber*/ ctx[23]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			create_component(typography.$$.fragment);
    			t = space();
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "pageButton svelte-hnrb8x");
    			add_location(button, file$d, 63, 12, 1639);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			mount_component(typography, button, null);
    			append_dev(button, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const typography_changes = {};

    			if (dirty & /*currentPage, pages*/ 384) typography_changes.type = /*currentPage*/ ctx[8] === /*pageNumber*/ ctx[23]
    			? "body2"
    			: "link";

    			if (dirty & /*$$scope, pages*/ 67108992) {
    				typography_changes.$$scope = { dirty, ctx };
    			}

    			typography.$set(typography_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(typography.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(typography.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			destroy_component(typography);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(63:10) {#each pages as pageNumber}",
    		ctx
    	});

    	return block;
    }

    // (76:6) {#if currentPage !== pageQnty}
    function create_if_block_2$1(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				iconRight: "arrow-right",
    				type: "flat",
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_2*/ ctx[16]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope, forwardButtonText*/ 67108872) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(76:6) {#if currentPage !== pageQnty}",
    		ctx
    	});

    	return block;
    }

    // (77:8) <Button           iconRight="arrow-right"           type="flat"           on:click={() => pageChange(currentPage * pageSize)}>
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*forwardButtonText*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*forwardButtonText*/ 8) set_data_dev(t, /*forwardButtonText*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(77:8) <Button           iconRight=\\\"arrow-right\\\"           type=\\\"flat\\\"           on:click={() => pageChange(currentPage * pageSize)}>",
    		ctx
    	});

    	return block;
    }

    // (88:4) {#if totalRecords > limits[0] || totalRecords > pageSize}
    function create_if_block$4(ctx) {
    	let typography;
    	let t;
    	let dropdown;
    	let current;

    	typography = new Typography({
    			props: {
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	dropdown = new Dropdown({
    			props: {
    				closeOnClick: true,
    				$$slots: {
    					default: [create_default_slot$3],
    					dropdown: [create_dropdown_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(typography.$$.fragment);
    			t = space();
    			create_component(dropdown.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(typography, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(dropdown, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const typography_changes = {};

    			if (dirty & /*$$scope, pageSizeText*/ 67108928) {
    				typography_changes.$$scope = { dirty, ctx };
    			}

    			typography.$set(typography_changes);
    			const dropdown_changes = {};

    			if (dirty & /*$$scope, limits, pageSize*/ 67108869) {
    				dropdown_changes.$$scope = { dirty, ctx };
    			}

    			dropdown.$set(dropdown_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(typography.$$.fragment, local);
    			transition_in(dropdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(typography.$$.fragment, local);
    			transition_out(dropdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(typography, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(dropdown, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(88:4) {#if totalRecords > limits[0] || totalRecords > pageSize}",
    		ctx
    	});

    	return block;
    }

    // (89:6) <Typography>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*pageSizeText*/ ctx[6]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pageSizeText*/ 64) set_data_dev(t, /*pageSizeText*/ ctx[6]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(89:6) <Typography>",
    		ctx
    	});

    	return block;
    }

    // (91:8) <Button iconRight="chevron-down" type="primary">
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*pageSize*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pageSize*/ 1) set_data_dev(t, /*pageSize*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(91:8) <Button iconRight=\\\"chevron-down\\\" type=\\\"primary\\\">",
    		ctx
    	});

    	return block;
    }

    // (93:10) {#each limits as limit}
    function create_each_block$1(ctx) {
    	let div;
    	let t_value = /*limit*/ ctx[20] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[17](/*limit*/ ctx[20]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "item svelte-hnrb8x");
    			add_location(div, file$d, 93, 12, 2542);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_3, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*limits*/ 4 && t_value !== (t_value = /*limit*/ ctx[20] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(93:10) {#each limits as limit}",
    		ctx
    	});

    	return block;
    }

    // (92:8) <div slot="dropdown">
    function create_dropdown_slot(ctx) {
    	let div;
    	let each_value = /*limits*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "slot", "dropdown");
    			add_location(div, file$d, 91, 8, 2474);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*changeLimit, limits*/ 2052) {
    				each_value = /*limits*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_dropdown_slot.name,
    		type: "slot",
    		source: "(92:8) <div slot=\\\"dropdown\\\">",
    		ctx
    	});

    	return block;
    }

    // (90:6) <Dropdown closeOnClick={true}>
    function create_default_slot$3(ctx) {
    	let button;
    	let t;
    	let current;

    	button = new Button({
    			props: {
    				iconRight: "chevron-down",
    				type: "primary",
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope, pageSize*/ 67108865) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(90:6) <Dropdown closeOnClick={true}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div2;
    	let div0;
    	let typography;
    	let t0;
    	let t1;
    	let div1;
    	let div2_class_value;
    	let current;

    	typography = new Typography({
    			props: {
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block0 = /*totalRecords*/ ctx[1] > 0 && create_if_block_1$1(ctx);
    	let if_block1 = (/*totalRecords*/ ctx[1] > /*limits*/ ctx[2][0] || /*totalRecords*/ ctx[1] > /*pageSize*/ ctx[0]) && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(typography.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			add_location(div0, file$d, 43, 2, 1155);
    			add_location(div1, file$d, 86, 2, 2239);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(`aa-pagination ${/*$$props*/ ctx[12].class || ""}`) + " svelte-hnrb8x"));
    			add_location(div2, file$d, 42, 0, 1100);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(typography, div0, null);
    			append_dev(div2, t0);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const typography_changes = {};

    			if (dirty & /*$$scope, totalRecords, totalRecordText*/ 67108898) {
    				typography_changes.$$scope = { dirty, ctx };
    			}

    			typography.$set(typography_changes);

    			if (/*totalRecords*/ ctx[1] > 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*totalRecords*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div2, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*totalRecords*/ ctx[1] > /*limits*/ ctx[2][0] || /*totalRecords*/ ctx[1] > /*pageSize*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*totalRecords, limits, pageSize*/ 7) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$$props*/ 4096 && div2_class_value !== (div2_class_value = "" + (null_to_empty(`aa-pagination ${/*$$props*/ ctx[12].class || ""}`) + " svelte-hnrb8x"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(typography.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(typography.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(typography);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let currentPage;
    	let pageQnty;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Pagination", slots, []);
    	let { totalRecords = 0 } = $$props;
    	let { pageSize = 10 } = $$props;
    	let { limits = [10, 20, 50, 100] } = $$props;
    	let { offset = 0 } = $$props;
    	let { forwardButtonText = "next" } = $$props;
    	let { backButtonText = "prev" } = $$props;
    	let { totalRecordText = "Total:" } = $$props;
    	let { pageSizeText = "Show:" } = $$props;
    	const dispatch = createEventDispatcher();
    	let pages = [];

    	const pageSizeChange = limit => {
    		$$invalidate(0, pageSize = limit);
    		dispatch("pageSizeChange", limit);
    	};

    	const pageChange = page => {
    		$$invalidate(13, offset = page);
    		dispatch("pageChange", page);
    	};

    	const changeLimit = limit => {
    		pageSizeChange(limit);
    		pageChange(Math.floor(offset / limit) * limit);
    	};

    	const click_handler = () => pageChange((currentPage - 2) * pageSize);
    	const click_handler_1 = pageNumber => pageChange((pageNumber - 1) * pageSize);
    	const click_handler_2 = () => pageChange(currentPage * pageSize);
    	const click_handler_3 = limit => changeLimit(limit);

    	$$self.$$set = $$new_props => {
    		$$invalidate(12, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("totalRecords" in $$new_props) $$invalidate(1, totalRecords = $$new_props.totalRecords);
    		if ("pageSize" in $$new_props) $$invalidate(0, pageSize = $$new_props.pageSize);
    		if ("limits" in $$new_props) $$invalidate(2, limits = $$new_props.limits);
    		if ("offset" in $$new_props) $$invalidate(13, offset = $$new_props.offset);
    		if ("forwardButtonText" in $$new_props) $$invalidate(3, forwardButtonText = $$new_props.forwardButtonText);
    		if ("backButtonText" in $$new_props) $$invalidate(4, backButtonText = $$new_props.backButtonText);
    		if ("totalRecordText" in $$new_props) $$invalidate(5, totalRecordText = $$new_props.totalRecordText);
    		if ("pageSizeText" in $$new_props) $$invalidate(6, pageSizeText = $$new_props.pageSizeText);
    	};

    	$$self.$capture_state = () => ({
    		Typography,
    		Button,
    		Dropdown,
    		createEventDispatcher,
    		totalRecords,
    		pageSize,
    		limits,
    		offset,
    		forwardButtonText,
    		backButtonText,
    		totalRecordText,
    		pageSizeText,
    		dispatch,
    		pages,
    		pageSizeChange,
    		pageChange,
    		changeLimit,
    		currentPage,
    		pageQnty
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(12, $$props = assign(assign({}, $$props), $$new_props));
    		if ("totalRecords" in $$props) $$invalidate(1, totalRecords = $$new_props.totalRecords);
    		if ("pageSize" in $$props) $$invalidate(0, pageSize = $$new_props.pageSize);
    		if ("limits" in $$props) $$invalidate(2, limits = $$new_props.limits);
    		if ("offset" in $$props) $$invalidate(13, offset = $$new_props.offset);
    		if ("forwardButtonText" in $$props) $$invalidate(3, forwardButtonText = $$new_props.forwardButtonText);
    		if ("backButtonText" in $$props) $$invalidate(4, backButtonText = $$new_props.backButtonText);
    		if ("totalRecordText" in $$props) $$invalidate(5, totalRecordText = $$new_props.totalRecordText);
    		if ("pageSizeText" in $$props) $$invalidate(6, pageSizeText = $$new_props.pageSizeText);
    		if ("pages" in $$props) $$invalidate(7, pages = $$new_props.pages);
    		if ("currentPage" in $$props) $$invalidate(8, currentPage = $$new_props.currentPage);
    		if ("pageQnty" in $$props) $$invalidate(9, pageQnty = $$new_props.pageQnty);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*offset, pageSize*/ 8193) {
    			 $$invalidate(8, currentPage = Math.ceil((offset + 1) / pageSize));
    		}

    		if ($$self.$$.dirty & /*totalRecords, pageSize*/ 3) {
    			 $$invalidate(9, pageQnty = Math.ceil(totalRecords / pageSize));
    		}

    		if ($$self.$$.dirty & /*pageQnty, currentPage, pages*/ 896) {
    			 {
    				$$invalidate(7, pages = []);

    				for (let i = 1; i <= pageQnty; i += 1) {
    					if (Math.abs(i - currentPage) < 3) pages.push(i);
    				}
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		pageSize,
    		totalRecords,
    		limits,
    		forwardButtonText,
    		backButtonText,
    		totalRecordText,
    		pageSizeText,
    		pages,
    		currentPage,
    		pageQnty,
    		pageChange,
    		changeLimit,
    		$$props,
    		offset,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class Pagination extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			totalRecords: 1,
    			pageSize: 0,
    			limits: 2,
    			offset: 13,
    			forwardButtonText: 3,
    			backButtonText: 4,
    			totalRecordText: 5,
    			pageSizeText: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pagination",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get totalRecords() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set totalRecords(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pageSize() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pageSize(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get limits() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set limits(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get forwardButtonText() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set forwardButtonText(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backButtonText() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backButtonText(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get totalRecordText() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set totalRecordText(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pageSizeText() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pageSizeText(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$9 = "";
    styleInject(css_248z$9);

    /* src\components\Posts.svelte generated by Svelte v3.31.2 */
    const file$e = "src\\components\\Posts.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (9:8) <Cell style="width: 10%;">
    function create_default_slot_16(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("No");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_16.name,
    		type: "slot",
    		source: "(9:8) <Cell style=\\\"width: 10%;\\\">",
    		ctx
    	});

    	return block;
    }

    // (10:8) <Cell>
    function create_default_slot_15(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Title");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15.name,
    		type: "slot",
    		source: "(10:8) <Cell>",
    		ctx
    	});

    	return block;
    }

    // (11:8) <Cell style="width: 20%;">
    function create_default_slot_14(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Writer");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14.name,
    		type: "slot",
    		source: "(11:8) <Cell style=\\\"width: 20%;\\\">",
    		ctx
    	});

    	return block;
    }

    // (12:8) <Cell style="width: 20%;">
    function create_default_slot_13(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("CreatedDate");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(12:8) <Cell style=\\\"width: 20%;\\\">",
    		ctx
    	});

    	return block;
    }

    // (8:6) <Row style="bo">
    function create_default_slot_12(ctx) {
    	let cell0;
    	let t0;
    	let cell1;
    	let t1;
    	let cell2;
    	let t2;
    	let cell3;
    	let current;

    	cell0 = new Cell({
    			props: {
    				style: "width: 10%;",
    				$$slots: { default: [create_default_slot_16] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	cell1 = new Cell({
    			props: {
    				$$slots: { default: [create_default_slot_15] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	cell2 = new Cell({
    			props: {
    				style: "width: 20%;",
    				$$slots: { default: [create_default_slot_14] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	cell3 = new Cell({
    			props: {
    				style: "width: 20%;",
    				$$slots: { default: [create_default_slot_13] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cell0.$$.fragment);
    			t0 = space();
    			create_component(cell1.$$.fragment);
    			t1 = space();
    			create_component(cell2.$$.fragment);
    			t2 = space();
    			create_component(cell3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cell0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(cell1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(cell2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(cell3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const cell0_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				cell0_changes.$$scope = { dirty, ctx };
    			}

    			cell0.$set(cell0_changes);
    			const cell1_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				cell1_changes.$$scope = { dirty, ctx };
    			}

    			cell1.$set(cell1_changes);
    			const cell2_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				cell2_changes.$$scope = { dirty, ctx };
    			}

    			cell2.$set(cell2_changes);
    			const cell3_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				cell3_changes.$$scope = { dirty, ctx };
    			}

    			cell3.$set(cell3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cell0.$$.fragment, local);
    			transition_in(cell1.$$.fragment, local);
    			transition_in(cell2.$$.fragment, local);
    			transition_in(cell3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cell0.$$.fragment, local);
    			transition_out(cell1.$$.fragment, local);
    			transition_out(cell2.$$.fragment, local);
    			transition_out(cell3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cell0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(cell1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(cell2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(cell3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(8:6) <Row style=\\\"bo\\\">",
    		ctx
    	});

    	return block;
    }

    // (7:4) <Head class="post-Head">
    function create_default_slot_11(ctx) {
    	let row;
    	let current;

    	row = new Row({
    			props: {
    				style: "bo",
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(7:4) <Head class=\\\"post-Head\\\">",
    		ctx
    	});

    	return block;
    }

    // (20:6) {:else}
    function create_else_block$3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*posts*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*detail, posts*/ 65) {
    				each_value = /*posts*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(20:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (16:6) {#if posts.length === 0}
    function create_if_block$5(ctx) {
    	let row;
    	let current;

    	row = new Row({
    			props: {
    				colspan: "4",
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(16:6) {#if posts.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (23:12) <Cell>
    function create_default_slot_10(ctx) {
    	let t_value = /*post*/ ctx[13].num + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*posts*/ 1 && t_value !== (t_value = /*post*/ ctx[13].num + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(23:12) <Cell>",
    		ctx
    	});

    	return block;
    }

    // (24:12) <Cell>
    function create_default_slot_9(ctx) {
    	let t_value = /*post*/ ctx[13].title + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*posts*/ 1 && t_value !== (t_value = /*post*/ ctx[13].title + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(24:12) <Cell>",
    		ctx
    	});

    	return block;
    }

    // (25:12) <Cell>
    function create_default_slot_8(ctx) {
    	let t_value = /*post*/ ctx[13].writer + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*posts*/ 1 && t_value !== (t_value = /*post*/ ctx[13].writer + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(25:12) <Cell>",
    		ctx
    	});

    	return block;
    }

    // (26:12) <Cell>
    function create_default_slot_7(ctx) {
    	let t_value = /*post*/ ctx[13].createdDate + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*posts*/ 1 && t_value !== (t_value = /*post*/ ctx[13].createdDate + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(26:12) <Cell>",
    		ctx
    	});

    	return block;
    }

    // (22:10) <Row on:click={detail(post.no)}>
    function create_default_slot_6$1(ctx) {
    	let cell0;
    	let t0;
    	let cell1;
    	let t1;
    	let cell2;
    	let t2;
    	let cell3;
    	let t3;
    	let current;

    	cell0 = new Cell({
    			props: {
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	cell1 = new Cell({
    			props: {
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	cell2 = new Cell({
    			props: {
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	cell3 = new Cell({
    			props: {
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cell0.$$.fragment);
    			t0 = space();
    			create_component(cell1.$$.fragment);
    			t1 = space();
    			create_component(cell2.$$.fragment);
    			t2 = space();
    			create_component(cell3.$$.fragment);
    			t3 = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(cell0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(cell1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(cell2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(cell3, target, anchor);
    			insert_dev(target, t3, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const cell0_changes = {};

    			if (dirty & /*$$scope, posts*/ 65537) {
    				cell0_changes.$$scope = { dirty, ctx };
    			}

    			cell0.$set(cell0_changes);
    			const cell1_changes = {};

    			if (dirty & /*$$scope, posts*/ 65537) {
    				cell1_changes.$$scope = { dirty, ctx };
    			}

    			cell1.$set(cell1_changes);
    			const cell2_changes = {};

    			if (dirty & /*$$scope, posts*/ 65537) {
    				cell2_changes.$$scope = { dirty, ctx };
    			}

    			cell2.$set(cell2_changes);
    			const cell3_changes = {};

    			if (dirty & /*$$scope, posts*/ 65537) {
    				cell3_changes.$$scope = { dirty, ctx };
    			}

    			cell3.$set(cell3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cell0.$$.fragment, local);
    			transition_in(cell1.$$.fragment, local);
    			transition_in(cell2.$$.fragment, local);
    			transition_in(cell3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cell0.$$.fragment, local);
    			transition_out(cell1.$$.fragment, local);
    			transition_out(cell2.$$.fragment, local);
    			transition_out(cell3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cell0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(cell1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(cell2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(cell3, detaching);
    			if (detaching) detach_dev(t3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(22:10) <Row on:click={detail(post.no)}>",
    		ctx
    	});

    	return block;
    }

    // (21:8) {#each posts as post}
    function create_each_block$2(ctx) {
    	let row;
    	let current;

    	row = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_6$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row.$on("click", function () {
    		if (is_function(/*detail*/ ctx[6](/*post*/ ctx[13].no))) /*detail*/ ctx[6](/*post*/ ctx[13].no).apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const row_changes = {};

    			if (dirty & /*$$scope, posts*/ 65537) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(21:8) {#each posts as post}",
    		ctx
    	});

    	return block;
    }

    // (18:10) <Cell>
    function create_default_slot_5$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("No post.");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(18:10) <Cell>",
    		ctx
    	});

    	return block;
    }

    // (17:8) <Row colspan="4">
    function create_default_slot_4$1(ctx) {
    	let cell;
    	let current;

    	cell = new Cell({
    			props: {
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cell.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cell, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const cell_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				cell_changes.$$scope = { dirty, ctx };
    			}

    			cell.$set(cell_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cell.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cell.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cell, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(17:8) <Row colspan=\\\"4\\\">",
    		ctx
    	});

    	return block;
    }

    // (15:4) <Body>
    function create_default_slot_3$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$5, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*posts*/ ctx[0].length === 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(15:4) <Body>",
    		ctx
    	});

    	return block;
    }

    // (6:2) <DataTable table$aria-label="Products" class="post-table">
    function create_default_slot_2$2(ctx) {
    	let head;
    	let t;
    	let body;
    	let current;

    	head = new Head({
    			props: {
    				class: "post-Head",
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	body = new Body({
    			props: {
    				$$slots: { default: [create_default_slot_3$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(head.$$.fragment);
    			t = space();
    			create_component(body.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(head, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(body, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const head_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				head_changes.$$scope = { dirty, ctx };
    			}

    			head.$set(head_changes);
    			const body_changes = {};

    			if (dirty & /*$$scope, posts*/ 65537) {
    				body_changes.$$scope = { dirty, ctx };
    			}

    			body.$set(body_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(head.$$.fragment, local);
    			transition_in(body.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(head.$$.fragment, local);
    			transition_out(body.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(head, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(body, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(6:2) <DataTable table$aria-label=\\\"Products\\\" class=\\\"post-table\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:4) <Button         raised         color="#ff3e00"         title="Simple button"          on:click={createPost}      >
    function create_default_slot_1$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("글 쓰기");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(33:4) <Button         raised         color=\\\"#ff3e00\\\"         title=\\\"Simple button\\\"          on:click={createPost}      >",
    		ctx
    	});

    	return block;
    }

    // (44:4) <Button         raised         color="#ff3e00"         title="Simple button"          on:click={go_search}         style="float: left;"      >
    function create_default_slot$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Search");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(44:4) <Button         raised         color=\\\"#ff3e00\\\"         title=\\\"Simple button\\\"          on:click={go_search}         style=\\\"float: left;\\\"      >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let header;
    	let t0;
    	let div3;
    	let div0;
    	let t1;
    	let datatable;
    	let t2;
    	let div1;
    	let button0;
    	let t3;
    	let input;
    	let t4;
    	let button1;
    	let t5;
    	let div2;
    	let br;
    	let t6;
    	let pagination;
    	let updating_offset;
    	let updating_pageSize;
    	let current;
    	let mounted;
    	let dispose;
    	header = new Header({ $$inline: true });

    	datatable = new DataTable({
    			props: {
    				"table$aria-label": "Products",
    				class: "post-table",
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0 = new xe({
    			props: {
    				raised: true,
    				color: "#ff3e00",
    				title: "Simple button",
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*createPost*/ ctx[5]);

    	button1 = new xe({
    			props: {
    				raised: true,
    				color: "#ff3e00",
    				title: "Simple button",
    				style: "float: left;",
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*go_search*/ ctx[8]);

    	function pagination_offset_binding(value) {
    		/*pagination_offset_binding*/ ctx[10].call(null, value);
    	}

    	function pagination_pageSize_binding(value) {
    		/*pagination_pageSize_binding*/ ctx[11].call(null, value);
    	}

    	let pagination_props = { totalRecords: /*totalCount*/ ctx[1] };

    	if (/*$offset*/ ctx[2] !== void 0) {
    		pagination_props.offset = /*$offset*/ ctx[2];
    	}

    	if (/*$pageSize*/ ctx[4] !== void 0) {
    		pagination_props.pageSize = /*$pageSize*/ ctx[4];
    	}

    	pagination = new Pagination({ props: pagination_props, $$inline: true });
    	binding_callbacks.push(() => bind(pagination, "offset", pagination_offset_binding));
    	binding_callbacks.push(() => bind(pagination, "pageSize", pagination_pageSize_binding));
    	pagination.$on("pageChange", /*go_page*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div0 = element("div");
    			t1 = space();
    			create_component(datatable.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			create_component(button0.$$.fragment);
    			t3 = space();
    			input = element("input");
    			t4 = space();
    			create_component(button1.$$.fragment);
    			t5 = space();
    			div2 = element("div");
    			br = element("br");
    			t6 = space();
    			create_component(pagination.$$.fragment);
    			attr_dev(div0, "class", "svelte-1jhjq64");
    			add_location(div0, file$e, 3, 2, 41);
    			attr_dev(input, "type", "text");
    			set_style(input, "float", "left");
    			add_location(input, file$e, 38, 4, 1043);
    			set_style(div1, "text-align", "right");
    			set_style(div1, "margin", "0px");
    			set_style(div1, "width", "100%");
    			set_style(div1, "padding-top", "10px");
    			attr_dev(div1, "class", "svelte-1jhjq64");
    			add_location(div1, file$e, 31, 2, 827);
    			add_location(br, file$e, 52, 4, 1343);
    			attr_dev(div2, "class", "post_paging svelte-1jhjq64");
    			add_location(div2, file$e, 51, 2, 1312);
    			attr_dev(div3, "class", "post-main svelte-1jhjq64");
    			add_location(div3, file$e, 1, 0, 12);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t1);
    			mount_component(datatable, div3, null);
    			append_dev(div3, t2);
    			append_dev(div3, div1);
    			mount_component(button0, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, input);
    			set_input_value(input, /*$search*/ ctx[3]);
    			append_dev(div1, t4);
    			mount_component(button1, div1, null);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, br);
    			append_dev(div2, t6);
    			mount_component(pagination, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[9]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const datatable_changes = {};

    			if (dirty & /*$$scope, posts*/ 65537) {
    				datatable_changes.$$scope = { dirty, ctx };
    			}

    			datatable.$set(datatable_changes);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);

    			if (dirty & /*$search*/ 8 && input.value !== /*$search*/ ctx[3]) {
    				set_input_value(input, /*$search*/ ctx[3]);
    			}

    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const pagination_changes = {};
    			if (dirty & /*totalCount*/ 2) pagination_changes.totalRecords = /*totalCount*/ ctx[1];

    			if (!updating_offset && dirty & /*$offset*/ 4) {
    				updating_offset = true;
    				pagination_changes.offset = /*$offset*/ ctx[2];
    				add_flush_callback(() => updating_offset = false);
    			}

    			if (!updating_pageSize && dirty & /*$pageSize*/ 16) {
    				updating_pageSize = true;
    				pagination_changes.pageSize = /*$pageSize*/ ctx[4];
    				add_flush_callback(() => updating_pageSize = false);
    			}

    			pagination.$set(pagination_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(datatable.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(pagination.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(datatable.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(pagination.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			destroy_component(datatable);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(pagination);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $cp;
    	let $offset;
    	let $search;
    	let $pageSize;
    	validate_store(cp, "cp");
    	component_subscribe($$self, cp, $$value => $$invalidate(12, $cp = $$value));
    	validate_store(offset, "offset");
    	component_subscribe($$self, offset, $$value => $$invalidate(2, $offset = $$value));
    	validate_store(search, "search");
    	component_subscribe($$self, search, $$value => $$invalidate(3, $search = $$value));
    	validate_store(pageSize, "pageSize");
    	component_subscribe($$self, pageSize, $$value => $$invalidate(4, $pageSize = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Posts", slots, []);
    	let posts = [];
    	let totalCount;

    	onMount(async () => {
    		if ($cp !== "") {
    			const res = await api.getPost($cp, $offset, $search, $pageSize);
    			$$invalidate(0, posts = res.post);
    			$$invalidate(1, totalCount = res.paging.totalCount);
    		}
    	});

    	const createPost = () => {
    		push("/createPost");
    	};

    	const detail = no => {
    		push("/detail/" + no);
    	};

    	const go_page = async () => {
    		const res = await api.getPost($cp, $offset, $search, $pageSize);
    		$$invalidate(0, posts = res.post);
    		$$invalidate(1, totalCount = res.paging.totalCount);

    		if ($offset > totalCount) {
    			set_store_value(offset, $offset = 0, $offset);
    		}
    	};

    	const go_search = async () => {
    		const res = await api.getPost($cp, 0, $search, $pageSize);
    		$$invalidate(0, posts = res.post);
    		$$invalidate(1, totalCount = res.paging.totalCount);

    		if ($offset > totalCount) {
    			set_store_value(offset, $offset = 0, $offset);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Posts> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		$search = this.value;
    		search.set($search);
    	}

    	function pagination_offset_binding(value) {
    		$offset = value;
    		offset.set($offset);
    	}

    	function pagination_pageSize_binding(value) {
    		$pageSize = value;
    		pageSize.set($pageSize);
    	}

    	$$self.$capture_state = () => ({
    		api,
    		cp,
    		offset,
    		search,
    		pageSize,
    		Header,
    		push,
    		Button: xe,
    		DataTable,
    		Head,
    		Body,
    		Row,
    		Cell,
    		onMount,
    		Pagination,
    		posts,
    		totalCount,
    		createPost,
    		detail,
    		go_page,
    		go_search,
    		$cp,
    		$offset,
    		$search,
    		$pageSize
    	});

    	$$self.$inject_state = $$props => {
    		if ("posts" in $$props) $$invalidate(0, posts = $$props.posts);
    		if ("totalCount" in $$props) $$invalidate(1, totalCount = $$props.totalCount);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		posts,
    		totalCount,
    		$offset,
    		$search,
    		$pageSize,
    		createPost,
    		detail,
    		go_page,
    		go_search,
    		input_input_handler,
    		pagination_offset_binding,
    		pagination_pageSize_binding
    	];
    }

    class Posts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Posts",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    var css_248z$a = "";
    styleInject(css_248z$a);

    /* src\components\Mypage.svelte generated by Svelte v3.31.2 */
    const file$f = "src\\components\\Mypage.svelte";

    // (36:2) <Button raised color="#ff3e00" on:click={save}>
    function create_default_slot_5$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("저장");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$2.name,
    		type: "slot",
    		source: "(36:2) <Button raised color=\\\"#ff3e00\\\" on:click={save}>",
    		ctx
    	});

    	return block;
    }

    // (37:2) <Button raised on:click={cancel}>
    function create_default_slot_4$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("취소");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$2.name,
    		type: "slot",
    		source: "(37:2) <Button raised on:click={cancel}>",
    		ctx
    	});

    	return block;
    }

    // (47:0) {:else}
    function create_else_block$4(ctx) {
    	let snackbar;
    	let updating_visible;
    	let current;

    	function snackbar_visible_binding_1(value) {
    		/*snackbar_visible_binding_1*/ ctx[19].call(null, value);
    	}

    	let snackbar_props = {
    		timeout: "3",
    		$$slots: {
    			default: [create_default_slot_2$3],
    			action: [create_action_slot_1]
    		},
    		$$scope: { ctx }
    	};

    	if (/*visible*/ ctx[8] !== void 0) {
    		snackbar_props.visible = /*visible*/ ctx[8];
    	}

    	snackbar = new Qn({ props: snackbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(snackbar, "visible", snackbar_visible_binding_1));

    	const block = {
    		c: function create() {
    			create_component(snackbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(snackbar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const snackbar_changes = {};

    			if (dirty & /*$$scope, visible, snackbar_message*/ 4194624) {
    				snackbar_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty & /*visible*/ 256) {
    				updating_visible = true;
    				snackbar_changes.visible = /*visible*/ ctx[8];
    				add_flush_callback(() => updating_visible = false);
    			}

    			snackbar.$set(snackbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(snackbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(snackbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(snackbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(47:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (40:0) {#if snackbar_message == "My info update success."}
    function create_if_block$6(ctx) {
    	let snackbar;
    	let updating_visible;
    	let current;

    	function snackbar_visible_binding(value) {
    		/*snackbar_visible_binding*/ ctx[17].call(null, value);
    	}

    	let snackbar_props = {
    		timeout: "3",
    		bg: "#ff3e00",
    		$$slots: {
    			default: [create_default_slot$5],
    			action: [create_action_slot$1]
    		},
    		$$scope: { ctx }
    	};

    	if (/*visible*/ ctx[8] !== void 0) {
    		snackbar_props.visible = /*visible*/ ctx[8];
    	}

    	snackbar = new Qn({ props: snackbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(snackbar, "visible", snackbar_visible_binding));

    	const block = {
    		c: function create() {
    			create_component(snackbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(snackbar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const snackbar_changes = {};

    			if (dirty & /*$$scope, visible, snackbar_message*/ 4194624) {
    				snackbar_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty & /*visible*/ 256) {
    				updating_visible = true;
    				snackbar_changes.visible = /*visible*/ ctx[8];
    				add_flush_callback(() => updating_visible = false);
    			}

    			snackbar.$set(snackbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(snackbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(snackbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(snackbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(40:0) {#if snackbar_message == \\\"My info update success.\\\"}",
    		ctx
    	});

    	return block;
    }

    // (51:8) <Button color="#ff0" on:click={()=>{visible = false}}>
    function create_default_slot_3$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Close");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$3.name,
    		type: "slot",
    		source: "(51:8) <Button color=\\\"#ff0\\\" on:click={()=>{visible = false}}>",
    		ctx
    	});

    	return block;
    }

    // (50:4) <span slot="action">
    function create_action_slot_1(ctx) {
    	let span;
    	let button;
    	let current;

    	button = new xe({
    			props: {
    				color: "#ff0",
    				$$slots: { default: [create_default_slot_3$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_1*/ ctx[18]);

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(button.$$.fragment);
    			attr_dev(span, "slot", "action");
    			add_location(span, file$f, 49, 4, 1103);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(button, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_action_slot_1.name,
    		type: "slot",
    		source: "(50:4) <span slot=\\\"action\\\">",
    		ctx
    	});

    	return block;
    }

    // (48:2) <Snackbar bind:visible  timeout="3" >
    function create_default_slot_2$3(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(/*snackbar_message*/ ctx[6]);
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			set_data_dev(t0, /*snackbar_message*/ ctx[6]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(48:2) <Snackbar bind:visible  timeout=\\\"3\\\" >",
    		ctx
    	});

    	return block;
    }

    // (44:8) <Button color="#ff0" on:click={()=>{visible = false}}>
    function create_default_slot_1$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Close");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(44:8) <Button color=\\\"#ff0\\\" on:click={()=>{visible = false}}>",
    		ctx
    	});

    	return block;
    }

    // (43:4) <span slot="action">
    function create_action_slot$1(ctx) {
    	let span;
    	let button;
    	let current;

    	button = new xe({
    			props: {
    				color: "#ff0",
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[16]);

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(button.$$.fragment);
    			attr_dev(span, "slot", "action");
    			add_location(span, file$f, 42, 4, 897);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(button, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_action_slot$1.name,
    		type: "slot",
    		source: "(43:4) <span slot=\\\"action\\\">",
    		ctx
    	});

    	return block;
    }

    // (41:2) <Snackbar bind:visible  timeout="3" bg="#ff3e00">
    function create_default_slot$5(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(/*snackbar_message*/ ctx[6]);
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			set_data_dev(t0, /*snackbar_message*/ ctx[6]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(41:2) <Snackbar bind:visible  timeout=\\\"3\\\" bg=\\\"#ff3e00\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let header;
    	let t0;
    	let div;
    	let textfield0;
    	let t1;
    	let textfield1;
    	let t2;
    	let textfield2;
    	let updating_value;
    	let t3;
    	let textfield3;
    	let updating_value_1;
    	let t4;
    	let textfield4;
    	let updating_value_2;
    	let t5;
    	let textfield5;
    	let updating_value_3;
    	let t6;
    	let button0;
    	let t7;
    	let button1;
    	let t8;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	header = new Header({ $$inline: true });

    	textfield0 = new Re({
    			props: {
    				label: "No",
    				message: "User No",
    				readonly: true,
    				placeholder: /*no*/ ctx[0]
    			},
    			$$inline: true
    		});

    	textfield1 = new Re({
    			props: {
    				label: "Company",
    				message: "User company",
    				readonly: true,
    				placeholder: /*company*/ ctx[4]
    			},
    			$$inline: true
    		});

    	function textfield2_value_binding(value) {
    		/*textfield2_value_binding*/ ctx[11].call(null, value);
    	}

    	let textfield2_props = { label: "Name", message: "User name" };

    	if (/*name*/ ctx[1] !== void 0) {
    		textfield2_props.value = /*name*/ ctx[1];
    	}

    	textfield2 = new Re({ props: textfield2_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield2, "value", textfield2_value_binding));

    	function textfield3_value_binding(value) {
    		/*textfield3_value_binding*/ ctx[12].call(null, value);
    	}

    	let textfield3_props = { label: "Email", message: "User email" };

    	if (/*email*/ ctx[2] !== void 0) {
    		textfield3_props.value = /*email*/ ctx[2];
    	}

    	textfield3 = new Re({ props: textfield3_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield3, "value", textfield3_value_binding));

    	function textfield4_value_binding(value) {
    		/*textfield4_value_binding*/ ctx[13].call(null, value);
    	}

    	let textfield4_props = {
    		label: "Password",
    		message: "User password"
    	};

    	if (/*password*/ ctx[3] !== void 0) {
    		textfield4_props.value = /*password*/ ctx[3];
    	}

    	textfield4 = new Re({ props: textfield4_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield4, "value", textfield4_value_binding));
    	/*textfield4_binding*/ ctx[14](textfield4);

    	function textfield5_value_binding(value) {
    		/*textfield5_value_binding*/ ctx[15].call(null, value);
    	}

    	let textfield5_props = { label: "Phone", message: "Phone number" };

    	if (/*phone*/ ctx[5] !== void 0) {
    		textfield5_props.value = /*phone*/ ctx[5];
    	}

    	textfield5 = new Re({ props: textfield5_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield5, "value", textfield5_value_binding));

    	button0 = new xe({
    			props: {
    				raised: true,
    				color: "#ff3e00",
    				$$slots: { default: [create_default_slot_5$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*save*/ ctx[9]);

    	button1 = new xe({
    			props: {
    				raised: true,
    				$$slots: { default: [create_default_slot_4$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*cancel*/ ctx[10]);
    	const if_block_creators = [create_if_block$6, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*snackbar_message*/ ctx[6] == "My info update success.") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			div = element("div");
    			create_component(textfield0.$$.fragment);
    			t1 = space();
    			create_component(textfield1.$$.fragment);
    			t2 = space();
    			create_component(textfield2.$$.fragment);
    			t3 = space();
    			create_component(textfield3.$$.fragment);
    			t4 = space();
    			create_component(textfield4.$$.fragment);
    			t5 = space();
    			create_component(textfield5.$$.fragment);
    			t6 = space();
    			create_component(button0.$$.fragment);
    			t7 = text("  \r\n  ");
    			create_component(button1.$$.fragment);
    			t8 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "class", "mypage svelte-6up40r");
    			add_location(div, file$f, 1, 0, 12);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(textfield0, div, null);
    			append_dev(div, t1);
    			mount_component(textfield1, div, null);
    			append_dev(div, t2);
    			mount_component(textfield2, div, null);
    			append_dev(div, t3);
    			mount_component(textfield3, div, null);
    			append_dev(div, t4);
    			mount_component(textfield4, div, null);
    			append_dev(div, t5);
    			mount_component(textfield5, div, null);
    			append_dev(div, t6);
    			mount_component(button0, div, null);
    			append_dev(div, t7);
    			mount_component(button1, div, null);
    			insert_dev(target, t8, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const textfield0_changes = {};
    			if (dirty & /*no*/ 1) textfield0_changes.placeholder = /*no*/ ctx[0];
    			textfield0.$set(textfield0_changes);
    			const textfield1_changes = {};
    			if (dirty & /*company*/ 16) textfield1_changes.placeholder = /*company*/ ctx[4];
    			textfield1.$set(textfield1_changes);
    			const textfield2_changes = {};

    			if (!updating_value && dirty & /*name*/ 2) {
    				updating_value = true;
    				textfield2_changes.value = /*name*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield2.$set(textfield2_changes);
    			const textfield3_changes = {};

    			if (!updating_value_1 && dirty & /*email*/ 4) {
    				updating_value_1 = true;
    				textfield3_changes.value = /*email*/ ctx[2];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			textfield3.$set(textfield3_changes);
    			const textfield4_changes = {};

    			if (!updating_value_2 && dirty & /*password*/ 8) {
    				updating_value_2 = true;
    				textfield4_changes.value = /*password*/ ctx[3];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			textfield4.$set(textfield4_changes);
    			const textfield5_changes = {};

    			if (!updating_value_3 && dirty & /*phone*/ 32) {
    				updating_value_3 = true;
    				textfield5_changes.value = /*phone*/ ctx[5];
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			textfield5.$set(textfield5_changes);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(textfield0.$$.fragment, local);
    			transition_in(textfield1.$$.fragment, local);
    			transition_in(textfield2.$$.fragment, local);
    			transition_in(textfield3.$$.fragment, local);
    			transition_in(textfield4.$$.fragment, local);
    			transition_in(textfield5.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(textfield0.$$.fragment, local);
    			transition_out(textfield1.$$.fragment, local);
    			transition_out(textfield2.$$.fragment, local);
    			transition_out(textfield3.$$.fragment, local);
    			transition_out(textfield4.$$.fragment, local);
    			transition_out(textfield5.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_component(textfield0);
    			destroy_component(textfield1);
    			destroy_component(textfield2);
    			destroy_component(textfield3);
    			/*textfield4_binding*/ ctx[14](null);
    			destroy_component(textfield4);
    			destroy_component(textfield5);
    			destroy_component(button0);
    			destroy_component(button1);
    			if (detaching) detach_dev(t8);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let $tk;
    	let $uId;
    	validate_store(tk, "tk");
    	component_subscribe($$self, tk, $$value => $$invalidate(20, $tk = $$value));
    	validate_store(uId, "uId");
    	component_subscribe($$self, uId, $$value => $$invalidate(21, $uId = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Mypage", slots, []);
    	let no, name, email, password, company, phone, snackbar_message, inpuPW;
    	let visible = false;

    	onMount(async () => {
    		const res = await api.getDecodeUser($tk);
    		$$invalidate(0, no = res.no);
    		$$invalidate(1, name = res.userName);
    		$$invalidate(2, email = res.userEmail);
    		$$invalidate(4, company = res.company);
    		$$invalidate(5, phone = res.userMobile);
    	});

    	const save = async () => {
    		const res = await api.updateUser(no, name, email, $uId, phone, password);

    		if (res === 1) {
    			$$invalidate(6, snackbar_message = "My info update success.");
    		} else {
    			$$invalidate(6, snackbar_message = "Error.");
    		}

    		$$invalidate(8, visible = true);
    	};

    	const cancel = () => {
    		push("/posts");
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Mypage> was created with unknown prop '${key}'`);
    	});

    	function textfield2_value_binding(value) {
    		name = value;
    		$$invalidate(1, name);
    	}

    	function textfield3_value_binding(value) {
    		email = value;
    		$$invalidate(2, email);
    	}

    	function textfield4_value_binding(value) {
    		password = value;
    		$$invalidate(3, password);
    	}

    	function textfield4_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inpuPW = $$value;
    			$$invalidate(7, inpuPW);
    		});
    	}

    	function textfield5_value_binding(value) {
    		phone = value;
    		$$invalidate(5, phone);
    	}

    	const click_handler = () => {
    		$$invalidate(8, visible = false);
    	};

    	function snackbar_visible_binding(value) {
    		visible = value;
    		$$invalidate(8, visible);
    	}

    	const click_handler_1 = () => {
    		$$invalidate(8, visible = false);
    	};

    	function snackbar_visible_binding_1(value) {
    		visible = value;
    		$$invalidate(8, visible);
    	}

    	$$self.$capture_state = () => ({
    		Header,
    		tk,
    		uId,
    		api,
    		onMount,
    		Snackbar: Qn,
    		Textfield: Re,
    		Button: xe,
    		push,
    		no,
    		name,
    		email,
    		password,
    		company,
    		phone,
    		snackbar_message,
    		inpuPW,
    		visible,
    		save,
    		cancel,
    		$tk,
    		$uId
    	});

    	$$self.$inject_state = $$props => {
    		if ("no" in $$props) $$invalidate(0, no = $$props.no);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("email" in $$props) $$invalidate(2, email = $$props.email);
    		if ("password" in $$props) $$invalidate(3, password = $$props.password);
    		if ("company" in $$props) $$invalidate(4, company = $$props.company);
    		if ("phone" in $$props) $$invalidate(5, phone = $$props.phone);
    		if ("snackbar_message" in $$props) $$invalidate(6, snackbar_message = $$props.snackbar_message);
    		if ("inpuPW" in $$props) $$invalidate(7, inpuPW = $$props.inpuPW);
    		if ("visible" in $$props) $$invalidate(8, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		no,
    		name,
    		email,
    		password,
    		company,
    		phone,
    		snackbar_message,
    		inpuPW,
    		visible,
    		save,
    		cancel,
    		textfield2_value_binding,
    		textfield3_value_binding,
    		textfield4_value_binding,
    		textfield4_binding,
    		textfield5_value_binding,
    		click_handler,
    		snackbar_visible_binding,
    		click_handler_1,
    		snackbar_visible_binding_1
    	];
    }

    class Mypage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mypage",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\components\DetailPost.svelte generated by Svelte v3.31.2 */
    const file$g = "src\\components\\DetailPost.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    // (2:0) {#if userId}
    function create_if_block$7(ctx) {
    	let div6;
    	let div2;
    	let textfield;
    	let updating_value;
    	let t0;
    	let div0;
    	let ul;
    	let li0;
    	let t1;
    	let t2;
    	let t3;
    	let li1;
    	let t4;
    	let t5;
    	let t6;
    	let div1;
    	let textarea0;
    	let br0;
    	let t7;
    	let t8;
    	let div3;
    	let br1;
    	let t9;
    	let div5;
    	let p;
    	let t11;
    	let div4;
    	let textarea1;
    	let t12;
    	let button;
    	let t13;
    	let current;
    	let mounted;
    	let dispose;

    	function textfield_value_binding(value) {
    		/*textfield_value_binding*/ ctx[17].call(null, value);
    	}

    	let textfield_props = {
    		autocomplete: "off",
    		label: "제목",
    		message: "Post 제목"
    	};

    	if (/*title*/ ctx[1] !== void 0) {
    		textfield_props.value = /*title*/ ctx[1];
    	}

    	textfield = new Re({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield, "value", textfield_value_binding));
    	/*textfield_binding*/ ctx[18](textfield);
    	let if_block0 = /*userId*/ ctx[0] === /*$uId*/ ctx[10] && create_if_block_3$1(ctx);

    	button = new xe({
    			props: {
    				raised: true,
    				color: "#ff3e00",
    				title: "Simple button",
    				style: "float: right; margin-top: 13px",
    				$$slots: { default: [create_default_slot_2$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*saveComent*/ ctx[13]);
    	let if_block1 = /*coments*/ ctx[9].length > 0 && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			create_component(textfield.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			t1 = text("createDate: ");
    			t2 = text(/*createDate*/ ctx[3]);
    			t3 = space();
    			li1 = element("li");
    			t4 = text("modifiedDate: ");
    			t5 = text(/*modifiedDate*/ ctx[4]);
    			t6 = space();
    			div1 = element("div");
    			textarea0 = element("textarea");
    			br0 = element("br");
    			t7 = space();
    			if (if_block0) if_block0.c();
    			t8 = space();
    			div3 = element("div");
    			br1 = element("br");
    			t9 = space();
    			div5 = element("div");
    			p = element("p");
    			p.textContent = "댓글:";
    			t11 = space();
    			div4 = element("div");
    			textarea1 = element("textarea");
    			t12 = space();
    			create_component(button.$$.fragment);
    			t13 = space();
    			if (if_block1) if_block1.c();
    			set_style(li0, "padding-right", "21%");
    			add_location(li0, file$g, 13, 10, 304);
    			add_location(li1, file$g, 14, 10, 376);
    			add_location(ul, file$g, 12, 8, 287);
    			attr_dev(div0, "class", "detail-ul");
    			add_location(div0, file$g, 11, 6, 254);
    			attr_dev(textarea0, "cols", "118%");
    			attr_dev(textarea0, "rows", "5");
    			set_style(textarea0, "resize", "none");
    			add_location(textarea0, file$g, 18, 8, 465);
    			add_location(br0, file$g, 24, 20, 646);
    			add_location(div1, file$g, 17, 6, 450);
    			attr_dev(div2, "class", "detail-box");
    			add_location(div2, file$g, 3, 4, 59);
    			add_location(br1, file$g, 34, 6, 1015);
    			attr_dev(div3, "class", "coment-border");
    			add_location(div3, file$g, 33, 4, 980);
    			attr_dev(p, "class", "coment-p");
    			add_location(p, file$g, 37, 6, 1065);
    			attr_dev(textarea1, "class", "coment-area");
    			attr_dev(textarea1, "name", "");
    			attr_dev(textarea1, "id", "coment-area");
    			attr_dev(textarea1, "rows", "2");
    			add_location(textarea1, file$g, 39, 8, 1135);
    			attr_dev(div4, "class", "coment-main");
    			add_location(div4, file$g, 38, 6, 1100);
    			attr_dev(div5, "class", "coment");
    			add_location(div5, file$g, 36, 4, 1037);
    			attr_dev(div6, "class", "detail-main");
    			add_location(div6, file$g, 2, 2, 28);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			mount_component(textfield, div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, t1);
    			append_dev(li0, t2);
    			append_dev(ul, t3);
    			append_dev(ul, li1);
    			append_dev(li1, t4);
    			append_dev(li1, t5);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, textarea0);
    			set_input_value(textarea0, /*contents*/ ctx[2]);
    			/*textarea0_binding*/ ctx[20](textarea0);
    			append_dev(div1, br0);
    			append_dev(div2, t7);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div6, t8);
    			append_dev(div6, div3);
    			append_dev(div3, br1);
    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			append_dev(div5, p);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, textarea1);
    			set_input_value(textarea1, /*comentVal*/ ctx[7]);
    			/*textarea1_binding*/ ctx[22](textarea1);
    			append_dev(div4, t12);
    			mount_component(button, div4, null);
    			append_dev(div5, t13);
    			if (if_block1) if_block1.m(div5, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea0, "input", /*textarea0_input_handler*/ ctx[19]),
    					listen_dev(textarea1, "input", /*textarea1_input_handler*/ ctx[21])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};

    			if (!updating_value && dirty & /*title*/ 2) {
    				updating_value = true;
    				textfield_changes.value = /*title*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);
    			if (!current || dirty & /*createDate*/ 8) set_data_dev(t2, /*createDate*/ ctx[3]);
    			if (!current || dirty & /*modifiedDate*/ 16) set_data_dev(t5, /*modifiedDate*/ ctx[4]);

    			if (dirty & /*contents*/ 4) {
    				set_input_value(textarea0, /*contents*/ ctx[2]);
    			}

    			if (/*userId*/ ctx[0] === /*$uId*/ ctx[10]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*userId, $uId*/ 1025) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div2, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*comentVal*/ 128) {
    				set_input_value(textarea1, /*comentVal*/ ctx[7]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1073741824) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (/*coments*/ ctx[9].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*coments*/ 512) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div5, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(button.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			/*textfield_binding*/ ctx[18](null);
    			destroy_component(textfield);
    			/*textarea0_binding*/ ctx[20](null);
    			if (if_block0) if_block0.d();
    			/*textarea1_binding*/ ctx[22](null);
    			destroy_component(button);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(2:0) {#if userId}",
    		ctx
    	});

    	return block;
    }

    // (27:6) {#if userId === $uId}
    function create_if_block_3$1(ctx) {
    	let button0;
    	let t0;
    	let button1;
    	let t1;
    	let button2;
    	let current;

    	button0 = new xe({
    			props: {
    				raised: true,
    				color: "#ff3e00",
    				title: "Simple button",
    				$$slots: { default: [create_default_slot_5$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*editPost*/ ctx[11]);

    	button1 = new xe({
    			props: {
    				raised: true,
    				title: "Simple button",
    				$$slots: { default: [create_default_slot_4$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*deletePost*/ ctx[14]);

    	button2 = new xe({
    			props: {
    				raised: true,
    				title: "Simple button",
    				$$slots: { default: [create_default_slot_3$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*cancel*/ ctx[12]);

    	const block = {
    		c: function create() {
    			create_component(button0.$$.fragment);
    			t0 = space();
    			create_component(button1.$$.fragment);
    			t1 = space();
    			create_component(button2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(button1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(button2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 1073741824) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 1073741824) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const button2_changes = {};

    			if (dirty & /*$$scope*/ 1073741824) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(button1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(button2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(27:6) {#if userId === $uId}",
    		ctx
    	});

    	return block;
    }

    // (28:8) <Button raised color="#ff3e00" title="Simple button" on:click={editPost}>
    function create_default_slot_5$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("수정");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$3.name,
    		type: "slot",
    		source: "(28:8) <Button raised color=\\\"#ff3e00\\\" title=\\\"Simple button\\\" on:click={editPost}>",
    		ctx
    	});

    	return block;
    }

    // (29:8) <Button raised title="Simple button" on:click={deletePost}>
    function create_default_slot_4$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("삭제");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$3.name,
    		type: "slot",
    		source: "(29:8) <Button raised title=\\\"Simple button\\\" on:click={deletePost}>",
    		ctx
    	});

    	return block;
    }

    // (30:8) <Button raised title="Simple button" on:click={cancel}>
    function create_default_slot_3$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("취소");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$4.name,
    		type: "slot",
    		source: "(30:8) <Button raised title=\\\"Simple button\\\" on:click={cancel}>",
    		ctx
    	});

    	return block;
    }

    // (47:8) <Button             raised             color="#ff3e00"             title="Simple button"             style="float: right; margin-top: 13px"             on:click={saveComent}          >
    function create_default_slot_2$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("저장");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$4.name,
    		type: "slot",
    		source: "(47:8) <Button             raised             color=\\\"#ff3e00\\\"             title=\\\"Simple button\\\"             style=\\\"float: right; margin-top: 13px\\\"             on:click={saveComent}          >",
    		ctx
    	});

    	return block;
    }

    // (55:6) {#if coments.length > 0}
    function create_if_block_1$2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*coments*/ ctx[9];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*coments, deleteComent, saveComent, $uId*/ 42496) {
    				each_value = /*coments*/ ctx[9];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(55:6) {#if coments.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (61:12) {#if coment.userId === $uId}
    function create_if_block_2$2(ctx) {
    	let div;
    	let button0;
    	let t;
    	let button1;
    	let current;

    	button0 = new xe({
    			props: {
    				raised: true,
    				color: "#ff3e00",
    				title: "Simple button",
    				style: "float: none; margin-top: 13px",
    				$$slots: { default: [create_default_slot_1$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*saveComent*/ ctx[13]);

    	button1 = new xe({
    			props: {
    				raised: true,
    				title: "Simple button",
    				style: "float: none; margin-top: 13px",
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", function () {
    		if (is_function(/*deleteComent*/ ctx[15](/*coment*/ ctx[27].no))) /*deleteComent*/ ctx[15](/*coment*/ ctx[27].no).apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t = space();
    			create_component(button1.$$.fragment);
    			set_style(div, "text-align", "left");
    			add_location(div, file$g, 61, 14, 1955);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button0, div, null);
    			append_dev(div, t);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 1073741824) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 1073741824) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(61:12) {#if coment.userId === $uId}",
    		ctx
    	});

    	return block;
    }

    // (63:16) <Button                     raised                     color="#ff3e00"                     title="Simple button"                     style="float: none; margin-top: 13px"                     on:click={saveComent}                  >
    function create_default_slot_1$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("수정");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$5.name,
    		type: "slot",
    		source: "(63:16) <Button                     raised                     color=\\\"#ff3e00\\\"                     title=\\\"Simple button\\\"                     style=\\\"float: none; margin-top: 13px\\\"                     on:click={saveComent}                  >",
    		ctx
    	});

    	return block;
    }

    // (70:16) <Button                     raised                     title="Simple button"                     style="float: none; margin-top: 13px"                     on:click={deleteComent(coment.no)}                  >
    function create_default_slot$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("삭제");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(70:16) <Button                     raised                     title=\\\"Simple button\\\"                     style=\\\"float: none; margin-top: 13px\\\"                     on:click={deleteComent(coment.no)}                  >",
    		ctx
    	});

    	return block;
    }

    // (56:8) {#each coments as coment}
    function create_each_block$3(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let t1_value = /*coment*/ ctx[27].writer + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let t4_value = /*coment*/ ctx[27].createdDate + "";
    	let t4;
    	let t5;
    	let div2;
    	let t6;
    	let t7_value = /*coment*/ ctx[27].coment + "";
    	let t7;
    	let t8;
    	let t9;
    	let br0;
    	let br1;
    	let t10;
    	let div3_id_value;
    	let current;
    	let if_block = /*coment*/ ctx[27].userId === /*$uId*/ ctx[10] && create_if_block_2$2(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = text("작성자: ");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			t3 = text("작성일자: ");
    			t4 = text(t4_value);
    			t5 = space();
    			div2 = element("div");
    			t6 = text("댓글: ");
    			t7 = text(t7_value);
    			t8 = space();
    			if (if_block) if_block.c();
    			t9 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t10 = space();
    			set_style(div0, "text-align", "left");
    			add_location(div0, file$g, 57, 14, 1689);
    			set_style(div1, "text-align", "left");
    			add_location(div1, file$g, 58, 14, 1762);
    			set_style(div2, "text-align", "left");
    			add_location(div2, file$g, 59, 14, 1841);
    			add_location(br0, file$g, 77, 12, 2538);
    			add_location(br1, file$g, 77, 16, 2542);
    			attr_dev(div3, "class", "coment-ul");
    			attr_dev(div3, "id", div3_id_value = "coment-ul-" + /*coment*/ ctx[27].no);
    			add_location(div3, file$g, 56, 10, 1623);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div1);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, t6);
    			append_dev(div2, t7);
    			append_dev(div3, t8);
    			if (if_block) if_block.m(div3, null);
    			append_dev(div3, t9);
    			append_dev(div3, br0);
    			append_dev(div3, br1);
    			append_dev(div3, t10);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*coments*/ 512) && t1_value !== (t1_value = /*coment*/ ctx[27].writer + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*coments*/ 512) && t4_value !== (t4_value = /*coment*/ ctx[27].createdDate + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*coments*/ 512) && t7_value !== (t7_value = /*coment*/ ctx[27].coment + "")) set_data_dev(t7, t7_value);

    			if (/*coment*/ ctx[27].userId === /*$uId*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*coments, $uId*/ 1536) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div3, t9);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*coments*/ 512 && div3_id_value !== (div3_id_value = "coment-ul-" + /*coment*/ ctx[27].no)) {
    				attr_dev(div3, "id", div3_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(56:8) {#each coments as coment}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let header;
    	let t;
    	let if_block_anchor;
    	let current;
    	header = new Header({ $$inline: true });
    	let if_block = /*userId*/ ctx[0] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*userId*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*userId*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $uId;
    	let $uName;
    	validate_store(uId, "uId");
    	component_subscribe($$self, uId, $$value => $$invalidate(10, $uId = $$value));
    	validate_store(uName, "uName");
    	component_subscribe($$self, uName, $$value => $$invalidate(25, $uName = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DetailPost", slots, []);
    	let { params = {} } = $$props;

    	let userId,
    		writer,
    		title,
    		contents,
    		category,
    		createDate,
    		modifiedDate,
    		inputTitle,
    		inputContents,
    		comentVal,
    		comentInput,
    		coments;

    	let fn_detail = async () => {
    		let res = await api.detailPost(params.id);
    		$$invalidate(1, title = res.post.title);
    		writer = res.post.writer;
    		$$invalidate(0, userId = res.post.userId);
    		$$invalidate(2, contents = res.post.contents);
    		category = res.post.category;
    		$$invalidate(3, createDate = res.post.createdDate);
    		$$invalidate(4, modifiedDate = res.post.modifiedDate);
    		$$invalidate(9, coments = res.coments);
    	};

    	fn_detail();

    	const editPost = async () => {
    		if (title === "") {
    			alert("Title is null");
    			inputTitle.focus();
    			return;
    		}

    		if (contents === "") {
    			alert("Contents is null");
    			inputContents.focus();
    			return;
    		}

    		const result = await api.updatePost(params.id, title, contents, $uId);

    		if (result === 1) {
    			alert("Edit post success.");
    			push("/posts");
    		}
    	};

    	const cancel = () => {
    		push("/posts");
    	};

    	const saveComent = async () => {
    		if (comentVal === "") {
    			alert("Coment is null");
    			comentInput.focus();
    			return;
    		}

    		if (comentVal === undefined) {
    			alert("Coment is null");
    			comentInput.focus();
    			return;
    		}

    		const result = await api.saveComent(params.id, comentVal, $uId, $uName);

    		if (result === 1) {
    			alert("Save coment success.");
    			$$invalidate(7, comentVal = "");
    			fn_detail();
    		}
    	};

    	const deletePost = async () => {
    		const con = confirm("Delete?");

    		if (!con) return; else {
    			const result = await api.deletePost(params.id);

    			if (result === 1) {
    				alert("Deleted");
    				push("/posts");
    			}
    		}
    	};

    	const deleteComent = async no => {
    		let res = await api.deleteComent(no);

    		if (res === 1) {
    			alert("Delete coment success.");
    			fn_detail();
    		}
    	};

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DetailPost> was created with unknown prop '${key}'`);
    	});

    	function textfield_value_binding(value) {
    		title = value;
    		$$invalidate(1, title);
    	}

    	function textfield_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputTitle = $$value;
    			$$invalidate(5, inputTitle);
    		});
    	}

    	function textarea0_input_handler() {
    		contents = this.value;
    		$$invalidate(2, contents);
    	}

    	function textarea0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputContents = $$value;
    			$$invalidate(6, inputContents);
    		});
    	}

    	function textarea1_input_handler() {
    		comentVal = this.value;
    		$$invalidate(7, comentVal);
    	}

    	function textarea1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			comentInput = $$value;
    			$$invalidate(8, comentInput);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(16, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		push,
    		Header,
    		api,
    		Snackbar: Qn,
    		Textfield: Re,
    		Button: xe,
    		uId,
    		uName,
    		params,
    		userId,
    		writer,
    		title,
    		contents,
    		category,
    		createDate,
    		modifiedDate,
    		inputTitle,
    		inputContents,
    		comentVal,
    		comentInput,
    		coments,
    		fn_detail,
    		editPost,
    		cancel,
    		saveComent,
    		deletePost,
    		deleteComent,
    		$uId,
    		$uName
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(16, params = $$props.params);
    		if ("userId" in $$props) $$invalidate(0, userId = $$props.userId);
    		if ("writer" in $$props) writer = $$props.writer;
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("contents" in $$props) $$invalidate(2, contents = $$props.contents);
    		if ("category" in $$props) category = $$props.category;
    		if ("createDate" in $$props) $$invalidate(3, createDate = $$props.createDate);
    		if ("modifiedDate" in $$props) $$invalidate(4, modifiedDate = $$props.modifiedDate);
    		if ("inputTitle" in $$props) $$invalidate(5, inputTitle = $$props.inputTitle);
    		if ("inputContents" in $$props) $$invalidate(6, inputContents = $$props.inputContents);
    		if ("comentVal" in $$props) $$invalidate(7, comentVal = $$props.comentVal);
    		if ("comentInput" in $$props) $$invalidate(8, comentInput = $$props.comentInput);
    		if ("coments" in $$props) $$invalidate(9, coments = $$props.coments);
    		if ("fn_detail" in $$props) fn_detail = $$props.fn_detail;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		userId,
    		title,
    		contents,
    		createDate,
    		modifiedDate,
    		inputTitle,
    		inputContents,
    		comentVal,
    		comentInput,
    		coments,
    		$uId,
    		editPost,
    		cancel,
    		saveComent,
    		deletePost,
    		deleteComent,
    		params,
    		textfield_value_binding,
    		textfield_binding,
    		textarea0_input_handler,
    		textarea0_binding,
    		textarea1_input_handler,
    		textarea1_binding
    	];
    }

    class DetailPost extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { params: 16 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DetailPost",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get params() {
    		throw new Error("<DetailPost>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<DetailPost>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\createPost.svelte generated by Svelte v3.31.2 */

    const { console: console_1$2 } = globals;
    const file$h = "src\\components\\createPost.svelte";

    // (11:4) <Button raised color="#ff3e00" on:click={save}>
    function create_default_slot_3$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("저장");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$5.name,
    		type: "slot",
    		source: "(11:4) <Button raised color=\\\"#ff3e00\\\" on:click={save}>",
    		ctx
    	});

    	return block;
    }

    // (12:4) <Button raised on:click={cancel}>
    function create_default_slot_2$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("취소");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$5.name,
    		type: "slot",
    		source: "(12:4) <Button raised on:click={cancel}>",
    		ctx
    	});

    	return block;
    }

    // (19:3) <Button color="#ff0" on:click={()=>{visible = false}}>
    function create_default_slot_1$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Close");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$6.name,
    		type: "slot",
    		source: "(19:3) <Button color=\\\"#ff0\\\" on:click={()=>{visible = false}}>",
    		ctx
    	});

    	return block;
    }

    // (18:1) <span slot="action">
    function create_action_slot$2(ctx) {
    	let span;
    	let button;
    	let current;

    	button = new xe({
    			props: {
    				color: "#ff0",
    				$$slots: { default: [create_default_slot_1$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[8]);

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(button.$$.fragment);
    			attr_dev(span, "slot", "action");
    			add_location(span, file$h, 17, 1, 476);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(button, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_action_slot$2.name,
    		type: "slot",
    		source: "(18:1) <span slot=\\\"action\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:0) <Snackbar bind:visible  timeout="3" >
    function create_default_slot$7(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(/*snackbar_message*/ ctx[3]);
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			set_data_dev(t0, /*snackbar_message*/ ctx[3]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(16:0) <Snackbar bind:visible  timeout=\\\"3\\\" >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let header;
    	let t0;
    	let div1;
    	let div0;
    	let textfield;
    	let updating_value;
    	let t1;
    	let textarea;
    	let br;
    	let t2;
    	let button0;
    	let t3;
    	let button1;
    	let t4;
    	let snackbar;
    	let updating_visible;
    	let current;
    	let mounted;
    	let dispose;
    	header = new Header({ $$inline: true });

    	function textfield_value_binding(value) {
    		/*textfield_value_binding*/ ctx[6].call(null, value);
    	}

    	let textfield_props = {
    		autocomplete: "off",
    		label: "제목",
    		message: "Post 제목"
    	};

    	if (/*title*/ ctx[0] !== void 0) {
    		textfield_props.value = /*title*/ ctx[0];
    	}

    	textfield = new Re({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield, "value", textfield_value_binding));

    	button0 = new xe({
    			props: {
    				raised: true,
    				color: "#ff3e00",
    				$$slots: { default: [create_default_slot_3$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*save*/ ctx[4]);

    	button1 = new xe({
    			props: {
    				raised: true,
    				$$slots: { default: [create_default_slot_2$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*cancel*/ ctx[5]);

    	function snackbar_visible_binding(value) {
    		/*snackbar_visible_binding*/ ctx[9].call(null, value);
    	}

    	let snackbar_props = {
    		timeout: "3",
    		$$slots: {
    			default: [create_default_slot$7],
    			action: [create_action_slot$2]
    		},
    		$$scope: { ctx }
    	};

    	if (/*visible*/ ctx[2] !== void 0) {
    		snackbar_props.visible = /*visible*/ ctx[2];
    	}

    	snackbar = new Qn({ props: snackbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(snackbar, "visible", snackbar_visible_binding));

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			create_component(textfield.$$.fragment);
    			t1 = space();
    			textarea = element("textarea");
    			br = element("br");
    			t2 = space();
    			create_component(button0.$$.fragment);
    			t3 = text("  \r\n    ");
    			create_component(button1.$$.fragment);
    			t4 = space();
    			create_component(snackbar.$$.fragment);
    			attr_dev(textarea, "cols", "100%");
    			attr_dev(textarea, "rows", "5");
    			attr_dev(textarea, "placeholder", "내용");
    			add_location(textarea, file$h, 9, 4, 182);
    			add_location(br, file$h, 9, 85, 263);
    			attr_dev(div0, "class", "create-box");
    			add_location(div0, file$h, 2, 2, 41);
    			attr_dev(div1, "class", "create-main");
    			add_location(div1, file$h, 1, 0, 12);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(textfield, div0, null);
    			append_dev(div0, t1);
    			append_dev(div0, textarea);
    			set_input_value(textarea, /*contents*/ ctx[1]);
    			append_dev(div0, br);
    			append_dev(div0, t2);
    			mount_component(button0, div0, null);
    			append_dev(div0, t3);
    			mount_component(button1, div0, null);
    			insert_dev(target, t4, anchor);
    			mount_component(snackbar, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[7]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const textfield_changes = {};

    			if (!updating_value && dirty & /*title*/ 1) {
    				updating_value = true;
    				textfield_changes.value = /*title*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);

    			if (dirty & /*contents*/ 2) {
    				set_input_value(textarea, /*contents*/ ctx[1]);
    			}

    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const snackbar_changes = {};

    			if (dirty & /*$$scope, visible, snackbar_message*/ 8204) {
    				snackbar_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty & /*visible*/ 4) {
    				updating_visible = true;
    				snackbar_changes.visible = /*visible*/ ctx[2];
    				add_flush_callback(() => updating_visible = false);
    			}

    			snackbar.$set(snackbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(textfield.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(snackbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(textfield.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(snackbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_component(textfield);
    			destroy_component(button0);
    			destroy_component(button1);
    			if (detaching) detach_dev(t4);
    			destroy_component(snackbar, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $uId;
    	let $uName;
    	let $cp;
    	validate_store(uId, "uId");
    	component_subscribe($$self, uId, $$value => $$invalidate(10, $uId = $$value));
    	validate_store(uName, "uName");
    	component_subscribe($$self, uName, $$value => $$invalidate(11, $uName = $$value));
    	validate_store(cp, "cp");
    	component_subscribe($$self, cp, $$value => $$invalidate(12, $cp = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CreatePost", slots, []);
    	let title, contents, visible, snackbar_message;

    	const save = async () => {
    		if (title === "" || title === undefined || contents === "" || contents === undefined) {
    			$$invalidate(3, snackbar_message = "Title or Contents is null");
    			$$invalidate(2, visible = true);
    			return;
    		}

    		console.log(title, contents, $uId, $uName, $cp);
    		const res = await api.savePost(title, contents, $uId, $uName, $cp);

    		if (res === 1) {
    			alert("Create post success.");
    		} else {
    			alert("Save error.");
    		}

    		push("/posts");
    	};

    	const cancel = () => {
    		push("/posts");
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<CreatePost> was created with unknown prop '${key}'`);
    	});

    	function textfield_value_binding(value) {
    		title = value;
    		$$invalidate(0, title);
    	}

    	function textarea_input_handler() {
    		contents = this.value;
    		$$invalidate(1, contents);
    	}

    	const click_handler = () => {
    		$$invalidate(2, visible = false);
    	};

    	function snackbar_visible_binding(value) {
    		visible = value;
    		$$invalidate(2, visible);
    	}

    	$$self.$capture_state = () => ({
    		push,
    		api,
    		Header,
    		cp,
    		uName,
    		uNo,
    		uId,
    		Snackbar: Qn,
    		Textfield: Re,
    		Button: xe,
    		title,
    		contents,
    		visible,
    		snackbar_message,
    		save,
    		cancel,
    		$uId,
    		$uName,
    		$cp
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("contents" in $$props) $$invalidate(1, contents = $$props.contents);
    		if ("visible" in $$props) $$invalidate(2, visible = $$props.visible);
    		if ("snackbar_message" in $$props) $$invalidate(3, snackbar_message = $$props.snackbar_message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		contents,
    		visible,
    		snackbar_message,
    		save,
    		cancel,
    		textfield_value_binding,
    		textarea_input_handler,
    		click_handler,
    		snackbar_visible_binding
    	];
    }

    class CreatePost extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreatePost",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    const routes = {
    	"/": Login,
    	"/posts": Posts,
    	"/createPost": CreatePost,
    	"/detail/:id": DetailPost,
    	"/mypage": Mypage,
    };

    /* src\App.svelte generated by Svelte v3.31.2 */

    function create_fragment$i(ctx) {
    	let router;
    	let current;
    	router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router, routes });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	// props: {
    	// 	name: 'world'
    	// }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
