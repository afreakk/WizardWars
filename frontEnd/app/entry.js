/**
 * App.js
 *
 * The main entry point from WebPack
 * - Appends render canvas to DOM
 * - Calls renderer.render
 * - Add Loading Screen and loads assets
 * - Adds WizardWars Screen once loading is complete
 * - Subscribes and Dispatches to AppStore & DOM
 */
import './index.html';

import {Container, utils} from 'pixi.js';

import ColorFilter from './filters/color/color';
import Renderer from './Renderer/Renderer';
import WizardWars from './screens/WizardWars';
import {updateFilterColor, updateFilterIsOn} from './stores/AppStore';
import {AnimationStore} from './stores/Store';
import Store from './stores/Store';

const renderer = new Renderer();  // an extension of WebGLRenderer which
                                  // dispatches to RendererStore
renderer.autoResize = true;
const app =
    new Container();  // Auto scale to screen size, subscribed to RendererStore

// Controls for filter/DOM Redux example
const colorOnInput = document.querySelector('#checkbox');
const colorValueInput = document.querySelector('#color');
const colorFilter = new ColorFilter();

// append renderer to DOM
document.body.appendChild(renderer.view);

// animate loop for render
AnimationStore.subscribe(() => {
    renderer.render(app);
});

// Update DOM and App.filters from AppStore
Store.subscribe(() => {
    const {color, coloron} = Store.getState().App;
    colorOnInput.checked = coloron;
    colorValueInput.value = utils.hex2string(color);
    colorFilter.color = color;
    app.filters = coloron ? [colorFilter] : [];
});

// Dispatch from DOM to AppStore
colorValueInput.addEventListener(
    'change', v => Store.dispatch(updateFilterColor(v.currentTarget.value)));
colorOnInput.addEventListener(
    'change', v => Store.dispatch(updateFilterIsOn(v.currentTarget.checked)));

const example = new WizardWars();
example.setRenderer(renderer);
app.addChild(example);

// start the render loop
renderer.start();
