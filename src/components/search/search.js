/* global process */
import s from './styles.scss';
import $d from '@Helpers/dom-helpers.js';
import main from '@Project/css/main.scss';
import Element from  '@UI/element/element.js';
import { Dropdown } from '@UI/inputs/inputs.js';
import Multiselect from './multiselect.js';
import { Button } from '@UI/buttons/buttons.js';
import { stateModule as S } from 'stateful-dead';
import PS from 'pubsub-setter';

class ShowAllButton extends Button {
	prerender(){
		var btn = super.prerender();
		if ( this.prerendered ) {
			return btn;
		}
		btn.innerHTML = `<span class="${s.oversetCount}"> + 1</span> <span id="overset-instruct"><strong>Show all</strong></span>`;
		return btn;
	}
	init(){
		PS.setSubs([
			['oversetCount', (msg,data) => {
                this.oversetCount = data;
            }]
		]);
		this.oversetCount = 0;
		this.isPressed = false;
		this.el.addEventListener('click', () => {
			this.isPressed = !this.isPressed;
		});
	}
	get isPressed(){
		return this._isPressed;
	}
	set isPressed(value){
		if ( typeof value !== 'boolean' ){
			throw 'isPressed value must be true or false';
		}
		this._isPressed = value;
		if ( value ) {
			this.stateIsPressed();
		} else {
			this.stateIsNotPressed();
		}
	}
	get oversetCount(){
		return this._oversetCount;
	}
	set oversetCount(value){
		if (!Number.isInteger(value)){
			throw 'oversetCount must be an integer';
		}
		if ( value === 0 ) {
			this.isPressed = false;
		}
		this._oversetCount = value;
		this.el.children[0].innerText = '+ ' + value;
		
	}
	stateIsPressed(){
		this.el.classList.add(s.isPressed);
		this.el.children[1].innerText = 'Close';
		S.setState('oversetOpen', true);
	}
	stateIsNotPressed(){
		this.el.classList.remove(s.isPressed);
		this.el.children[1].innerText = 'Show all';
		S.setState('oversetOpen', false);
	}
}

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
			new ShowAllButton(`button.${s.showAllSelected}.${main.pctBtn}`, {key:'pct-show-all-btn',name:'Show all'}),
			new Button(`button.${s.clearSearch}.${main.pctBtn}`,{key:'pct-clear-btn',name:'Clear'}),
		];
console.log(this.children);
		//container
		var div = super.prerender();
		if ( this.prerendered ) {
			return div; // if prerendered wil already have this stuff below
		}
		
		//if not prerndered:

		//search container
		var searchCont = $d.c(`div.${s.searchContainer}.${main.flex}.${main.sb}.${main.grow}`);
		
			// multiselect
			searchCont.appendChild(this.children[0].el);
			searchCont.appendChild(this.children[1].el);
			
		div.appendChild(searchCont);

		//clear button
		div.appendChild(this.children[2].el);


		return div;
	}
	toggleShowMore(msg,data){
		if ( data ) {
			this.el.classList.add(s.revealOverflowTags);
		} else {
			this.el.classList.remove(s.revealOverflowTags);
		}
	}
	init(){
		PS.setSubs([
			['oversetOpen', (msg,data) => {
				this.toggleShowMore.call(this,msg,data);
			}],
			['oversetCount', (msg,data) => {
				if ( data === 0 ) {
					this.toggleShowMore.call(this,msg,false);
				}
			}]
		]);
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