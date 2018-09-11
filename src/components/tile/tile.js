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
    changePosition(msg,data){ // this.country.value is '-' joined string of the agreements the country is party to
        console.log(this,msg,data);
        var shouldReorder = data.reduce((acc,cur) => {
            if ( this.country.value.indexOf(cur) !== -1 ){ // ie the current treaty key IS in the value string
                acc = false;
            }
            return acc;
        }, true);
        console.log(shouldReorder)
        if ( shouldReorder ) {
            this.el.style.order = 999;
        }
    }

}