class ActivityCard extends HTMLElement {
  static get observedAttributes() {
    return ['subject', 'description', 'document', '_document'];
  }
  constructor(){
    super();
    this.attachShadow({"mode": "open"});

    this._document = {};
  }

  connectedCallback(){
    this.render();
  }

  attributeChangedCallback(attrName, oldValue, newValue){
    if(oldValue !== newValue){
      this[attrName] = newValue;
    }
    this.render();
  }

  set document(doc){
    // console.log(doc);
    this._document = doc;
  }

  get document(){
    // console.log(this._document);
    return this._document;
  }

  render(){
    const { shadowRoot } = this;
    const templateNode = document.getElementById('list-card-template');
    shadowRoot.innerHTML = '';
    if(templateNode){
      //in list-card-template there is a div with class called content inside a div called list-card.
      const instance = document.importNode(templateNode.content, true);
      // this needs to be in a loop for all editable fields
      // What does Object refer to? I think that Object.entries is a way to iterate all properties, in this case of "this"
      for (let [key, value] of Object.entries(this)) {
        //console.log(key,value);
        if(instance.querySelector('#' + `${key}`) != null){
          instance.querySelector('#' + `${key}`).innerHTML = this[`${key}`];
        }
      }


      shadowRoot.appendChild(instance);

    } else {
      shadowRoot.innerHTML =  `<p>Shadow root failed. Please try again later.</p>`;
    }
  }

}

customElements.define('activity-card', ActivityCard);

/*
Lifecycle
constructor, connectedCallback, disconnectedCallback, attributeChangedCallback, adoptedCallback
constructor runs upon creation. Create an instance of the shadow DOM, set up event listeners, initialize state.
do not use constructor for executing tasks, rendering, or fetching resources.
It is mandatory to use a constructor.
Cannot have a RETURN statement or include document.write()/document.open()
Children should not be accessed because they have not been created yet.
You do setup resources in constructor. This is not "run setup code" seen in connectedCallback. Here we setup
resources that will be used by connectedCallback for rendering.
connectedCallback is triggered when an element is added to the DOM.
--set attributes
--fetch resources
--run setup code
--render templates
connectedCallback handles the rendering in our case.
disconnectedCallback is triggered when an element is removed from the DOM.
--notify other parts of the application that the element is being removed
--unsubscribe from DOM events
--stop interval timers
--unregister all registered callbacks.
document.querySelector('blog-card').remove();
attributeChangedCallback(name, oldValue, newValue)
triggered when the attribute is added, removed, updated, or replaced.
The attribute to track will be specified in a method called: static get observedAttributes
adoptedCallback()
*/
