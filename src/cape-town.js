//data
import treaties from '@Project/data/treaties.json';
import countries from '@Project/data/countries.csv';

//views
import MapView from './views/map/map.js';
import TextView from './views/text/text.js';
import SelectionView from './views/selection/selection.js';
import TileView from './views/tiles/tile-view.js';

const model = {
	treaties,
	countries
};

const views = [ 
	new TextView('div#pct-text'),
	new MapView('div#pct-map'),
	new SelectionView('div#selection-view', model),
	new TileView(model)
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