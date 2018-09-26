//utils
import * as d3 from 'd3-collection';
import Papa from 'papaparse';

//data
import treaties from '@Project/data/treaties.json';
import countries from '@Project/data/countries.csv'; 
import countryCodes from '@Project/data/country-codes.json';
import EUCountries from '@Project/data/eu-countries.json';

//views
import MapView from './views/map/map.js';
import TextView from './views/text/text.js';
import SelectionView from './views/selection/selection.js';
import TileView from './views/tiles/tile-view.js';

// app prototype
import PCTApp from '@App';

const model = {
    treaties,
    EUCountries,
    countryCodes,
};


const views = [];

function getRuntimeData(){
    console.log(countries);
    return new Promise((resolve, reject) => {
        Papa.parse(countries, {
            download: true,
            dynamicTyping: true,
            header: true,
            fastMode: true,
            skipEmptyLines: true,
            complete: function(response){
                var countries = response.data;
                /* complete model based on fetched data */

                model.countries = countries;
                model.countriesNested = d3.nest().key(d => d.iso_a3).entries(countries);
                model.treatiesNested =  d3.nest().key(d => d.treaty_id).entries(countries);
                model.joinData = d3.nest().key(d => d.iso_a3).entries(countries).map(d => {
                    var ratified = [];
                    d.values.sort((a,b) => a.treaty_id < b.treaty_id ? -1 : a.treaty_id > b.treaty_id ? 1 : a.treaty_id >= b.treaty_id ? 0 : NaN).forEach(v => { // sort fn from d3.ascending()
                        if (v.ratified_date !== '' ){
                            ratified.push(v.treaty_id);
                        }
                    });
                                        // add className property to each country that corresponds to which treaties it is party to, or "none"
                    d.value = ratified.length === 0 ? 'None' : ratified.join('-');
                    return d;
                });
                console.log(model);
                /* push views now that model is complete */
                views.push(
                    new TextView('div#pct-text'),
                    new MapView('div#pct-map',model),
                    new SelectionView('div#selection-view', model),
                    new TileView(model)
                );
                console.log(model);
                resolve(true);
            },
            error: function(error){
                reject(error);
            }
        });
    });
}

class CapeTown extends PCTApp {
    prerender(){
        getRuntimeData().then(() => {
            var app = document.querySelector('#pew-app');
            views.forEach(view => {
                app.appendChild(view.el);
            });
            app.classList.add('rendered');
        });
    }
    init(){
        super.init(); // super init include fn that addss has-hover class to body when mouse is use, removes it when touch is used.
        getRuntimeData().then(() => {
            views.forEach(view => {
                view.init();                     // the views are all constructors (new keyword), so they are objects with methods, properties etc
            });
        });                                // STEP ONE:  index.js calls this init()
        
    }
}


export default CapeTown;