import s from './styles.scss';
//import main from './../../css/main.scss';
import text from './text.md';

export default function TextView(){
	this.el = this.prerender();
}

TextView.prototype = {
	prerender(){
		var div = document.createElement('div');
		div.className = s.textBlock;
		div.innerHTML = text;
		return div;
	}
}