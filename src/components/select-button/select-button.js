import s from './styles.scss';
//import d from './../../data/treaties.json';

export default function(treaty){
	var btn = document.createElement('button');
	btn.className = s.selectButton;
	btn.innerHTML = treaty.name;
	return btn;
}