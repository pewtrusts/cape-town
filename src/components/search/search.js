/* global process */
import s from './styles.scss';
import $d from '@Helpers/dom-helpers.js';
import main from '@Project/css/main.scss';
import Element from  '@UI/element/';
import { Dropdown } from '@UI/inputs/inputs.js';
import Multiselect from './multiselect.js';
import { Button } from '@UI/buttons/buttons.js';
import { stateModule as S } from 'stateful-dead';
import PS from 'pubsub-setter';
import { CreateComponent } from '@Project/cape-town.js'; 

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
		if ( value % 1 !== 0 ){
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

	constructor(_selector, options){ // full app model from selection.js
		// calls the class Element's constructor which includes making this.el the result of this.prerender()
		var selector = _selector === 'defer' ? `div#pct-search.${s.searchDiv}.${main.flex}.${main.sb}` : _selector;
		super(selector, options);
	}
	
	prerender(){
		var partyArray = []; // array of countries that are part to at least one agreemet
		var nonpartyArray = []; // array of couhntries that are not part
		var qualifyingOverseas = [];
		for ( let key in this.model.overseas ){
			if (this.model.overseas.hasOwnProperty(key) && this.model.overseas[key].inheritTreaties.length > 0){
				qualifyingOverseas.push({value: key, name: this.model.countryCodes[key], isParty: true});
			}
		}
		for ( let key in this.model.countryCodes) {
			let isParty = ( this.model.countriesNested.find(d => d.key === key) !== undefined ); // true iif country in list of all countries is aso in list of party countries
			if ( this.model.countryCodes.hasOwnProperty(key) && !this.model.overseas.hasOwnProperty(key) ){ // is in country codes list but not an OT
				if ( isParty) {
					partyArray.push({value: key, name: this.model.countryCodes[key], isParty});  
				} else {
					nonpartyArray.push({value: key, name: this.model.countryCodes[key], isParty});
				}
			}
		}
		partyArray.sort((a,b) => {
			
			return this.model.countryCodes[a.value] < this.model.countryCodes[b.value] ? -1 : 1;
		});
		nonpartyArray.sort((a,b) => this.model.countryCodes[a.value] < this.model.countryCodes[b.value] ? -1 : 1);
		var countryCodesArray = partyArray.concat(qualifyingOverseas).concat(nonpartyArray); // concat the arrays so that  party countries show first	
		this.children = [
			new Dropdown(`select.${main.grow}`, countryCodesArray),
			//new ShowAllButton(`button.${s.showAllSelected}.${main.pctBtn}`, {key:'pct-show-all-btn',name:'Show all'}),
			CreateComponent(ShowAllButton, `button.${s.showAllSelected}.${main.pctBtn}`, {data:{key:'pct-show-all-btn',name:'Show all'}, parent: this}),
			//new Button(`button.${s.clearSearch}.${main.pctBtn}`,{key:'pct-clear-btn',name:'Clear'}),
			CreateComponent(Button, `button.${s.clearSearch}.${main.pctBtn}`, {data: {key:'pct-clear-btn',name:'Clear'}, parent: this}),
		];

		//container
		var div = super.prerender();
		if ( this.prerendered && !this.rerender) {
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
	init(resolveFn, app){ // the parent's (selection.js) resolve function
		PS.setSubs([
			['oversetOpen', (msg,data) => {
				this.toggleShowMore.call(this,msg,data);
			}],
			['oversetCount', (msg,data) => {
				if ( data === 0 ) {
					this.toggleShowMore.call(this,msg,false);
				}
			}],
			['selectrTagFocus', (msg,data) => {
				if ( !this.children[1].isPressed && data  && this.children[1].oversetCount > 0 ){
					this.children[1].isPressed = true;
				}
			}]
		]);
		this.children.forEach(each => {
			each.init(); // passing reference to resolveFn to all children althogh only multiselect will resolve it
		});
		
		if ( process.env.NODE_ENV === 'development' || app.wasPrerendered ){
			
			this.Selectr = new Multiselect(this.children[0].el, {
				resolveFn,
				multiple: true,
				clearable: false,
				defaultSelected: false,
				placeholder: 'Filter by parties',
				renderOption: function(option){
					
					return '<span class="isParty-' + option.pctModel.isParty + '">' + option.textContent + '</span>';
				}
			});
		}
		var clrBtn = $d.q(`button.${s.clearSearch}`);
		clrBtn.setAttribute('aria-label', "Clear the 'Filter by parties' filter");
		clrBtn.addEventListener('click', () => {
			window.lastCountrySelectMethod = 'clear';
			this.Selectr.Selectr.clear();
			
		});
		$d.q('.selectr-input').setAttribute('aria-labelledby','party-filter');
		$d.q('.selectr-options').setAttribute('aria-labelledby','party-filter');
	}
}