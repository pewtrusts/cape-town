import MapView from './views/map/map.js';
import TextView from './views/text/text.js';
import SelectorsView from './views/selectors/selectors.js';

const views = {
	map: new MapView(),
	text: new TextView(),
	selectors: new SelectorsView()
};

const TestApp = {
	prerender(){
		var app = document.querySelector('#pew-app');
		app.appendChild(views.map.el);
		app.appendChild(views.text.el);
		app.appendChild(views.selectors.el);
		app.classList.add('rendered');
	},
	init(){
		console.log('Init!');
	}
}


export default TestApp;