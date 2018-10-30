import s from './styles.scss';
import Element from '@UI/element/';

export default class RatifiedView extends Element {
    prerender(){
		var div = super.prerender();
		if ( this.prerendered && this.rerender) {
			return div;
		}
        console.log(this);
        div.classList.add(s.ratifiedView, s[this.data.key]);
        div.innerHTML = `
                        <div>
                            <span class="${s.numberRatified}">${this.model.treatiesNested.find(d => d.key === this.data.key).values.length}</span>
                            <span>Ratified</span>
                        </div>
                        <div class="${this.data.status === 'Not In Force' ? ' ' + s.invert : '' }">
                            <span class="${s.treatyStatus}">${this.data.status}</span>
                            <span>Status</span>
                        </div>
                        `;
		return div;
	}
    init(){
        console.log('Init ratified view')
    }
}