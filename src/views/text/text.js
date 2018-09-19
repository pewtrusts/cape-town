import s from './styles.scss';
import text from './text.md';
import Element from '@UI/element/element.js';

export default class TextView extends Element {
    // no constructor is specified so the super's (Element's) constructor does its thing
    // that includes this.el = this.prerender(arguments)
	prerender(){
		var div = super.prerender(); // calls Element's prerender method, which checks to see if this.el is already in the DOM
                                     // it would be in the DOM in preview and in production. super prerender makes prerender prop true if so
		if ( this.prerendered ) {
			return div; // return the existing DOM element if existing to this.el
		}
		div.className = s.textBlock; // if not already existing, do the things that need to be done to DOM elementt
		div.innerHTML = text;
		return div; // now return it to this.el
	}

    // capetown.js calls init(), which in this case is a Super, a method of Element. it does nothing
    // when init() is called, the TextView object and its properties already exist. this.el is the DOM element
}