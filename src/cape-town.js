//utils
import * as d3 from 'd3-collection';
import Papa from 'papaparse';
import PS from 'pubsub-setter';

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
    countryCodes
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
                model.countriesArray = model.countriesNested.map(c => c.key);
                model.joinData = d3.nest().key(d => d.iso_a3).entries(countries).map(d => {
                    var ratified = [];
                    d.values.sort((a,b) => a.treaty_id < b.treaty_id ? -1 : a.treaty_id > b.treaty_id ? 1 : a.treaty_id >= b.treaty_id ? 0 : NaN).forEach(v => { // sort fn from d3.ascending()
                        if (v.ratified_date !== '' ){
                            ratified.push(v.treaty_id);
                        }
                    });
                    // **** below applies only to countries that are in the csv ***
                    if ( model.EUCountries.indexOf(d.key) !== -1 && ratified.indexOf('psma') === -1 ) { // ie is an EU country and not independently party to psma
                        console.log('pushing psma', d);
                        ratified.push('psma');
                    }
                    // add className property to each country that corresponds to which treaties it is party to, or "none"
                    d.value = ratified.length === 0 ? 'None' : ratified.join('-');
                    return d;
                }).concat(
                    model.EUCountries.filter(eur => model.countriesArray.indexOf(eur) === -1).map(c => { 
                        return {key: c, values: [], value: 'psma'};
                    })
                );
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
        var subsriptionsForRouter = ['deselected','searchCountries'];
        super.init(subsriptionsForRouter, PS, this.routerSetHashFn); // super init include fn that addss has-hover class to body when mouse is use, removes it when touch is used.
        getRuntimeData().then(() => {
            views.forEach(view => {
                view.init();                     // the views are all constructors (new keyword), so they are objects with methods, properties etc
            });
        });                                // STEP ONE:  index.js calls this init()
        
    }
    routerSetHashFn(){
            var deselected = [],
            hashStrings = [],
            abbreviations = {
                deselected: 'ds',
                selected: 's',
                searchCountries: 'sc'
            };
            for ( var key in this.stateObj) {
                if (this.stateObj.hasOwnProperty(key)){
                    if ( key.indexOf('deselected') !== -1 ){
                        if ( this.stateObj[key] ){
                            deselected.push(key.split('.')[1]);
                        }
                    } else if ( this.stateObj[key].length > 0 ){
                        hashStrings.push(abbreviations[key] + '=' + this.stateObj[key].join('+'));
                    }
                }
            }
            deselected.sort();
            console.log(deselected);
            // deselected string
            if ( deselected.length > 0 ){
                hashStrings.push('d=' + deselected.join('+'));
            }
            console.log(hashStrings);
            this.hashString = hashStrings.length > 0 ? '#' + hashStrings.join('?') : ' ';

        }

}


export default CapeTown;