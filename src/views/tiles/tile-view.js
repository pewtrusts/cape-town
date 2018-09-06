//utils
import * as d3 from 'd3-collection';

import main from '@Project/css/main.scss';
import $d from '@Helpers/dom-helpers.js';
//import s from './styles.scss';
import CountryTile from '@Project/components/tile/tile.js';

export default class TileView {
	constructor(model){
		this.model = model;
		this.tiles = d3.nest().key(d => d.country_iso3).entries(model.countries).map((country, index, array) => new CountryTile(country, index, array));
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
		console.log('Init tiles');
		this.tiles.forEach(each => {
			each.init();
		});
		this.el.addEventListener('click', () => {
			this.update.call(this);
		});
	}
	update(){
		console.log('update');
		this.tiles.forEach(each => {
			each.getPosition('first');
		});
		this.tiles.forEach(each => {
			each.changePosition();
		});
		this.tiles.forEach(each => {
			each.getPosition('last');
		});
	}
}