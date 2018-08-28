import s from './styles.scss';
import $d from '@Helpers/dom-helpers.js';
import main from '@Project/css/main.scss';

export default class SearchBar {
	constructor(id = 'pct-search'){
		this.id = id;
		this.el = this.prerender();
	}
	prerender(){
		var existing = $d.q('div#' + this.id);
		if ( existing ) {
			return existing;
		}
		//container
		var div = $d.c(`div#${this.id}.${s.searchDiv}.${main.flex}.${main.sb}`);
		
		////search and submit container
		var searchCont = $d.c(`div.${s.searchContainer}.${main.flex}.${main.sb}.${main.grow}`);
		
		//////search
		var search = $d.c(`input.${main.grow}`);
		search.setAttribute('type', 'text');

		
		//////submit
		var submit = $d.c(`button.${s.submitSearch}.${main.pctBtn}`);
		submit.setAttribute('type','submit');
		
		////clear button
		var clear = $d.c(`button.${s.clearSearch}.${main.pctBtn}`);
		clear.setAttribute('type','button');
		clear.innerHTML = 'Clear';



		searchCont.appendChild(search);
		searchCont.appendChild(submit);
		div.appendChild(searchCont);
		div.appendChild(clear);
		return div;
	}
	init(){
		console.log('init');
	}
}