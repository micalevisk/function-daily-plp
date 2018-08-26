// TODO: refatorar tudo

function compareObjs(o1, o2) {
  for (let k in o2)
    if (o1[k] !== o2[k]) return false
  return true
}

function isType({ type }, t) { return type === t }
function isName({ name }, n) { return name === n }
function getAttribs({ attribs }) { return attribs }
function hasAttribs(e, obj) {
  const attribs = getAttribs(e)
  if (!attribs || attribs === undefined) return false
  return compareObjs(attribs, obj)
}

const hasData = e => isType(e, 'text') && e.hasOwnProperty('data')

const strDateToObj = (strdate) => {
  const [ day, month, year, hour ] = strdate.replace(/\bde\b/g,'').split(' ').filter(e => e.trim())
  return { day: parseInt(day), month, year: parseInt(year), hour }
}


//////////////////
module.exports = {
   isType
  ,isName
  ,getAttribs
  ,hasAttribs
  ,hasData
  ,strDateToObj
}
//////////////////
