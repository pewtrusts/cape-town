/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "StringHelpers" }]*/
import { StringHelpers } from '@Helpers/string-helpers.js';
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
// polyfills to be loaded only if needed
/*if ( Element.prototype.animate === undefined ){
    let scriptElement = document.createElement('script');
    scriptElement.async = false;
    scriptElement.src = 'js/webAnimation.js';
    document.head.appendChild(scriptElement);
}

if ( window.fetch === undefined ){
    let scriptElement = document.createElement('script');
    scriptElement.async = false;
    scriptElement.src = 'js/fetchPolyfill.js';
    document.head.appendChild(scriptElement);
}
*/
//end polyfills
App.init();