class ReportModal extends HTMLElement {
  static get observedAttributes(){
    return ['open', 'subject', 'description', '_id', '_document', 'document'];
  }
  constructor(){
    super();

    this._document = {};

    this.attachShadow({mode: 'open'});
    this.close = new CustomEvent('close', {
      bubbles: true,
      cancelable: false,
      detail: {
        open: false
      }
    })

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

  set document(doc){
    this._document = doc;
    // run a function here that adds any additional fields.
    this.populate();
  }

  get document(){
    return this._document;
  }

  render(){
    const { shadowRoot } = this;
    const templateNode = document.getElementById('modal-report-template')

    shadowRoot.innerHTML = '';

    if(templateNode){
      const instance = document.importNode(templateNode.content,  true);
      const close = instance.querySelector('.close'); // close is a reference to the html element.
      const deleteActivity = instance.getElementById('deleteActivity');
      const addFieldLink = instance.getElementById('addFieldLink');
      const editableList = instance.querySelectorAll(".editable");
      const wrapper = instance.querySelector('.wrapper');
      if(this.getAttribute('open')){
        wrapper.style.display = 'block';
      } else {
        wrapper.style.display = 'none';
      }
      // so far instance only has the html taken from the template
      const closeEvent = this.close;
      const editableListEvent = this.editableList;
      const theId = this['_id'];

      deleteActivity.addEventListener('click', () => {
        const result = db.collection('activities').deleteOne({"_id": {"$oid": theId}});
        // console.log(result);
        const activityCard = document.getElementById(theId);
        const container = document.getElementById('reports-container');
        close.onclick();
      });
      addFieldLink.addEventListener('click', () => {
        var divLabel = document.createElement( 'div');
        var div = document.createElement( 'div');
        divLabel.innerHTML = `newFieldlabel`;
        divLabel.classList.add('fieldLabel');
        console.log('addFieldLink. add event listener. add editable to div. 94');
        div.classList.add('editable');
        div.innerHTML = `newField value`
        div.id = 'newField';
        this.hasCreatedSDListeners = false;
        // console.log('XXXXXXX = Append div and divLabel = XXXXXXX')
        this.shadowRoot.querySelector('#addField').appendChild(divLabel);
        this.shadowRoot.querySelector('#addField').appendChild(div);
        this.addListeners(div, true, this._id);
        this.addLabelListeners(divLabel, true, this._id, div);
      });
      for (var i=0; i < editableList.length; i++){
        editableList[i].onclick = function(){
          this.dispatchEvent(editableListEvent);
        }
    		editableList[i].addEventListener('edit', (editableListEvent) => {
          if(editableListEvent == undefined){
        		var elem = window.event.target || window.event.srcElement;
        	} else {
        		var elem = editableListEvent.target || editableListEvent.srcElement;
        	}
          const theValue = elem.innerHTML;
          if(editableListEvent.detail.good){
            //should actually append a child.
            var input = document.createElement("input");
            input.type = "text";
            input.className = "editInput";
            input.value = `${theValue}`;
            elem.innerHTML = '';
            elem.appendChild(input);
            editableListEvent.detail.good = false;
            const blurInputEvent = this.input;

            input.addEventListener('focusout', (input) => {
              const oldValue = this['subject'];
              const newValue = input.path[0].value;
              elem.innerHTML = newValue;
              const fieldName = elem.getAttribute('id');
              this[elem.getAttribute('id')] = newValue;
              editableListEvent.detail.good = true;
              const activityCard = document.getElementById(theId);
              activityCard.setAttribute(elem.getAttribute('id'), newValue);
              const updateString = `${elem.getAttribute('id')}`;
              const result = db.collection('activities').updateOne({"_id": {"$oid": theId}},{"$set":{[updateString]: newValue}});
              // console.log(result);
            })
          }
        });
    	}

      close.onclick = function(){
        this.dispatchEvent(closeEvent);
        editableListEvent.detail.good = true;
      }
      shadowRoot.addEventListener('close', () => {
        wrapper.classList.remove('open');
        wrapper.style.display = 'none';
        this['open'] = false;
      })
      if(this['open'] == true){
        instance.querySelector('.wrapper').classList.add('open');
      }
      if(this['subject'].length === 0){
        instance.querySelector('#subject').innerHTML = 'Click here to edit.';
      } else {
        instance.querySelector('#subject').innerHTML = this['subject'];
      }
      if(!this['description'] || this['description'].length === 0){
        instance.querySelector('#description').innerHTML = 'Click here to edit.';
      } else {
        instance.querySelector('#description').innerHTML = this['description'];
      }
      shadowRoot.appendChild(instance);
    } else {
      shadowRoot.innerHTML = '<p>Shadow root failed. Please try again later.</p>'
    }
  }

  populate(){
    let i=0;
    let theValue = null, theKey = null;
    this.hasCreatedSDListeners = false;
    let manualFields = ["_id", "description", "subject", "ownerId"];
    for(let item in this['document']){
      // if the field is not "_id", "description", or "subject"
      // also not ownerId and not of type object.
      theValue = this['document'][item];
      // console.log('YYY Look here YYY');
      this.hasCreatedSDListeners = false;
      // console.log(theValue); // this comes from the database.
      theKey = item;
      if(manualFields.indexOf(item)===-1){
        // console.log('not found. Fire the first recursiveReport.');
        this.recursiveReport(theKey, theValue, this._id, this);
      }
      i++;
      // console.log(i, theKey, theValue);
    }
  }

  recursiveReport(theKey, theValue, theId, that, theDivId, callback){
    //need the overall value. use theValue[theKey] to get the current theValue or maybe refactor and use theValue
    //consistently with the rest of the module, and rename theValue to elementValue or something.
    //never mind. theValue has to change as it recursively travels inside the object.
    //how about setting a value inside this.
    console.log('begin recursiveReport()');
    var countOfChildren = 0;

    // console.log('beginning of recursive report. create 2 div elements and assign to div and divLabel');
    // console.log('could this be a problem. div and divlabel created twice?')
    if(!div){
      var divLabel = document.createElement('div');
      var div = document.createElement('div');
      // console.log('created div and divLabel');
    }
    if(theDivId){
      // weird.
      // console.log(theDivId);
      // console.log(typeof callback);
      // console.log('here we set the id of div.id. This is actually a later concern, specifically for divSD.id')
    }
    // console.log(theId);
    // console.log(typeof theValue);
    // console.log(theKey);
    // console.log(theValue);
    switch(typeof theValue){
      case 'object':
        //array or subdocument?

        if(Array.isArray(theValue)){
          // console.log('Array');
          div.id = theKey;
          // console.log(div.id);
          if(theDivId){
            div.id = theDivId + '.' + theKey
            // console.log(div.id);
          } else {
            div.id = theKey;
            theDivId = div.id;
            // console.log(div.id);
            // console.log('theDivId IS NOT defined.');
          }
          divLabel.innerHTML = `${theKey}`;
          divLabel.classList.add('fieldLabel');

          for(const item in theValue){

            // console.log(item); // the sub field name. The key.
            // console.log(theValue[item]); // the sub field's value.

            // console.log('XXXXXXX this (above) is the subdocument value XXXXXXX add a callback parameter. and pass div.id: ' + div.id);
            this.recursiveReport(item, theValue[item], theId, that, theDivId, function(that){
              countOfChildren += 2;
              // console.log(that.children);
              // div.innerHTML += that.children[0].outerHTML; //<div class="fieldLabel">danieleX</div>
              // div.innerHTML += that.children[1].outerHTML; //<div>grazianiX</div>x
              // the contents of div, therefore, get set to the subdocument's key and value.
              // but does the value div have a listener that we can fire?
              // Apparently not, when we click on grazianiX the enclosing div fires the click event and populates with
              // subject, which is doubly wrong. but it makes logical sense and that is why I wanted to remove
              // the listener. But that listener is created after the grazianiX div listener.
            }); // this is an object so it needs to be broken down. Recursive?

          }
        } else {
          // console.log('subdocument:');
          // console.log(theKey, theId);
          // console.log(theValue); // the subdocument. This returns {x: "a", y: "b"}
          if(theDivId){
            div.id = theDivId + '.' + theKey;
            theDivId = div.id;
            // console.log(div.id);
            // console.log('theDivId IS defined');
          } else {
            div.id = theKey;
            theDivId = div.id;
            // console.log(div.id);
            // console.log('theDivId IS NOT defined.');
          }
          divLabel.innerHTML = `${theKey}`;
          divLabel.classList.add('fieldLabel');
          for(const item in theValue){
            // console.log(item); // the sub field name. The key.
            // console.log(theValue[item]); // the sub field's value.

            // console.log('XXXXXXX this (above) is the subdocument value XXXXXXX add a callback parameter. and pass div.id: ' + div.id);
            this.recursiveReport(item, theValue[item], theId, that, theDivId, function(that){
              countOfChildren += 2;
              // console.log(that.children);
              // div.innerHTML += that.children[0].outerHTML; //<div class="fieldLabel">danieleX</div>
              // div.innerHTML += that.children[1].outerHTML; //<div>grazianiX</div>x
              // the contents of div, therefore, get set to the subdocument's key and value.
              // but does the value div have a listener that we can fire?
              // Apparently not, when we click on grazianiX the enclosing div fires the click event and populates with
              // subject, which is doubly wrong. but it makes logical sense and that is why I wanted to remove
              // the listener. But that listener is created after the grazianiX div listener.
            }); // this is an object so it needs to be broken down. Recursive?

          }
        }
      break;

      default:
        // console.log('DEFAULT');
        divLabel.innerHTML = `${theKey}`;
        divLabel.classList.add('fieldLabel');
        // console.log('add editable to div 243');
        //div.classList.add('editable');
        // console.log(typeof theValue);
        if(!callback){
          if(theValue.length === 0){
            div.innerHTML = 'click here to edit.'
          } else {
            // console.log('XXXXXXX this is the DEFAULT string or numeric value XXXXXXX');
            // console.log(theKey, theValue);
            div.innerHTML = `${theValue}`
          }
        }
      //end of default
    }
    // console.log(divLabel);
    // drop the editable class to div here (if it is an object)
    // element.classList.remove("mystyle");
    div.classList.remove("editable");
    console.log('Inside recursiveReport. About to create listeners for div and divLabel. Div: ', div);
    if (callback && typeof(callback) === "function") {
      var divLabelSD = document.createElement( 'div' );
      var divSD = document.createElement( 'div' );
      //div.innerHTML = '';
      divLabelSD.innerHTML = `${theKey}`;
      divLabelSD.classList.add('objectFieldLabel');
      // console.log('add editable to divSD. 265.')
      // divSD.classList.add('editable');
      if(theValue.length === 0){
        divSD.innerHTML = 'click here to edit.'
      } else {
        // console.log('XXXXXXX this is the DEFAULT SD value XXXXXXX');
        // console.log(theKey, theValue);
        divSD.innerHTML = `${theValue}`
      }
      //divSD.classList.add('editable');
      // console.log('XXXXXXX = Append divSD and divLabelSD = XXXXXXX')
      that.shadowRoot.querySelector('#additionalFields').appendChild(divLabelSD);
      that.shadowRoot.querySelector('#additionalFields').appendChild(divSD);
      // console.log(divSD.parentElement.children.length);
      // console.log(divSD.parentElement);

      // maybe these listeners need to not fire the innerHTML content of the textarea. TODO.
      that.addSDListeners(divSD, true, theId, theDivId, divLabelSD, div);
      that.addLabelListeners(divLabelSD, true, that._id, divSD);
      // console.log(div.innerHTML);
      // console.log(divSD.innerHTML);
      // console.log(divSD);
      //maybe this needs to be divSD
      callback(div);
    } else {
      div.id = theKey;
      // console.log('XXXYYYXXXX = Append div and divLabel = XXXYYY  XXXX')
      // console.log(that.shadowRoot.querySelector('#additionalFields').children.length);
      let theField = '#' + div.id;
      // console.log(this);
      // countOfChildren = that.shadowRoot.querySelector('#additionalFields').children.length; //
      // console.log('YYYYYYYYY ' + countOfChildren);
      if(this.hasCreatedSDListeners){
        that.shadowRoot.querySelector('#additionalFields').insertBefore(divLabel, that.shadowRoot.querySelector('#additionalFields').children[that.shadowRoot.querySelector('#additionalFields').children.length - countOfChildren]);

      } else {
        that.shadowRoot.querySelector('#additionalFields').appendChild(divLabel);

      }
      that.shadowRoot.querySelector('#additionalFields').appendChild(div);
      // console.log(div.parentElement.children.length);
      that.addListeners(div, true, that._id);
      that.addLabelListeners(divLabel, true, that._id, div);

    }
  }
  //this adds listeners to the value, which mean modifying the value stored.
  // elem is the div. div is a child of #additionalFields. The div can also be
  // divSD which is a child of div.
  // The root of the problem is here. What is elem? When clicking the sub document
  // it fires for the child of #additionalFields instead of the sub document element.
  // we build theElement (passing the div to it)

  addListeners(el, enabled, theId, labelElem, parentElem){
    // console.log('ADD REGULAR LISTENERS.');
    // This has become a mess, but the concept is simple like at line 551.
    console.log('Begin addListeners()');
    // console.log('this is the critical point (LISTENERS). If this is an SD, the elem should be the SD, not its parent or grandparent.');
    // console.log('If this is an SD parentElem has to be defined and point to the parent. elem needs to be the SD.')
    var parameters = {};
    parameters.labelElem = labelElem;
    // console.log(parameters);
    // console.log(el, parentElem, labelElem); // this appears to be correct. It is the SD elem but there are 2 spaces in front, why? maybe
    // console.log(theId);
    // for navigation in case it has sub elements.
    if(labelElem){
      // console.log('THIS IS A SUBDOCUMENT WITH LABELELEM');
    } else {
      // console.log('this is NOT a SD');
    }
    // addEventListener('click',function() {elementSpanClicked(i);})
    // console.log(el.innerHTML);
    parameters.event = event;
    // console.log(parameters);
    //parentElem.removeEventListener("click", handleClickEvent(), true);
    //this is what happens when we click on the next field.
    //for a field with a subdocument this will run twice and the first time is the sd and the second time it is
    // the original value div.
    if(!this.hasCreatedSDListeners){
      el.addEventListener('click', function() {handleClickEvent(parameters);});
      // console.log('Did create listeners for div.');
    } else { console.log('DID NOT create listeners for div.');}
    function handleClickEvent(that){
      console.log('Begin handleClickEvent().')
      if(enabled === true){
        // console.log(el); // on line 314 elem appears to be correct, while here it is the parent elem (for SD). -- for non sd the value of el contains "undefined" and the subject value html. Where did it come from?
        // console.log(parameters); // same here. LabelElem is not pointing to the right variable. Let's try "this"
        // console.log(parameters.event);
        // console.log(that);
        // console.log(parameters.labelElem);
        // console.log(parameters.event.path[0].innerHTML);
        var theElement = buildElement(el, parameters.labelElem, parameters.event);
        // console.log(theElement);
        // here we are adding the input/textarea created in the function. For SD the key is lost.
        el.appendChild(theElement);
        enabled = false;
        const oldValue = theElement.value;
        theElement.addEventListener('focusout', (theElement) => {
          const newValue = theElement.path[0].value;
          el.innerHTML = newValue;
          enabled = true;
          const updateString = `${el.getAttribute('id')}`;
          const result = db.collection('activities').updateOne({"_id": {"$oid": theId}},{"$set":{[updateString]: newValue}});
          // console.log(result);
        })
      }
      // This function is still active, right? It is supposed to build the element that fits the size or data
      // type of the element passed.
      function buildElement(elementary, labelElem, event){
        console.log('Begin buildElement inside handleClickEvent.');
        // console.log('here we are passing elem just to clear it. When we should pass SD and preserve the label.');
        // console.log(el, labelElem);
        // console.log(el.innerHTML); // this inner html is correct for outer fields, -- using path[0] does not work for root fields.
        if(elementary.innerHTML.length <= 20){
          var theElement = document.createElement("input");
          theElement.type = "text";
          theElement.size = 50;
          theElement.className = "editInput";
          theElement.value = elementary.innerHTML;
          elementary.innerHTML = '';
        } else if (elementary.innerHTML.length > 20) {
          var theElement = document.createElement("textarea");
          // but incorrect for sub-document-fields (subcocuments). In this case, instead of just the value,
          // it is populated by the inner html of the outer div (like testSubdocument)
          theElement.rows = 5;
          theElement.cols = 20;
          theElement.className = "editInput";
          theElement.value = elementary.innerHTML;
          elementary.innerHTML = '';//this needs to preserve the key if it is an SD. But this is probably not the place.
          // or, it is possible that instead of clearing elem we need to clear SD. So these functions need to have
          // both parameters.
        }
        return theElement
      }
    }

  }

  addSDListeners(elemento, enabled, theId, theDivId, labelElem, parentElem){
    // console.log('ADD SD LISTENERS.');
    // console.log(this.hasCreatedSDListeners);
    // console.log('this is the critical point (LISTENERS). This is an SD, the elem should be the SD, not its parent or grandparent.');
    // console.log('If this is an SD parentElem has to be defined and point to the parent. elem needs to be the SD.')
    var parameters = {};
    this.hasCreatedSDListeners = true;
    parameters.labelElem = labelElem;
    // console.log(parameters);
    // console.log(parentElem, labelElem, theId); // this appears to be correct. It is the SD elem but there are 2 spaces in front, why? maybe
    // for navigation in case it has sub elements.
    // console.log(theId)
    elemento.id = theDivId + '.' + labelElem.innerHTML;
    // console.log(elemento);
    if(labelElem){
      // console.log('THIS IS A SUBDOCUMENT WITH LABELELEM');
    } else {
      // console.log('this is NOT a SD');
    }
    // addEventListener('click',function() {elementSpanClicked(i);})
    // console.log(elemento.innerHTML);
    parameters.event = event;
    // console.log(parameters);
    //parentElem.removeEventListener("click", handleClickEvent(), true);
    //this is what happens when we click on the next field.
    //for a field with a subdocument this will run twice and the first time is the sd and the second time it is
    // the original value div.
    elemento.addEventListener('click', function() {handleSDClickEvent(parameters);});
    function handleSDClickEvent(parameters){
      // console.log('Here we might have added a listener to the SD sub-element. But what is firing must be the parent element.')
      if(enabled === true){
        var event = parameters.event;
        if (!event) event = window.event;
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
        // console.log(parameters.event);
        // console.log(elemento); // on line 314 elem appears to be correct, while here it is the parent elem (for SD)
        // console.log(parameters); // same here. LabelElem is not pointing to the right variable. Let's try "this"
        // console.log(parameters.event);
        // console.log(parameters.labelElem);
        var theElement = buildSDElement(elemento, parameters.labelElem, parameters.event);
        // console.log(theElement);
        // here we are adding the input/textarea created in the function. For SD they key is lost.
        elemento.appendChild(theElement);
        enabled = false;
        const oldValue = theElement.value;
        theElement.addEventListener('focusout', (theElement) => {
          const newValue = theElement.path[0].value;
          // console.log(newValue);
          elemento.innerHTML = newValue;
          enabled = true;
          const updateString = `${elemento.getAttribute('id')}`;
          // console.log(updateString);
          // console.log(theId);
          // console.log(newValue);
          const result = db.collection('activities').updateOne({"_id": {"$oid": theId}},{"$set":{[updateString]: newValue}});
          // console.log(result);
        })
      }
      function buildSDElement(elemento, labelElem, event){
        // console.log('this is the build SD element inside the listener. Is the other one still in use?');
        // console.log('here we are passing elem just to clear it. When we should pass SD and preserve the label.');
        // console.log(elemento, labelElem);
        // console.log(elemento.innerHTML);
        let elementoValue = elemento.innerHTML; // this inner html is correct for outer fields,
        if(elementoValue.length <= 20){
          var theElement = document.createElement("input");
          theElement.type = "text";
          theElement.className = "editInput";
          theElement.value = elementoValue;
          elemento.innerHTML = '';
        } else if (elementoValue.length > 20) {
          var theElement = document.createElement("textarea");
          // but incorrect for sub-document-fields (subcocuments). In this case, instead of just the value,
          // it is populated by the inner html of the outer div (like testSubdocument)
          theElement.rows = 5;
          theElement.cols = 20;
          theElement.className = "editInput";
          theElement.value = elementoValue;
          elemento.innerHTML = '';//this needs to preserve the key if it is an SD. But this is probably not the place.
          // or, it is possible that instead of clearing elem we need to clear SD. So these functions need to have
          // both parameters.
        }
        // console.log(theElement);
        return theElement
      }
    }

  }

  // this adds listeners to the labels, which mean renaming the element.
  addLabelListeners(elm, enabled, theId, valueElem){
    // console.log('LABEL LISTENERS');
    elm.addEventListener('click', () => {
      if(enabled === true){
        const oldValue = elm.innerHTML;
        var theElement = this.buildElement(elm);
        elm.appendChild(theElement);
        enabled = false;
        theElement.addEventListener('focusout', (theElement) => {
          //THIS COULD BE A textarea now
          const newValue = theElement.path[0].value;
          elm.innerHTML = newValue;
          enabled = true;
          const updateString = `${elm.getAttribute('id')}`;
          const result = db.collection('activities').updateOne({"_id": {"$oid": theId}},{"$rename":{[oldValue]: newValue}});
          // console.log(result);
          valueElem.setAttribute('id', newValue);
        })
      }
    })
  }

  // I think that this is to build the "edit" element.
  buildElement(el){
    console.log('Begin buildElement(). This is the build element OUTSIDE the listener. Is it still in use?');
    if(el.innerHTML.length <= 20){
      // console.log(el);
      // console.log(el.innerHTML);
      var theElement = document.createElement("input");
      theElement.type = "text";
      theElement.className = "editInput";
      theElement.value = el.innerHTML;
      el.innerHTML = '';
    } else if (el.innerHTML.length > 20) {
      var theElement = document.createElement("textarea");
      // console.log(el);
      // console.log(el.innerHTML);
      theElement.rows = 5;
      theElement.cols = 20;
      theElement.className = "editInput";
      theElement.value = el.innerHTML;
      el.innerHTML = '';
    }

    return theElement
  }


}

customElements.define('report-modal', ReportModal);
