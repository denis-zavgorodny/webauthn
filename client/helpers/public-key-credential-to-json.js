import base64url from "base64url";

const publicKeyCredentialToJSON = (pubKeyCred) => {
  const utf8Decoder = new TextDecoder('utf-8');
  if(pubKeyCred instanceof Array) {
      let arr = [];
      for(let i of pubKeyCred)
          arr.push(publicKeyCredentialToJSON(i));

      return arr
  }

  if(pubKeyCred instanceof ArrayBuffer) {
    // return utf8Decoder.decode(pubKeyCred)
    return base64url.encode(pubKeyCred)
  }

  if(pubKeyCred instanceof Object) {
      let obj = {};

      for (let key in pubKeyCred) {
          obj[key] = publicKeyCredentialToJSON(pubKeyCred[key])
      }

      return obj
  }

  return pubKeyCred
}

export default publicKeyCredentialToJSON;