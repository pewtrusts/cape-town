import s from './styles.scss';
import main from './../../css/main.scss';

export default function MapView(){
	this.el = this.prerender();
}

MapView.prototype = {
	prerender(){
		var map = document.createElement('div');
		map.innerHTML = 'map';
		map.classList.add(s.mapContainer);
		map.classList.add(main.wireframe);
		return map;
	}
}