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
        cont.classList.add(main.wireframe);
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
        console.log('update', msg, data);
        this.tiles.forEach(tile => {
            tile.shouldDisappear = data.reduce((acc,cur) => {
                if ( tile.country.value.indexOf(cur) !== -1 ){ // ie the current treaty key IS in the value string
                    acc = false;
                }
                return acc;
            }, true);
           /* if ( tile.shouldDisappear ) {
                tile.el.classList.add(tileStyles.shouldDisappear);
            } else {
                tile.el.classList.remove(tileStyles.shouldDisappear);
            }*/
        });
        setTimeout(() => { // separate FLIP steps out to do one at a times
            this.tiles.forEach((each) => {
                each.getPosition('first'); //Flip
            });
            this.tiles.forEach((each,i) => {
                each.changePosition(msg,data,i); //Last
            });
            this.tiles.forEach((each) => {
                each.getPosition('last');
                each.invertPosition();
            });
            this.tiles.forEach((each,i,array) => {
                each.animatePosition(i,array.length);
            });

        },500);
    }
}