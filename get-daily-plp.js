const fetch = require('node-fetch');
const { fetchLastAnnouncement } = require('./fetchLastPost');

function sendMessageToTelegram(token, chatId, text, parseMode = 'HTML') {
  const url = `https://api.telegram.org/bot${token}/sendMessage?parse_mode=${parseMode}&chat_id=${chatId}&text=${text}`;
  return fetch(url);
}

//#region Webtask.io API

function saveToStorage(ctx, data, cb) {
  ctx.storage.set(data, { force: 1 }, function (error) {
    if (typeof cb !== 'function') return;

    if (error) return cb(error);
    return cb(null, error);
  });
}

function retriveFromStorage(ctx, cb) {
  ctx.storage.get((error, data) => {
    if (error) return cb(error);
    cb(null, data);
  });
}


function saveLastAnnouncement(ctx, lastAnnouncementFetched) {
  return new Promise((resolve, reject) => {

    const onRetrived = (error, lastAnnouncementSaved) => {
      if (error) return;
      if (!lastAnnouncementSaved || lastAnnouncementSaved !== lastAnnouncementFetched) {
        saveToStorage(ctx, lastAnnouncementFetched);
        resolve();
      } else {
        reject();
      }
    };

    retriveFromStorage(ctx, onRetrived);

  });
}


/**
 *
 * @param {WebtaskContext} ctx https://webtask.io/docs/context
 * @param {Function} cb Callback
 */
function getLastAnnouncement(ctx, cb) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_TARGET_CHAT_ID, GPROJECT_NAME } = ctx.secrets;

  fetchLastAnnouncement(GPROJECT_NAME)
    .then((dadosUltimoAnuncio) => {
      const {title, link, publish_date, updated_date} = dadosUltimoAnuncio;
      const msgFormatada = (updated_date)
        ? `<b>${publish_date}</b> ~ <code>${updated_date}</code>\n<a href="${link}">${title}</a>`
        : `<b>${publish_date}</b>\n<a href="${link}">${title}</a>`;

      saveLastAnnouncement(ctx, msgFormatada)
        .then(() => {
          sendMessageToTelegram(TELEGRAM_BOT_TOKEN, TELEGRAM_TARGET_CHAT_ID, msgFormatada)
            .then(response => cb(null, response))
            .catch(() => cb('something wrong'));
        })
        .catch(() => {
          cb(null, `[nada de novo] > "${title}"`);
        })
    })
    .catch(errMessage => cb(errMessage));
}

//#endregion

module.exports = getLastAnnouncement;
