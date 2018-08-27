import treaties from './../../data/treaties.json';
import main from './../../css/main.scss';
import btn from './../../components/select-button/select-button.js';
import $d from './../../../helpers/dom-helpers.js';
import SearchBar from './../../components/search/search.js';

export default function Selection(){
	this.buttons = treaties.map(treaty => new btn(treaty));
	this.searchBar = new SearchBar();
	this.el = this.prerender();
}

Selection.prototype = {
	prerender(){
		var existing = $d.q('#selection-view');
		if ( existing ) {
			return existing;
		}
		var div = $d.c('div');
		div.setAttribute('id','selection-view');

		var btnContainer = $d.c('div');
		btnContainer.classList.add(main.flex);
		btnContainer.classList.add(main.sb);
		this.buttons.forEach(btn => {
			btnContainer.appendChild(btn.el);
		});


		div.appendChild(btnContainer);
		div.appendChild(this.searchBar.el);
		return div;
	},
	init(){
		console.log('Init selection-view');
		this.buttons.forEach(btn => {
			btn.init();
		});
	}
}