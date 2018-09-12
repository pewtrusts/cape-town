/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "StringHelpers" }]*/
import { StringHelpers } from '@Helpers/string-helpers.js';
import CapeTown from './cape-town.js';
import './arrayFrom.js';

const app = document.querySelector('#pew-app');
const prerenderScript = document.querySelector('#prerender-script');
if ( !app.classList.contains('rendered') ){
	CapeTown.prerender();
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
console.log(window.fetch === undefined);
if ( window.fetch === undefined ){
    let scriptElement = document.createElement('script');
    scriptElement.async = false;
    scriptElement.src = 'js/fetchPolyfill.js';
    document.head.appendChild(scriptElement);
}
*/
//end polyfills
CapeTown.init();