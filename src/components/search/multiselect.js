import { Mobius1Selectr } from '@UI/inputs/inputs.js';
import './styles-exclude.scss';
//import $d from '@Helpers/dom-helpers.js';
//import main from '@Project/css/main.scss';

export default class Multiselect extends Mobius1Selectr {
    prerender(){
        var selector = super.prerender();
        if ( this.prerendered ) {
            return selector;
        }
        console.log(selector.options);
        Array.from(selector.options).forEach(option => { // this will hide the options in the original select element
                                                         // that are not party to at least one agreement, but the Selectr
                                                         // transforms the original and shows them again. init() method
                                                         // below finds what should be hidden and hides them
            if ( !option.pctModel.isParty ){
                option.style.display = 'none';
            }
        });
        return selector;
    }
    init(){
        super.init();
        console.log(this.Selectr.container);
        this.Selectr.on('selectr.change', function(){
            console.log('selectr change');
        });
        this.Selectr.on('selectr.open', function(){
            setTimeout(() => { // timeout gives API timeto create the <li>s that this needs to search through
                console.log(this.tree);
                this.tree.querySelectorAll('span.isParty-false').forEach(span => {
                    console.log(span);
                    span.parentNode.classList.add('hideOption'); // hides the Selectr options that should have been hidden; ie are not party to an agreement
                });
            });
        });
    }
}         