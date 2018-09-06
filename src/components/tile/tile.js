import $d from '@Helpers/dom-helpers.js';
import s from './styles.scss';
import main from '@Project/css/main.scss';

export default class CountryTile {
    constructor(country, index, array){
        console.log(country);
        this.country = country;
        this.el = this.prerender(index, array);
    }
	prerender(index,array){
        /* opacity by index for testing resorting */
        var step =  0.9 / array.length;
        var opacity = 0.1 + step * index;

        /* end*/
        var existing = $d.q('#' + this.country.key + '-tile');
        if ( existing ) {
            return existing;
        }
		var tile = $d.c(`div#${this.country.key}-tile.${s.countryTile}`);
		tile.classList.add(main.wireframe); // TO DO : some of main.css should be up the tree in UI
        /* testing */
        tile.style.order = Math.floor(Math.random() * 100);
        tile.style.backgroundColor = '#000';
        tile.style.opacity = opacity;
		return tile;
	}
    init(){
        console.log('initialize tile', this.el);
        //this.update()
    }
    getPosition(position){
        this[position] = this.el.getBoundingClientRect();
        if ( position === 'last' && Element.prototype.animate !== undefined ){
            this.deltaX = this.first.left - this.last.left;
            this.deltaY = this.first.top - this.last.top;
            this.el.animate([{
                  transformOrigin: 'top left',
                  transform: `
                    translate(${this.deltaX}px, ${this.deltaY}px)
                  `
                }, {
                  transformOrigin: 'top left',
                  transform: 'none'
                }], {
                  duration: 300,
                  easing: 'ease-in-out',
                 //fill: 'both'
                });
        }
    }
    changePosition(){
        this.el.style.order = Math.floor(Math.random() * 100);
    }

}