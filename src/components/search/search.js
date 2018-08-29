import s from './styles.scss';
import $d from '@Helpers/dom-helpers.js';
import main from '@Project/css/main.scss';
import Element from '@UI/element/element.js';
import { TextInput } from '@UI/inputs/inputs.js';

export default class SearchBar extends Element {

	constructor(){
		super(`div#pct-search.${s.searchDiv}.${main.flex}.${main.sb}`);
	}
	
	prerender(){
		
		this.input = new TextInput(`input.${main.grow}`);

		//container
		var div = super.prerender();
		if ( this.prerendered ) {
			return div;
		}
		
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