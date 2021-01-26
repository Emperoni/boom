class InsertModal extends HTMLElement {
  static get observedAttributes(){
    return ['open', 'subject', 'description', 'authenticatedUser'];
  }
  constructor(){
    super();
    this.attachShadow({mode: 'open'});
    this.close = new CustomEvent('close', {
      bubbles: true,
      cancelable: false,
      detail: {
        open: false
      }
    })
/*
    this.editableList = new CustomEvent('edit', {
      bubbles: true,
      cancelable: false,
      detail: {
        good: true
      }
    })
*/
    this.blurInput = new CustomEvent('blurInput', {
      bubbles: true,
      cancelable: false,
      detail: {
        good: true
      }
    })
  }

  connectedCallback(){
    this.render();
  }

  attributeChangedCallback(attrName, oldValue, newValue){
    if(attrName !== 'open' && oldValue !== newValue){
      this[attrName] = newValue;
    } else if(attrName === 'open'){
      this['open'] = true;
    } // I think that we would need an else as well.
    this.render();
  }

  render(){
    const { shadowRoot } = this;
    const templateNode = document.getElementById('modal-insert-template')

    shadowRoot.innerHTML = '';

    if(templateNode){
      const instance = document.importNode(templateNode.content,  true);
      const close = instance.querySelector('.close'); // close is a reference to the html element.
      const cancel = instance.querySelector('.cancel'); // close is a reference to the html element.
      const insertActivity = instance.querySelector('.insertActivity'); // insertActivity is a reference to the html element.
      //insertActivity
      const insertableList = instance.querySelectorAll(".insertable");
      const wrapper = instance.querySelector('.wrapper');

      if(this.getAttribute('open')){
        wrapper.style.display = 'block';
      } else {
        wrapper.style.display = 'none';
      }
      const closeEvent = this.close;

      cancel.onclick = function(){
        this.dispatchEvent(closeEvent);
      }
      insertActivity.onclick = function(){
        close.onclick();
      }
      close.onclick = function(){
        this.dispatchEvent(closeEvent);

        console.log(ActivityCard);
        //ActivityCard.subject = 'test';
        console.log('close now.');
        //const subject = document.getElementById('subjectInput');
        console.log(insertableList[0]);
        const subjectValue = insertableList[0].value;
        const description = insertableList[1];
        console.log(description);
        //console.log(authenticatedUser);
        //console.log(ActivityCard.authenticatedUser);
        const descriptionValue = description.value;
        if(subjectValue.length > 0){
          // 5e9bda09f4bc8e3f31e2fbcd dg22@marcopoloni.com
          const authenticatedUser= {};
          const pageTitle = document.getElementById('pageTitle');
          const ownerId = document.getElementById('pageTitle').getAttribute('ownerId');
          if(pageTitle.getAttribute('ownerId')){
            console.log('ownerId is live');

          } else {
            console.log(pageTitle);
            console.log('ownerId is not live');
          }
          db.collection('activities').insertOne({"subject": subjectValue, "description": descriptionValue, "ownerId": ownerId})
          .then(result => {
            console.log(`Successfully inserted activity with _id: ${result.insertedId}`)
            const container = document.getElementById('reports-container');
            let node = document.createElement('activity-card');
            node.setAttribute('open', false);
            node.setAttribute('id', result.insertedId);
            node.setAttribute('_id', result.insertedId);
            node.setAttribute('subject', subjectValue);
            node.setAttribute('description', descriptionValue);
            console.log(node);
            let theCard = document.getElementById(result.insertedId);
            console.log(theCard)
            theCard.addEventListener('click',(event) => {
              let activityModal = document.querySelector('report-modal');
              activityModal.setAttribute('open', true);
              activityModal.setAttribute('_id', theCard.getAttribute('id'));
              activityModal.setAttribute('subject', theCard.getAttribute('subject'));
              activityModal.setAttribute('description', theCard.getAttribute('description'));
            })
          })
          .catch(err => console.error(`Failed to insert item: ${err}`));
        }


        // container.appendChild(node); Removed this to prevent duplicates.
      }
      shadowRoot.addEventListener('close', () => {
        wrapper.classList.remove('open');
        wrapper.style.display = 'none';
        this['open'] = false;
      })
      if(this['open'] == true){
        instance.querySelector('.wrapper').classList.add('open');
      }
      shadowRoot.appendChild(instance);
    } else {
      shadowRoot.innerHTML = '<p>Shadow root failed. Please try again later.</p>'
    }
  }
}

customElements.define('insert-modal', InsertModal);
