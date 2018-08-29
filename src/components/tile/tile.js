import $d from '@Helpers/dom-helpers.js';
import s from './styles.scss';
import main from '@Project/css/main.scss';

export default class CountryTile {
    constructor(country){
        console.log(country);
        this.country = country;
        this.el = this.prerender();
    }
	prerender(){
        var existing = $d.q('#' + this.country.key.cleanString() + '-tile');
        if ( existing ) {
            return existing;
        }
		var tile = $d.c(`div#${this.country.key.cleanString()}-tile.${s.countryTile}`);
		tile.classList.add(main.wireframe); // TO DO : some of main.css should be up the tree in UI
		return tile;
	}
}