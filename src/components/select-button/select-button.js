import s from './styles.scss';
import main from '@Project/css/main.scss';
import { Button } from '@UI/buttons/buttons.js';
import { stateModule as S } from 'stateful-dead';
import PS from 'pubsub-setter';
import { GTMPush } from '@Utils';

export default class SelectButton extends Button {
    // no constructor the super constructor takes over
	prerender(){
		var btn = super.prerender();
		if ( this.prerendered && !this.rerender ) {
			return btn;
		}
		btn.classList.add(s.selectButton, main.pctBtn, s[this.data.key]);
        btn.setAttribute('aria-pressed', true);
        btn.setAttribute('aria-controls', 'pct-tiles-cont');
		return btn;
	}
    init(treaties){
        PS.setSubs([
            ['deselected.' + this.el.value, (msg,data) => {
                this.updateAppearance.call(this,msg,data);
            }]
        ]);
        super.init()
        this.el.addEventListener('click', e => {
            
            this.clickEventHandler.call(e.target, treaties);
        });
        this.el.setAttribute('aria-label',`Toggle ${this.el.innerHTML} filter on/off`);
    }
    updateAppearance(msg, data){
        if ( data ){ // ie is deselected
            this.el.classList.add(s.deselected);
        } else {
            this.el.classList.remove(s.deselected);
        }
        this.el.setAttribute('aria-pressed', data); // to do: do this via getters/setters?
        
        
    }
    clickEventHandler(treaties){
        var currentState = S.getState('deselected.' + this.value);
        S.setState('deselected.' + this.value, !currentState );
        var label = 'EIFP|Treaty|' + this.value + '|' + ( currentState ? 'on' : 'off' );
        GTMPush(label);
        
        var selected = treaties.reduce((acc,cur) => { // pass in all treaties to get order so that order is not hard coded but infered from data
            if ( !S.getState('deselected.' + cur.key) ) {
                acc.push(cur.key);
                return acc
            }
            return acc;
        },[]).sort();
        S.setState('selected', selected);
    }
}