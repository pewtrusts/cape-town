import $d from '@Helpers/dom-helpers.js';
import s from './styles.scss';
import './colorCoding-exclude.scss';
//import testsvg from 'svgo-loader!@Project/assets/ALB.svg';

export default class CountryTile {
    constructor(country, index, parent){
        console.log(country);
        this.parent = parent;
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
        tile.setAttribute('data-originalIndex', index);
        tile.style.order = index;
        tile.innerHTML = `
            <div class="${s.tileName}">${this.parent.model.countryCodes[this.country.key]}</div>
        `;
        this.getImage().then(v => {
            tile.insertAdjacentHTML('afterbegin',v);
        });
		return tile;
	}
    getImage(){
        return import('@Project/assets/' + this.country.key + '.svg').then(({default: svg}) => {
            return svg;
        }).catch(error => 'Error');
    }
    init(){
        console.log('initialize tile', this.el);
    }
    getPosition(position){ 
        this[position] = this.el.getBoundingClientRect();
    }
    changePosition(msg,data,index){ // this.country.value is '-' joined string of the agreements the country is party to
        if ( index === 0 ) {
            this.parent.endOrder = 200;
        }
        if ( this.shouldDisappear ) {
            this.el.style.order = this.parent.endOrder++;
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
    animatePosition(index, length){

        var factor = 1; // factor by which to speed down the animations . > 1 slower < 1 faster.
        this.el.style.zIndex = length - index;
        this.moveTiles = this.el.animate([{
              transformOrigin: 'top left',
              transform: `
                translate(${this.deltaX}px, ${this.deltaY}px) rotate(2deg)
              `
            }, {
              transformOrigin: 'top left',
              transform: 'none'
            }], {
              duration: 200 * factor,
              easing: 'ease-out',
              delay: 50 * index * factor
            });
        this.moveTiles.onfinish = () => {
            this.el.style.transform = 'none';
           // this.el.classList.remove(s.animating);
            if ( index === length - 1){ // ie is the last tile
                console.log('last animation finished', this);
                this.parent.tiles.forEach(each => {
                    each.el.style.zIndex = 'auto';
                });
                this.parent.tiles.sort((a,b) => parseInt(a.el.style.order) < parseInt(b.el.style.order) ? -1 : parseInt(a.el.style.order) > parseInt(b.el.style.order) ? 1 : parseInt(a.el.style.order) >= parseInt(b.el.style.order) ? 0 : NaN);
                console.log(this.parent.tiles);
            }
        };
    }

}