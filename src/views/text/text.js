import s from './styles.scss';
import text from './text.md';

export default class TextView{
	constructor(){
		this.el = this.prerender();
	}
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
	}
	init(){
		console.log('Init text');
	}
}