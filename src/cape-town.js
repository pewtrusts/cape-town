/* global PUBLICPATH process*/
//utils
import * as d3 from 'd3-collection';
import Papa from 'papaparse';
import { stateModule as S } from 'stateful-dead';
import PS from 'pubsub-setter';
import { publishWindowResize } from '@Utils';

//data
import treaties from '@Project/data/treaties.json';
import countries from '@Project/data/countries.csv'; 
import countryCodes from '@Project/data/country-codes.json';
import EUCountries from '@Project/data/eu-countries.json';
import overseas from '@Project/data/overseas-territories.json';

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
    overseas
};
console.log(typeof PS);
publishWindowResize(S);

const views = [];

/*
CreateComponent take the passed-in _options and assigns its properties to the default options object. That object is then passed
in to the class constructor for the component.

All components receive the app's main model via options.model

rerenderOnDataMismatch specifies whether the component should be rerendered if the current data has changed since the build. The build
process appends a hash of the data to the app's container. See `beforeFirstChunk` property of Papa.parse options below.
*/
export function CreateComponent(component, selector, _options){ // TODO:  this should be a method of PCTApp or of the component library
    var options = Object.create({
        children: [],
        data: null,
        model,
        parent: null,
        rerenderOnDataMismatch: false
    });
    if ( _options !== null && typeof _options === 'object' ){
        for ( let key in _options ){
            if ( _options.hasOwnProperty(key) ){
                options[key] = _options[key];
            }
        }
    }
    
    return new component(selector, options);
}

function getRuntimeData(){
    var publicPath = '';
    if ( process.env.NODE_ENV === 'production' && !window.IS_PRERENDERING ){ // production build needs to know the public path of assets
                                                                             // for dev and preview, assets are a child of root; for build they
                                                                             // are in some distant path on sitecore
        publicPath = PUBLICPATH;
    }
    return new Promise((resolve, reject) => {
        Papa.parse(publicPath + countries, {
            download: true,
            dynamicTyping: true,
            header: true,
            fastMode: true, // no string escapes
            skipEmptyLines: true,
            beforeFirstChunk(chunk){ // on prerender, do simple hash of CSV contents and append as attribute of the app container
                                     // at runtime, do same hash of csv contents and compare to original. if hashes match, app will
                                     // continue normally. if mismatched, app will rerender all components based on the new data.
                                     // this allows for `hot` updating of the main data file without rebuilding the dist/ folder.
                                     // `model.isMismatch` will be set to `true` and the prerendering functions will check that value
                                     // and respond accordingly

                var dataHash = chunk.hashCode(); // hashCode is helper function from utils
                var el = document.querySelector('#pew-app');
                if ( window.IS_PRERENDERING ){
                    el.setAttribute('data-data-hash', dataHash);
                } else if ( process.env.NODE_ENV !== 'development' && dataHash.toString() !== el.getAttribute('data-data-hash') ){
                    el.setAttribute('data-data-mismatch',true);
                    console.log('data mismatch');
                    model.isMismatched = true; // set so that components can access this value 
                }
            },
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
                    /* June 3, 2020: commenting this out to prevent countries that have not directly ratified PSMA from showing
                        when it is selected. Leaving as comment in case future needs bring it back -JO */
                    if ( model.EUCountries.indexOf(d.key) !== -1 && ratified.indexOf('psma') === -1 ) { // ie is an EU country and not independently party to psma
                        
                        ratified.push('psma');
                    } 
                    // add className property to each country that corresponds to which treaties it is party to, or "none"
                    d.value = ratified.length === 0 ? 'None' : ratified.join('-');
                    return d;
                }).concat(// add on EU countries not already included from the CSV, ie, countries that have not independently
                          // ratified a treaty
                    model.EUCountries.filter(eur => model.countriesArray.indexOf(eur) === -1).map(c => { 
                        return {key: c, values: [], value: 'psma'};
                    })
                );
                
                // creat array of overseas territories to be included
                var overseasTerritories = [];
                for ( var key in model.overseas ){
                    if (model.overseas.hasOwnProperty(key)){
                        overseasTerritories.push(key);
                    }
                }
                
               model.joinData = model.joinData.concat(
                   overseasTerritories.map(ot => {
                        
                        var mainlandDatum = model.joinData.find(c => c.key === model.overseas[ot].mainland);
                        return Object.create(mainlandDatum, {
                            key: {
                                value: ot
                            },
                            isOverseasTerritory: {
                                value: true
                            },
                            mainland: {
                                value: mainlandDatum.key
                            },
                            values: {
                                value: model.overseas[ot].inheritTreaties.slice() // copy
                            },
                            value: {
                                value: model.overseas[ot].inheritTreaties.sort().join('-')
                            }
                        });
                    }) // creates objects that prototypically inherit from the mainland's object
                        // key is ownProperty; others are property up the inheritance chain.
               ).sort((a,b) => model.countryCodes[a.key] < model.countryCodes[b.key] ? -1 : 1);
               
                /* push views now that model is complete */
                
                views.push(
                    CreateComponent(TextView, 'div#pct-text'),
                    CreateComponent(MapView, 'div#pct-map'), // no need for rerenderOnDataMismatch b/c map is
                                                             // already only initialized at runtime
                    CreateComponent(SelectionView, 'div#selection-view', {rerenderOnDataMismatch: true}),
                    CreateComponent(TileView, 'defer', {rerenderOnDataMismatch: true})
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
            views.forEach(view => {
                this.container.appendChild(view.el);
            });
            this.container.classList.add('rendered');
        });
    }
    init(){
        this.needsRouter = true;
        var routerOptions = {
            subscriptions: ['deselected','searchCountries'],
            encode: this.routerSetHashFn,
            decode: this.routerDecodeHashFn,
            views,  // router needs view passed in because it can init only after views' promises have resolved
            PS      // router needs pubsub-setter passed in                             
        };
        getRuntimeData().then(() => {
            views.forEach(view => {
               view.init(this);                     // the views are all constructors (new keyword), so they are objects with methods, properties etc
            });
            //
            super.init(routerOptions); // super init include fn that addss has-hover class to body when mouse is use, removes it when touch is used.
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
                        
                        S.setState(this.abbreviations[arr[0]], arr[1].split('+'));
                        if ( arr[0] === 'c' ){
                            window.lastCountrySelectMethod = 'savedState'; // keeps from firing GTMPush for country selection events when they
                                                                           // happen from loading a saved state
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