// ==UserScript==
// @name        VNDB Parent-only Search
// @match       https://vndb.org/i*
// @match       https://vndb.org/g*
// @version     0.1
// @author      mertvn
// @grant       GM_openInTab
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-idle
// ==/UserScript==

/* eslint-disable no-console */
/* eslint-disable no-return-assign */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */

// https://code.blicky.net/yorhel/vndb/src/branch/master/lib/VNWeb/AdvSearch.pm
const alpha = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';

function makeButton(text, onclick, cssObj, id) {
  const button = document.createElement('button');
  const btnStyle = button.style;
  button.id = id;
  button.innerHTML = text;
  button.onclick = onclick;
  Object.keys(cssObj).forEach((key) => btnStyle[key] = cssObj[key]);
  return button;
}

function r(zero, one) {
  const abc = zero > 1 ? r(zero - 1, Math.trunc(one / 64)) : '';
  return abc + alpha[one % 64];
}

function _enc_int(n) {
  if (n < 0) {
    return null;
  }

  if (n < 49) {
    return alpha[n];
  }

  if (n < 689) {
    return alpha[49 + Math.trunc((n - 49) / 64)] + alpha[(n - 49) % 64];
  }

  if (n < 4785) {
    return `X${r(2, n - 689)}`;
  }

  if (n < 266929) {
    return `Y${r(3, n - 4785)}`;
  }

  // TODO: n >= 266929

  return null;
}

function findChildTags(page) {
  const tagtreechildren = document.querySelector('.tagtree').children;
  console.log({ tagtreechildren });

  const childTagIDs = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const child of tagtreechildren) {
    const childTagID = child.children[0].getAttribute('href').replace('/', '').replace('g', '').replace('i', '');
    childTagIDs.push(childTagID);
  }

  console.log({ childTagIDs });

  let result = '';
  result += `0${childTagIDs.length}`;
  for (let i = 0; i < childTagIDs.length; i++) {
    const childTagID = childTagIDs[i];
    const enc = _enc_int(childTagID);
    console.log({ enc });

    if (page === 0) {
      result += '81';
    } else if (page === 1) {
      result += 'd1';
    }

    result += enc;
  }

  console.log({ res: result });
  return result;
}

async function stuff() {
  let page = null; // 0: Tags, 1: Traits
  if (document.location.pathname.startsWith('/g')) {
    page = 0;
  } else if
  (document.location.pathname.startsWith('/i')) {
    page = 1;
  }

  const result = findChildTags(page);

  const re = /[gi][0-9]{1,9}/;
  const match = document.location.pathname.match(re);
  const url = `https://vndb.org/${match}?f=${result}`;

  // return;
  document.location.replace(url);
}

(function main() {
  if (!document.querySelector('.tagtree')) {
    const button = makeButton('Can\'t find tagtree', null, {
      position: 'absolute', top: '25%', right: '3%', 'z-index': 3, color: 'grey',
    }, 'NotagtreeButton');
    button.disabled = true;
    // document.body.appendChild(button); // uncomment if debugging

    return;
  }

  const divCSS = {
    position: 'absolute', top: '62%', right: '3%', 'z-index': 3,
  };
  const buttonCSS = {
    margin: '2px',
  };

  const div = document.createElement('div');
  div.id = 'VNDBParent-onlySearchDiv';
  Object.keys(divCSS).forEach((key) => div.style[key] = divCSS[key]);
  document.body.appendChild(div);

  div.appendChild(makeButton('Parent-only', stuff, buttonCSS, 'VNDBParent-onlySearchButton'));
}());
