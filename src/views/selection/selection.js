//import treaties from '@Project/data/treaties.json';
import main from '@Project/css/main.scss';
import Button from '@Project/components/select-button/select-button.js';
import $d from '@Helpers/dom-helpers.js';
import SearchBar from '@Project/components/search/search.js';
import Element from '@UI/element/element.js';
import s from './styles.scss';
import Ratified from '@Project/components/ratified/'

export default class Selection extends Element {
	prerender(){
		/* any child elements that need initialization such as eventListeners
			need to instantiated as properties of `this` so that their methods
			can be accessed */
		this.buttons = this.model.treaties.map(treaty => new Button(treaty));
		this.ratified = this.model.treaties.map(treaty => new Ratified(`div.ratifyComponent-${treaty.key}.${main.wireframe}`, treaty));
		this.willInitialize = [
			new SearchBar(this.model),
			...this.ratified,	
			...this.buttons
		];	
		console.log(this.ratified);
		//container
		var div = super.prerender();
		if ( this.prerendered ) {
			return div;
		}
		
		//searchbar
		div.appendChild(this.willInitialize[0].el);
		
		// button container
		var btnContainer = $d.c('div.' + main.flex + '.' + main.sb + '.' + main.wrap);

		//// button groups
		this.buttons.forEach((btn,i) => {
			var btnGroup = $d.c('div.' + s.buttonGroup);
			// buttons
			btnGroup.appendChild(btn.el);
			// ratified
			btnGroup.appendChild(this.ratified[i].el)

			btnContainer.appendChild(btnGroup);
		});

		div.appendChild(btnContainer);
		
		return div;
	}
	init(){
		console.log('Init selection-view');
		
		this.willInitialize.forEach(each => {
			if (each instanceof Button) {
				each.init(this.model.treaties);
			} else {
				each.init();
			}
		});
	}
}