import s from './styles.scss';
import $d from '@Helpers/dom-helpers.js';
import main from '@Project/css/main.scss';
import Element from '@UI/element/element.js';
import Multiselect from './multiselect.js';
import { Button, SubmitButton } from '@UI/buttons/buttons.js';

export default class SearchBar extends Element {

	constructor(countryCodes){
		//console.log(countryCodes);
		super(`div#pct-search.${s.searchDiv}.${main.flex}.${main.sb}`, countryCodes);
	}
	
	prerender(){
		var countryCodesArray = [];
		for ( var key in this.model) {
			if ( this.model.hasOwnProperty(key) ){
				countryCodesArray.push({value: key, name: this.model[key]});
			}
		}
		console.log(countryCodesArray);
		this.willInitialize = [
			new Multiselect(`select.${main.grow}`, countryCodesArray),
			new SubmitButton(`button.${s.submitSearch}.${main.pctBtn}`),
			new Button(`button.${s.clearSearch}.${main.pctBtn}`,{key:'pct-clear-btn',name:'Clear'}),
		];

		//container
		var div = super.prerender();
		if ( this.prerendered ) {
			return div;
		}
		
		////search and submit container
		var searchCont = $d.c(`div.${s.searchContainer}.${main.flex}.${main.sb}.${main.grow}`);
		
		
		//////submit
		//var submit = $d.c(`button.${s.submitSearch}.${main.pctBtn}`);
		//submit.setAttribute('type','submit');
		
		////clear button
		



		searchCont.appendChild(this.willInitialize[0].el);
		searchCont.appendChild(this.willInitialize[1].el);
		div.appendChild(searchCont);
		div.appendChild(this.willInitialize[2].el);
		return div;
	}
	init(){
		console.log('init');
		//this.submit.init();
		//this.clearButton.init();
		this.willInitialize.forEach(each => {
			each.init();
		});

	}
}