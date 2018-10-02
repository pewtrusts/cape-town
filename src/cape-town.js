//utils
import * as d3 from 'd3-collection';
import Papa from 'papaparse';
import { stateModule as S } from 'stateful-dead';
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
    //views.length = 0;
    
    return new Promise((resolve, reject) => {
        Papa.parse(countries, {
            download: true,
            dynamicTyping: true,
            header: true,
            fastMode: true,
            skipEmptyLines: true,
            complete: function(response){
                views.length = 0;
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
                /* push views now that model is complete */
                views.push(
                    new TextView('div#pct-text'),
                    new MapView('div#pct-map',model),
                    new SelectionView('div#selection-view', model),
                    new TileView(model)
                );
                
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
        this.wasPrerendered = false;
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
        getRuntimeData().then(() => {
            views.forEach(view => {
               view.init(this);                     // the views are all constructors (new keyword), so they are objects with methods, properties etc
            });
            //console.log(this, views);
            super.init(subsriptionsForRouter, PS, this.routerSetHashFn, this.routerDecodeHashFn, views); // super init include fn that addss has-hover class to body when mouse is use, removes it when touch is used.
            this.router.abbreviations = {
                deselected: 'd',
                searchCountries: 'c',
                d: 'deselected',
                c: 'searchCountries'
            };
        });                                // STEP ONE:  index.js calls this init()

        
    }
    routerSetHashFn(){
        var deselected = [],
        hashStrings = [];
        
        for ( var key in this.stateObj) {
            if (this.stateObj.hasOwnProperty(key)){
                if ( key.indexOf('deselected') !== -1 ){
                    if ( this.stateObj[key] ){
                        deselected.push(key.split('.')[1]);
                    }
                } else if ( this.stateObj[key].length > 0 ){
                    hashStrings.push(this.abbreviations[key] + '=' + this.stateObj[key].join('+'));
                }
            }
        }
        deselected.sort();
        
        // deselected string
        if ( deselected.length > 0 ){
            hashStrings.push('d=' + deselected.join('+'));
        }
        
        this.hashString = hashStrings.length > 0 ? '#' + hashStrings.join('?') : ' ';

    }
    routerDecodeHashFn(){
        if ( window.location.hash && window.location.hash.slice(1).split('?').length > 0 ){
            window.location.hash.slice(1).split('?').forEach(category => {
                var arr = category.split('=');
                console.log(arr);
                if (arr.length > 1){
                    var treaties = model.treaties.map(t => t.key);
                    if (arr[0] === 'd'){
                        arr[1].split('+').forEach(treaty => {
                            S.setState('deselected.' + treaty, true);
                            let index = treaties.indexOf(treaty);
                            treaties.splice(index,1);
                        });
                        S.setState('selected',treaties);
                    } else {
                        console.log(this);
                        S.setState(this.abbreviations[arr[0]], arr[1].split('+'));
                        if ( arr[0] === 'c' ){
                            arr[1].split('+').forEach(c => {
                                S.setState('clickCountries', c);
                            });
                        }
                    }
                }
            });
        }

    }

}


export default CapeTown;