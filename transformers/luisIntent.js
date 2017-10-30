function luisIntent (session, messages, configObject) {
  if (typeof configObject.luisRecognizer === 'undefined') {
    return null
  }
  // return (new Promise((resolve, reject) => {
  //   configObject.luisRecognizer.onRecognize(session.toRecognizeContext(), function (err, result) {
  //     if (err) {
  //       reject(err)
  //     }
  //     resolve(result.intent)
  //   })
  // })).then(result => {
  //   return result
  // })
  configObject.luisRecognizer.onRecognize(session.toRecognizeContext(), function (err, result) {
    if (err) {
      console.log(err)
    }
    return result
  })
}

module.exports = luisIntent
