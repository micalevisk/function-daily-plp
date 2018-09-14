const fetch = require('node-fetch')
const cheerio= require('cheerio')
const _ = require('./utils')
const sitesGoogleAPI = require('./sitesGoogleAPI')

//#region handlers
const titleHandler = {
  isPattern(e) {
    return _.isType(e, 'tag')
        && _.isName(e, 'h4')
  },

  isChildren(e) {
    return _.isType(e, 'tag')
        && _.isName(e, 'a')
        && e.hasOwnProperty('attribs')
        && _.hasAttribs(e, { dir: 'ltr' })
  }
}

const dateHandler = {
  isPattern(className) {
    return e => _.isType(e, 'tag')
             && e.hasOwnProperty('attribs')
             && _.hasAttribs(e, { class: className })
  },

  isChildren(e) {
    return _.isType(e, 'tag')
        && e.hasOwnProperty('attribs')
        && _.hasAttribs(e, { dir: 'ltr' })
  }
}
//#endregion

function formatDate(strDate) {
  const {day, month, year} = _.strDateToObj(strDate)
  return `${day}/${month}/${year}`
}

function scrapeLastAnnouncement(baseURL, body) {
  const $ = cheerio.load(body)

  const ultimaPublicacao = $('div.announcement')[0]
  if (!ultimaPublicacao) {
    return Promise.reject(new Error('Publicação não encontrada'))
  }

  const titleElement = ultimaPublicacao.children.find(titleHandler.isPattern)
  const publiLinkElement = titleElement.children.find(titleHandler.isChildren)
  const title = publiLinkElement.children.find(_.hasData).data
  const pageLinkPath = _.getAttribs(publiLinkElement)['href'] //.split('/').pop()

  const timeElement = ultimaPublicacao.children.find(dateHandler.isPattern('timestamp'))
  const dateElement = timeElement.children.find(dateHandler.isChildren)
  const publish_date = dateElement.children.find(_.hasData).data

  const response = {
    title: title,
    link: baseURL + pageLinkPath,
    publish_date: formatDate(publish_date)
  }

  const updatedTimeElement = timeElement.children.find(dateHandler.isPattern('updatedTime'))
  if (updatedTimeElement) {
    const updatedDateElement = updatedTimeElement.children.find(dateHandler.isChildren)
    const updated_date = updatedDateElement.children.find(_.hasData).data

    Object.assign(response, { updated_date: formatDate(updated_date) })
  }

  return Promise.resolve(response)
}


/**
 *
 * @param {string} projectName
 * @returns {Promise<{title:string, link:string, publish_date:string, updated_date?:string}>}
 */
function fetchLastAnnouncement(projectName) {
  return fetch( getURLToProjectName(projectName) + '/' + SITES_GOOGLE_CLASSROOM_NEWS )
    .then(res => res.text())
    .then(body => scrapeLastAnnouncement(SITES_GOOGLE_BASE_URL, body))
    .catch(err => err.message)
}

module.exports = fetchLastAnnouncement
