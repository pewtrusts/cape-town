import { Mobius1Selectr } from '@UI/inputs/inputs.js';
import PS from 'pubsub-setter';
import './styles-exclude.scss';
import { stateModule as S } from 'stateful-dead';
//import $d from '@Helpers/dom-helpers.js';
//import main from '@Project/css/main.scss';

export default class Multiselect extends Mobius1Selectr {
    // param1 = selector `select.${main.grow}`;
    // param2 = countryCodesArray of data for all countries
    // param3 = config object for Mobius1Slectr
    
    // does not specify constructor, the Mobius1Selectr constructor does its thing, including
    // assigning DOM element to this.el

   init(){
        super.init(); //calls init() method from class Mobius1Selector which initiates the multiselect on this.el

        Array.from(this.el.options).forEach(option => {  // this will hide the options in the original select element
                                                         // that are not party to at least one agreement, but the Selectr
                                                         // transforms the original and shows them again. init() method
                                                         // below finds what should be hidden and hides them. this task
                                                         // needs to be done as part of init() to work with prerendered
                                                         // build
            if ( !option.pctModel.isParty ){
                option.style.display = 'none';
            }
        });
        
        PS.setSubs([
            ['clickCountries', (msg,data) => {
                this.setValues.call(this,msg,data);
                this.addTagEvents();
            }],
            ['oversetCount', (msg,data) => {
                this.showOversetCount.call(this,msg,data);
            }]
        ]);
        
        function selectrOnChange(Selectr){
            this.checkForTagOverflow();
            this.addTagEvents();
            
            console.log('selectr change', Selectr.selectedValues.slice(1));
            S.setState('searchCountries', Selectr.selectedValues.slice(1));
        }
        
        this.Selectr.on('selectr.change', () => {
            selectrOnChange.call(this, this.Selectr);
        });
        
        this.Selectr.on('selectr.open', function(){
            setTimeout(() => { // timeout gives API timeto create the <li>s that this needs to search through
                this.tree.querySelectorAll('span.isParty-false').forEach(span => {
                    span.parentNode.classList.add('hideOption'); // hides the Selectr options that should have been hidden; ie are not party to an agreement
                });
            });
        });
    }
    checkForTagOverflow(){
        var threshold = this.Selectr.container.children[0].children[0].offsetWidth;
        var width = 0;
        var tags = this.Selectr.tags;
        for ( let i = 0; i < tags.length; i++ ){
            width += tags[i].offsetWidth;
            if ( width > threshold ) {
                S.setState('oversetCount', tags.length - i)
                console.log(this);
                //this.Selectr.container.parentNode.classList.add('tag-overflow');
                //document.querySelector('#overset-count').innerHTML = '+ ' + (tags.length - i) ;
                break;
            }
            if ( width <= threshold && i === tags.length - 1 ){
                S.setState('oversetCount', 0)
                //this.Selectr.container.parentNode.classList.remove('tag-overflow');
                //document.querySelector('#overset-count').innerHTML = '0';
            }
        }
    }
    showOversetCount(msg,data){
        if (data > 0) {
            this.Selectr.container.parentNode.classList.add('tag-overflow');
        } else {
            this.Selectr.container.parentNode.classList.remove('tag-overflow');
        }
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
        
        this.Selectr.setValue(data);
    }
}         