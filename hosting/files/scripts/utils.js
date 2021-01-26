function idToString(id){
  let output = '';
  if(Array.isArray(id)){
    console.log('id is array');
    for(let i=0; i<id.length; i++){
      console.log(i)
      output += id[i];
      if(i=id.length-1){
        return output;
      }
    }
  } else {
    console.log('id is not an array');
    console.log(id);
    console.log(typeof id);
    for(let j=0; j<12; j++){
      console.log(j);
      output += id[j].toString(16);
      if(j===11){
        return output;
      }
    }
  }
  return output;
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function escapeHTML(str) {
  var div = document.createElement('div');
  var text = document.createTextNode(str);
  div.appendChild(text);
  return div.innerHTML;
}

function singularize(str){
  if(str.substring(str.length -2) === 's'){
    if(str.substring(str.length -3) === 'es'){
      str = str.substring(0, str.length - 3)
    } else {
      str = str.substring(0, str.length - 2)
    }
  }
  return str;
}

function separateCamel(str){
  let output = '';
  str = str.split('');
  while(str.length>0){

    if(str[1] && str[1].charCodeAt(0) < 91){
      output += str.shift(str[0]) + ' ';
    }else {
      output += str.shift(str[0]);
    }
    if(str.length === 1){
      output += str[0];
      return output
    }
  }
  // use shift to remove the first element and return it
  return output
}

function capitalizeFirst(str){
  let output = '';
  if(str.charCodeAt(0) > 96 && str.charCodeAt(0) < 123){
    output = String.fromCharCode(str.charCodeAt(0) - 32) + str.substring(1);
    return output
  } else {
    output = str;
    return output
  }
}
