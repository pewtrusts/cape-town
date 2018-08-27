const d = {
 c:  (s) => {
     console.log(s);
     if ( s.indexOf('.') !== -1 || s.indexOf('#') !== -1 ){
         let classStrings = s.match(/\.([^#.]*)/g);
         let idString = s.match(/#([^.]*)/);
         let elString = s.match(/^([^.#]+)/);
         console.log(elString);
         console.log(classStrings);
         let el = document.createElement(elString[0]);
         classStrings.forEach(klass => {
            el.classList.add(klass.replace('.',''));
         });
         if ( idString !== null ){
            el.setAttribute('id', idString[1]);
         }
         return el;
     }
     return document.createElement(s);
 },
 q:  (s) => document.querySelector(s),
 qa: (s) => document.querySelectorAll(s)
};
export default d;