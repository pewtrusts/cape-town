import treaties from './../../data/treaties.json';
import main from './../../css/main.scss';
import btn from './../../components/select-button/select-button.js';

export default function Selectors(){
	this.el = this.prerender();
}

Selectors.prototype = {
	prerender(){
		var div = document.createElement('div');
		div.classList.add(main.flex);
		div.classList.add(main.sb);
		treaties.forEach(treaty => {
			div.appendChild(btn(treaty));
		});

		return div;
	}
}