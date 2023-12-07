
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
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
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update$1(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update$1($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
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
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
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
            if (!is_function(callback)) {
                return noop;
            }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
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
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
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

    /* src/components/AddPet.svelte generated by Svelte v3.59.2 */

    const { console: console_1$2 } = globals;
    const file$3 = "src/components/AddPet.svelte";

    function create_fragment$3(ctx) {
    	let form;
    	let h3;
    	let t1;
    	let div0;
    	let label0;
    	let t2;
    	let span0;
    	let t4;
    	let t5;
    	let input0;
    	let t6;
    	let br0;
    	let t7;
    	let div1;
    	let label1;
    	let t8;
    	let span1;
    	let t10;
    	let t11;
    	let input1;
    	let t12;
    	let br1;
    	let t13;
    	let fieldset;
    	let legend;
    	let t14;
    	let span2;
    	let t16;
    	let label2;
    	let input2;
    	let t17;
    	let t18;
    	let label3;
    	let input3;
    	let t19;
    	let t20;
    	let label4;
    	let input4;
    	let t21;
    	let t22;
    	let br2;
    	let t23;
    	let div2;
    	let label5;
    	let t24;
    	let t25_value = /*pet*/ ctx[0].name + "";
    	let t25;
    	let t26;
    	let input5;
    	let t27;
    	let br3;
    	let t28;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			h3 = element("h3");
    			h3.textContent = "New Pet";
    			t1 = space();
    			div0 = element("div");
    			label0 = element("label");
    			t2 = text("Pet Name");
    			span0 = element("span");
    			span0.textContent = "*";
    			t4 = text(":");
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			br0 = element("br");
    			t7 = space();
    			div1 = element("div");
    			label1 = element("label");
    			t8 = text("Profile Picture");
    			span1 = element("span");
    			span1.textContent = "*";
    			t10 = text(":");
    			t11 = space();
    			input1 = element("input");
    			t12 = space();
    			br1 = element("br");
    			t13 = space();
    			fieldset = element("fieldset");
    			legend = element("legend");
    			t14 = text("Species");
    			span2 = element("span");
    			span2.textContent = "*";
    			t16 = space();
    			label2 = element("label");
    			input2 = element("input");
    			t17 = text("\n      Dog");
    			t18 = space();
    			label3 = element("label");
    			input3 = element("input");
    			t19 = text("\n      Cat");
    			t20 = space();
    			label4 = element("label");
    			input4 = element("input");
    			t21 = text("\n      Fish");
    			t22 = space();
    			br2 = element("br");
    			t23 = space();
    			div2 = element("div");
    			label5 = element("label");
    			t24 = text("Is ");
    			t25 = text(t25_value);
    			t26 = text(" friendly?\n      ");
    			input5 = element("input");
    			t27 = space();
    			br3 = element("br");
    			t28 = space();
    			button = element("button");
    			button.textContent = "Add Pet";
    			add_location(h3, file$3, 38, 2, 690);
    			attr_dev(span0, "class", "required svelte-w7m4kf");
    			add_location(span0, file$3, 40, 34, 749);
    			attr_dev(label0, "for", "pet-name");
    			add_location(label0, file$3, 40, 4, 719);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "pet-name");
    			input0.required = true;
    			add_location(input0, file$3, 41, 4, 795);
    			add_location(div0, file$3, 39, 2, 709);
    			add_location(br0, file$3, 42, 8, 869);
    			attr_dev(span1, "class", "required svelte-w7m4kf");
    			add_location(span1, file$3, 45, 48, 931);
    			attr_dev(label1, "for", "profile-picture");
    			add_location(label1, file$3, 45, 4, 887);
    			attr_dev(input1, "type", "url");
    			attr_dev(input1, "id", "profile-picture");
    			input1.required = true;
    			add_location(input1, file$3, 46, 4, 977);
    			add_location(div1, file$3, 44, 2, 877);
    			add_location(br1, file$3, 47, 8, 1060);
    			attr_dev(span2, "class", "required svelte-w7m4kf");
    			add_location(span2, file$3, 50, 19, 1098);
    			add_location(legend, file$3, 50, 4, 1083);
    			attr_dev(input2, "type", "radio");
    			attr_dev(input2, "name", "species");
    			attr_dev(input2, "id", "species-dog");
    			input2.required = true;
    			add_location(input2, file$3, 53, 6, 1180);
    			attr_dev(label2, "for", "species-dog");
    			add_location(label2, file$3, 52, 4, 1148);
    			attr_dev(input3, "type", "radio");
    			attr_dev(input3, "name", "species");
    			attr_dev(input3, "id", "species-cat");
    			input3.required = true;
    			add_location(input3, file$3, 60, 6, 1337);
    			attr_dev(label3, "for", "species-cat");
    			add_location(label3, file$3, 59, 4, 1305);
    			attr_dev(input4, "type", "radio");
    			attr_dev(input4, "name", "species");
    			attr_dev(input4, "id", "species-fish");
    			input4.required = true;
    			add_location(input4, file$3, 65, 6, 1485);
    			attr_dev(label4, "for", "species-fish");
    			add_location(label4, file$3, 64, 4, 1452);
    			add_location(fieldset, file$3, 49, 2, 1068);
    			add_location(br2, file$3, 68, 13, 1610);
    			attr_dev(input5, "type", "checkbox");
    			attr_dev(input5, "id", "pet-friendly");
    			add_location(input5, file$3, 73, 6, 1691);
    			attr_dev(label5, "for", "pet-friendly");
    			add_location(label5, file$3, 71, 4, 1628);
    			add_location(div2, file$3, 70, 2, 1618);
    			add_location(br3, file$3, 75, 8, 1782);
    			add_location(button, file$3, 78, 2, 1791);
    			add_location(form, file$3, 37, 0, 681);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, h3);
    			append_dev(form, t1);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(label0, t2);
    			append_dev(label0, span0);
    			append_dev(label0, t4);
    			append_dev(div0, t5);
    			append_dev(div0, input0);
    			set_input_value(input0, /*pet*/ ctx[0].name);
    			append_dev(div0, t6);
    			append_dev(form, br0);
    			append_dev(form, t7);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(label1, t8);
    			append_dev(label1, span1);
    			append_dev(label1, t10);
    			append_dev(div1, t11);
    			append_dev(div1, input1);
    			set_input_value(input1, /*pet*/ ctx[0].picture);
    			append_dev(div1, t12);
    			append_dev(form, br1);
    			append_dev(form, t13);
    			append_dev(form, fieldset);
    			append_dev(fieldset, legend);
    			append_dev(legend, t14);
    			append_dev(legend, span2);
    			append_dev(fieldset, t16);
    			append_dev(fieldset, label2);
    			append_dev(label2, input2);
    			set_input_value(input2, /*pet*/ ctx[0].species);
    			append_dev(label2, t17);
    			append_dev(fieldset, t18);
    			append_dev(fieldset, label3);
    			append_dev(label3, input3);
    			set_input_value(input3, /*pet*/ ctx[0].species);
    			append_dev(label3, t19);
    			append_dev(fieldset, t20);
    			append_dev(fieldset, label4);
    			append_dev(label4, input4);
    			set_input_value(input4, /*pet*/ ctx[0].species);
    			append_dev(label4, t21);
    			append_dev(fieldset, t22);
    			append_dev(form, br2);
    			append_dev(form, t23);
    			append_dev(form, div2);
    			append_dev(div2, label5);
    			append_dev(label5, t24);
    			append_dev(label5, t25);
    			append_dev(label5, t26);
    			append_dev(label5, input5);
    			set_input_value(input5, /*pet*/ ctx[0].friendly);
    			append_dev(div2, t27);
    			append_dev(form, br3);
    			append_dev(form, t28);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[2]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[3]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[4]),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[5]),
    					listen_dev(input4, "change", /*input4_change_handler*/ ctx[6]),
    					listen_dev(input5, "change", /*input5_change_handler*/ ctx[7]),
    					listen_dev(button, "click", /*handleAdd*/ ctx[1], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pet*/ 1 && input0.value !== /*pet*/ ctx[0].name) {
    				set_input_value(input0, /*pet*/ ctx[0].name);
    			}

    			if (dirty & /*pet*/ 1 && input1.value !== /*pet*/ ctx[0].picture) {
    				set_input_value(input1, /*pet*/ ctx[0].picture);
    			}

    			if (dirty & /*pet*/ 1) {
    				set_input_value(input2, /*pet*/ ctx[0].species);
    			}

    			if (dirty & /*pet*/ 1) {
    				set_input_value(input3, /*pet*/ ctx[0].species);
    			}

    			if (dirty & /*pet*/ 1) {
    				set_input_value(input4, /*pet*/ ctx[0].species);
    			}

    			if (dirty & /*pet*/ 1 && t25_value !== (t25_value = /*pet*/ ctx[0].name + "")) set_data_dev(t25, t25_value);

    			if (dirty & /*pet*/ 1) {
    				set_input_value(input5, /*pet*/ ctx[0].friendly);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
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
    	validate_slots('AddPet', slots, []);

    	let pet = {
    		name: '',
    		picture: 'Picture URL',
    		species: '',
    		friendly: false
    	};

    	const handleAdd = async () => {
    		try {
    			const response = await fetch('http://127.0.0.1:5000/api/pets', {
    				method: 'POST',
    				headers: { 'Content-Type': 'application/json' },
    				body: JSON.stringify(pet)
    			});

    			$$invalidate(0, pet = {
    				name: '',
    				picture: 'Picture URL',
    				species: '',
    				friendly: false
    			});

    			if (response.ok) {
    				console.log('Add ok');
    			} else {
    				console.error('Add fail');
    			}
    		} catch(error) {
    			console.error('Error:', error);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<AddPet> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		pet.name = this.value;
    		$$invalidate(0, pet);
    	}

    	function input1_input_handler() {
    		pet.picture = this.value;
    		$$invalidate(0, pet);
    	}

    	function input2_change_handler() {
    		pet.species = this.value;
    		$$invalidate(0, pet);
    	}

    	function input3_change_handler() {
    		pet.species = this.value;
    		$$invalidate(0, pet);
    	}

    	function input4_change_handler() {
    		pet.species = this.value;
    		$$invalidate(0, pet);
    	}

    	function input5_change_handler() {
    		pet.friendly = this.value;
    		$$invalidate(0, pet);
    	}

    	$$self.$capture_state = () => ({ pet, handleAdd });

    	$$self.$inject_state = $$props => {
    		if ('pet' in $$props) $$invalidate(0, pet = $$props.pet);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		pet,
    		handleAdd,
    		input0_input_handler,
    		input1_input_handler,
    		input2_change_handler,
    		input3_change_handler,
    		input4_change_handler,
    		input5_change_handler
    	];
    }

    class AddPet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddPet",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/GetCard.svelte generated by Svelte v3.59.2 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/components/GetCard.svelte";

    // (34:0) {:else}
    function create_else_block(ctx) {
    	let p;
    	let t0;
    	let t1_value = /*pet*/ ctx[0].name + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Careful, ");
    			t1 = text(t1_value);
    			t2 = text(" is not so friendly...");
    			add_location(p, file$2, 34, 0, 694);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pet*/ 1 && t1_value !== (t1_value = /*pet*/ ctx[0].name + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(34:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (32:0) {#if pet.friendly}
    function create_if_block(ctx) {
    	let p;
    	let t0_value = /*pet*/ ctx[0].name + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = text(" is super friendly!");
    			add_location(p, file$2, 32, 0, 649);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pet*/ 1 && t0_value !== (t0_value = /*pet*/ ctx[0].name + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(32:0) {#if pet.friendly}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let p0;
    	let t0;
    	let t1_value = /*pet*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let p1;
    	let t3;
    	let t4_value = /*pet*/ ctx[0].species + "";
    	let t4;
    	let t5;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t6;
    	let t7;
    	let button;
    	let t9;
    	let br;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*pet*/ ctx[0].friendly) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("Name: ");
    			t1 = text(t1_value);
    			t2 = space();
    			p1 = element("p");
    			t3 = text("Species: ");
    			t4 = text(t4_value);
    			t5 = space();
    			img = element("img");
    			t6 = space();
    			if_block.c();
    			t7 = space();
    			button = element("button");
    			button.textContent = "Remove";
    			t9 = space();
    			br = element("br");
    			add_location(p0, file$2, 25, 0, 485);
    			add_location(p1, file$2, 27, 0, 510);
    			if (!src_url_equal(img.src, img_src_value = './img/' + /*pet*/ ctx[0].picture)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "A " + /*pet*/ ctx[0].species.toLowerCase() + " named " + /*pet*/ ctx[0].name);
    			attr_dev(img, "class", "svelte-194ukt0");
    			add_location(img, file$2, 29, 0, 541);
    			add_location(button, file$2, 37, 0, 750);
    			add_location(br, file$2, 39, 0, 809);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, img, anchor);
    			insert_dev(target, t6, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, br, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*handleRemove*/ ctx[1](/*pet*/ ctx[0].id))) /*handleRemove*/ ctx[1](/*pet*/ ctx[0].id).apply(this, arguments);
    					},
    					false,
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*pet*/ 1 && t1_value !== (t1_value = /*pet*/ ctx[0].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*pet*/ 1 && t4_value !== (t4_value = /*pet*/ ctx[0].species + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*pet*/ 1 && !src_url_equal(img.src, img_src_value = './img/' + /*pet*/ ctx[0].picture)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*pet*/ 1 && img_alt_value !== (img_alt_value = "A " + /*pet*/ ctx[0].species.toLowerCase() + " named " + /*pet*/ ctx[0].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t7.parentNode, t7);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t6);
    			if_block.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(br);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GetCard', slots, []);
    	let { pet } = $$props;

    	const handleRemove = async id => {
    		try {
    			const response = await fetch(`http://127.0.0.1:5000/api/pets/${id}`, {
    				method: 'DELETE',
    				headers: { 'Content-Type': 'application/json' }
    			});

    			if (response.ok) {
    				console.log('Remove ok');
    				update = true;
    			} else {
    				console.error('Remove fail');
    			}
    		} catch(error) {
    			console.error('Error:', error);
    		}
    	};

    	$$self.$$.on_mount.push(function () {
    		if (pet === undefined && !('pet' in $$props || $$self.$$.bound[$$self.$$.props['pet']])) {
    			console_1$1.warn("<GetCard> was created without expected prop 'pet'");
    		}
    	});

    	const writable_props = ['pet'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<GetCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('pet' in $$props) $$invalidate(0, pet = $$props.pet);
    	};

    	$$self.$capture_state = () => ({ pet, handleRemove });

    	$$self.$inject_state = $$props => {
    		if ('pet' in $$props) $$invalidate(0, pet = $$props.pet);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pet, handleRemove];
    }

    class GetCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { pet: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GetCard",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get pet() {
    		throw new Error("<GetCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pet(value) {
    		throw new Error("<GetCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ListPets.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/ListPets.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (24:0) {#each pets as pet}
    function create_each_block(ctx) {
    	let getcard;
    	let t;
    	let hr;
    	let current;

    	getcard = new GetCard({
    			props: {
    				pet: /*pet*/ ctx[2],
    				update: /*update*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(getcard.$$.fragment);
    			t = space();
    			hr = element("hr");
    			add_location(hr, file$1, 25, 2, 479);
    		},
    		m: function mount(target, anchor) {
    			mount_component(getcard, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, hr, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const getcard_changes = {};
    			if (dirty & /*pets*/ 1) getcard_changes.pet = /*pet*/ ctx[2];
    			getcard.$set(getcard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(getcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(getcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(getcard, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(24:0) {#each pets as pet}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let h3;
    	let t1;
    	let each_1_anchor;
    	let current;
    	let each_value = /*pets*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Pet List";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(h3, file$1, 21, 0, 407);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pets, update*/ 3) {
    				each_value = /*pets*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ListPets', slots, []);
    	let pets = [];

    	onMount(async () => {
    		try {
    			const response = await fetch('http://127.0.0.1:5000/api/pets');
    			const data = await response.json();
    			$$invalidate(0, pets = data);
    		} catch(error) {
    			console.error('Gretchen, stop trying to make fetch happen!', error);
    		}
    	});

    	let update = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<ListPets> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, pets, GetCard, update });

    	$$self.$inject_state = $$props => {
    		if ('pets' in $$props) $$invalidate(0, pets = $$props.pets);
    		if ('update' in $$props) $$invalidate(1, update = $$props.update);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pets, update];
    }

    class ListPets extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListPets",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let section0;
    	let addpet;
    	let t2;
    	let section1;
    	let listpets;
    	let current;
    	addpet = new AddPet({ $$inline: true });
    	listpets = new ListPets({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Pet Tracker";
    			t1 = space();
    			section0 = element("section");
    			create_component(addpet.$$.fragment);
    			t2 = space();
    			section1 = element("section");
    			create_component(listpets.$$.fragment);
    			attr_dev(h1, "class", "svelte-txm76o");
    			add_location(h1, file, 7, 1, 132);
    			attr_dev(section0, "class", "svelte-txm76o");
    			add_location(section0, file, 9, 1, 155);
    			attr_dev(section1, "class", "svelte-txm76o");
    			add_location(section1, file, 13, 1, 192);
    			attr_dev(main, "class", "svelte-txm76o");
    			add_location(main, file, 6, 0, 124);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, section0);
    			mount_component(addpet, section0, null);
    			append_dev(main, t2);
    			append_dev(main, section1);
    			mount_component(listpets, section1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addpet.$$.fragment, local);
    			transition_in(listpets.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addpet.$$.fragment, local);
    			transition_out(listpets.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(addpet);
    			destroy_component(listpets);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ AddPet, ListPets });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
