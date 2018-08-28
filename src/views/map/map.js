import s from './styles.scss';
import main from '@Project/css/main.scss';

export default function MapView(){
	this.el = this.prerender();

}

MapView.prototype = {
	prerender(){
		var existing = document.querySelector('#map');
		if ( existing ) {
			return existing;
		}
		var map = document.createElement('div');
		map.setAttribute('id', 'map');
		map.innerHTML = 'map';
		map.classList.add(s.mapContainer);
		map.classList.add(main.wireframe);
		return map;
	},
	init(){
		console.log('Init map');
	}
}