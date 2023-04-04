'use strict';

/*
 * [FILE] covid19.js
 *
 * [DESCRIPTION]
 *  新型コロナウィルスの感染状況を提示する関数を定義するファイル
 * 
 */
const { httpGet } = require('./http_get');

require('dotenv').config();
// disease.shにアクセスするためのベースURL
const BASE_URL=process.env.BASE_URL;
// 選択メニューの項目数
const NUM_MENUITEMS=process.env.NUM_OF_MENU_ITEMS;
let numMenuItems = NUM_MENUITEMS ? parseInt(NUM_MENUITEMS) : 20;

// ---------- Functions ----------

/*
 * [FUNCTION] getCountryInfo()
 *
 * [DESCRIPTION]
 *  指定した国の新型コロナウィルス感染状況をSlack向けブロック構造として整形する
 * 
 * [INPUTS]
 * 　country - 対象となる国名
 * 
 * [OUTPUTS]
 *  成功: {blocks:[<見出し>, <セクション>]}
 *  失敗: {type:"plain_text", text:"<エラーメッセージ>"}
 * 
 * [NOTE]
 *  アクセスするURL:
 *   https://disease.sh/v3/covid-19/countries/<country>
 *   あるいはcountryがallのときは
 * 　https://disease.sh/v3/covid-19/all
 * 
 *  toLocaleString()は数値を三桁区切りにする。
 */
exports.getCountryInfo = async (country) => {

  let retVal = null;
  // 対象URLにアクセスし、結果をJSONで取得する
  let url = BASE_URL + "countries/" + country;
  if (country == 'all') url = BASE_URL + "all";
  const result = await httpGet(url);

  let blocks = [];
  if (result != null) {
    let population = Number(result.population).toLocaleString(); //人口
    // 見出しの構造を生成する
    let objheader = {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": `[国名] ${country} [人口] ${population}`,
        "emoji": true
      }
    }
    blocks.push(objheader);

    let active    = Number(result.active).toLocaleString(); //感染者数
    let critical  = Number(result.critical).toLocaleString(); //重病者数
    let recovered = Number(result.recovered).toLocaleString(); //退院・療養終了
    let cases     = Number(result.cases).toLocaleString(); //感染者累計
    let deaths    = Number(result.deaths).toLocaleString(); //死亡者累計
    let tests     = Number(result.tests).toLocaleString(); //検査数

    // 本体となるセクション構造を生成する
    let objBody = {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": `*感染者数:* ${active}`
        },
        {
          "type": "mrkdwn",
          "text": `*重病者数:* ${critical}`
        },
        {
          "type": "mrkdwn",
          "text": `*退院・療養終了:* ${recovered}`
        },
        {
          "type": "mrkdwn",
          "text": `*感染者累計:* ${cases}`
        },
        {
          "type": "mrkdwn",
          "text": `*死亡者累計:* ${deaths}`
        },
        {
          "type": "mrkdwn",
          "text": `*検査数:* ${tests}`
        },
      ]
    }
    blocks.push(objBody);

    // アクションを定義する（追加）
    let objActions = {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "国名選択に戻る",
            "emoji": true
          },
          "value": `${country}`, // アクション関数action-get-countries()に渡す引数
          "action_id": "action-get-countries"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "再表示",
            "emoji": true
          },
          "value": `${country}`, // アクション関数action-get-info()に渡す引数
          "action_id": "action-get-info"
        }
      ]
    }
    blocks.push(objActions);

    // 区切り線
    let objDivider = {
      "type": "divider"
    };
    blocks.push(objDivider);

    retVal = {
      "blocks": blocks
    };
  } else {
    retVal = {
      "type": "plain_text",
      "text": `${country}の情報は見つかりませんでした`,
      "emoji": true
    };
  }

  return (retVal);
};

/*
 * [FUNCTION] getCountries()
 *
 * [DESCRIPTION]
 *  Webサイトから利用可能な国名を抽出し、選択項目とする選択メニュー向けブロック構造として整形する
 * 
 * [INPUTS] 指定なし
 * 
 * [OUTPUTS]
 *  成功: {blocks:[<見出し>, <セクション>]}
 *  失敗: {type:"plain_text", text:"<エラーメッセージ>"}
 * 
 * [NOTE]
 *  選択メニューは20カ国ごと（環境変数 NUM_OF_MENU_ITEMSで変更可能）に1つ作成する
 */
exports.getCountries = async () => {
  let retVal = null;
  const result = await httpGet(BASE_URL + "countries");

  let blocks = [];
  if (result != null && result.length > 0) {
    // 見出しの構造を生成する
    let objheader = {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "国名一覧",
        "emoji": true
      }
    }
    blocks.push(objheader);

    let menu_num = Math.ceil(result.length / numMenuItems);
    let n = 0;
    for (let m = 1; m <= menu_num; m++) {
      // 選択メニューを形成するセクション構造を生成する
      let objBody = {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `[${m}] 国名: ${result[n].country}～`
        },
        "accessory": {
          "action_id": "action-select-country",
          "type": "static_select",
          "placeholder": {
            "type": "plain_text",
            "text": "国名を選択"
          },
          "options": []
        }
      };

      let count = numMenuItems * m;
      if (m == menu_num) count = result.length; // 最後のメニュー
      for ( ; n < count; n++) {
        let objOption = {
          "text": {
            "type": "plain_text",
            "text": `${result[n].country}`
          },
          "value": `${result[n].country}`, // アクション関数action-select-country()に渡す引数
        };
        objBody.accessory.options.push(objOption);
      }

      blocks.push(objBody);
    }
      
    // 区切り線
    let objDivider = {
      "type": "divider"
    };
    blocks.push(objDivider);

    retVal = {
      "blocks": blocks
    };

  } else {
    retVal = {
      "type": "plain_text",
      "text": `国名は見つかりませんでした`,
      "emoji": true
    };
  }

  
  return (retVal);

};

/*
 * END OF FILE
 */