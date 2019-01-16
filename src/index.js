/* entry point. any polyfills or native prototype extensions should be imported here */
import '@Helpers/string-helpers.js'; // string helpers is an IIFE
import './arrayFrom.js'; // IIFE

import CapeTown from './cape-town.js';

const App = new CapeTown();
App.wasPrerendered = true;
const appContainer = document.querySelector('#pew-app');
if ( !appContainer.classList.contains('rendered') ){
	App.prerender();
}
App.init();