'use strict';

/*
 * [FILE] current_time.js
 *
 * [DESCRIPTION]
 *  現在の時刻を表示する関数を定義するファイル
 * 
 * [NOTE]
 */
require('date-utils');

/*
 * [FUNCTION] currentTime()
 *
 * [DESCRIPTION]
 *  現在の時刻を表示する関数
 * 
 * [INPUTS] なし
 * 
 * [OUTPUTS]
 *  YYYY-MM-DD HH24:MI:SS
 * 
 * [NOTE]
 */
function currentTime() {
    let dt = new Date();
    let formatted = dt.toFormat("YYYY-MM-DD HH24:MI:SS");
    return formatted;
}

/*
 * 関数の開示
 */
exports.currentTime = currentTime;

/*
 * [FUNCTION] currentHour()
 *
 * [DESCRIPTION]
 *  現在の時間(hour)を取得する関数
 * 
 * [INPUTS] なし
 * 
 * [OUTPUTS]
 *  現在の時間：0 ～ 24
 * 
 * [NOTE]
 */
function currentHour() {
    let dt = new Date();
    let hour = dt.getHours();
    return hour;
}

/*
 * 関数の開示
 */
exports.currentHour = currentHour;

/*
 * END OF FILE
 */