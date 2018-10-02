//utils
import PS from 'pubsub-setter';
//import * as d3 from 'd3-collection';

import main from '@Project/css/main.scss';
import $d from '@Helpers/dom-helpers.js';
import tileStyles from '@Project/components/tile/styles.scss';
import CountryTile from '@Project/components/tile/tile.js';

export default class TileView {
    constructor(model){
        this.model = model;
        this.tiles = model.joinData.filter(country => country.values.length !== 0) // values length === 0 means it's an U
                                                                                   // pushed into the joinData array that shouldn't
                                                                                   // have a tile of its own. onlu PSMA by virtue of
                                                                                   // being an EU member
            .map((country, index) => new CountryTile(country, index, this));
        
        this.el = this.prerender();
        this.isReady = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        
    }
    prerender(){
        var existing = $d.q('#pct-tiles-cont');
        if ( existing ) {
            return existing;
        }

        //container
        var cont = $d.c('div');
        cont.setAttribute('id', 'pct-tiles-cont');
        cont.classList.add(main.flex);
        //cont.classList.add(main.sb);
        cont.classList.add(main.wrap);
        cont.classList.add(tileStyles.tilesContainer);
        
        ////tiles
        this.tiles.forEach(tile => {
            cont.appendChild(tile.el);
        });



        return cont;
    }
    init(){
        PS.setSubs([
            ['selected', (msg,data) => {
                this.update.call(this,msg,data);
            }],
            ['searchCountries', (msg,data) => {
               this.update.call(this,msg,data); 
            }]
        ]);
        
        this.tiles.forEach(each => {
            each.init();
        });
        this.resolve(true);
    }
    update(msg,data){
        if ( msg === 'selected') {
            this.swapPositions.call(this,msg,data);
        }
        if ( msg === 'searchCountries' ){
            this.searchCountries.call(this,msg,data);
        }
    }
    searchCountries(msg,data){
        
        var newMatch = null;
        var iso = data.length === 0 ? null : data[data.length - 1];
        if ( data.length !== 0 ){ // newMatch should be undefined only if data is not zero and there's still no match
                                  // this means there is no match because the requested country is not yet in the tiles  
            newMatch = this.tiles.find(t => iso === t.country.key);
        }
        
        if ( newMatch === undefined ){
            let datum = this.model.EUCountries.indexOf(iso) === -1 ? {key: iso, values: [], value: "None"} : {key: iso, values: [], value: "psma"};
            let newCountry = new CountryTile(datum, this.tiles.length, this, true); 
            this.tiles.push(newCountry);
            this.el.appendChild(newCountry.el);
        }
        if ( data.length === 0 ){ // ie search array from multiselect is cleared
            this.tiles.forEach((t,i) => {
                t.showOnSearch(data, i); // all should be made visible
            });
        } else {
            this.tiles.filter(t => data.indexOf(t.country.key) !== -1 ).forEach((filtered,i) => {
                filtered.showOnSearch(data, i);
            });
            this.tiles.filter(t => data.indexOf(t.country.key) === -1 ).forEach((filtered) => {
                filtered.hideOnSearch();
            });
        }
    }
    swapPositions(msg,data){ 
        this.tiles.forEach(tile => {
            tile.shouldGoToEnd = data.reduce((acc,cur) => {
                if ( tile.country.value.indexOf(cur) !== -1 ){ // ie the current treaty key IS in the value string
                    acc = false;
                }
                return acc;
            }, true);
        });
        var visibleTiles = this.tiles.filter(tile => tile.isVisible);
        
        setTimeout(() => { // separate FLIP steps out to do one at a times
            visibleTiles.forEach((each) => {
                each.getPosition('first'); //Flip
            });
            visibleTiles.forEach((each,i) => {
                each.changePosition(msg,data,i); //Last
            });
            visibleTiles.forEach((each) => {
                each.getPosition('last');
                each.invertPosition();
            });
            visibleTiles.forEach((each,i,array) => {
                each.animatePosition(i,array.length);
            });

        },250);
    }
}