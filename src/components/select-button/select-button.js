import s from './styles.scss';
import main from '@Project/css/main.scss';
import { Button } from '@UI/buttons/buttons.js';

export default class SelectButton extends Button {
	prerender(){
		var btn = super.prerender();
		if ( this.prerendered ) {
			return btn;
		}
		btn.classList.add(s.selectButton, main.pctBtn); // TO DO : some of main.css should be up the tree in UI
		return btn;
	}
}