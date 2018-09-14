const sitesGoogleAPI = {
  baseURL: 'https://sites.google.com',

  getURLToProjectName(projectName) {
    return `${this.baseURL}/site/${projectName}`
  },

  classroomNews(projectName) {
    return this.getURLToProjectName(projectName) + '/' + 'classroom-news'
  },

  assignments(projectName) {
    return this.getURLToProjectName(projectName) + '/' + 'assignments'
  },
}

module.exports = sitesGoogleAPI
