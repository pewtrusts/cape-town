import $d from '@Helpers/dom-helpers.js';
import s from './styles.scss';
import './colorCoding-exclude.scss';
//import testsvg from 'svgo-loader!@Project/assets/ALB.svg';

export default class CountryTile {
    //constructor(country, index, parent, isPushed = false){
    constructor(selector, options){
        
        this.parent = options.parent;
        this.country = options.data;
        this.isPushed = options.isPushed || false;
        this.model = options.model;
        this.rerender = ( options.rerenderOnDataMismatch && this.model.isMismatched );
        this.el = this.prerender(options.data.index);
        console.log(options, this);
    }
    prerender(index){
        var existing = $d.q('#' + this.country.key + '-tile');
        var tile;
        if ( existing && !this.rerender ) {
            console.log('returning existing');
            return existing;
        }
        if ( existing && this.rerender ){
            console.log('existing and rerender is true');
            existing.innerHTML = '';
            tile = existing;
        } else {
            tile = $d.c(`li#${this.country.key}-tile.${s.countryTile}`);
        }
        tile.classList.add(this.country.value);
        tile.setAttribute('data-originalIndex', index);
        tile.setAttribute('tabindex',0);
        tile.style.order = index;
        
        var countryInfoText;
        
        var EUDatum = this.parent.model.countriesNested.find(c => c.key === 'EU').values[0];
        var isEUMember = this.parent.model.EUCountries.indexOf(this.country.key) !== -1;


        /* if country is an overseas territory, find the datum of the mainland country. if none will be undefined */
       // this.mainlandDatum = this.parent.model.countriesNested.find(c => c.key === this.parent.model.overseas[this.country.key]);
       // this.country.isOverseasTerritory = this.parent.model.overseas.hasOwnProperty(this.country.key);

        if (isEUMember){
            tile.classList.add('EU');
            if ( this.country.values.length === 0 ) {
                tile.classList.add(s.EUOnly);
            }
        }
        if ( this.country.isOverseasTerritory ){
            tile.classList.add(s.otOnly);
        }
        if ( this.country.value !== 'None' ) {
            if ( this.country.key === 'EU'){ // is the EU
                countryInfoText = `<p><strong>${EUDatum.treaty_id.toUpperCase()}:</strong> Ratified on ${EUDatum.ratified_date}`;
            } else if (!this.country.isOverseasTerritory){
                countryInfoText = this.parent.model.treaties.reduce((acc,cur) => {
                    let match = this.country.values.find(d => d.treaty_id === cur.key);
                    let info =  
                                /** CTA **/
                                match && cur.key ===  'cta' ? 
                                    'Ratified on ' + match.ratified_date + ' with ' + match.note + '.' :
                                /** PSMA for EU countries **/
    /*is EU but also on own */  match && isEUMember && cur.key === 'psma' ? 
                                    'Ratified by the EU on ' +  EUDatum.ratified_date + '; in respect of overseas territories on ' + match.ratified_date + '.' :
    /*is EU only (ie no match)*/isEUMember && cur.key === 'psma' ?
                                    'Ratified by the EU on ' +  EUDatum.ratified_date + '.' : 
                                /** PSMA for non-EU or C188 **/
                                match ?
                                    'Ratified on ' + match.ratified_date + '.' : 
                                /** Not ratified **/
                                    'Not ratified.';
                    return acc + `<p><strong>${cur.key.toUpperCase()}:</strong> ${info}</p>`;
                },'');
            } else { // country is overseasTerritory
                // here you should cycle through the ownProperty values of the OT to create the infoText
                let mainlandDatum = this.parent.model.countriesNested.find(c => c.key === this.country.mainland);
                
                countryInfoText = this.country.values.reduce((acc, cur) => {
                    let match = mainlandDatum.values.find(d => d.treaty_id === cur);
                    
                    if ( match ){
                        return acc + `<p><strong>${cur.toUpperCase()}:</strong> Ratified by ${this.parent.model.countryCodes[this.country.mainland]} in respect of overseas territories on ${match.ratified_date}</p>`
                    }
                },'');
            }
        } else {
            tile.classList.add(s.noHover);
            countryInfoText = '<p class="' + s.noAgreements +'">No agreements ratified</p>';
        }
        tile.innerHTML = `
            <p title="${this.parent.model.countryCodes[this.country.key]}" class="${s.tileName}">${this.parent.model.countryCodes[this.country.key]}</p>
                ${ this.country.value === 'None' && !this.country.isOverseasTerritory ? countryInfoText : ''}
            <div aria-hidden="true" class="${s.svgWrapper}">
            </div>
            <div class="${s.countryInfo} country-info">
                ${this.country.isOverseasTerritory ? '<p><strong>Territory of ' + this.parent.model.countryCodes[this.country.mainland] + '</strong></p>' : '' }
                ${countryInfoText}
            </div>
        `;
        //if ( !this.isPushed ){
            this.getImage().then(v => {
                tile.querySelector(`.${s.svgWrapper}`).insertAdjacentHTML('afterbegin',v);
            });
       // }
        return tile;
    }
    set isClicked(bool){
        if ( typeof bool !== 'boolean' ) {
            throw 'isVisible property must be true or false';
        }
        var details = this.el.querySelector('.' + s.countryInfo);

        if ( bool ){
            this.el.classList.add(s.selected);
            details.setAttribute('aria-expanded', true);
        } else {
            this.el.classList.remove(s.selected);
            details.setAttribute('aria-expanded', false);
        }
        this._isClicked = bool;
    }
    get isClicked(){
        return this._isClicked;
    }
    set isVisible(bool){
        if ( typeof bool !== 'boolean' ) {
            throw 'isVisible property must be true or false';
        }
        if ( bool ) {
            this.el.classList.add(s.showOnSearch);
            this.el.setAttribute('aria-hidden', false);
        } else {
            this.el.classList.remove(s.showOnSearch);
            this.el.setAttribute('aria-hidden', true);
        }
        this._isVisible = bool;
    }
    get isVisible(){
        return this._isVisible;
    }
    getImage(){
        var key = this.country.isOverseasTerritory ? this.country.mainland + '-flag' : this.isPushed && this.country.value === 'None' ? 'globe' : this.isPushed ? 'EU' : this.country.key; // EU country tiles can be pushed but value will equal psma, not None
        if ( !this.isPushed ){
            return import(/* webpackChunkName: "svgs-prerendered/[request]"*/ '@Project/assets/countries-prerender/' + key + '.svg').then(({default: svg}) => {
                return svg;
            }).catch(() => {
                return import('@Project/assets/countries-dynamic/globe.svg').then(({default: svg}) => {
                    return svg;
                }).catch(error => 'Error: Country image not found. Tried loading globe but: ' + error);
            });
        ///. ***    // TO DO. here on error, need to default to countries/dynamic/globe.svg
        } else {
            return import(/* webpackMode: "eager" */ '@Project/assets/countries-dynamic/' + key + '.svg').then(({default: svg}) => {
                return svg;
            }).catch(error => 'Error:' + error);
        }
    }
    init(){
        this.isVisible = true;
        this.isClicked = false;
        function clickHandler(){
            if ( window.innerWidth < 629 ){
                
                this.parent.tiles.filter(d => d !== this).forEach(each => {
                    each.isClicked = false;
                });
            }
            this.isClicked = !this.isClicked;
        }
        this.el.addEventListener('click', () => {
            //var alreadySelected = Array.from($d.qa('.' + s.selected)); // makes copy of already selected 
                                                                       // so that the one being toggled now
               clickHandler.call(this);
            });
        this.el.addEventListener('keyup', (e) => {
            
            if (e.keyCode === 13){ // enter key
                clickHandler.call(this);
            }
        });
        this.el.addEventListener('mouseenter', () => {
            if ( !this.isClicked ){
                this.el.querySelector('.' + s.countryInfo).setAttribute('aria-expanded', true);
            }
        });
        this.el.addEventListener('mouseleave', () => {
            if ( !this.isClicked ){
                this.el.querySelector('.' + s.countryInfo).setAttribute('aria-expanded', false);
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
            this.el.setAttribute('aria-hidden', true);
        } else {
            this.el.setAttribute('aria-hidden', false);
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
        setTimeout(() => {
            this.el.style.transform = 'none';
        }, delay);
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