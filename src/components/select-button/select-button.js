import s from './styles.scss';
import main from '@Project/css/main.scss';
import { Button } from '@UI/buttons/buttons.js';
import { stateModule as S } from 'stateful-dead';

export default class SelectButton extends Button {
	prerender(){
		var btn = super.prerender();
		if ( this.prerendered ) {
			return btn;
		}
		btn.classList.add(s.selectButton, main.pctBtn, s[this.model.key]); // TO DO : some of main.css should be up the tree in UI
		return btn;
	}
    init(){
        super.init()
        this.el.addEventListener('click', this.clickEventHandler);
    }
    clickEventHandler(){
        var currentState = S.getState('deselected.' + this.value);
        console.log(currentState);
        S.setState('deselected.' + this.value, !currentState );
        this.classList.toggle(s.deselected);
    }
}