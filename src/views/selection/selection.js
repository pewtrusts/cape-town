import main from '@Project/css/main.scss';
import Button from '@Project/components/select-button/select-button.js';
import $d from '@Helpers/dom-helpers.js';
import SearchBar from '@Project/components/search/search.js';
import Element from '@UI/element/element.js';
import s from './styles.scss';
import Ratified from '@Project/components/ratified/'

export default class Selection extends Element {
    //no constructor is specified so the super's constructr does its thing (Element)
    prerender(){ // remember prerender is called by the constructor so the properties and methods, including other
                 // new Constructors are ready for init(); 
        /* any child elements that need initialization such as eventListeners
            need to instantiated as properties of `this` so that their methods
            can be accessed */
        this.buttons = this.model.treaties.map(treaty => new Button(treaty));
        this.ratified = this.model.treaties.map(treaty => new Ratified(`div.ratifyComponent-${treaty.key}`, treaty, this));
        this.children = [
            new SearchBar(this.model),
            ...this.ratified,    
            ...this.buttons
        ];    
        
        //container
        var div = super.prerender();
        if ( this.prerendered ) {
            return div; // if prerendered
        }
        
        // if NOT prerendered:

        //searchbar
        div.appendChild(this.children[0].el); 
        
        // button container
        var btnContainer = $d.c('div.' + main.flex + '.' + main.sb + '.' + main.wrap);

        //// button groups
        this.buttons.forEach((btn,i) => {
            var btnGroup = $d.c('div.' + s.buttonGroup);
            // buttons
            btnGroup.appendChild(btn.el);
            // ratified
            btnGroup.appendChild(this.ratified[i].el)

            btnContainer.appendChild(btnGroup);
        });

        div.appendChild(btnContainer);
        
        return div;
    }
    init(){
        
        
        this.children.forEach(each => {
            if (each instanceof Button) {
                each.init(this.model.treaties);
            } else {
                each.init();
            }
        });
    }
}