import CapeTown from './cape-town.js';
const app = document.querySelector('#pew-app');
const prerenderScript = document.querySelector('#prerender-script');
if ( !app.classList.contains('rendered') ){
	CapeTown.prerender();
}
if ( prerenderScript !== null ){ // html for build process includes spript#prerender-script that should be removed on build
	prerenderScript.parentNode.removeChild(prerenderScript);
}
CapeTown.init();