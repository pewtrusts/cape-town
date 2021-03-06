//utils
import PS from 'pubsub-setter';
//import * as d3 from 'd3-collection';

import main from '@Project/css/main.scss';
import { DOMHelpers as $d } from '@Utils';
import tileStyles from '@Project/components/tile/styles.scss';
import CountryTile from '@Project/components/tile/tile.js';
import { CreateComponent } from '@Project/cape-town.js'; 

export default class TileView {
    constructor(selector, options){
        this.model = options.model;
        console.log(this.model);
        this.tiles = options.model.joinData.filter(country => country.values.length !== 0 && !country.isOverseasTerritory ) 
                                                                                   // values length === 0 means it's an EU country
                                                                                   // pushed into the joinData array that shouldn't
                                                                                   // have a tile of its own. onlu PSMA by virtue of
                                                                                   // being an EU member

                                                                                   // isOverseasTerritory countries should not be include
                                                                                   // in initial rendering
            .map((country, index) => {
                country.index = index;
                
                return CreateComponent(CountryTile, 'defer', {data: country, parent: this, rerenderOnDataMismatch: true});
            });

        this.rerender = ( options.rerenderOnDataMismatch && this.model.isMismatched );
        this.el = this.prerender();
        this.isReady = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        
    }
    prerender(){
        console.log(this);
        var existing = $d.q('#pct-tiles-cont');
        var cont;

        if ( existing && !this.rerender ) {
            
            return existing;
        }
        if ( existing && this.rerender ){
            
            existing.innerHTML = ''; 
            cont = existing;
        } else {
            cont = $d.c('ul');
        }
        //container
        cont.setAttribute('id', 'pct-tiles-cont');
        cont.setAttribute('aria-live', 'polite');
        cont.setAttribute('aria-relevant', 'additions removals');
        cont.classList.add(main.flex);
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
            let overseasMatch = this.model.joinData.find(c => c.key === iso);
            
            let datum = overseasMatch ? overseasMatch : this.model.EUCountries.indexOf(iso) === -1 ? {key: iso, values: [], value: "None"} : {key: iso, values: [], value: "psma"};
            
            //let newCountry = new CountryTile(datum, this.tiles.length, this, true); 
            datum.index = this.tiles.length;
            let newCountry = CreateComponent(CountryTile, 'defer', {data: datum, parent: this, isPushed: true});
            this.tiles.push(newCountry);
            this.el.appendChild(newCountry.el);
            newCountry.init();
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
        var isNarrow = document.documentElement.clientWidth < 629;
        var delay = !isNarrow ? 200 : 0;
        setTimeout(() => { // separate FLIP steps out to do one at a times
            if (!isNarrow){
                this.tiles.forEach((each) => {
                    each.getPosition('first'); //Flip
                });
            }
            this.tiles.forEach((each,i) => {
                each.changePosition(msg,data,i); //Last
            });
            this.nonMatching.sort((a,b) => {
                var _a = this.model.countryCodes[a.country.key];
                var _b = this.model.countryCodes[b.country.key];
                var sorted = [_a,_b].sort();
                return sorted.indexOf(_a) - sorted.indexOf(_b);
            }).forEach((each => {
                each.sendToEnd();
            }));
            if (!isNarrow){
                this.tiles.forEach((each) => {
                    each.getPosition('last');
                    each.invertPosition();
                });
                this.tiles.forEach((each,i,array) => {
                    each.animatePosition(i,array.length);
                });
            }

        },delay);
    }
}