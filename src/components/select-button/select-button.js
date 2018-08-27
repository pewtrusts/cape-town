import s from './styles.scss';
import main from './../../css/main.scss';
import $d from './../../../helpers/dom-helpers.js';

export default function SelectButton(treaty){
	console.log(treaty);
	this.el = this.prerender(treaty);
}

SelectButton.prototype = {
	prerender(treaty){
		var existing = $d.q('button#' + treaty.key);
		if ( existing ) {
			return existing;
		}
		var btn = $d.c(`button#${treaty.key}.${s.selectButton}.${main.pctBtn}`);
		btn.setAttribute('value', treaty.key);
		btn.innerHTML = treaty.name;
		return btn;
	},
	init(){
		this.el.addEventListener('click', this.clickHandler);
	},
	clickHandler(e){
		console.log(e.target.value)
	}
};