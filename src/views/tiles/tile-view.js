//utils
import PS from 'pubsub-setter';
//import * as d3 from 'd3-collection';

import main from '@Project/css/main.scss';
import $d from '@Helpers/dom-helpers.js';
//import s from './styles.scss';
import CountryTile from '@Project/components/tile/tile.js';

export default class TileView {
    constructor(model){
        this.model = model;
        this.tiles = model.joinData.map((country, index, array) => new CountryTile(country, index, array));
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
        cont.classList.add(main.sb);
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
    update(msg,data){ // !!!!!TO DO HERE: use state to inform logic. desellected tiles
                      // should get order of 999; reselected should get data-originalIndex
        console.log('update', msg, data);
        this.tiles.forEach(each => {
            each.getPosition('first');
        });
        this.tiles.forEach(each => {
            each.changePosition(msg,data);
        });
        this.tiles.forEach(each => {
            each.getPosition('last');
        });
    }
}