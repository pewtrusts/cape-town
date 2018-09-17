//utils
import * as d3 from 'd3-collection';

//data
import treaties from '@Project/data/treaties.json';
import countries from '@Project/data/countries_new.csv';
import countryCodes from '@Project/data/country-codes.json';
import EUCountries from '@Project/data/eu-countries.json';

//views
import MapView from './views/map/map.js';
import TextView from './views/text/text.js';
import SelectionView from './views/selection/selection.js';
import TileView from './views/tiles/tile-view.js';
console.log(EUCountries);
const model = {
	treaties,
	countries,
    EUCountries,
	countryCodes,
	// take the csv data and nest it by country so each country is one object with an array of values
	countriesNested: d3.nest().key(d => d.iso_a3).entries(countries),
    treatiesNested: d3.nest().key(d => d.treaty_id).entries(countries),
	joinData: d3.nest().key(d => d.iso_a3).entries(countries).map(d => {
        var ratified = [];
        d.values.sort((a,b) => a.treaty_id < b.treaty_id ? -1 : a.treaty_id > b.treaty_id ? 1 : a.treaty_id >= b.treaty_id ? 0 : NaN).forEach(v => { // sort fn from d3.ascending()
            if (v.ratified_date !== '' ){
                ratified.push(v.treaty_id);
            }
        })
        // add className property to each country that corresponds to which treaties it is party to, or "none"
        d.value = ratified.length === 0 ? 'None' : ratified.join('-');
        return d;
    })
};

console.log(model);
const views = [ 
	new TextView('div#pct-text'),
	new MapView('div#pct-map',model),
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