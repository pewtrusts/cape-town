import s from './styles.scss';
import main from '@Project/css/main.scss';
import Element from '@UI/element/element.js';

export default class MapView extends Element {
	prerender(){
		var map = super.prerender();
		if ( this.prerendered ) {
			return map;
		}
		map.innerHTML = 'map';
		map.classList.add(s.mapContainer);
		map.classList.add(main.wireframe);
		return map;
	}
}