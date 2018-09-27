/* global process */
import s from './styles.scss';
import $d from '@Helpers/dom-helpers.js';
import main from '@Project/css/main.scss';
import Element from  '@UI/element/element.js';
import { Dropdown } from '@UI/inputs/inputs.js';
import Multiselect from './multiselect.js';
import { Button } from '@UI/buttons/buttons.js';


export default class SearchBar extends Element {

	constructor(model){ // full app model from selection.js
		// calls the class Element's constructor which includes making this.el the result of this.prerender()
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
		this.children = [
			new Dropdown(`select.${main.grow}`, countryCodesArray),
			//new SubmitButton(`button.${s.submitSearch}.${main.pctBtn}`),
			new Button(`button.${s.clearSearch}.${main.pctBtn}`,{key:'pct-clear-btn',name:'Clear'}),
		];

		//container
		var div = super.prerender();
		if ( this.prerendered ) {
			return div; // if prerendered wil already have this stuff below
		}
		
		//if not prerndered:

		//search and submit container
		var searchCont = $d.c(`div.${s.searchContainer}.${main.flex}.${main.sb}.${main.grow}`);
		
			// multiselect
			searchCont.appendChild(this.children[0].el);
			
		div.appendChild(searchCont);

		//clear button
		div.appendChild(this.children[1].el);


		return div;
	}
	init(){
		this.children.forEach(each => {
			each.init();
		});
		if ( this.prerendered || process.env.NODE_ENV === 'development' ){
			this.Selectr = new Multiselect(this.children[0].el, {
				multiple: true,
				clearable: false,
				defaultSelected: false,
				placeholder: '',
				renderOption: function(option){
					console.log(option);
					return '<span class="isParty-' + option.pctModel.isParty + '">' + option.textContent + '</span>';
				}
			});
		}
		var clrBtn = $d.q(`button.${s.clearSearch}`);
		clrBtn.setAttribute('aria-label', "Clear the 'Filter by parties' filter");
		clrBtn.addEventListener('click', () => {
			this.Selectr.Selectr.clear();
		});
		$d.q('.selectr-input').setAttribute('aria-labelledby','party-filter');
		$d.q('.selectr-options').setAttribute('aria-labelledby','party-filter');
	}
}