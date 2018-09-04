import s from './styles.scss';
import Element from '@UI/element/element.js';

export default class RatifiedView extends Element {
	prerender(){
		var div = super.prerender();
		if ( this.prerendered ) {
			return div;
		}
        div.classList.add(s.ratifiedView);
        div.innerHTML = `
                        <div>
                            <span class="numberRatified">XX</span>
                            Ratified
                        </div>
                        <div>
                            <span class="treatyStatus">Foo Bar</span>
                            Status
                        </div>
                        `;
		return div;
	}
    init(){
        console.log('Init ratified view')
    }
}