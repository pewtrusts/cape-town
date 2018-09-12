import { Mobius1Selectr } from '@UI/inputs/inputs.js';
//import $d from '@Helpers/dom-helpers.js';
//import main from '@Project/css/main.scss';

export default class Multiselect extends Mobius1Selectr {
    prerender(){
        var selector = super.prerender();
        if ( this.prerendered ) {
            return selector;
        }
        console.log(selector.options);
        Array.from(selector.options).forEach(option => {
            if ( !option.pctModel.isParty ){
                option.style.display = 'none';
            }
        });
        return selector;
    }
    init(){
        console.log('init Multiselect');
    }
}