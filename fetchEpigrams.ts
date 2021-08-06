import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';

const EPIGRAMS_URL = 'http://pu.inf.uni-tuebingen.de/users/klaeren/epigrams.html';

const main = async () => {
  try {
    const response = await fetch(EPIGRAMS_URL);
    const html = await response.text();
    const parsed = new JSDOM(html);

    const list = parsed.window.document.getElementsByTagName('ol');
    if (list.length === 0) {
      throw new Error('Could not find "ol" tag.');
    }

    const epigramList: string[] = [];
    list[0].childNodes.forEach(item => {
      if (! item.textContent || item.textContent.trim() === '') {
        return;
      }

      epigramList.push(item.textContent.trim().replace(/\n/g, ''));
    });

    console.log(epigramList);
    const jsonList = JSON.stringify(epigramList);
    fs.writeFileSync('./epigrams.json', jsonList);

    console.log('We are done :)');
  } catch (e) {
    console.log(e);
  }
};

main();
