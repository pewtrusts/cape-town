import s from './styles.scss';
import text from './text.md';

export default function TextView(){
	this.el = this.prerender();
}

TextView.prototype = {
	prerender(){
		var existing = document.querySelector('#pct-text');
		if ( existing ) {
			return existing;
		}
		var div = document.createElement('div');
		div.setAttribute('id', 'pct-text');
		div.className = s.textBlock;
		div.innerHTML = text;
		return div;
	},
	init(){
		console.log('Init text');
	}
}