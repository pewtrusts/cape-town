import treaties from '@Project/data/treaties.json';
import main from '@Project/css/main.scss';
import Button from '!!@Project/components/select-button/select-button.js';
import $d from '@Helpers/dom-helpers.js';
import SearchBar from '@Project/components/search/search.js';

export default class Selection {
	constructor(){
		this.buttons = treaties.map(treaty => new Button(treaty));
		this.searchBar = new SearchBar();
		this.el = this.prerender();
	}
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
	}
	init(){
		console.log('Init selection-view');
		console.log(this.buttons);
		this.buttons.forEach(btn => {
			btn.init();
		});
	}
}