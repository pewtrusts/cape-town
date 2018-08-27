import MapView from './views/map/map.js';
import TextView from './views/text/text.js';
import SelectionView from './views/selection/selection.js';

const views = [ 
	new MapView(),
	new TextView(),
	new SelectionView(),
];

const TestApp = {
	prerender(){
		var app = document.querySelector('#pew-app');
		views.forEach(view => {
			app.appendChild(view.el);
		});
		app.classList.add('rendered');
	},
	init(){
		views.forEach(view => {
			view.init();
		});
	}
}


export default TestApp;