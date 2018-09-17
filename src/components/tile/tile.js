import $d from '@Helpers/dom-helpers.js';
import s from './styles.scss';
import './colorCoding-exclude.scss';
//import testsvg from 'svgo-loader!@Project/assets/ALB.svg';

export default class CountryTile {
    constructor(country, index, parent, isPushed = false){
        this.parent = parent;
        this.country = country;
        this.isPushed = isPushed;
        this.el = this.prerender(index);
    }
	prerender(index){
        var existing = $d.q('#' + this.country.key + '-tile');
        if ( existing ) {
            return existing;
        }
		var tile = $d.c(`div#${this.country.key}-tile.${s.countryTile}.${this.country.value}`);
        tile.setAttribute('data-originalIndex', index);
        tile.style.order = index;
        var countryInfoText = this.parent.model.treaties.reduce((acc,cur) => {
            var match = this.country.values.find(d => d.treaty_id === cur.key);
            var info = match && cur.key ===  'cta' ? 'Ratified on ' + match.ratified_date + ' with ' + match.note + '.':
                 match && cur.key === 'psma' && this.parent.model.EUCountries.indexOf(match.iso_a3) !== -1 ? 'Ratified by the EU on ' +  match.ratified_date + ( match.note !== '' ? '; in respect of overseas territories on ' + match.note : '' ) + '.' :
                 match ? 'Ratified on ' + match.ratified_date + '.': 
                 'Not ratified.';
            return acc + `<p><b>${cur.key.toUpperCase()}:</b> ${info}</p>`;
        },'');
        tile.innerHTML = `
            <div class="${s.tileName}">${this.parent.model.countryCodes[this.country.key]}</div>
            <div class="${s.svgWrapper}">
            </div>
            <div class="${s.countryInfo} country-info">
                ${countryInfoText}
            </div>
        `;
        this.getImage().then(v => {
            tile.querySelector(`.${s.svgWrapper}`).insertAdjacentHTML('afterbegin',v);
        });
		return tile;
	}
    getImage(){
        console.log(this.isPushed);
        var key = this.isPushed ? 'globe' : this.country.key;
        return import('@Project/assets/' + key + '.svg').then(({default: svg}) => {
            return svg;
        }).catch(error => 'Error:' + error);
    }
    init(){
        console.log('initialize tile', this.el);
        this.el.addEventListener('click', function(){
            this.classList.toggle(s.selected);
        });
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
            let original = this.el.getAttribute('data-originalIndex');
            this.el.style.order = original; // using getAttribute bs IE10 doesn't support dataset
        }
    }
    invertPosition(){
        this.deltaX = this.first.left - this.last.left;
        this.deltaY = this.first.top - this.last.top;
        this.el.style.transformOrigin = 'top left';
        this.el.style.transform = `translate(${this.deltaX}px, ${this.deltaY}px)`;
    }
    animatePosition(index, length){
        console.log(this.deltaX,this.deltaY, this);
        var factor = 1; // factor by which to speed down the animations . > 1 slower < 1 faster.
        this.el.style.zIndex = length - index;
            this.moveTiles = this.el.animate([{
              transformOrigin: 'top left',
              transform: ( this.deltaY === 0 && this.deltaX === 0 ) ?
                `translate(${this.deltaX}px, ${this.deltaY}px)` :
                `translate(${this.deltaX}px, ${this.deltaY}px) rotate(5deg)` 
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
    showOnSearch(data, index){
        console.log(data.length);
        if ( data.length > 0 && index === 0){ // index === 0 sothe classList is called only once, on the first tile passed to this fn
            this.parent.el.classList.add(s.searchActive);
        }
        this.el.classList.add(s.showOnSearch);
    }
    hideOnSearch(data, index){
        if ( data.length === 0 && index === 0){
            this.parent.el.classList.remove(s.searchActive);
        }
        this.el.classList.remove(s.showOnSearch);
    }

}