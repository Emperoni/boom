class LoginModal extends HTMLElement {
  static get observedAttributes(){
    return ['open', 'email', 'password', 'message'];
  }
  constructor(){
    super();
    this.attachShadow({mode: 'open'});
    // TODO. We do need to close the form.
    this.close = new CustomEvent('close', {
      bubbles: true,
      cancelable: false,
      detail: {
        open: false
      }
    })
    // TODO. Remove
    this.editableList = new CustomEvent('edit', {
      bubbles: true,
      cancelable: false,
      detail: {
        good: true
      }
    })

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
    const templateNode = document.getElementById('login-modal-template')

    shadowRoot.innerHTML = '';

    if(templateNode){
      const instance = document.importNode(templateNode.content,  true);
      const message = instance.getElementById('message');
      if(this.getAttribute('message') != "undefined"){
        message.innerHTML = this.getAttribute('message');
      }

      const login = instance.getElementById('login');
      // need to define close or move the close event. this.close is defined...
      const email = instance.getElementById('email');
      const password = instance.getElementById('password');
      const wrapper = instance.querySelector('.wrapper');
      if(this.getAttribute('open')){
        wrapper.style.display = 'block';
      } else {
        wrapper.style.display = 'none';
      }
      const closeEvent = this.login;

      login.addEventListener('click', () => {
        console.log('We clicked the login button.');
        testCredential(email.value, password.value);
        close.onclick();
        console.log('did the window close?')
        message.innerHTML = 'did it close?<br>';
      });

      close.onclick = function(){
        //this.dispatchEvent(closeEvent);
        wrapper.classList.remove('open');
        wrapper.style.display = 'none';
        this['open'] = false;
        console.log('close now.');

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

customElements.define('login-modal', LoginModal);
