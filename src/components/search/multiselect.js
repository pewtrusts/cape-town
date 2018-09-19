import { Mobius1Selectr } from '@UI/inputs/inputs.js';
import PS from 'pubsub-setter';
import './styles-exclude.scss';
import { stateModule as S } from 'stateful-dead';
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
        PS.setSubs([
            ['clickCountries', (msg,data) => {
                this.setValues.call(this,msg,data);
                this.addTagEvents();
            }]
        ]);
        function selectrOnChange(Selectr){
            this.addTagEvents();
            console.log(this, Selectr);
            console.log('selectr change', Selectr.selectedValues.slice(1));
            S.setState('searchCountries', Selectr.selectedValues.slice(1));
        }
        this.Selectr.on('selectr.change', () => {
            selectrOnChange.call(this, this.Selectr);
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
    addTagEvents(){
        var cont = document.querySelector('.selectr-options-container');
        console.log(document.querySelectorAll('button.selectr-tag-remove'));
        /* the third-party Selectr is allowing a click on a tag to bubble up to the search bar itself,
        which then opens or closes the dropdown. until / unless that code is brought in local, there is
        no access to the event. the tags themselves in the DOM have no attribute refering to the country
        so the only way to work around is to allow the third-part code to do its thing and then undo it */
        document.querySelectorAll('button.selectr-tag-remove').forEach(button => {
            button.addEventListener('click', () => {
                if ( !this.Selectr.opened ){
                    cont.style.display = 'none';
                    setTimeout(() => {
                        this.Selectr.close();
                        cont.style.display = 'block';
                    });
                } else {
                    setTimeout(() => {
                        this.Selectr.open();
                    });
                }
            });
        });
    }
    setValues(msg,data){
        console.log(data);
        this.Selectr.setValue(data);
    }
}         