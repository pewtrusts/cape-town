//import treaties from '@Project/data/treaties.json';
import main from '@Project/css/main.scss';
import Button from '@Project/components/select-button/select-button.js';
import $d from '@Helpers/dom-helpers.js';
import SearchBar from '@Project/components/search/search.js';
import Element from '@UI/element/element.js';

export default class Selection extends Element {
	prerender(){
		/* any child elements that need initialization such as eventListeners
			need to instantiated as properties of `this` so that their methods
			can be accessed */
		this.buttons = this.model.treaties.map(treaty => new Button(treaty));
		this.willInitialize = [
			new SearchBar(),	
			...this.buttons
		];	
		console.log(this.willInitialize[1]);
		//this.searchBar = new SearchBar();
		//this.buttons = this.model.treaties.map(treaty => new Button(treaty));
		
		//container
		var div = super.prerender();
		if ( this.prerendered ) {
			return div;
		}
		
		//// button container
		var btnContainer = $d.c('div.' + main.flex + '.' + main.sb);
		
		//////buttons
		this.buttons.forEach(btn => {
			btnContainer.appendChild(btn.el);
		});


		div.appendChild(btnContainer);
		div.appendChild(this.willInitialize[0].el);
		return div;
	}
	init(){
		console.log('Init selection-view');
		/*this.buttons.forEach(btn => {
			btn.init();
		});
		this.searchBar.init();*/
		this.willInitialize.forEach(each => {
			each.init();
		});
	}
}