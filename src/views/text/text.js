import s from './styles.scss';
import text from './text.md';
import Element from '@UI/element/element.js';

export default class TextView extends Element {
	prerender(){
		var div = super.prerender();
		if ( this.prerendered ) {
			return div;
		}
		div.className = s.textBlock;
		div.innerHTML = text;
		return div;
	}
}