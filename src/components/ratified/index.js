import s from './styles.scss';
import Element from '@UI/element/element.js';

export default class RatifiedView extends Element {
    prerender(args){
        this.parent = args[2];
		var div = super.prerender();
		if ( this.prerendered ) {
			return div;
		}
        div.classList.add(s.ratifiedView, s[this.model.key]);
        div.innerHTML = `
                        <div>
                            <span class="${s.numberRatified}">${this.parent.model.treatiesNested.find(d => d.key === this.model.key).values.length}</span>
                            Ratified
                        </div>
                        <div>
                            <span class="${s.treatyStatus}${this.model.status === 'Not In Force' ? ' ' + s.invert : '' }">${this.model.status}</span>
                            <span class="${s.statusLabel}">Status</span>
                        </div>
                        `;
		return div;
	}
    init(){
        console.log('Init ratified view')
    }
}