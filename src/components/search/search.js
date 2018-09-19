import s from './styles.scss';
import $d from '@Helpers/dom-helpers.js';
import main from '@Project/css/main.scss';
import Element from '@UI/element/element.js';
import Multiselect from './multiselect.js';
import { Button, SubmitButton } from '@UI/buttons/buttons.js';

export default class SearchBar extends Element {

	constructor(model){
		//console.log(countryCodes);
		super(`div#pct-search.${s.searchDiv}.${main.flex}.${main.sb}`, model);
	}
	
	prerender(){
		var partyArray = []; // array of countries that are part to at least one agreemet
		var nonpartyArray = []; // array of couhntries that are not part
		for ( var key in this.model.countryCodes) {
			let isParty = ( this.model.countriesNested.find(d => d.key === key) !== undefined ); // true iif country in list of all countries is aso in list of party countries
			if ( this.model.countryCodes.hasOwnProperty(key) ){
				if ( isParty) {
					partyArray.push({value: key, name: this.model.countryCodes[key], isParty});  
				} else {
					nonpartyArray.push({value: key, name: this.model.countryCodes[key], isParty});
				}
			}
		}
		var countryCodesArray = partyArray.concat(nonpartyArray); // concat the arrays so that  party countries show first	
		this.willInitialize = [
			new Multiselect(`select.${main.grow}`, countryCodesArray, {
				multiple: true,
				clearable: true,
				defaultSelected: false,
				placeholder: 'Search for a country',
				renderOption: function(option){
					return '<span class="isParty-' + option.pctModel.isParty + '">' + option.textContent + '</span>';
				}
			}),
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
		this.willInitialize.forEach(each => {
			console.log(each);
			each.init();
		});

	}
}