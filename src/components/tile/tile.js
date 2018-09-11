import $d from '@Helpers/dom-helpers.js';
import s from './styles.scss';
import './colorCoding-exclude.scss';

export default class CountryTile {
    constructor(country, index){
        console.log(country);
        this.country = country;
        this.el = this.prerender(index);
        console.log(country);
    }
	prerender(index){
        var existing = $d.q('#' + this.country.key + '-tile');
        if ( existing ) {
            return existing;
        }
		var tile = $d.c(`div#${this.country.key}-tile.${s.countryTile}.${this.country.value}`);
		//tile.classList.add(main.wireframe); // TO DO : some of main.css should be up the tree in UI
        tile.setAttribute('data-originalIndex', index);
        tile.style.order = index;
		return tile;
	}
    init(){
        console.log('initialize tile', this.el);
        //this.update()
    }
    getPosition(position){ 
        this[position] = this.el.getBoundingClientRect();
    }
    changePosition(msg,data){ // this.country.value is '-' joined string of the agreements the country is party to
        console.log(this,msg,data);
        
        if ( this.shouldDisappear ) {
            this.el.style.order = 999;
        } else {
            this.el.style.order = this.el.getAttribute('data-originalIndex'); // using getAttribute bs IE10 doesn't support dataset
        }
    }
    invertPosition(){
        this.deltaX = this.first.left - this.last.left;
        this.deltaY = this.first.top - this.last.top;
        this.el.style.transformOrigin = 'top left';
        this.el.style.transform = `translate(${this.deltaX}px, ${this.deltaY}px)`;
    }
    animatePosition(){
        
        this.moveTiles = this.el.animate([{
              transformOrigin: 'top left',
              transform: `
                translate(${this.deltaX}px, ${this.deltaY}px)
              `
            }, {
              transformOrigin: 'top left',
              transform: 'none'
            }], {
              duration: 200,
              easing: 'ease-out'
            });
    }

}