import main from '@Project/css/main.scss'; 
import SelectButton from '@Project/components/select-button/select-button.js';
import { DOMHelpers as $d } from '@Utils';
import SearchBar from '@Project/components/search/search.js';
import Element from '@UI/element';
import s from './styles.scss';
import Ratified from '@Project/components/ratified/';
import { CreateComponent } from '@Project/cape-town.js'; 

export default class Selection extends Element {
    //no constructor is specified so the super's constructr does its thing (Element)
    prerender(){ // remember prerender is called by the constructor so the properties and methods, including other
                 // new Constructors are ready for init(); 
        /* any child elements that need initialization such as eventListeners
            need to instantiated as properties of `this` so that their methods
            can be accessed */

        this.buttons = this.model.treaties.map(treaty => CreateComponent(SelectButton, 'defer', {data: treaty, parent: this}));
        this.ratified = this.model.treaties.map(treaty => CreateComponent(Ratified, `div.ratifyComponent-${treaty.key}`, {data: treaty, parent: this}));
        this.searchBar = CreateComponent(SearchBar, 'defer', {parent: this}),
        this.children = [
            ...this.ratified,     
            ...this.buttons,
            this.searchBar,
        ];    
        
        //container
        var div = super.prerender();
        if ( this.prerendered && !this.rerender) {
            return div; // if prerendered and no need to render (no data mismatch)
        }
        // if NOT prerendered or if there is a need to rerender:
        div.classList.add(s.selectionView);

        var fieldset = $d.c('fieldset');
        
        // button container
        var btnContainer = $d.c('div.' + main.flex + '.' + main.sb + '.' + main.wrap + '.' + s.buttonGroupContainer);

        //// button groups
        this.buttons.forEach((btn,i) => {
            var btnGroup = $d.c('div.' + s.buttonGroup);
            // buttons
            btnGroup.appendChild(btn.el);
            // ratified
            btnGroup.appendChild(this.ratified[i].el)

            btnContainer.appendChild(btnGroup);
        });
        fieldset.insertAdjacentHTML('afterbegin', '<legend id="treaty-filter">Filter by treaties</legend>');
        fieldset.appendChild(btnContainer);
        div.appendChild(fieldset);
      //  div.insertAdjacentHTML('beforeend', '<label id="party-filter">Filter by parties:</label>');

        //searchbar
        div.appendChild(this.searchBar.el); 
        
        return div;
    }
    init(app){
        
        
        this.children.forEach(each => {
            if (this.buttons.indexOf(each) !== -1) {
                each.init(this.model.treaties);
            } else {
                each.init(this.resolve, app); // passing in reference to Selections resolve so that 
                                         // the children can handle it; ie resolve true after 
                                         // mobius selectr is initialized;
            }
        });
        
    }
}