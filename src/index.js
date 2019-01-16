/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "StringHelpers" }]*/
import '@Helpers/string-helpers.js'; // string helpers is an IIFE, invoke when imported but never referenced again
import CapeTown from './cape-town.js';
import './arrayFrom.js';

const App = new CapeTown();
App.wasPrerendered = true;
const appContainer = document.querySelector('#pew-app');
const prerenderScript = document.querySelector('#prerender-script');
if ( !appContainer.classList.contains('rendered') ){

	App.prerender();
}
if ( prerenderScript !== null ){ // html for build process includes spript#prerender-script that should be removed on build
	prerenderScript.parentNode.removeChild(prerenderScript);
}
App.init();