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
    init(treaties){
        console.log(treaties);
        super.init()
        this.el.addEventListener('click', e => {
            this.clickEventHandler.call(e.target, treaties);
        });
    }
    clickEventHandler(treaties){
        var currentState = S.getState('deselected.' + this.value);
        S.setState('deselected.' + this.value, !currentState );
        var selected = treaties.reduce((acc,cur) => { // pass in all treaties to get order so that order is not hard coded but infered from data
            if ( !S.getState('deselected.' + cur.key) ) {
                acc.push(cur.key);
                return acc
            }
            return acc;
        },[]).sort();
        S.setState('selected', selected);
        this.classList.toggle(s.deselected);
    }
}