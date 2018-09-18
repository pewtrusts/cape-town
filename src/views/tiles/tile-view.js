//utils
import PS from 'pubsub-setter';
//import * as d3 from 'd3-collection';

import main from '@Project/css/main.scss';
import $d from '@Helpers/dom-helpers.js';
//import tileStyles from '@Project/components/tile/styles.scss';
import CountryTile from '@Project/components/tile/tile.js';

export default class TileView {
    constructor(model){
        this.model = model;
        this.tiles = model.joinData.map((country, index) => new CountryTile(country, index, this));
        this.el = this.prerender();
        console.log(this.tiles);
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
        
        ////tiles
        this.tiles.forEach(tile => {
            cont.append(tile.el);
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
        console.log('Init tiles');
        this.tiles.forEach(each => {
            each.init();
        });
        /*this.el.addEventListener('click', () => {
            this.update.call(this);
        });*/
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
        console.log('searchCountries',msg,data);
        var newMatch = null;
        if ( data.length !== 0 ){ // newMatch should be undefined only if data is not zero and there's still no match
                                  // this means there is no match because the requested country is not yet in the tiles  
            newMatch = this.tiles.find(t => data[data.length - 1] === t.country.key);
        }
        console.log(newMatch);
        if ( newMatch === undefined ){
            this.tiles.push(new CountryTile({key: data[data.length - 1], values: [], value: "None"}, this.tiles.length, this, true));
            this.el.appendChild(this.tiles[this.tiles.length - 1].el);
        }
        this.tiles.filter(t => data.indexOf(t.country.key) !== -1 ).forEach((filtered,i) => {
            filtered.showOnSearch(data, i);
        });
        this.tiles.filter(t => data.indexOf(t.country.key) === -1 ).forEach((filtered,i) => {
            filtered.hideOnSearch(data,i);
        });
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
        console.log(this.tiles);
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

        },500);
    }
}