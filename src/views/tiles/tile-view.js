import main from '@Project/css/main.scss';
import $d from '@Helpers/dom-helpers.js';
//import s from './styles.scss';
import CountryTile from '@Project/components/tile/tile.js';

export default class TileView {
	constructor(model){
		this.model = model;
		this.tiles = model.countries.map(country => new CountryTile(country));
		this.el = this.prerender();
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
		console.log('Init tiles');
	}
}