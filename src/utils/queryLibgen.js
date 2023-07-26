import axios from 'axios';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import emailFile from "./mail.js";

const baseUrl = "https://libgen.is/fiction";

/**
 *
 * @param search search query
 * @param language language of result
 * @param page page of result
 * @param sort
 * @param sortDirection
 * returns results:
 * {
 *   pages: number,
 *   results: [
 *     author: string,
 *     title: string,
 *     series: string,
 *     files: [
 *       {
 *          type: string,
 *          size: number,
 *          links: [string]
 *       }
 *     ]
 *   ]
 * }
 */
export async function queryLibgen(search, page = 1, sort = 'title', sortDirection= 'a', language = 'English') {
  const res = await axios.get(`${baseUrl}?q=${encodeURI(search)}&language=${language}&sort=${sort}:${sortDirection}`);
  const document = new JSDOM(res.data).window.document.documentElement;
  let pages = 1;
  if (document.getElementsByClassName('page_selector').length > 0) {
    pages = parseInt(document.getElementsByClassName('page_selector')[0]
      .textContent
      .substr(-1));
  }
  try {
    const rawData = Array.from(document.getElementsByTagName('tbody')[0]
      .getElementsByTagName('tr'))
      .map(element => {
        const fileInfo = element.getElementsByTagName('td')[4].textContent.split(' / ');
        return {
          author: Array.from(element.getElementsByTagName('td')[0]
            .getElementsByTagName('a'))
            .map(a => a.textContent).join(';'),
          series: element.getElementsByTagName('td')[1].textContent,
          title: element.getElementsByTagName('td')[2].getElementsByTagName('a')[0].textContent,
          fileType: fileInfo[0],
          fileSize: fileInfo[1],
          fileLinks: Array.from(element.getElementsByTagName('td')[5]
            .getElementsByTagName('a'))
            .map(link => link.href)
        }
      });
    return {data: joinResults(rawData), pages};
  } catch(e) {
    console.error(e);
    console.log(document.outerHTML);
    return {data: [], pages: 0}
  }
}

export async function downloadFile(url) {
  const res = await axios.get(`${url}`);
  const document = new JSDOM(res.data).window.document.documentElement;
  try {
    const link = document.getElementsByTagName('a')[0].href;
    const res = await axios.get(link, {responseType: 'stream'});
    const filename = decodeURIComponent(link.split('/').slice(-1)[0]);
    const writeResult = await new Promise(resolvePromise => {
      const writeSteam = fs.createWriteStream(`./temp/${filename}`);
      writeSteam.on('close', () => {
        resolvePromise(true);
      });
      res.data.pipe(writeSteam);
    });

    return filename;
  } catch (e) {
    console.error(e);
    console.log(document.outerHTML);
    console.log(document.getElementsByTagName('a').length);
  }
}

export async function downloadConvertFile(bookUrl) {
  const filename = await downloadFile(bookUrl);
  return await convertToMobi(filename);
}

export async function sendToKindle(filename, email) {
  await emailFile(filename, email);
}

async function emailToKindle(mobiPath, email) {

}

async function convertToMobi(filepath) {
  const fileExtension = filepath.split('.').slice(-1)[0];
  if (fileExtension === '.mobi') {
    return filepath;
  } else {
    switch (fileExtension) {
      case 'epub':
        return await epubToMobi(filepath);
      case 'pdf':
        return await pdfToMobi(filepath);
      case 'txt':
        return await textToMobi(filepath);
      default:
        throw `Unsupported file ${fileExtension}`;
    }
  }
}

async function epubToMobi(filepath) {

}

async function pdfToMobi(filepath) {

}

async function textToMobi(filepath) {

}

function joinResults(results) {
  let index = {};

  for(let i = 0; i < results.length; i++) {
    let result = results[i];
    if (result.author in index) {
      if (result.title.toLowerCase() in index[result.author]) {
        index[result.author][result.title.toLowerCase()].files.push({
          type: result.fileType,
          size: result.fileSize,
          links: result.fileLinks
        });
      } else {
        index[result.author][result.title.toLowerCase()] = {
          author: result.author,
          series: result.series,
          title: result.title,
          files: [
            {
              type: result.fileType,
              size: result.fileSize,
              links: result.fileLinks
            }
          ]
        };
      }
    } else {
      index[result.author] = {
        [result.title.toLowerCase()]: {
          author: result.author,
          series: result.series,
          title: result.title,
          files: [
            {
              type: result.fileType,
              size: result.fileSize,
              links: result.fileLinks
            }
          ]
        }
      }
    }
  }

  let out = []
  for (const authorObj of Object.values(index)) {
    for (const result of Object.values(authorObj)) {
      out.push(result);
    }
  }

  return out;
}
