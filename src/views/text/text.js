import s from './styles.scss';
import text from './text.md';
//import Element from '@UI/element/element.js';
import Element from '@UI/element/';

export default class TextView extends Element {
    // no constructor is specified so the super's (Element's) constructor does its thing
    // that includes this.el = this.prerender(arguments)
	prerender(){
		var div = super.prerender(); // calls Element's prerender method, which checks to see if this.el is already in the DOM
                                     // it would be in the DOM in preview and in production. super prerender makes prerender prop true if so
		
        if ( this.prerendered && !this.rerender ) {
			return div; // return the existing DOM element if existing to this.el
		}
		div.className = s.textBlock; // if not already existing, do the things that need to be done to DOM elementt
		div.innerHTML = text;
        
		return div; // now return it to this.el
	}

    // capetown.js calls init(), which in this case is a Super, a method of Element. it does nothing
    set isOpen(value){
        if ( value ){
            this.el.querySelector('.expand-text').classList.add(s.expanded);
            this.el.querySelector('.expand-text').setAttribute('aria-expanded', true);
            this.el.querySelector('a.read-more').innerHTML = 'Read less &rarr;';
        } else {
            this.el.querySelector('.expand-text').classList.remove(s.expanded);
            this.el.querySelector('.expand-text').setAttribute('aria-expanded', false);
            this.el.querySelector('a.read-more').innerHTML = 'Read more &rarr;';
        }
        this._isOpen = value;

    }
    get isOpen(){
        return this._isOpen;
    }
    init(){
        this.isOpen = false;
        this.el.querySelector('a.read-more').addEventListener('click', () => {
            this.isOpen = !this.isOpen;
        });
        this.resolve(true);
        
    }
}