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
        
        var countryInfoText;
        
        var EUDatum = this.parent.model.countriesNested.find(c => c.key === 'EU').values[0];
        var isEUMember = this.parent.model.EUCountries.indexOf(this.country.key) !== -1; 
        if (isEUMember){
            tile.classList.add('EU');
        }
        if ( this.country.value !== 'None' ){
            if ( this.country.key == 'EU'){
                countryInfoText = `<p><b>${EUDatum.treaty_id.toUpperCase()}:</b> Ratified on ${EUDatum.ratified_date}`;
            } else {
                countryInfoText = this.parent.model.treaties.reduce((acc,cur) => {
                    let match = this.country.values.find(d => d.treaty_id === cur.key);
                    let info =  match && cur.key ===  'cta' ? 
                                    'Ratified on ' + match.ratified_date + ' with ' + match.note + '.' :
    /*is EU but also on own */  match && isEUMember && cur.key === 'psma' ? 
                                    'Ratified by the EU on ' +  EUDatum.ratified_date + '; in respect of overseas territories on ' + match.ratified_date + '.' :
    /*is EU only */             isEUMember && cur.key === 'psma' ?
                                    'Ratified by the EU on ' +  EUDatum.ratified_date + '.' : 
                                match ?
                                    'Ratified on ' + match.ratified_date + '.' : 
                                    'Not ratified.';
                    return acc + `<p><b>${cur.key.toUpperCase()}:</b> ${info}</p>`;
                },'');
            }
        } else {
            tile.classList.add(s.noHover);
            countryInfoText = '<p class="' + s.noAgreements +'">No agreements  ratified</p>';
        }
        tile.innerHTML = `
            <div title="${this.parent.model.countryCodes[this.country.key]}" class="${s.tileName}">${this.parent.model.countryCodes[this.country.key]}</div>
                ${ this.country.value === 'None' ? countryInfoText : ''}
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
    set isVisible(bool){
        if ( typeof bool !== 'boolean' ) {
            throw 'isVisible property must be true or false';
        }
        if ( bool ) {
            this.el.classList.add(s.showOnSearch);
        } else {
            this.el.classList.remove(s.showOnSearch);
        }
        this._isVisible = bool;
    }
    get isVisible(){
        return this._isVisible;
    }
    getImage(){
        var key = this.isPushed && this.country.value === 'None' ? 'globe' : this.isPushed ? 'EU' : this.country.key; // EU country tiles can be pushed but value will equal psma, not None
        return import(/* webpackChunkName: "svgs/[request]" */ '@Project/assets/countries/' + key + '.svg').then(({default: svg}) => {
            return svg;
        }).catch(error => 'Error:' + error);
    }
    init(){
        this.isVisible = true;
        
        this.el.addEventListener('click', function(){
            var alreadySelected = Array.from($d.qa('.' + s.selected)); // makes copy of already selected 
                                                                       // so that the one being toggled now
                                                                       // isn't double toggle  
            this.classList.toggle(s.selected);
            if ( window.innerWidth < 629 ){
                alreadySelected.forEach(each => {
                    each.classList.remove(s.selected);
                });
            }
        });
    }
    getPosition(position){ 
        this[position] = this.el.getBoundingClientRect();
    }
    changePosition(msg,data,index){ // this.country.value is '-' joined string of the agreements the country is party to
        if ( index === 0 ) {
            this.parent.endOrder = 200;
        }
        if ( this.shouldGoToEnd ) {
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
        
        var delay = document.documentElement.clientWidth > 628 ? 200 : 100; // time in ms it should take for transitions to have begun
        var duration = document.documentElement.clientWidth > 628 ? 500 : 250; // time in ms it should take to complete all transitions
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
              duration: duration - ( ( delay / length ) * index ),
              easing: 'ease-out',
              delay: ( delay / length ) * index
                });
        this.moveTiles.onfinish = () => {
            this.el.style.transform = 'none';
           // this.el.classList.remove(s.animating);
            if ( index === length - 1){ // ie is the last tile
                
                this.parent.tiles.forEach(each => {
                    each.el.style.zIndex = 'auto';
                });
                this.parent.tiles.sort((a,b) => parseInt(a.el.style.order) < parseInt(b.el.style.order) ? -1 : parseInt(a.el.style.order) > parseInt(b.el.style.order) ? 1 : parseInt(a.el.style.order) >= parseInt(b.el.style.order) ? 0 : NaN);
                
            }
        };
    }
    showOnSearch(data, index){
        
        if ( data.length > 0 && index === 0){ // this will be true when search is not empty and only matching countries shoud show; index === 0 sothe classList is called only once, on the first tile passed to this fn
            this.parent.el.classList.add(s.searchActive);
        } else if ( index === 0 ){ // this will be true when search array is empty ie reset so that all **original** countries should show
            this.parent.el.classList.remove(s.searchActive);
        }
        if ( data.length === 0 ) {
            this.isVisible = !this.isPushed; // ie if search array is empty, cleared, only original countries should be made visible
        } else {
            this.isVisible = true; // else all matching countries should be visible
        }
       // this.el.classList.add(s.showOnSearch);
    }
    hideOnSearch(){
        this.isVisible = false;
    }

}